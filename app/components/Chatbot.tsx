"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import styles from './Chatbot.module.css';

interface Message {
  id: string;
  role: 'yasmeen' | 'user';
  text: string;
}

const CONCIERGE_KNOWLEDGE = {
  greeting: "أهلاً بكِ في زهرة الخليج للمطرزات الشرقية. أنا ياسمين، مساعدتكِ الرقمية الخاصة بالفخامة. كيف يمكنني مساعدتكِ اليوم؟ ✦",
  followUp: "يمكنكِ الاستفسار عن المقاسات، الأقمشة، أو خيارات التطريز المخصصة.",
  quickReplies: [
    "ما هي المقاسات المتوفرة؟",
    "تفاصيل أقمشة العبايات",
    "كم يستغرق الشحن والتوصيل؟",
    "هل يتوفر تطريز خاص؟"
  ],
  responses: {
    sizes: "نوفر مقاسات عبايات متنوعة تبدأ من 50 إلى 60 لتناسب جميع الأطوال. يمكنكِ أيضاً إرسال مقاساتكِ الخاصة في خانة الملاحظات عند تأكيد الطلب لتفصيلها لكِ بدقة.",
    fabrics: "نستخدم أفخم الأقمشة الكورية واليابانية مثل كريب الصالونة الفاخر، الكريب الملكي، والحرير الطبيعي المقاوم للتجعد لضمان الراحة والأناقة المستدامة.",
    shipping: "نوفر خدمة التوصيل السريع خلال 24 ساعة داخل المملكة الأردنية الهاشمية، وخلال 3 إلى 5 أيام عمل لباقي دول الخليج العربي.",
    custom: "نعم بالطبع! جميع مطرزاتنا شرقية يدوية ١٠٠٪. يمكنكِ طلب تعديل طول العباية أو إضافة تطريز خاص بالتواصل مع الإدارة عبر الواتساب مباشرة.",
    default: "سؤالكِ يهمنا جداً! يمكنكِ أيضاً التواصل مع مصممينا مباشرة عبر الواتساب (+962 7 XXXXXXX) للحصول على استشارة فورية بخصوص إطلالتكِ. ✦"
  }
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    { id: 'w1', role: 'yasmeen', text: CONCIERGE_KNOWLEDGE.greeting },
    { id: 'w2', role: 'yasmeen', text: CONCIERGE_KNOWLEDGE.followUp }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLang] = useState('ar-SA');

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs, typing, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      stopSpeech();
    }
  }, [open]);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
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

  const getSmartReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('مقاس') || t.includes('حجم') || t.includes('طول')) {
      return CONCIERGE_KNOWLEDGE.responses.sizes;
    }
    if (t.includes('قماش') || t.includes('خام') || t.includes('كريب') || t.includes('حرير')) {
      return CONCIERGE_KNOWLEDGE.responses.fabrics;
    }
    if (t.includes('توصيل') || t.includes('شحن') || t.includes('وقت') || t.includes('يوم')) {
      return CONCIERGE_KNOWLEDGE.responses.shipping;
    }
    if (t.includes('تطريز') || t.includes('تعديل') || t.includes('خاص') || t.includes('فصل')) {
      return CONCIERGE_KNOWLEDGE.responses.custom;
    }
    return CONCIERGE_KNOWLEDGE.responses.default;
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { id: String(Date.now()), role: 'user', text: trimmed };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate luxury AI response delay
    setTimeout(() => {
      const replyText = getSmartReply(trimmed);
      const yasmeenMsg: Message = { id: String(Date.now() + 1), role: 'yasmeen', text: replyText };
      setMsgs(prev => [...prev, yasmeenMsg]);
      setTyping(false);
    }, 1200);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      <div className={`${styles.window} ${open ? styles.open : ''}`} role="dialog" aria-label="محادثة ياسمين">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              <Sparkles size={16} className={styles.sparkleIcon} />
              <span className={styles.dot} />
            </div>
            <div>
              <div className={styles.name}>ياسمين</div>
              <div className={styles.status}>المستشار الرقمي الفاخر</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div className={styles.messages}>
          {msgs.map(m => (
            <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.userMsg : styles.yasmeenMsg}`}>
              {m.role === 'yasmeen' && (
                <div className={styles.msgAvatar}>
                  <Sparkles size={12} />
                </div>
              )}
              <div className={styles.bubble}>
                <p className={styles.bubbleText}>{m.text}</p>
                {m.role === 'yasmeen' && (
                  <button 
                    onClick={() => speaking ? stopSpeech() : speakText(m.text)}
                    title={speaking ? 'إيقاف الاستماع' : 'استمع للرسالة'}
                    className={styles.listenBtn}
                    style={speaking ? { background: 'rgba(184, 147, 58, 0.2)', color: 'var(--gold-primary)' } : {}}
                  >
                    {speaking ? 'إيقاف' : 'استماع صوتي'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className={`${styles.msg} ${styles.yasmeenMsg}`}>
              <div className={styles.msgAvatar}><Sparkles size={12} /></div>
              <div className={`${styles.bubble} ${styles.typing}`}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {msgs.length <= 3 && (
          <div className={styles.quickReplies}>
            {CONCIERGE_KNOWLEDGE.quickReplies.map(q => (
              <button key={q} className={styles.chip} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            placeholder="اسألي ياسمين عن العبايات..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={typing}
          />
          <button className={styles.sendBtn} onClick={() => send(input)} disabled={!input.trim() || typing} aria-label="إرسال">
            <Send size={16} />
          </button>
        </div>
      </div>

      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(v => !v)} aria-label="تواصل مع ياسمين">
        {open ? (
          <X size={24} style={{ color: '#ffffff', stroke: '#ffffff' }} />
        ) : (
          <MessageCircle size={24} style={{ color: '#ffffff', stroke: '#ffffff' }} />
        )}
        {unread && !open && <span className={styles.badge}>1</span>}
      </button>
    </>
  );
}
