import webkomIcon from "/webkom.png";
import { motion } from "motion/react";

const NumberOfOs = 30;

// Precompute delays using an ease-out curve so the flow starts briskly
// and gently decelerates towards the end rather than abruptly stopping
const BASE_DELAY = 1;
const delays = (() => {
  const result: number[] = [BASE_DELAY];
  for (let i = 1; i < NumberOfOs; i++) {
    const progress = i / (NumberOfOs - 1);
    // Interval starts at ~25ms and gracefully stretches to ~135ms
    const interval = 0.025 + 0.11 * Math.pow(progress, 2.2);
    result.push(result[result.length - 1] + interval);
  }
  return result;
})();

const finalDelay = delays[delays.length - 1];

const LoadingIcon = () => (
  <motion.div
    key="loader"
    className="w-full justify-center items-center flex overflow-x-hidden overflow-y-hidden h-screen perspective-near"
    initial={{
      opacity: 0,
      x: 100,
    }}
    animate={{
      opacity: 1,
      x: 0,
      transition: { delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    }}
    exit={{
      opacity: 0,
      y: 100,
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0, rotateX: 130 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: {
          delay: finalDelay + 0.4,
          type: "spring",
          stiffness: 120,
          damping: 14,
        },
      }}
      className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-8.5"
    >
      <img src={webkomIcon} className="w-14" />
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
              y: 50,
              scaleX: 0,
              width: 0,
              overflow: "hidden",
              paddingInline: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              paddingInline: 12,
              scaleX: 2,
              width: "auto",
              transition: {
                delay: delays[i],
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1], // ease-out expo for buttery smooth deceleration
              },
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
      <motion.span className="inline-block">m</motion.span>
    </h1>
  </motion.div>
);

export default LoadingIcon;
