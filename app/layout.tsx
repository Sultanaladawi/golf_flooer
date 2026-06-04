import type { Metadata } from 'next';
import { Amiri, Tajawal } from 'next/font/google';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LayoutClientWrapper from './components/LayoutClientWrapper';
import './globals.css';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'زهرة الخليج للمطرزات الشرقية | عبايات فاخرة',
  description: 'تسوقي أرقى العبايات من زهرة الخليج للمطرزات الشرقية. فخامة وأناقة تليق بكِ.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} ${amiri.variable}`}>
        <AppProvider>
          <LayoutClientWrapper>
            <Header />
            <div style={{ minHeight: '80vh' }}>
              {children}
            </div>
            <Footer />
          </LayoutClientWrapper>
        </AppProvider>
      </body>
    </html>
  );
}

