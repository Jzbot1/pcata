import React from "react";
import Marquee from "react-fast-marquee";

const SliderText = ({ text, direction, bg }) => {
  return (
    <div
      className="slider-text-container"
      style={{
        backgroundColor:"#000", // Default background if not provided
        padding: "10px 20px",
        border: "2px solid #fff", // White border for contrast
        borderRadius: "8px", // Rounded corners for a smoother look
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
        overflow: "hidden", // To prevent content overflow
        maxWidth: "100%",
      }}
    >
      <Marquee speed={50} direction={direction}>
        {new Array(20).fill(null).map((_, index) => (
          <div
            key={index}
            style={{
              margin: "0 25px", // Increased space between items
              fontWeight: "600", // Slightly bolder font for emphasis
              fontSize: "18px", // A bit larger text
              color: "#fff", // White text for readability
              textTransform: "uppercase", // Making the text uppercase for style
              letterSpacing: "1px", // Adding some letter spacing for better readability
              transition: "color 0.3s ease-in-out", // Smooth color change effect
            }}
            className="slider-text-item"
          >
            {text}
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default SliderText;
