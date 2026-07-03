import React from 'react';

/* Login page background: gradient panel + glow circle + curved bottom-
   left corner, taken directly from login-bg-1.svg. Uses the SVG's own
   viewBox/path, so the curve never distorts at any height. */
export function LoginBackground({ className }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 1366 472"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient x1="90.7329503%" y1="50.735091%" x2="18.6243087%" y2="50%" id="loginBgGradient">
          <stop stopColor="#0474DA" offset="0%" />
          <stop stopColor="#044E92" offset="100%" />
        </linearGradient>
        <path d="M0,0 L1366,0 L1366,472 L87,472 C38.9512268,472 0,433.048773 0,385 L0,0 Z" id="loginBgPath" />
      </defs>
      <mask id="loginBgMask">
        <use xlinkHref="#loginBgPath" fill="white" />
      </mask>
      <use fill="url(#loginBgGradient)" xlinkHref="#loginBgPath" />
      <ellipse cx="869.5" cy="127" rx="323.5" ry="313" fill="#389AF3" opacity="0.29" mask="url(#loginBgMask)" />
    </svg>
  );
}

/* Header background used on Dashboard / Project Listing / Create Project.
   Sourced directly from Header-bg.svg -- same gradient + glow treatment
   as the login background, just shorter. */
export function HeaderBackground({ className }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 1308 150"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient x1="90.7329503%" y1="50.2664836%" x2="18.6243087%" y2="50%" id="headerBgGradient">
          <stop stopColor="#0474DA" offset="0%" />
          <stop stopColor="#044E92" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="1308" height="150" fill="url(#headerBgGradient)" />
      <ellipse cx="811.5" cy="88" rx="323.5" ry="313" fill="#389AF3" opacity="0.29" />
    </svg>
  );
}