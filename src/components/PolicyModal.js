import React from 'react';
import { X, ShieldCheck, RefreshCw, Crown, Truck, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PolicyModal({ type, isOpen, onClose }) {
  if (!isOpen || !type) return null;

  const contentMap = {
    privacy: {
      title: 'سياسة الاستخدام والخصوصية الملكية',
      subtitle: 'حماية بياناتكِ وخصوصيتكِ هي أولويتنا المطلقة في دار زهرة بيسان',
      icon: <ShieldCheck size={28} color="var(--gold)" />,
      badge: 'سرية وتشفير تام 100%',
      sections: [
        {
          heading: '1. حماية وتشفير البيانات الشخصية',
          text: 'نحن في دار زهرة بيسان نلتزم بأقصى درجات السرية والخصوصية. جميع البيانات التي تدمجينها (الاسم، العنوان، رقم الهاتف، والبريد الإلكتروني) تُشفر باستخدام أحدث بروتوكولات الأمان الإلكتروني ولا يتم مشاركتها أو بيعها مطلقاً لأي طرف ثالث.'
        },
        {
          heading: '2. أمان المعاملات المالية والدفع',
          text: 'جميع المعاملات المالية البنكية أو بطاقات الائتمان تتم عبر بوابات دفع مخصصة ومعتمدة عالمياً بدعم التشفير التام (SSL 256-bit). لا يقوم متجرنا بتخزين أرقام البطاقات البنكية الخاصة بكِ في أي مرحلة من مراحل الدفع.'
        },
        {
          heading: '3. استخدام خيارات التواصل والحساب',
          text: 'نستخدم معلومات التواصل المباشرة (مثل رقم الواتساب والهاتف) حائرياً لإبلاغكِ بتحديثات حالة الطلب، مواعيد التوصيل مع شركة الشحن، أو تقديم خدمة الاستشارات الخاصة بالتصميم والمقاسات.'
        },
        {
          heading: '4. الملكية الفكرية وحقوق التصاميم',
          text: 'جميع تصاميم العبايات، الصور الفاخرة، الفيديوهات الحصرية، والشعار الرسمي هي ملكية فكرية وحصرية لدار "زهرة بيسان". يمنع منعاً باتاً استخدامها أو إعادة نشرها لأغراض تجارية دون إذن كتابي مسبق.'
        }
      ]
    },
    returns: {
      title: 'سياسة الاستبدال والإرجاع الفاخرة',
      subtitle: 'نضمن لكِ رضاكِ التام وعناية ملكية بكل قطعة تقتنينها',
      icon: <RefreshCw size={28} color="var(--gold)" />,
      badge: 'ضمان الاستبدال 14 يوماً',
      sections: [
        {
          heading: '1. فترة ومهلة الاستبدال والإرجاع',
          text: 'يحق لعميلات دار زهرة بيسان طلب استبدال أو إرجاع القطع خلال 14 يوماً من تاريخ استلام الطلب من مندوب الشحن.'
        },
        {
          heading: '2. شروط قبول الاستبدال والإرجاع',
          text: 'أن تكون العباءة أو القطعة بحالتها الأصلية تماماً، غير مستعملة، خالية من أي روائح أو عطور، ومرفقة بالتغليف الملكي والتاغ (Tag) الخاص بالدار.'
        },
        {
          heading: '3. العبايات والطلبات الخاصة (Custom Tailoring)',
          text: 'القطع التي يتم تفصيلها خصيصاً بمقاسات تعديلية بناءً على طلب العميل تُستبدل فوراً في حال وجود أي خطأ في المقاسات المعتمدة أو وجود أي عيب مصنعي.'
        },
        {
          heading: '4. آلية تنفيذ الاستبدال وسرعة الإجراءات',
          text: 'كل ما عليكِ هو التواصل مع خدمة العميلات عبر الواتساب المباشر، وسنقوم بإرسال مندوب الشحن السريع لاستلام القطعة وإيصال البديل حتى باب بيتكِ بكل سلاسة.'
        }
      ]
    },
    about: {
      title: 'عن دار زهرة بيسان للأزياء الفاخرة',
      subtitle: 'أصالة العباءة الشرقية بالفخامة العصرية واللمسات الملكية',
      icon: <Crown size={28} color="var(--gold)" />,
      badge: 'تصاميم حصرية وفخامة لا تضاهى',
      sections: [
        {
          heading: 'قصة زهرة بيسان — العراقة والأنوثة',
          text: 'تأسست دار زهرة بيسان لتكون العنوان الأول لكل امرأة عربية تبحث عن الأناقة الرفيعة والتميز الملكي. نجمع في تصاميمنا بين سحر الأصالة الشرقية وأحدث صيحات الموضة العالمية.'
        },
        {
          heading: 'حرفية الخياطة والتطريز اليدوي',
          text: 'نختار خاماتنا من أفخم مصانع الأقمشة العالمية (الحرير الملكي، الكريب المقصّب الياباني، والدانتيل الفرنسي). كل قطعة تشهد ساعات من الشك والتطريز اليدوي المتقن بأيدي أشهر الحرفيين.'
        },
        {
          heading: 'التزامنا بالجودة والاستدامة',
          text: 'نؤمن بأن كل عباءة تحمل اسم "زهرة بيسان" هي قطعة فنية تحكي قصة ذوقكِ الرفيع، مع الحرص التام على العناية بالتفاصيل من القصّة وحتى التغليف الراقي الذي يصلكِ.'
        }
      ]
    }
  };

  const current = contentMap[type] || contentMap.privacy;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(10, 8, 6, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        backgroundColor: '#12100d',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
        color: '#f8f5ee',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl'
      }} onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {current.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'serif', color: '#d4af37' }}>
                  {current.title}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#d4af37',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontWeight: 600
                }}>
                  {current.badge}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#b5a995' }}>
                {current.subtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#d4af37',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '28px 32px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {current.sections.map((sec, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(212, 175, 55, 0.1)',
              borderRadius: '16px',
              padding: '20px 22px'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                color: '#f3ebd9',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#d4af37" />
                {sec.heading}
              </h4>
              <p style={{
                margin: 0,
                color: '#c9bfae',
                fontSize: '0.92rem',
                lineHeight: '1.7'
              }}>
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'rgba(10, 8, 6, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#b5a995' }}>
            <PhoneCall size={14} color="#d4af37" />
            <span>لأي استفسار إضافي: تواصل مباشر عبر الواتساب الفاخر</span>
          </div>

          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
}
