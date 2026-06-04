"use client";

import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import Chatbot from './Chatbot';
import { usePathname } from 'next/navigation';

export default function LayoutClientWrapper({ children }) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || false;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Handle Scroll Progress Bar
  useEffect(() => {
    if (isAdmin) return;
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progressEl = document.getElementById('scroll-progress');
      if (totalScroll > 0 && progressEl) {
        const scrollPercent = (window.scrollY / totalScroll) * 100;
        progressEl.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  // Handle Scroll Reveal animations globally on page change (with MutationObserver safety fallback)
  useEffect(() => {
    if (isAdmin || !loaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            // Also support CSS modules class suffix for local modules
            entry.target.classList.forEach((className) => {
              if (className.includes('reveal')) {
                entry.target.classList.add(className + 'Visible');
                entry.target.classList.add(className.replace('reveal', 'revealVisible'));
              }
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -60px 0px' }
    );

    // Function to observe reveal elements under a node
    const observeElements = (root) => {
      const elements = root.querySelectorAll('.reveal, [class*="reveal"]');
      elements.forEach((el) => observer.observe(el));
      // Also check the root itself
      if (root instanceof HTMLElement) {
        const isReveal = root.classList.contains('reveal') || 
                         Array.from(root.classList).some(c => c.includes('reveal'));
        if (isReveal) {
          observer.observe(root);
        }
      }
    };

    // Observe initial elements
    const timer = setTimeout(() => {
      observeElements(document);
    }, 150);

    // Watch for dynamic DOM changes (e.g. products loading or page updates)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            observeElements(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname, isAdmin, loaded]);


  // Show normal layout without loading screen on admin panel
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Scroll Progress Bar (Inspired by CaffAine) */}
      {mounted && (
        <div 
          id="scroll-progress" 
          style={{
            position: 'fixed',
            top: 0,
            right: 0, // Since site is RTL, progress starts from right
            height: '3px',
            width: '0%',
            background: 'linear-gradient(270deg, var(--gold-deep), var(--gold-shimmer))',
            zIndex: 99999,
            transition: 'width 0.1s linear',
            pointerEvents: 'none',
          }}
        />
      )}

      {mounted && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Fade page elements in once the loader is done. Render fully on server for SEO. */}
      <div 
        style={{
          opacity: !mounted ? 1 : (loaded ? 1 : 0),
          transform: !mounted ? 'none' : (loaded ? 'none' : 'translateY(10px)'),
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {children}
        {mounted && <Chatbot />}
      </div>
    </>
  );
}
