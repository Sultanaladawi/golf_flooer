import { useState, useRef, useEffect } from 'react';
import { shopInfo, sophieKnowledge } from '../data/shopData';
import styles from './Chatbot.module.css';

// System prompt for Yafa (Fashion Consultant for Zahrat Beesan)
const SYSTEM_PROMPT = `
أنتِ "يافا"، مستشارة الأزياء والأناقة الرسمية لمتجر "زهرة بيسان" (Zahrat Beesan) للعبايات والأزياء الفاخرة.
تساعدين العميلات في اختيار العبايات والمقاسات ومعرفة أنواع الأقمشة وتفاصيل الشحن والتوصيل والخصومات.
أسلوبك: راقٍ، دافئ، ملكي، وتستخدمين رمز ✦ في إجاباتك.
معلومات أساسية:
- الشحن دولي لكافة الدول.
- الدفع عند الاستلام (محلياً) وبالبطاقات البنكية دولياً.
- كود الخصم الحالي: BEESAN2026 للحصول على خصم 10% إضافي.
`;

// Helper: Call server AI or fallback to rich fashion response
async function fetchAIResponse(userQuery) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userQuery, prompt: SYSTEM_PROMPT }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply && typeof data.reply === 'string') {
        const cleaned = data.reply.trim();
        if (cleaned.length > 5 && !cleaned.includes('غير متاحة') && !cleaned.includes('خطأ')) {
          return cleaned;
        }
      }
    }
  } catch (e) {
    // Network or server timeout — proceed to smart fallback
  }

  // 👑 Royal Fashion Consultation Smart Fallback Logic
  const query = userQuery.toLowerCase();

  if (query.includes('مقاس') || query.includes('حجم') || query.includes('size')) {
    return `✦ **دليل المقاسات لمتجر زهرة بيسان:**\n\n- **مقاس 52:** يناسب الطول (150-155 سم).\n- **مقاس 54:** يناسب الطول (156-160 سم).\n- **مقاس 56:** يناسب الطول (161-165 سم).\n- **مقاس 58:** يناسب الطول (166-170 سم).\n- **مقاس 60:** يناسب الطول (171-175 سم).\n\n💡 يسعدنا مساعدتك في اختيار المقاس الدقيق تواصل معنا عبر الواتساب!`;
  }

  if (query.includes('قماش') || query.includes('خام') || query.includes('تطريز') || query.includes('حرير') || query.includes('مخمل')) {
    return `✦ **أقمشة وخامات زهرة بيسان الملكية:**\n\nنستخدم أفخر أنواع الكريب الكوري الأصلي، الحرير المغسول، المخمل الملكي، وشيفون الكريستال الناعم المخيط بدقة وتطريزات يدوية راقية لا تتأثر بالغسيل. ✨`;
  }

  if (query.includes('شحن') || query.includes('توصيل') || query.includes('دول') || query.includes('مصر') || query.includes('سعودية') || query.includes('إمارات')) {
    return `✦ **خدمة الشحن والتوصيل:**\n\n- **التوصيل المحلي (الأردن):** خلال 24 - 48 ساعة فقط.\n- **الشحن الدولي (السعودية، الإمارات، قطر، كافة الدول):** خلال 3 - 5 أيام عمل فقط عبر شركات الشحن السريع.\n\n🚚 الشحن مجاني للطلبات الممتازة!`;
  }

  if (query.includes('خصم') || query.includes('كوبون') || query.includes('عرض') || query.includes('discount') || query.includes('beesan')) {
    return `✦ **هدية خاصة لكِ اليوم!**\n\nاستخدمي كود الخصم الملكي: **BEESAN2026** عند إتمام الطلب للحصول على **خصم 10% إضافي** وفوري على جميع العبايات! 🎁`;
  }

  if (query.includes('تبديل') || query.includes('ترجيع') || query.includes('استبدال') || query.includes('إرجاع')) {
    return `✦ **سياسة الاستبدال والاسترجاع:**\n\nنضمن لكِ رضا تام عن عبايتك! يمكنكِ طلب الاستبدال أو الاسترجاع خلال 7 أيام من تاريخ الاستلام بشرط أن تكون العباية بحالتها الأصلية. 🌸`;
  }

  if (query.includes('سعر') || query.includes('أسعار') || query.includes('ثمن') || query.includes('تكلفة')) {
    return `✦ **أسعار العبايات في زهرة بيسان:**\n\nتبدأ أسعار عباياتنا الملكية من **35 دينار أردني** (أو ما يعادلها بالريال والدولار)، وتشمل الطرحة المجانية المطابقة للتصميم! 💎`;
  }

  return `✦ أهلاً بكِ عزيزتي في زهرة بيسان ✨\n\nأنا يافا، مستشارتكِ الخاصة للأناقة. كيف يمكنني مساعدتكِ اليوم في اختيار عبايتكِ المثالية أو تحديد مقاسكِ المناسب؟ يمكنكِ كتابة سؤالكِ أو اختيار أحد الخيارات السريعة بالأسفل! 👑`;
}

