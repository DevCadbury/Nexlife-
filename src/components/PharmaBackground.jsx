import React from "react";
import styled from "styled-components";

// Optimized: Pure CSS background with minimal DOM elements
const PharmaBackground = React.memo(({ variant = "default" }) => {
  return (
    <StyledWrapper $variant={variant}>
      <div className="background-container">
        {/* Ultra-minimal decorative elements - CSS only */}
        <div className="pattern-overlay" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>
    </StyledWrapper>
  );
});

const StyledWrapper = styled.div`
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
    /* Static gradient background - no JS needed */
    background: ${(props) =>
      props.$variant === "subtle"
        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(147, 197, 253, 0.04) 25%, rgba(191, 219, 254, 0.03) 50%, rgba(219, 234, 254, 0.02) 75%, rgba(239, 246, 255, 0.01) 100%)"
        : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.08) 25%, rgba(191, 219, 254, 0.06) 50%, rgba(219, 234, 254, 0.04) 75%, rgba(239, 246, 255, 0.02) 100%)"};
  }

  /* CSS-only pattern overlay using repeating gradient */
  .pattern-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.03" : "0.05")};
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    background-size: 100% 100%;
    background-position: 0% 0%;
    animation: pattern-drift 60s ease-in-out infinite;
  }

  /* Subtle animated gradient orbs - GPU accelerated */
  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: ${(props) => (props.$variant === "subtle" ? "0.15" : "0.25")};
    animation: float-orb 20s ease-in-out infinite;
    will-change: transform;
  }

  .orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
    top: 10%;
    left: 15%;
    animation-duration: 25s;
  }

  .orb-2 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    top: 60%;
    right: 20%;
    animation-duration: 30s;
    animation-delay: -10s;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
    bottom: 15%;
    left: 50%;
    animation-duration: 35s;
    animation-delay: -20s;
  }

  /* Extremely lightweight animations - GPU accelerated only */
  @keyframes pattern-drift {
    0%, 100% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
  }

  @keyframes float-orb {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(20px, -20px) scale(1.05);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.95);
    }
  }

  /* Respect user motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .pattern-overlay,
    .gradient-orb {
      animation: none;
    }
  }

  /* Mobile optimizations - hide blur effects on mobile for performance */
  @media (max-width: 768px) {
    .gradient-orb {
      filter: blur(40px);
      opacity: ${(props) => (props.$variant === "subtle" ? "0.1" : "0.15")};
    }

    .orb-1 {
      width: 200px;
      height: 200px;
    }

    .orb-2 {
      width: 180px;
      height: 180px;
    }

    .orb-3 {
      width: 150px;
      height: 150px;
    }
  }

  /* Further optimization for low-end devices */
  @media (max-width: 480px) {
    .pattern-overlay {
      opacity: 0.02;
    }

    .gradient-orb {
      display: none; /* Hide blur effects on very small screens */
    }
  }
`;

export default PharmaBackground;
