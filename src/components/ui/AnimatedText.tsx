"use client";

import { motion, Variants } from "framer-motion";
import React from "react";

interface AnimatedTextProps {
  text: string;
  el?: React.ElementType;
  className?: string;
  once?: boolean;
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
  }),
};

const child: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

const AnimatedText = ({
  text,
  el: Wrapper = "p",
  className,
  once,
}: AnimatedTextProps) => {
  const words = text.split(" ");

  return (
    <Wrapper className={className}>
      <motion.span
        style={{ display: "inline-block" }}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: once ?? false }}
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            style={{ display: "inline-block", marginRight: "0.25em" }}
            key={index}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;
