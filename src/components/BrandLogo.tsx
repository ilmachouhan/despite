import { motion } from "motion/react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "massive";
  slam?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function BrandLogo({ size = "md", slam = false, className = "", onClick }: BrandLogoProps) {
  // Setup sizing classes
  const containerSizes = {
    sm: "px-4 py-1.5 text-xl tracking-tight leading-none",
    md: "px-8 py-3 text-3xl tracking-tight leading-none",
    lg: "px-12 py-5 text-5xl tracking-normal leading-none",
    massive: "px-16 py-8 md:px-24 md:py-10 text-6xl md:text-8xl tracking-normal leading-none",
  };

  const lineHeights = {
    sm: "h-2 w-4",
    md: "h-3 w-8",
    lg: "h-4 w-12",
    massive: "h-5 md:h-6 w-16 md:w-24",
  };

  // Vertical text sizes for "I DID IT"
  const verticalTextSizes = {
    sm: "text-[7px] mt-1 right-2",
    md: "text-[10px] mt-2 right-4",
    lg: "text-[14px] mt-3 right-6",
    massive: "text-[14px] md:text-[18px] mt-3 right-8 md:right-12 font-mono",
  };

  const textClass = "font-sans font-extrabold text-white uppercase select-none";

  // Animations configuration
  const slamAnimation = {
    initial: { scale: 3, opacity: 0, filter: "blur(20px)" },
    animate: { 
      scale: 1, 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        damping: 10, 
        stiffness: 140,
        mass: 0.8
      }
    }
  };

  const standardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const selectAnimation = slam ? slamAnimation : standardAnimation;

  return (
    <div className={`relative flex flex-col items-center ${className}`} onClick={onClick}>
      <motion.div
        initial={selectAnimation.initial}
        animate={selectAnimation.animate}
        className="relative flex items-center justify-center"
      >
        {/* Supreme-style red logo box */}
        <div className={`bg-gradient-to-r from-red-600 to-red-500 shadow-2xl shadow-red-950/40 relative flex items-center gap-2 md:gap-4 border-t-2 border-red-400 ${containerSizes[size]}`}>
          {/* Left horizontal double white lines */}
          <div className="flex flex-col gap-1 pr-1 md:pr-2">
            <div className={`bg-white rounded-sm ${lineHeights[size]}`} style={{ height: "3px" }} />
            <div className={`bg-white rounded-sm ${lineHeights[size]}`} style={{ height: "3px" }} />
          </div>

          {/* Core Word with premium tracking */}
          <span className={`${textClass} tracking-wide italic select-all`}>
            Despite
          </span>

          {/* Right horizontal double white lines */}
          <div className="flex flex-col gap-1 pl-1 md:pl-2">
            <div className={`bg-white rounded-sm ${lineHeights[size]}`} style={{ height: "3px" }} />
            <div className={`bg-white rounded-sm ${lineHeights[size]}`} style={{ height: "3px" }} />
          </div>
        </div>
      </motion.div>

      {/* "I DID IT" vertical signpost on the right */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: slam ? 0.4 : 0.2, duration: 0.5 }}
        className={`absolute font-black tracking-widest text-zinc-400 uppercase select-none ${verticalTextSizes[size]} flex flex-col items-center font-mono`}
        style={{
          top: "100%",
          lineHeight: "1.2",
        }}
      >
        <span>I</span>
        <span>D</span>
        <span>I</span>
        <span>D</span>
        {/* IT stacked vertically inside red solid badge */}
        <span className="bg-red-600 text-white font-mono px-1 rounded-sm text-[10px] md:text-[12px] font-bold mt-1 shadow-md shadow-red-950 flex items-center justify-center w-5 h-5 leading-none">
          IT
        </span>
      </motion.div>
    </div>
  );
}

