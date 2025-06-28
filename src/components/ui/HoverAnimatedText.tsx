"use client";

import { motion, Variants } from "framer-motion";
import { useState } from "react";
import React from "react";

interface HoverAnimatedTextProps {
  text: string;
  className?: string;
  el?: React.ElementType;
}

const HoverAnimatedText = ({
  text,
  el: Wrapper = "p",
  className,
}: HoverAnimatedTextProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const container: Variants = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const letter: Variants = {
    initial: {
      y: 0,
    },
    hover: {
      y: -4,
      color: "#2563eb",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        variants={container}
        animate={isHovered ? "hover" : "initial"}
        style={{ display: "flex", cursor: "pointer" }}
      >
        {text.split("").map((char, index) => (
          <motion.span key={index} variants={letter}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default HoverAnimatedText;
