import React, { useState } from 'react';
import styles from './LoginModal.module.css';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { FiUser, FiX } from 'react-icons/fi';
import { FaApple, FaFacebookF } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useCustomerAuth();
  const [email, setEmail] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      login(email.trim());
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    if (decoded && decoded.email) {
      login(decoded.email);
    }
  };

  return (
    <div className={styles.overlay} onClick={closeLoginModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeLoginModal} aria-label="إغلاق">
          <FiX />
        </button>

        <div className={styles.userIconContainer}>
          <FiUser size={30} />
        </div>

        <div className={styles.title}>تسجيل الدخول</div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={!email.trim()}>
            دخول
          </button>
        </form>

        <div className={styles.divider}>أو سجل دخولك من خلال</div>

        <div className={styles.socialLogins} style={{ justifyContent: 'center' }}>
          <div className={styles.googleBtnContainer}>
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
             />
          </div>
        </div>
      </div>
    </div>
  );
}
