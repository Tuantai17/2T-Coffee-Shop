import React from "react";

function AuthHeaderIllustration() {
  return (
    <div className="d-flex justify-content-center mb-3">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 15L65 30V40H35V30L50 15Z" fill="#e30613" />
        <path d="M35 40H65V80H35V40Z" fill="#ffc600" />
        <path d="M25 45L35 55V80H25V45Z" fill="#e30613" />
        <path d="M75 45L65 55V80H75V45Z" fill="#e30613" />
        <path d="M45 60H55V80H45V60Z" fill="#fff" />
        <circle cx="50" cy="25" r="4" fill="#ffc600" />
        <circle cx="30" cy="40" r="3" fill="#ffc600" />
        <circle cx="70" cy="40" r="3" fill="#ffc600" />
        <circle cx="20" cy="30" r="2" fill="#0b1c55" opacity="0.5" />
        <circle cx="80" cy="30" r="2" fill="#0b1c55" opacity="0.5" />
        <path d="M40 50H45V55H40V50Z" fill="#0b1c55" />
        <path d="M55 50H60V55H55V50Z" fill="#0b1c55" />
      </svg>
    </div>
  );
}

export default AuthHeaderIllustration;
