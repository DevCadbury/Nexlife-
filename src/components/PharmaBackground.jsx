import React from "react";
import styled from "styled-components";

const PharmaBackground = ({ variant = "default" }) => {
  return (
    <StyledWrapper $variant={variant}>
      <div className="background-container">
        {/* Medical Cross Pattern */}
        <div className="medical-crosses">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="cross"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Pill Capsules Pattern */}
        <div className="pill-capsules">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="pill"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* DNA Helix Pattern */}
        <div className="dna-helix">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="dna-node"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Global Network Lines */}
        <div className="global-network">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="network-line"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Medical Equipment Icons */}
        <div className="medical-equipment">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="equipment"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Pharmaceutical Symbols */}
        <div className="pharma-symbols">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="symbol"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 7}s`,
              }}
            />
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

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
    background: ${(props) =>
      props.$variant === "subtle"
        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.06) 25%, rgba(191, 219, 254, 0.04) 50%, rgba(219, 234, 254, 0.03) 75%, rgba(239, 246, 255, 0.02) 100%)"
        : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.12) 25%, rgba(191, 219, 254, 0.08) 50%, rgba(219, 234, 254, 0.06) 75%, rgba(239, 246, 255, 0.04) 100%)"};
  }

  .medical-crosses {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .cross {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.15" : "0.25")};
    animation: float 8s ease-in-out infinite;
    pointer-events: none;
  }

  .cross::before,
  .cross::after {
    content: "";
    position: absolute;
    background: #3b82f6;
    border-radius: 2px;
  }

  .cross::before {
    width: 20px;
    height: 4px;
    top: 8px;
    left: 0;
  }

  .cross::after {
    width: 4px;
    height: 20px;
    top: 0;
    left: 8px;
  }

  .pill-capsules {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .pill {
    position: absolute;
    width: 30px;
    height: 12px;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 6px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.12" : "0.2")};
    animation: float 10s ease-in-out infinite;
  }

  .dna-helix {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .dna-node {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #8b5cf6;
    border-radius: 50%;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.1" : "0.18")};
    animation: float 12s ease-in-out infinite;
  }

  .global-network {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .network-line {
    position: absolute;
    width: 60px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #3b82f6 50%,
      transparent 100%
    );
    opacity: ${(props) => (props.$variant === "subtle" ? "0.08" : "0.15")};
    animation: float 15s ease-in-out infinite;
  }

  .medical-equipment {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .equipment {
    position: absolute;
    width: 25px;
    height: 25px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.08" : "0.15")};
    animation: float 10s ease-in-out infinite;
  }

  .equipment::before {
    content: "";
    position: absolute;
    width: 25px;
    height: 25px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #dc2626;
  }

  .equipment::after {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
    background: #ffffff;
    border-radius: 50%;
    top: 5px;
    left: 5px;
  }

  .pharma-symbols {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .symbol {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.05" : "0.1")};
    animation: float 12s ease-in-out infinite;
  }

  .symbol::before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    background: #f59e0b;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .symbol::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background: #ffffff;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    top: 4px;
    left: 4px;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(90deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .cross {
      width: 16px;
      height: 16px;
    }

    .cross::before {
      width: 16px;
      height: 3px;
      top: 6.5px;
    }

    .cross::after {
      width: 3px;
      height: 16px;
      top: 0;
      left: 6.5px;
    }

    .pill {
      width: 25px;
      height: 10px;
    }

    .dna-node {
      width: 6px;
      height: 6px;
    }

    .network-line {
      width: 40px;
    }

    .equipment {
      width: 20px;
      height: 20px;
    }

    .symbol {
      width: 15px;
      height: 15px;
    }
  }
`;

export default PharmaBackground;