const INITIAL_MESSAGES = [
  { id: 'm1', role: 'sophie', text: sophieKnowledge.greeting || '✦ أهلاً بكِ في دار زهرة بيسان للعبايات الفاخرة 👑' },
  { id: 'm2', role: 'sophie', text: sophieKnowledge.followUp || 'كيف يمكنني مساعدتكِ اليوم في اختيار العباية والمقاس المناسب لكِ؟' }
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Global event listeners for WhatsApp mutual exclusion
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener('open_ai_chat', handleOpen);
    window.addEventListener('close_ai_chat', handleClose);

    return () => {
      window.removeEventListener('open_ai_chat', handleOpen);
      window.removeEventListener('close_ai_chat', handleClose);
    };
  }, []);

  const toggleChat = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      window.dispatchEvent(new CustomEvent('close_wa_chat'));
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const replyText = await fetchAIResponse(text);
    const aiMsg = { id: `a_${Date.now()}`, role: 'sophie', text: replyText };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        aria-label="محادثة يافا - مستشارة الأزياء"
        title="تحدثي مع يافا مستشارة زهرة بيسان"
      >
        {open ? '✕' : '✨'}
        {!open && <span className={styles.badge}>1</span>}
      </button>

      {/* Main Chat Window */}
      <div className={`${styles.window} ${open ? styles.open : ''}`}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              👑
              <span className={styles.dot}></span>
            </div>
            <div>
              <div className={styles.name}>يافا | Yafa</div>
              <div className={styles.status}>مستشارة زهرة بيسان الملكية ✦ متواجدة الآن</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className={styles.closeBtn} aria-label="إغلاق">✕</button>
        </div>

        {/* Message Container */}
        <div className={styles.messages}>
          {messages.map((m) => {
            const isYafa = m.role === 'sophie';
            return (
              <div
                key={m.id}
                className={`${styles.row} ${isYafa ? styles.sophieRow : styles.userRow}`}
              >
                <div
                  className={`${styles.bubble} ${isYafa ? styles.sophieMsg : styles.userMsg}`}
                  style={{
                    background: isYafa ? '#ffffff' : 'linear-gradient(135deg, #1c1208, #362211)',
                    color: isYafa ? '#111111' : '#ffffff',
                    border: isYafa ? '1.5px solid #d4af37' : '1.5px solid #b8943a',
                    boxShadow: isYafa ? '0 4px 18px rgba(0,0,0,0.08)' : '0 4px 18px rgba(28,18,8,0.3)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    fontSize: '0.94rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    fontWeight: isYafa ? '700' : '600'
                  }}
                >
                  <span style={{ color: isYafa ? '#111111' : '#ffffff', fontWeight: 700 }}>
                    {m.text}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className={`${styles.row} ${styles.sophieRow}`}>
              <div
                className={`${styles.bubble} ${styles.sophieMsg}`}
                style={{
                  background: '#ffffff',
                  color: '#111111',
                  border: '1.5px solid #d4af37',
                  padding: '10px 16px'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#b8943a' }}>✦ جاري تجهيز الرد الأنسب لكِ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips */}
        <div className={styles.quickChips}>
          <button
            onClick={() => handleSend('💎 نسّقي لي إطلالة لمناسبة فاخرة')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            💎 نسّقي لي إطلالة لمناسبة فاخرة
          </button>
          <button
            onClick={() => handleSend('🌸 ترشيح عباية يومية أنيقة')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            🌸 ترشيح عباية يومية أنيقة
          </button>
          <button
            onClick={() => handleSend('❄️ ما هي تشكيلة العباية الفاخرة المتوفرة؟')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            ❄️ تشكيلة العباية الفاخرة
          </button>
          <button
            onClick={() => handleSend('📏 مساعدة في اختيار المقاس المناسب')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            📏 مساعدة في اختيار المقاس المناسب
          </button>
          <button
            onClick={() => handleSend('✈️ ما هي تفاصيل الشحن الدولي وطرق الدفع؟')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            ✈️ الشحن الدولي وطرق الدفع
          </button>
          <button
            onClick={() => handleSend('🏷️ هل يوجد كود خصم متاح الآن؟')}
            className={styles.chip}
            style={{ background: '#ffffff', color: '#1c1208', border: '1.5px solid #b8943a', fontWeight: '700' }}
          >
            🏷️ كود الخصم (BEESAN2026)
          </button>
          <a
            href={`https://wa.me/${shopInfo.phoneClean || '962796697413'}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chip}
            style={{ background: '#25D366', color: '#ffffff', border: 'none', fontWeight: '700', textDecoration: 'none' }}
          >
            💬 واتساب مباشر
          </a>
        </div>

        {/* Input Area */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسألي يافا عن العبايات والمقاسات..."
            className={styles.input}
            disabled={loading}
            style={{ background: '#ffffff', color: '#111111', border: '1.5px solid #d4af37' }}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={loading || !input.trim()}
            style={{ background: 'linear-gradient(135deg, #1c1208, #362211)', color: '#ffffff' }}
          >
            إرسال
          </button>
        </form>

      </div>
    </>
  );
}