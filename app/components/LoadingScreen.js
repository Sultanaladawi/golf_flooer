"use client";

import React, { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState('drawing');

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log("[LoadingScreen] Timeout useEffect initialized");
    const t1 = setTimeout(() => {
      console.log("[LoadingScreen] Transitioning to fading");
      setPhase('fading');
    }, 1800);

    const t2 = setTimeout(() => {
      console.log("[LoadingScreen] Transitioning to done");
      setPhase('done');
      if (onCompleteRef.current) {
        console.log("[LoadingScreen] Triggering onComplete callback");
        onCompleteRef.current();
      }
    }, 2400);

    return () => {
      console.log("[LoadingScreen] Cleaning up timeouts");
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div 
      className={`${styles.loader} ${phase === 'fading' ? styles.fading : ''}`}
      aria-hidden="true"
    >
      <div className={styles.inner}>
        <div className={styles.logoWrapper}>
          <img 
            src="/logo.png" 
            alt="لوجو زهرة الخليج" 
            width="80" 
            height="80" 
            className={styles.logoImg}
          />
        </div>

        <div className={styles.brandContainer}>
          <h1 className={styles.brandTitle}>زهرة الخليج</h1>
          <span className={styles.brandSubtitle}>ZAHRAT AL KHALEEJ</span>
        </div>

        <p className={styles.tagline}>المطرزات الشرقية · تأسس ٢٠٠٦</p>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}
