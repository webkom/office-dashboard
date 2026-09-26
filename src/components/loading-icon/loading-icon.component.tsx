import webkomIcon from "/webkom.png";
import { motion } from "motion/react";
import styles from "./loading-icon.module.css";

const NumberOfOs = 50;

const LoadingIcon = () => (
  <motion.div
    className="w-full justify-center items-center flex overflow-x-hidden overflow-y-hidden h-screen perspective-near"
    initial={{
      opacity: 0,
      left: 100,
    }}
    animate={{
      opacity: 1,
      left: 0,
      transition: { delay: 1 },
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0, rotateX: 130 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: {
          delay: 1 + NumberOfOs * 0.05,
          // delay: 2,
          type: "spring",
        },
      }}
      className="absolute top-1/2 left-1/2 -translate-1/2 z-10"
    >
      <img src="webkom.png" className="w-50" />
    </motion.div>
    <h1 className="text-8xl font-extralight flex flex-row flex-nowrap">
      webk
      <motion.span
        animate={{
          scaleX: 2,
          width: "auto",
          paddingInline: 12,
        }}
        style={{
          fontVariationSettings: `'slnt' -10`,
        }}
        className="inline-block"
      >
        o
      </motion.span>
      <div className="px-2 whitespace-nowrap">
        {Array.from({ length: NumberOfOs }).map((_, i) => (
          <motion.span
            initial={{
              opacity: 0,
              translateY: 50,
              scaleX: 0,
              width: 0,
              overflow: "hidden",
              paddingInline: 0,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              transition: {
                delay: 1 + i * 0.05,
              },
              paddingInline: 12,
              scaleX: 2,
              width: "auto",
            }}
            key={i}
            style={{
              fontVariationSettings: `'slnt' -10`,
            }}
            className="inline-block"
          >
            o
          </motion.span>
        ))}
      </div>
      m
    </h1>
  </motion.div>
);

export default LoadingIcon;
