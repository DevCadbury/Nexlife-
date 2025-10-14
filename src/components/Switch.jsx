import React from "react";
import styled from "styled-components";

const Switch = ({ isDark, onToggle }) => {
  const handleChange = (e) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(e);
    }
  };

  return (
    <StyledWrapper>
      <label className="switch">
        <input
          type="checkbox"
          id="toggle"
          checked={isDark}
          onChange={handleChange}
          aria-label="Toggle theme"
        />
        <span className="slider">
          <div className="moons-hole">
            <div className="moon-hole" />
            <div className="moon-hole" />
            <div className="moon-hole" />
          </div>
          <div className="black-clouds">
            <div className="black-cloud" />
            <div className="black-cloud" />
            <div className="black-cloud" />
          </div>
          <div className="clouds">
            <div className="cloud" />
            <div className="cloud" />
            <div className="cloud" />
            <div className="cloud" />
            <div className="cloud" />
            <div className="cloud" />
            <div className="cloud" />
          </div>
          <div className="stars">
            <svg className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
          </div>
        </span>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 90px;
    height: 40px;
    border: 1px solid rgb(58, 58, 58);
    border-radius: 22px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: black;
    border-radius: 20px;
    transition: background-color 0.4s ease;
    overflow: hidden;
    z-index: 2;
    cursor: pointer;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 30px;
    width: 30px;
    left: 4px;
    bottom: 5px;
    background-color: white;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s ease;
    border-radius: 50%;
    overflow: hidden;
    will-change: transform;
  }

  .moons-hole {
    content: "";
    position: absolute;
    opacity: 1;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
    will-change: transform, opacity;
  }

  .moon-hole {
    position: absolute;
    border-radius: 50%;
    transform: translateX(0px);
  }

  .moon-hole:nth-child(1) {
    background-color: rgb(85, 85, 85);
    height: 5px;
    width: 5px;
    top: 26px;
    left: 20px;
  }

  .moon-hole:nth-child(2) {
    background-color: rgb(85, 85, 85);
    height: 10px;
    width: 10px;
    top: 16px;
    left: 7px;
  }

  .moon-hole:nth-child(3) {
    background-color: rgb(85, 85, 85);
    height: 4px;
    width: 4px;
    top: 12px;
    left: 21px;
  }

  input:checked + .slider {
    background-color: #62cff0;
  }

  input:focus + .slider {
    outline: none;
  }

  input:checked + .slider:before {
    transform: translateX(52px);
    background-color: orange;
  }

  input:checked + .slider .moons-hole {
    transform: translateX(52px);
    opacity: 0;
  }

  .stars {
    right: 6px;
    top: 0;
    bottom: 0;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
    transform: translateY(0px);
    will-change: transform, opacity;
  }

  .star {
    position: absolute;
    fill: white;
    animation: star-twinkle 2s infinite;
    opacity: 1;
  }

  /* Posizionamento casuale dei puntini */
  .star:nth-child(1) {
    top: 5px;
    right: 29px;
    width: 20px;
    animation-delay: 0.3s;
  }

  .star:nth-child(2) {
    top: 18px;
    right: 9px;
    width: 15px;
  }

  .star:nth-child(3) {
    top: 5px;
    right: 15px;
    width: 10px;
    animation-delay: 0.6s;
  }

  .star:nth-child(4) {
    top: 26px;
    right: 28px;
    width: 12px;
    animation-delay: 0.9s;
  }

  .star:nth-child(5) {
    top: 2px;
    right: 50px;
    width: 8px;
    animation-delay: 1.2s;
  }

  input:checked + .slider .stars {
    transform: translateY(-32px);
    opacity: 0;
  }

  @keyframes star-twinkle {
    0% {
      transform: scale(1);
    }

    40% {
      transform: scale(1.2);
    }

    80% {
      transform: scale(0.8);
    }

    100% {
      transform: scale(1);
    }
  }

  .clouds {
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 20px;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
    transform: translateX(-55px);
    will-change: transform, opacity;
  }

  .black-clouds {
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 20px;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
    transform: translateX(-55px);
    opacity: 0;
    z-index: 0;
    will-change: transform, opacity;
  }

  .black-cloud {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #555; /* Grigio più scuro per simulare nuvola */
    opacity: 60%;
    border-radius: 50%;
    animation: cloud-move 6s infinite;
    animation-delay: 1s;
  }

  .black-cloud:nth-child(1) {
    top: 1px;
    right: 3px;
  }

  .black-cloud:nth-child(2) {
    top: 15px;
    left: 9px;
  }

  .black-cloud:nth-child(3) {
    top: 20px;
    left: 27px;
  }

  input:checked + .slider .black-clouds {
    transform: translateX(32px);
    opacity: 1;
  }

  .cloud {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    z-index: 1;
    animation: cloud-move 6s infinite;
  }

  .cloud:nth-child(1) {
    top: 0;
    height: 21px;
    width: 21px;
    right: 14px;
  }

  .cloud:nth-child(2) {
    height: 25px;
    width: 25px;
    border-radius: 50%;
    top: 14px;
    right: 6px;
  }

  .cloud:nth-child(3) {
    height: 23px;
    width: 23px;
    top: 28px;
    left: 4px;
  }

  .cloud:nth-child(4) {
    top: 26px;
    left: 20px;
  }

  .cloud:nth-child(5) {
    top: 30px;
    left: 30px;
  }

  .cloud:nth-child(6) {
    top: 27px;
    left: 46px;
  }

  .cloud:nth-child(7) {
    top: 31px;
    left: 58px;
  }

  input:checked + .slider .clouds {
    transform: translateX(32px);
    opacity: 1;
  }

  @keyframes cloud-move {
    0% {
      transform: translateX(-32px);
    }

    40% {
      transform: translateX(-36px);
    }

    80% {
      transform: translateX(-28px);
    }

    100% {
      transform: translateX(-32px);
    }
  }
`;

export default Switch;
