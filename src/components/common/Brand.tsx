"use client";

import React from 'react';

// export function BrandLogo({ className = '', title = 'YOC', src = '/insights/brand/Asset%201@4x.png' }: { className?: string; title?: string; src?: string }) {
export function BrandLogo({ className = '', title = 'YOC', src = 'brand/Asset%201@4x.png' }: { className?: string; title?: string; src?: string }) {
  return (
    <img
      src={src}
      alt={title}
      className={className}
    />
  );
}

export function PoweredByYOC({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 text-xs text-gray-400 ${className}`}>
      <span>Powered</span>
      <span className="text-gray-300">by</span>
      <span className="inline-flex items-center gap-1 font-medium">
        <span className="text-rose-500" aria-hidden>❤</span>
        <span>YOC</span>
      </span>
    </div>
  );
}
