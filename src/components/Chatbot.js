import { useState, useRef, useEffect } from 'react';
import { shopInfo, sophieKnowledge } from '../data/shopData';
import styles from './Chatbot.module.css';

const GITHUB_API_KEY = process.env.REACT_APP_GITHUB_AI_KEY;
const GITHUB_URL     = 'https://models.inference.ai.azure.com/chat/completions';

const SYSTEM_PROMPT = `
You are Yasmin (ياسمين), the elegant and friendly fashion consultant for Yafa Online (يافا اونلاين) — a global online boutique specializing in luxury abayas and oriental embroideries, shipping worldwide.
You help customers from all over the world select abayas, choose sizes, learn about fabrics, and complete their purchase. You speak any language the customer uses.
Personality: Professional, warm, and sophisticated. Use ✨ ⚜️ 👑.
Key info: We ship internationally to all countries. Payment methods include cash on delivery (local) and credit/debit cards worldwide. No physical store — online only.
`;

async function callAI(userMsg) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg }),
      signal: controller.signal
    });

    if (!res.ok) throw new Error('AI service error');
    const data = await res.json();
    return data.reply || "عذراً، لم أستطع فهم ذلك جيداً. يمكنكِ الاتصال بنا مباشرة ✨";
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("[Chatbot] Request timed out");
      return "لقد استغرق الرد وقتاً أطول من المعتاد. يرجى المحاولة مرة أخرى ✨";
    }
    console.error("[Chatbot] AI Call Failed:", err);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const WELCOME = [
  { id: 'w1', role: 'sophie', text: sophieKnowledge.greeting },
  { id: 'w2', role: 'sophie', text: sophieKnowledge.followUp },
];

