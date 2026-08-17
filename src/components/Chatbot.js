import { useState, useRef, useEffect } from 'react';
import { shopInfo, sophieKnowledge } from '../data/shopData';

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
  } catch (e) {}

  const query = userQuery.toLowerCase();
  if (query.includes('مقاس') || query.includes('حجم') || query.includes('size')) {
    return `✦ دليل المقاسات لمتجر زهرة بيسان:\n\n- مقاس 52: يناسب الطول (150-155 سم)\n- مقاس 54: يناسب الطول (156-160 سم)\n- مقاس 56: يناسب الطول (161-165 سم)\n- مقاس 58: يناسب الطول (166-170 سم)\n- مقاس 60: يناسب الطول (171-175 سم)\n\n💡 يسعدنا مساعدتك في اختيار المقاس الدقيق!`;
  }
  if (query.includes('شحن') || query.includes('توصيل') || query.includes('دول')) {
    return `✦ خدمة الشحن والتوصيل:\n\n- التوصيل المحلي (الأردن): خلال 24-48 ساعة\n- الشحن الدولي: خلال 3-5 أيام عمل\n\n🚚 الشحن مجاني للطلبات الممتازة!`;
  }
  if (query.includes('خصم') || query.includes('كوبون') || query.includes('كود')) {
    return `✦ هدية خاصة لكِ اليوم!\n\nاستخدمي كود الخصم الملكي: BEESAN2026\nللحصول على خصم 10% إضافي على جميع العبايات! 🎁`;
  }
  if (query.includes('سعر') || query.includes('أسعار') || query.includes('ثمن')) {
    return `✦ أسعار العبايات في زهرة بيسان:\n\nتبدأ من 35 دينار أردني وتشمل الطرحة المجانية! 💎`;
  }
  return `✦ أهلاً بكِ عزيزتي في زهرة بيسان ✨\n\nأنا يافا، مستشارتكِ الخاصة للأناقة. كيف يمكنني مساعدتكِ اليوم؟ 👑`;
}

const INITIAL_MESSAGES = [
  { id: 'm1', role: 'yafa', text: sophieKnowledge.greeting || '✦ أهلاً بكِ في دار زهرة بيسان للعبايات الفاخرة 👑' },
  { id: 'm2', role: 'yafa', text: sophieKnowledge.followUp || 'كيف يمكنني مساعدتكِ اليوم في اختيار العباية والمقاس المناسب لكِ؟' }
];

const QUICK_CHIPS = [
  { label: '💎 نسّقي لي إطلالة لمناسبة فاخرة', msg: '💎 نسّقي لي إطلالة لمناسبة فاخرة' },
  { label: '🌸 ترشيح عباية يومية أنيقة', msg: '🌸 ترشيح عباية يومية أنيقة' },
  { label: '❄️ تشكيلة العباية الفاخرة', msg: '❄️ ما هي تشكيلة العباية الفاخرة المتوفرة؟' },
  { label: '📏 مساعدة في اختيار المقاس', msg: '📏 مساعدة في اختيار المقاس المناسب' },
  { label: '✈️ الشحن الدولي وطرق الدفع', msg: '✈️ ما هي تفاصيل الشحن الدولي وطرق الدفع؟' },
  { label: '🏷️ كود الخصم (BEESAN2026)', msg: '🏷️ هل يوجد كود خصم متاح الآن؟' },
];

