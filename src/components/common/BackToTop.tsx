"use client";

import React, { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 001.414 0L10 4.414l5.293 5.293a1 1 0 001.414-1.414l-6-6a1 1 0 00-1.414 0l-6 6a1 1 0 000 1.414z" clipRule="evenodd" />
        <path d="M10 5a1 1 0 011 1v9a1 1 0 11-2 0V6a1 1 0 011-1z" />
      </svg>
    </button>
  );
}

