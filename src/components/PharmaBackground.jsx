import React, { useMemo } from "react";
import styled from "styled-components";

const PharmaBackground = ({ variant = "default" }) => {
  // Pre-calculate positions to avoid random generation on every render
  const elements = useMemo(() => {
    const positions = [];

    // Reduced element counts for better performance
    const elementCounts = {
      crosses: variant === "subtle" ? 8 : 12,
      pills: variant === "subtle" ? 6 : 10,
      dnaNodes: variant === "subtle" ? 4 : 6,
      networkLines: variant === "subtle" ? 3 : 5,
      equipment: variant === "subtle" ? 2 : 4,
      symbols: variant === "subtle" ? 3 : 5,
    };

    // Generate positions once
    Object.entries(elementCounts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        positions.push({
          type,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 3,
        });
      }
    });

    return positions;
  }, [variant]);

  return (
    <StyledWrapper $variant={variant}>
      <div className="background-container">
        {elements.map((element, i) => (
          <div
            key={i}
            className={`element ${element.type}`}
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDelay: `${element.delay}s`,
            }}
          />
        ))}
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

  .element {
    position: absolute;
    pointer-events: none;
    will-change: transform;
    animation: gentle-float 12s ease-in-out infinite;
  }

  /* Medical Cross - simplified */
  .crosses {
    width: 16px;
    height: 16px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.1" : "0.15")};
    background: #3b82f6;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  /* Pill Capsule - simplified */
  .pills {
    width: 24px;
    height: 8px;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 4px;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.08" : "0.12")};
  }

  /* DNA Node - simplified */
  .dnaNodes {
    width: 6px;
    height: 6px;
    background: #8b5cf6;
    border-radius: 50%;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.06" : "0.1")};
  }

  /* Network Line - simplified */
  .networkLines {
    width: 40px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #3b82f6 50%,
      transparent 100%
    );
    opacity: ${(props) => (props.$variant === "subtle" ? "0.05" : "0.08")};
  }

  /* Medical Equipment - simplified */
  .equipment {
    width: 16px;
    height: 16px;
    background: #ef4444;
    border-radius: 50%;
    opacity: ${(props) => (props.$variant === "subtle" ? "0.05" : "0.08")};
  }

  /* Pharmaceutical Symbol - simplified */
  .symbols {
    width: 12px;
    height: 12px;
    background: #f59e0b;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    opacity: ${(props) => (props.$variant === "subtle" ? "0.03" : "0.06")};
  }

  /* Optimized animation - only transform, no rotation */
  @keyframes gentle-float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .element {
      animation: none;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .crosses {
      width: 12px;
      height: 12px;
    }

    .pills {
      width: 20px;
      height: 6px;
    }

    .dnaNodes {
      width: 4px;
      height: 4px;
    }

    .networkLines {
      width: 30px;
    }

    .equipment {
      width: 12px;
      height: 12px;
    }

    .symbols {
      width: 10px;
      height: 10px;
    }
  }
`;

export default PharmaBackground;