// ─── Inline Styles ────────────────────────────────────────────────────────────
const S = {
  fab: (open) => ({
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: open ? '#111111' : 'linear-gradient(135deg, #d4af37, #967424)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: open ? '1.3rem' : '1.5rem',
    boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'all 0.3s ease',
  }),
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    background: '#e53935',
    color: '#ffffff',
    borderRadius: '50%',
    fontSize: '0.7rem',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  window: (open) => ({
    position: 'fixed',
    bottom: '96px',
    left: '16px',
    width: '340px',
    maxWidth: 'calc(100vw - 32px)',
    height: '580px',
    maxHeight: 'calc(100vh - 120px)',
    background: '#faf8f4',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    display: open ? 'flex' : 'none',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9998,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    direction: 'rtl',
    border: '1.5px solid #d4af37',
  }),
  header: {
    background: 'linear-gradient(135deg, #1c1208, #362211)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #d4af37, #967424)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    flexShrink: 0,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    background: '#10b981',
    borderRadius: '50%',
    border: '2px solid #1c1208',
  },
  headerName: {
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    margin: 0,
  },
  headerStatus: {
    color: '#e5cda8',
    fontSize: '0.72rem',
    margin: 0,
    marginTop: '2px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#ffffff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#faf8f4',
  },
  yafaBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    background: '#ffffff',
    color: '#111111',
    border: '1.5px solid #d4af37',
    borderRadius: '16px',
    borderBottomRightRadius: '4px',
    padding: '12px 14px',
    fontSize: '0.92rem',
    lineHeight: '1.65',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
    fontWeight: '600',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    background: 'linear-gradient(135deg, #1c1208, #362211)',
    color: '#ffffff',
    border: '1.5px solid #b8943a',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    padding: '12px 14px',
    fontSize: '0.92rem',
    lineHeight: '1.65',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
    fontWeight: '600',
    boxShadow: '0 4px 16px rgba(28,18,8,0.3)',
  },
  chips: {
    padding: '8px 10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    borderTop: '1px solid rgba(212,175,55,0.2)',
    background: '#faf8f4',
    flexShrink: 0,
  },
  chip: {
    background: '#ffffff',
    color: '#1c1208',
    border: '1.5px solid #b8943a',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  waChip: {
    background: '#25D366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    borderTop: '1px solid rgba(212,175,55,0.2)',
    background: '#ffffff',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: '#ffffff',
    color: '#111111',
    border: '1.5px solid #d4af37',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.88rem',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #1c1208, #362211)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s',
  },
  loadingDot: {
    background: '#ffffff',
    color: '#b8943a',
    border: '1.5px solid #d4af37',
    borderRadius: '16px',
    borderBottomRightRadius: '4px',
    padding: '12px 14px',
    fontSize: '0.88rem',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

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

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) window.dispatchEvent(new CustomEvent('close_wa_chat'));
  };

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setMessages(prev => [...prev, { id: `u_${Date.now()}`, role: 'user', text: t }]);
    if (!text) setInput('');
    setLoading(true);
    const reply = await fetchAIResponse(t);
    setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'yafa', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* FAB Button */}
      <button onClick={toggle} style={S.fab(open)} aria-label="يافا - مستشارة زهرة بيسان">
        <span>{open ? '✕' : '✨'}</span>
        {!open && <span style={S.badge}>1</span>}
      </button>

      {/* Chat Window */}
      <div style={S.window(open)}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.avatar}>
              👑
              <span style={S.dot} />
            </div>
            <div>
              <p style={S.headerName}>يافا | Yafa</p>
              <p style={S.headerStatus}>مستشارة زهرة بيسان الملكية ✦ متواجدة الآن</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={S.closeBtn}>✕</button>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={m.role === 'yafa' ? S.yafaBubble : S.userBubble}
            >
              <span style={{ color: m.role === 'yafa' ? '#111111' : '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                {m.text}
              </span>
            </div>
          ))}
          {loading && (
            <div style={S.loadingDot}>
              <span style={{ color: '#b8943a', fontWeight: 700 }}>✦ جاري تجهيز الرد...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Chips */}
        <div style={S.chips}>
          {QUICK_CHIPS.map((c) => (
            <button key={c.label} onClick={() => send(c.msg)} style={S.chip}>
              {c.label}
            </button>
          ))}
          <a
            href={`https://wa.me/${shopInfo.phoneClean || '962796697413'}`}
            target="_blank"
            rel="noopener noreferrer"
            style={S.waChip}
          >
            💬 واتساب مباشر
          </a>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          style={S.inputArea}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسألي يافا عن العبايات والمقاسات..."
            style={S.input}
            disabled={loading}
          />
          <button type="submit" style={S.sendBtn} disabled={loading || !input.trim()}>
            إرسال
          </button>
        </form>

      </div>
    </>
  );
}