import { useState, useRef, useEffect } from 'react';
import { shopInfo, sophieKnowledge } from '../data/shopData';
import styles from './Chatbot.module.css';

const GITHUB_API_KEY = process.env.REACT_APP_GITHUB_AI_KEY;
const GITHUB_URL     = 'https://models.inference.ai.azure.com/chat/completions';

const SYSTEM_PROMPT = `
You are Yafa (يافا), the elegant and friendly fashion consultant for Zahrat Beesan (زهرة بيسان) — a global online boutique specializing in luxury abayas and oriental embroideries, shipping worldwide.
You help customers from all over the world select abayas, choose sizes, learn about fabrics, and complete their purchase. You speak any language the customer uses.
Personality: Professional, warm, and sophisticated. Use ✦.
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
    return data.reply || "عذراً، لم أستطع فهم ذلك جيداً. يمكنكِ الاتصال بنا مباشرة ✦";
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("[Chatbot] Request timed out");
      return "لقد استغرق الرد وقتاً أطول من المعتاد. يرجى المحاولة مرة أخرى ✦";
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
  const [msgs, setMsgs]           = useState(() => {
    try {
      const saved = localStorage.getItem('zb_ai_chat_history');
      return saved ? JSON.parse(saved) : WELCOME;
    } catch(e) {
      return WELCOME;
    }
  });
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [unread, setUnread]       = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ar-SA'); // Default to 'ar-SA' for Arabic
  const endRef         = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  // 💾 Persist AI chat history in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zb_ai_chat_history', JSON.stringify(msgs));
    } catch(e) {}
  }, [msgs]);

  // 🔄 Mutual Exclusion: Close AI Chatbot when WhatsApp opens & listen to close_ai_chat
  useEffect(() => {
    const handleCloseAi = () => setOpen(false);
    window.addEventListener('close_ai_chat', handleCloseAi);
    return () => window.removeEventListener('close_ai_chat', handleCloseAi);
  }, []);

  const toggleOpen = () => {
    setOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        // Dispatch event to automatically close WhatsApp Start Chat popup if open!
        window.dispatchEvent(new Event('close_wa_chat'));
      }
      return nextState;
    });
  };

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

  const getInstantReply = (text) => {
    const q = text.toLowerCase();
    
    // Fashion Styling & Occasions
    if (q.includes('نسق') || q.includes('تنسيق') || q.includes('إطلالة') || q.includes('اطلالة') || q.includes('مناسبة') || q.includes('عرس') || q.includes('زواج') || q.includes('حفلة') || q.includes('سهرة') || q.includes('فاخر')) {
      return "يسعدني جداً تنسيق إطلالتكِ الملكية! ✨💎\n\nلمناسبتكِ الفاخرة، أنصحكِ بهذه الإطلالة المتكاملة:\n👑 العباية: «عباية سلتانة الملكية» أو «عباية التطريز اليدوي الأسود والذهبي» بتصميم كلوش انسيابي.\n🧣 الطرحة: طرحة شيفون كريب بلون بيج ذهبي أو كحلي ملكي بأطراف مطرزة بنعومة.\n👜 الإكسسوارات: حقيبة كلاتش ميتاليك ذهبية أو برونزية مع حذاء كعب كلاسيكي ناعم.\n💎 اللمسة الأخيرة: مجوهرات ذهبية رقيقة وعطر عود ملكي فواح ✦";
    }
    if (q.includes('يومي') || q.includes('دوام') || q.includes('عمل') || q.includes('جامعة') || q.includes('مريح')) {
      return "لإطلالة يومية عملية تجمع بين الحشمة والرقي:\nأنصحكِ بـ «عباية الكريب السعودي الناعم» بقصة نص كلوش مريحة لا تتجعد وسهلة العناية، مع طرحة قطن ليزر باردة وحذاء مريح بلون نيود أو أسود ✦";
    }
    if (q.includes('قماش') || q.includes('خامة') || q.includes('حرير') || q.includes('كريب') || q.includes('كتان') || q.includes('شيفون')) {
      return "نستخدم في زهرة بيسان أفخر الخامات الكورية واليابانية الأصلية:\n• الكريب الملكي: سواد فاحم، انسيابي، غير شفاف وبارد.\n• الحرير المغسول: فخامة ناعمة وانسيابية رائعة للمناسبات.\n• الكتان الطبيعي: نسيج صيفي خفيف وأنيق ✦";
    }
    if (q.includes('سعر') || q.includes('أسعار') || q.includes('بكم') || q.includes('كم السعر')) {
      return "أسعار عباياتنا الفاخرة تبدأ من 45 JOD وتصل إلى 150 JOD حسب نوع القماش والتطريز اليدوي ✦ يمكنكِ تصفح التشكيلة الكاملة من الصفحة الرئيسية.";
    }
    if (q.includes('مقاس') || q.includes('قياس') || q.includes('سايز') || q.includes('طول')) {
      return "نوفر جميع المقاسات القياسية المعتمدة عالمياً: 50، 52، 54، 56، 58، 60 ✦ يمكنكِ استخدام دليل المقاسات الذكي داخل صفحة أي عباية لمعرفة المقاس الأنسب لكِ حسب الطول والوزن.";
    }
    if (q.includes('توصيل') || q.includes('شحن') || q.includes('توصل') || q.includes('كم يوم')) {
      return "نوصل لجميع محافظات الأردن خلال 1-3 أيام عمل، والتوصيل الدولي لجميع دول العالم والخليج خلال 5-10 أيام مع شركات الشحن السريع 🚚✦";
    }
    if (q.includes('تبديل') || q.includes('ارجاع') || q.includes('إرجاع') || q.includes('استبدال')) {
      return "التبديل والترجيع متاح داخل الأردن فقط وبنفس وقت التوصيل أثناء تواجد الكابتن ببابك. يُرجى العلم أن رسوم التوصيل غير قابلة للاسترداد وتكون على حساب العميل في حال التبديل أو الترجيع. لا يوجد تبديل أو إرجاع خارج الأردن ✦";
    }
    if (q.includes('واتساب') || q.includes('تواصل') || q.includes('رقم') || q.includes('اتصال')) {
      return "يمكنكِ التواصل معنا مباشرة عبر الواتساب على الرقم +962790000000 💬✦ يسعدنا خدمتكِ دائماً.";
    }
    if (q.includes('خصم') || q.includes('عرض') || q.includes('كوبون') || q.includes('تخفيض')) {
      return "استخدمي كود الخصم BEESAN2026 عند إتمام الطلب للحصول على خصم خاص على التشكيلة الجديدة ✦";
    }
    if (q.includes('طلب') || q.includes('كيف اطلب') || q.includes('شراء')) {
      return "الطلب سهل ومباشر جداً:\n1. اختاري العباية والمقاس واللون المناسب لكِ.\n2. أضيفيها لسلة التسوق واضغطي «إتمام الشراء».\n3. ادخلي اسمكِ وعنوانكِ ورقم هاتفكِ، واختاري طريقة الدفع المناسبة ✦";
    }
    return null;
  };

  const send = async (text) => {
    const t = text.trim();
    if (!t || typing) return;

    const userMsg = { id: Date.now(), role: 'user', text: t };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);

    // Check instant match first
    const instantReply = getInstantReply(t);
    if (instantReply) {
      setTimeout(() => {
        const aiMsg = { id: Date.now() + 1, role: 'sophie', text: instantReply };
        setMsgs(prev => [...prev, aiMsg]);
        setTyping(false);
      }, 300);
      return;
    }

    try {
      const reply = await callAI(t);
      const aiMsg = { id: Date.now() + 1, role: 'sophie', text: reply };
      setMsgs(prev => [...prev, aiMsg]);
      
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_msg: t, ai_msg: reply })
      }).catch(err => console.error("[Chatbot] Sync Error:", err));

    } catch {
      setMsgs(p => [...p, { id: Date.now() + 1, role: 'sophie', text: `أهلاً بكِ عزيزتي ✦ يمكنكِ أيضاً التواصل مع فريق خدمة العملاء مباشرة لمساعدتكِ فوراً عبر البريد ${shopInfo.email}` }]);
    } finally {
      setTyping(false);
    }
  };


  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <>
      <div className={`${styles.window} ${open ? styles.open : ''}`} role="dialog">
        <div className={styles.header} style={{ background: 'linear-gradient(135deg, #2b2520 0%, #1a1209 100%)', borderBottom: '1px solid rgba(197,168,128,0.3)' }}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #c5a880, #a6865d)' }}>
              <i className="fas fa-gem" style={{ color: '#1a1209' }} />
              <span className={styles.dot} />
            </div>
            <div>
              <div className={styles.name} style={{ color: '#f3ebd9', fontWeight: 700 }}>يافا</div>
              <div className={styles.status} style={{ color: '#c5a880', opacity: 0.9 }}>زهرة بيسان · مستشارة الأناقة</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="إغلاق" style={{ color: '#f3ebd9' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className={styles.messages} style={{ background: '#fcfaf6' }}>
          {msgs.map(m => (
            <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.userMsg : styles.sophieMsg}`}>
              {m.role === 'sophie' && <div className={styles.msgAvatar} style={{ background: 'linear-gradient(135deg, #c5a880, #a6865d)' }}><i className="fas fa-gem" style={{ color: '#1a1209' }} /></div>}
              <div 
                className={styles.bubble} 
                style={m.role === 'user' 
                  ? { background: 'linear-gradient(135deg, #c5a880, #a6865d)', color: '#1a1209', fontWeight: 600, borderBottomRightRadius: '4px' } 
                  : { background: '#ffffff', color: '#1a1209', border: '1px solid rgba(197, 168, 128, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 500, borderBottomLeftRadius: '4px' }
                }
              >
                <div style={{ color: m.role === 'user' ? '#1a1209' : '#1a1209', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {m.text}
                </div>
                {m.role === 'sophie' && (
                  <div style={{ textAlign: 'left', marginTop: '6px' }}>
                    <button 
                      onClick={() => speaking ? stopSpeech() : speakText(m.text)}
                      title={speaking ? 'إيقاف الاستماع' : 'استمع للرسالة'}
                      className={styles.listenBtn}
                      style={speaking ? { background: 'rgba(255, 77, 77, 0.15)', color: '#cc0000', border: '1px solid rgba(255, 77, 77, 0.3)' } : {}}
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
          {msgs.length <= 2 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '8px 12px 14px', direction: 'rtl' }}>
              <button onClick={() => send('الأسعار والمقاسات')} style={{ background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.3)', color: 'var(--gold-dim, #a6865d)', borderRadius: '16px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>💰 الأسعار والمقاسات</button>
              <button onClick={() => send('التوصيل والشحن')} style={{ background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.3)', color: 'var(--gold-dim, #a6865d)', borderRadius: '16px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>🚚 التوصيل والشحن</button>
              <button onClick={() => send('سياسة التبديل')} style={{ background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.3)', color: 'var(--gold-dim, #a6865d)', borderRadius: '16px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>🔄 سياسة التبديل</button>
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
            placeholder={listening ? 'جاري الاستماع...' : 'اسألي يافا عن العبايات والمقاسات...'}
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
              title={listening ? 'إيقاف التسجيل' : 'تحدثي مع يافا'}
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

      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={toggleOpen} style={{ border: '1.5px solid rgba(255,255,255,0.4)', background: 'linear-gradient(135deg, #c5a880 0%, #a6865d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {open ? (
          <span style={{ fontSize: '1.3rem', color: '#1a1209', fontWeight: 'bold' }}>✕</span>
        ) : (
          <span style={{ fontSize: '1.3rem' }} title="مستشارة الأناقة يافا">💎</span>
        )}
        {unread && !open && <span className={styles.badge} style={{ background: '#111827', color: '#f3ebd9', border: '1px solid #c5a880' }}>1</span>}
      </button>
    </>
  );
}