export default function Chatbot() {
  const [open, setOpen]           = useState(false);
  const [msgs, setMsgs]           = useState(WELCOME);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [unread, setUnread]       = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ar-SA'); // Default to 'ar-SA' for Arabic
  const endRef         = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => {
    if (open) { setUnread(false); setTimeout(() => inputRef.current?.focus(), 300); }
    else { stopSpeech(); } // Stop talking if window closed
  }, [open]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, []);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('إدخال الصوت غير مدعوم في متصفحكِ. يرجى تجربة متصفح Chrome.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      
      const cleanTranscript = transcript.replace(/[.,]/g, '').trim();
      setInput(cleanTranscript);
      
      // Auto-send when speech is final
      if (e.results[e.results.length - 1].isFinal) {
        setTimeout(() => send(cleanTranscript), 300);
      }
    };

    recognition.start();
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = voiceLang;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      setSpeaking(false);
    }
  };

  const send = async (text) => {
    const t = text.trim();
    if (!t || typing) return;

    const userMsg = { id: Date.now(), role: 'user', text: t };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const reply = await callAI(t);
      const aiMsg = { id: Date.now() + 1, role: 'sophie', text: reply };
      setMsgs(prev => [...prev, aiMsg]);
      
      console.log('[Chatbot] Syncing message to DB...');
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_msg: t, ai_msg: reply })
      })
      .then(r => r.json())
      .then(data => console.log('[Chatbot] Sync Success:', data))
      .catch(err => console.error("[Chatbot] Sync Error:", err));

    } catch {
      setMsgs(p => [...p, { id: Date.now() + 1, role: 'sophie', text: `عذراً، تواصلوا معنا مباشرة عبر البريد ${shopInfo.email} ✨` }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <>
      <div className={`${styles.window} ${open ? styles.open : ''}`} role="dialog">
        <div className={styles.header} style={{ background: 'linear-gradient(135deg, var(--tea-light) 0%, var(--gold-light) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar} style={{ background: 'var(--gold)' }}>
              <i className="fas fa-gem" style={{ color: 'var(--espresso)' }} />
              <span className={styles.dot} />
            </div>
            <div>
              <div className={styles.name} style={{ color: 'var(--espresso)' }}>ياسمين</div>
              <div className={styles.status} style={{ color: 'var(--espresso)', opacity: 0.8 }}>يافا اونلاين · مستشارة الأناقة</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="إغلاق" style={{ color: 'var(--espresso)' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className={styles.messages}>
          {msgs.map(m => (
            <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.userMsg : styles.sophieMsg}`}>
              {m.role === 'sophie' && <div className={styles.msgAvatar} style={{ background: 'var(--gold)' }}><i className="fas fa-gem" style={{ color: 'var(--espresso)' }} /></div>}
              <div className={styles.bubble} style={m.role === 'user' ? { background: 'var(--gold)', color: 'var(--espresso)' } : { background: '#fff', border: '1px solid #eee' }}>
                {m.text}
                {m.role === 'sophie' && (
                  <div style={{ textAlign: 'left' }}>
                    <button 
                      onClick={() => speaking ? stopSpeech() : speakText(m.text)}
                      title={speaking ? 'إيقاف الاستماع' : 'استمع للرسالة'}
                      className={styles.listenBtn}
                      style={speaking ? { background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d' } : {}}
                    >
                      <i className={`fas ${speaking ? 'fa-stop-circle' : 'fa-volume-up'}`} /> 
                      {speaking ? ' إيقاف' : ' استمع'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className={`${styles.msg} ${styles.sophieMsg}`}>
              <div className={styles.msgAvatar} style={{ background: 'var(--gold)' }}><i className="fas fa-gem" style={{ color: 'var(--espresso)' }} /></div>
              <div className={`${styles.bubble} ${styles.typing}`}><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {msgs.length === WELCOME.length && (
          <div className={styles.quickReplies}>
            {sophieKnowledge.quickReplies.map(q => (
              <button key={q} className={styles.chip} onClick={() => send(q)} style={{ border: '1px solid var(--gold)', color: 'var(--espresso)' }}>{q}</button>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            placeholder={listening ? '🎙️ جاري الاستماع...' : 'اسألي ياسمين عن العبايات والمقاسات...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={typing}
            style={listening ? { borderColor: 'var(--gold)', boxShadow: '0 0 0 2px var(--gold-glow)' } : {}}
          />
          
          <div className={styles.actionGroup}>
            {/* Language Toggle */}
            <button
              onClick={() => setVoiceLang(v => v === 'en-GB' ? 'ar-SA' : 'en-GB')}
              disabled={listening || typing}
              title={voiceLang === 'ar-SA' ? 'Switch to English' : 'التبديل إلى العربية'}
              className={styles.langBtn}
            >
              {voiceLang === 'ar-SA' ? 'AR' : 'EN'}
            </button>

            {/* Microphone Button */}
            <button
              className={styles.micBtn}
              onClick={startVoice}
              disabled={typing}
              title={listening ? 'إيقاف التسجيل' : 'تحدثي مع ياسمين'}
              style={{
                background: listening
                  ? 'linear-gradient(135deg, #ff4d4d, #cc0000)'
                  : 'linear-gradient(135deg, var(--tea-light), var(--gold))',
                animation: listening ? 'micPulse 1.2s infinite' : 'none',
              }}
            >
              <i className={`fas ${listening ? 'fa-stop' : 'fa-microphone'}`} />
            </button>

            {/* Send Button */}
            <button className={styles.sendBtn} onClick={() => send(input)} disabled={!input.trim() || typing}>
              <i className="fas fa-arrow-left" style={{ transform: 'rotate(0deg)' }} />
            </button>
          </div>
        </div>
      </div>

      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(v => !v)} style={{ border: '1px solid var(--gold)' }}>
        {open ? <i className="fas fa-times" style={{ color: 'var(--espresso)' }} /> : <i className="fas fa-gem" style={{ color: 'var(--espresso)' }} />}
        {unread && !open && <span className={styles.badge} style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>1</span>}
      </button>
    </>
  );
}