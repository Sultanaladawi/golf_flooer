"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* About Column */}
          <div className={styles.col}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <img 
                src="/logo.png" 
                alt="لوجو زهرة الخليج" 
                width="36" 
                height="36" 
                style={{ objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--gold-primary)' }} 
              />
              <h3 className={styles.brand} style={{ margin: 0 }}>زهرة الخليج</h3>
            </div>
            <p className={styles.desc}>
              وجهتك الأولى لأرقى العبايات والمطرزات الشرقية. نجمع بين الأصالة والحداثة لنقدم لكِ فخامة تليق بكِ.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink}><Mail size={20} /></a>
              <a href="#" className={styles.socialLink}><Phone size={20} /></a>
              <a href="#" className={styles.socialLink}><MapPin size={20} /></a>
            </div>
          </div>

          {/* Links Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>روابط سريعة</h4>
            <ul className={styles.list}>
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/shop">المتجر</Link></li>
              <li><Link href="/about">من نحن</Link></li>
              <li><Link href="/contact">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>خدمة العملاء</h4>
            <ul className={styles.list}>
              <li><Link href="/faq">الأسئلة الشائعة</Link></li>
              <li><Link href="/shipping">سياسة الشحن</Link></li>
              <li><Link href="/returns">سياسة الاسترجاع</Link></li>
              <li><Link href="/privacy">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>النشرة البريدية</h4>
            <p className={styles.desc}>اشتركي لتصلك أحدث العروض والتشكيلات الجديدة.</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="بريدك الإلكتروني" className={styles.input} />
              <button type="button" className={styles.btn}>اشتراك</button>
            </form>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} زهرة الخليج للمطرزات الشرقية.</p>
        </div>
      </div>
    </footer>
  );
}
