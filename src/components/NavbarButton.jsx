import React from "react";
import styled from "styled-components";

const NavbarButton = ({ children, isActive, onClick, className }) => {
  return (
    <StyledWrapper>
      <button
        className={`button ${isActive ? "active" : ""} ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    --😀: #644dff;
    --😀😀: #4836bb;
    --😀😀😀: #654dff63;
    cursor: pointer;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 1px;
    color: #fff;
    background: var(--😀);
    border: 2px solid var(--😀😀);
    border-radius: 0.75rem;
    box-shadow: 0 4px 0 var(--😀😀);
    transform: skew(-5deg);
    transition: all 0.1s ease;
    filter: drop-shadow(0 8px 15px var(--😀😀😀));
    min-width: 120px;
  }

  .button:not(.active) {
    background: transparent;
    color: #6b7280;
    border: 2px solid #e5e7eb;
    box-shadow: none;
    filter: none;
    transform: none;
  }

  .button:not(.active):hover {
    background: #f3f4f6;
    color: #374151;
    border-color: #d1d5db;
  }

  .button.active {
    background: var(--😀);
    color: #fff;
    border: 2px solid var(--😀😀);
    box-shadow: 0 4px 0 var(--😀😀);
    transform: skew(-5deg);
    filter: drop-shadow(0 8px 15px var(--😀😀😀));
  }

  .button.active:active {
    letter-spacing: 0px;
    transform: skew(-5deg) translateY(4px);
    box-shadow: 0 0 0 var(--😀😀😀);
  }

  .button:not(.active):active {
    transform: scale(0.98);
  }
`;

export default NavbarButton;
