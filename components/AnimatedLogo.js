import React from 'react'

export default function AnimatedLogo({ size = 56, className = '' }){
  // This SVG composes a heart motion leading to a fish and to an eagle silhouette
  // The 'B' in the middle fades out during the animation.
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden="false" role="img" aria-label="Bluephes logo: heart to fish and eagle path">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#00c2a8" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* heart path (starts bold, then turns smaller) */}
        <path id="heart" d="M60 60 C60 40 90 32 100 56 C110 32 140 40 140 60 C140 90 100 115 100 115 C100 115 60 90 60 60 Z" fill="#ff5c7c" opacity="0.95"></path>
        {/* fish path - will be stroked in as if it's the same past path */}
        <path id="fish" d="M24 110 C46 90 100 84 120 110 C100 130 46 124 24 110 Z" strokeWidth="2" fill="#00c2a8" opacity="0.96"></path>
        {/* eagle wings (just stylized shapes) */}
        <path id="eagle" d="M120 40 L170 20 L154 52 L190 68 L150 80 L140 62 L120 80" strokeWidth="3" fill="#7c3aed" opacity="0.95" />
      </g>

      {/* center B that disappears */}
      <g className="logo-center-b" transform="translate(92 88)">
        <text x="0" y="0" fontSize="36" fontWeight="700" fill="#021018">B</text>
      </g>

      <style>
{`
        /* Simple animation sequences: stroke-dash and fade */
        #heart { transform-origin: 100px 80px; animation: heartPulse 1.2s ease-out forwards }
        @keyframes heartPulse { 0% { transform: scale(1.02)} 40% { transform: scale(0.86)} 70% { transform: scale(0.95)} 100% { transform: scale(0.98) } }

        #fish { transform-origin: 60px 110px; animation: fishDraw 1.5s 0.8s ease-out forwards }
        @keyframes fishDraw { 0% { opacity:0; transform: translateX(-18px) scale(0.85)} 50% { opacity:1 } 100% { transform: translateX(0) scale(1) } }

        #eagle { transform-origin: 150px 40px; animation: eagleRise 1.6s 1.6s cubic-bezier(.2,.9,.2,1) forwards }
        @keyframes eagleRise { 0% { opacity:0; transform: translateY(8px) scale(0.9) } 100% { opacity:1; transform: translateY(0) scale(1) } }

        .logo-center-b { transform-origin: center; animation: bFade 0.9s 1.4s ease-out forwards }
        @keyframes bFade { 0% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(0.88) } }

        /* add a hover effect to bring the B back on hover and gently highlight shapes */
        svg:hover #heart { transform: scale(1.06) }
        svg:hover #fish { transform: translateX(3px) scale(1.02) }
        svg:hover #eagle { transform: translateY(-4px) scale(1.02) }
        svg:hover .logo-center-b { animation: none; opacity: 1; transform: scale(1) }
      `}
      </style>
    </svg>
  )
}
