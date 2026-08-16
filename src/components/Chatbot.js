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
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg }),
      signal: controller.signal
    });

    if (!res.ok) throw new Error('AI service error');
    const data = await res.json();
    const rep = (data && data.reply) ? String(data.reply).trim() : '';
    if (!rep || rep.includes('غير متاحة') || rep.includes('مؤقتاً') || rep.includes('خطأ')) {
      return null; // Return null so caller applies rich fashion intelligence
    }
    return rep;
  } catch (err) {
    return null;
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
      localStorage.removeItem('zb_ai_chat_history');
      localStorage.removeItem('zb_ai_chat_history_v2');
      const saved = localStorage.getItem('zb_ai_chat_history_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean = parsed.filter(m => !m.text.includes('غير متاحة') && !m.text.includes('خطأ'));
        if (clean.length > 0) return clean;
      }
      return WELCOME;
    } catch(e) {
      return WELCOME;
    }
  });

  const clearChat = () => {
    stopSpeech();
    setMsgs(WELCOME);
    try {
      localStorage.removeItem('zb_ai_chat_history_v4');
      localStorage.removeItem('zb_ai_chat_history');
    } catch(e) {}
  };
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
      localStorage.setItem('zb_ai_chat_history_v4', JSON.stringify(msgs));
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
    const q = (text || '').toLowerCase().trim();
    if (!q) return null;

    // Greetings & Warm Royal Welcome
    if (q === 'مرحبا' || q === 'السلام عليكم' || q === 'هلا' || q === 'هلو' || q === 'مساء الخير' || q === 'صباح الخير' || q.includes('كيفك') || q.includes('شخبارك') || q.includes('شو اخبارك') || q.includes('يعطيك العافية') || q.includes('يعطيكي العافيه')) {
      return "أهلاً بكِ في دار زهرة بيسان للعبايات الفاخرة! 👑✨ يسعدني ويشرفني خدمتكِ اليوم.\nأنا يافا، مستشارتكِ للأناقة الملكية وتنسيق الإطلالات. كيف يمكنني مساعدتكِ اليوم؟ هل تبحثين عن عباية لمناسبة سعيدة، أم للاستخدام اليومي والدوام الراقي؟ ✦";
    }

    // Occasions & High Fashion Styling (الأعراس، السهرات، المناسبات)
    if (q.includes('نسق') || q.includes('تنسيق') || q.includes('إطلالة') || q.includes('اطلالة') || q.includes('مناسبة') || q.includes('عرس') || q.includes('زواج') || q.includes('خطوبة') || q.includes('كتب كتاب') || q.includes('سهرة') || q.includes('حفلة') || q.includes('فاخر') || q.includes('استقبال') || q.includes('عشاء') || q.includes('عزومة') || q.includes('عيد') || q.includes('رمضان')) {
      return "يسعدني جداً تنسيق إطلالتكِ الملكية لتكوني محط الأنظار! 💎✨\n\nإليكِ تنسيقي المتكامل لمناسبتكِ الفاخرة:\n👑 العباية: «عباية سلتانة الملكية» أو «عباية التطريز اليدوي الأسود والذهبي» بقصة كلوش ملكية انسيابية تعكس الفخامة.\n🧣 الطرحة: طرحة شيفون كريب بلون بيج ذهبي أو كحلي ملكي بتطريز طرف ناعم.\n👜 الحقيبة والكعب: كلاتش ميتاليك ذهبي أو لؤلؤي مع حذاء كعب كلاسيكي أسود أو نيود.\n💎 اللمسة الأخيرة: مجوهرات ذهبية رقيقة ورشة من عطر العود الملكي لتكتمل فخامتكِ ✦";
    }

    // Daily, Work & Casual Abayas (الدوام، الجامعة، يومي، مريح)
    if (q.includes('يومي') || q.includes('دوام') || q.includes('عمل') || q.includes('جامعة') || q.includes('مريح') || q.includes('كاجوال') || q.includes('سفر') || q.includes('طيارة') || q.includes('خفيف')) {
      return "لإطلالة يومية عملية تجمع بين الحشمة التامة والراحة والأناقة العالية:\n👑 أنصحكِ بـ «عباية الكريب السعودي الفاخر» بقصة نص كلوش مريحة لا تتجعد إطلاقاً مع الحركة والجلوس.\n🧣 الطرحة: طرحة قطن ليزر باردة أو كريب أسود فاخر مانع للانزلاق.\n👟 التنسيق: حذاء سنيكرز جلدي أبيض فاخر أو فلات أنيق بلون نيود مع حقيبة توت جلدية عملية ✦";
    }

    // Fabrics & Materials (الأقمشة والخامات)
    if (q.includes('قماش') || q.includes('خامة') || q.includes('حرير') || q.includes('كريب') || q.includes('مخمل') || q.includes('كتان') || q.includes('شيفون') || q.includes('صوف') || q.includes('شتوي') || q.includes('صيفي') || q.includes('تجعد') || q.includes('سواد')) {
      return "ننتقي في زهرة بيسان أرقى الخامات الكورية واليابانية المعتمدة عالمياً:\n• الكريب الملكي: سواد فاحم ملكي، قماش انسيابي بارد لا يتجعد ومثالي للدوام والمناسبات.\n• الحرير المغسول: نعومة حريرية ولمعة خفيفة راقية تعكس الضوء بجمال.\n• المخمل الشتوي الفاخر: دافئ وفاخر للمناسبات الشتوية والأجواء الباردة.\n• الكتان الطبيعي: نسيج صيفي مسامي خفيف وأنيق ✦";
    }

    // Sizing & Height Measurement (المقاسات ودليل القياس)
    if (q.includes('مقاس') || q.includes('مقاسي') || q.includes('قياس') || q.includes('سايز') || q.includes('طول') || q.includes('طولي') || q.includes('وزن') || q.includes('وزني') || q.includes('50') || q.includes('52') || q.includes('54') || q.includes('56') || q.includes('58') || q.includes('60')) {
      return "يسعدني مساعدتكِ في اختيار المقاس الأنسب لطولكِ:\n• طول 150-154 سم: المقاس الأنسب هو (50)\n• طول 155-159 سم: المقاس الأنسب هو (52)\n• طول 160-164 سم: المقاس الأنسب هو (54)\n• طول 165-169 سم: المقاس الأنسب هو (56)\n• طول 170-174 سم: المقاس الأنسب هو (58)\n• طول 175 سم فما فوق: المقاس الأنسب هو (60)\n\n✦ إذا كنتِ ترتدين كعباً عالياً، يُفضل اختيار مقاس أكبر بنمرة واحدة لتغطية الكعب بأناقة.";
    }

    // Prices, Offers & Discounts (الأسعار والعروض والخصومات)
    if (q.includes('سعر') || q.includes('أسعار') || q.includes('بكم') || q.includes('كم السعر') || q.includes('كم سعر') || q.includes('خصم') || q.includes('عرض') || q.includes('كود') || q.includes('كوبون') || q.includes('تخفيض') || q.includes('غالي') || q.includes('رخيص')) {
      return "أسعار عباياتنا الفاخرة تبدأ من 45 JOD وتصل إلى 150 JOD للقطع الملكية المطرزة يدوياً بخيوط القصب والكريستال ✦\n🎁 هدية خاصة لكِ: استخدمي كود الخصم الحصري (BEESAN2026) عند إتمام الشراء للحصول على خصم خاص على طلبكِ!";
    }

    // Shipping & Delivery (الشحن والتوصيل المحلي والدولي)
    if (q.includes('توصيل') || q.includes('شحن') || q.includes('كم يوم') || q.includes('بتوصلوا') || q.includes('عمان') || q.includes('اربد') || q.includes('الزرقاء') || q.includes('العقبة') || q.includes('السعودية') || q.includes('الامارات') || q.includes('قطر') || q.includes('الكويت') || q.includes('دولي') || q.includes('امريكا') || q.includes('اوروبا')) {
      return "نوفر خدمة الشحن السريع حتى باب بيتكِ:\n🚚 داخل الأردن: توصيل سريع لجميع المحافظات خلال 24 - 48 ساعة فقط.\n✈️ التوصيل الدولي (السعودية، دول الخليج، أوروبا، وأمريكا): خلال 5 - 8 أيام عمل عبر شركات الشحن السريع مع رقم تتبع مباشر ✦";
    }

    // Exchange & Return Policy (التبديل والترجيع)
    if (q.includes('تبديل') || q.includes('ارجاع') || q.includes('إرجاع') || q.includes('استبدال') || q.includes('استرجاع') || q.includes('غلط')) {
      return "راحة بالكِ ورضاكِ أولويتنا ✦\nداخل الأردن: التبديل والترجيع متاح بنفس وقت التوصيل أثناء تواجد مندوب الشحن ببابكِ لتجربة المقاس والتأكد من جودة القطعة.\n(يُرجى العلم أن رسوم الشحن غير مستردة وتكون على العميل في حال التبديل). الشحن الدولي نهائي ✦";
    }

    // Ordering & Payment Methods (طريقة الطلب والدفع)
    if (q.includes('طلب') || q.includes('كيف اطلب') || q.includes('شراء') || q.includes('دفع') || q.includes('كليك') || q.includes('فيزا') || q.includes('ماستركارد') || q.includes('كاش') || q.includes('عند الاستلام') || q.includes('تقسيط') || q.includes('تمارا') || q.includes('تابي')) {
      return "خطوات الطلب سهلة ومباشرة:\n1. تصفحي المتجر واختاري العباية ومقاسكِ المفضل.\n2. أضيفيها للسلة واضغطي «إتمام الشراء».\n3. ادخلي اسمكِ وعنوانكِ ورقم هاتفكِ.\n💳 طرق الدفع المتاحة: دفع فوري عبر CliQ الأردن، البطاقات الائتمانية الدولية، أو نقداً عند الاستلام ✦";
    }

    // Contact & WhatsApp (الواتساب والتواصل المباشر)
    if (q.includes('واتساب') || q.includes('تواصل') || q.includes('رقم') || q.includes('اتصال') || q.includes('تلفون') || q.includes('هاتف') || q.includes('خدمة العملاء') || q.includes('بدي احكي')) {
      return "يسعدنا دائماً تواصلكِ المباشر معنا! 💬✦\nرقم الواتساب والاتصال الرسمي المعتمد: +962 79 669 7413\nالبريد الإلكتروني: zahratbeesanshop@gmail.com\nنحن بخدمتكِ لمساعدتكِ فوراً في أي استفسار 👑";
    }

    // Location & About the Store (الموقع ومكان المتجر)
    if (q.includes('وين موقعكم') || q.includes('موقعكم') || q.includes('مكانكم') || q.includes('عندكم محل') || q.includes('فرع') || q.includes('معرض')) {
      return "دار زهرة بيسان هي متجر إلكتروني عالمي فاخر متخصص في العبايات والأزياء الملكية 👑 نشحن لجميع محافظات الأردن ولكافة دول العالم مباشرة مع توصيل فوري لباب منزلكِ ✦";
    }

    // Thank you & Politeness (الشكر والثناء)
    if (q.includes('شكرا') || q.includes('يسلمو') || q.includes('مشكورة') || q.includes('ما قصرتي') || q.includes('تمام')) {
      return "العفو عزيزتي، هذا واجبي ويسعدني دائماً خدمتكِ! ✦ أتمنى لكِ يوماً مليئاً بالأناقة والجمال. إذا احتجتِ أي مساعدة أخرى أنا هنا دائماً 👑✨";
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

    // Check instant expert match first
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
      let reply = await callAI(t);
      if (!reply) {
        reply = `أهلاً بكِ في دار زهرة بيسان للعبايات الفاخرة! 👑✨\nيسعدني ويشرفني خدمتكِ وتقديم أفضل استشارات الموضة والتنسيق الملكي لكِ.\n\n👑 لاقتراحات وتنسيق الإطلالات: أخبريني بالمناسبة (أعراس، سهرة، دوام، يومي).\n📏 للمقاسات: أخبريني بطولكِ لأقترح المقاس الأنسب لكِ (50 - 60).\n🚚 للشحن: نوصل داخل الأردن خلال 24-48 ساعة ولجميع دول العالم خلال 5-8 أيام.\n💬 للتواصل المباشر والطلبات الخاصة: يسعدنا تواصلكِ عبر الواتساب على +962 79 669 7413 ✦`;
      }
      const aiMsg = { id: Date.now() + 1, role: 'sophie', text: reply };
      setMsgs(prev => [...prev, aiMsg]);
      
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_msg: t, ai_msg: reply })
      }).catch(err => console.error("[Chatbot] Sync Error:", err));

    } catch {
      const smartFallback = `أهلاً بكِ عزيزتي في دار زهرة بيسان 👑✨\nيسعدني دائماً مساعدتكِ في اختيار العباية المثالية، تنسيق الإطلالات الملكية، أو تحديد المقاس الأنسب لكِ.\n\n💬 يمكنكِ أيضاً التواصل مباشرة مع فريقنا عبر الواتساب على الرقم +962 79 669 7413 أو عبر البريد ${shopInfo.email} لمساعدتكِ فوراً ✦`;
      setMsgs(p => [...p, { id: Date.now() + 1, role: 'sophie', text: smartFallback }]);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={clearChat} 
              title="بدء محادثة جديدة" 
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(197,168,128,0.3)', color: '#c5a880', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}
            >
              <i className="fas fa-redo-alt" />
            </button>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="إغلاق" style={{ color: '#f3ebd9' }}>
              <i className="fas fa-times" />
            </button>
          </div>
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