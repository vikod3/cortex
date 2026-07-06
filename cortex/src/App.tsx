import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { TextEffect } from '@/src/components/ui/text-effect';

const blurSlideVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.015 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.01, staggerDirection: -1 as const },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(10px) brightness(0%)',
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px) brightness(100%)',
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: 'blur(10px) brightness(0%)',
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  },
};

const otherElementVariants = {
  hidden: { 
    opacity: 0, 
    y: 35,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  },
  exit: { 
    opacity: 0, 
    y: -25,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  }
};

export default function App() {
  // Section Scroll & Intersection refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);
  
  // Checking inView state
  const inViewHero = useInView(heroRef, { amount: 0.15, once: false });
  const inViewAbout = useInView(aboutRef, { amount: 0.15, once: false });
  const inViewSolutions = useInView(solutionsRef, { amount: 0.1, once: false });
  
  // Video scroll progress over first two sections (Hero and About)
  const { scrollYProgress: videoScrollProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end start"]
  });

  // Fade out the background video exactly when reaching the bottom of the second section
  const videoOpacity = useTransform(videoScrollProgress, [0.9, 1.0], [1, 0]);

  // Sync scroll position with video's current frame using requestAnimationFrame and Lerp
  useEffect(() => {
    const video = videoRef.current;
    const container = scrollContainerRef.current;
    if (!video || !container) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let animationFrameId: number;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.scrollHeight;
      if (scrollHeight <= 0) return;

      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / scrollHeight));
    };

    const updateVideoProgress = () => {
      // Linear interpolation (lerp) for smooth easing
      // 0.08 offers a beautiful buttery-smooth follow effect
      currentProgress += (targetProgress - currentProgress) * 0.08;

      if (Math.abs(targetProgress - currentProgress) < 0.0001) {
        currentProgress = targetProgress;
      }

      const duration = video.duration;
      if (duration && !isNaN(duration)) {
        const targetTime = currentProgress * duration;
        // Update video frame if difference is meaningful and video is not currently seeking
        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.02) {
          video.currentTime = targetTime;
        }
      }

      animationFrameId = requestAnimationFrame(updateVideoProgress);
    };

    // Initialize positions
    handleScroll();
    currentProgress = targetProgress;

    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameId = requestAnimationFrame(updateVideoProgress);

    const handleLoadedMetadata = () => {
      handleScroll();
      currentProgress = targetProgress;
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: solutionsRef,
    offset: ["start start", "end end"]
  });

  // 1. Hero Scroll Progress
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroTitleOpacity = useTransform(heroScroll, [0, 0.45], [1, 0]);
  const heroTitleBlur = useTransform(heroScroll, [0, 0.45], ["blur(0px)", "blur(20px)"]);
  const heroTitleY = useTransform(heroScroll, [0, 0.45], [0, -60]);

  const heroOtherOpacity = useTransform(heroScroll, [0, 0.45], [1, 0]);
  const heroOtherY = useTransform(heroScroll, [0, 0.45], [0, -40]);

  // 2. About Scroll Progress
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });

  const aboutTitleOpacity = useTransform(aboutScroll, [0.1, 0.35, 0.65, 0.9], [0, 1, 1, 0]);
  const aboutTitleBlur = useTransform(aboutScroll, [0.1, 0.35, 0.65, 0.9], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"]);
  const aboutTitleY = useTransform(aboutScroll, [0.1, 0.35, 0.65, 0.9], [60, 0, 0, -60]);

  const aboutOtherOpacity = useTransform(aboutScroll, [0.15, 0.35, 0.65, 0.85], [0, 1, 1, 0]);
  const aboutOtherY = useTransform(aboutScroll, [0.15, 0.35, 0.65, 0.85], [50, 0, 0, -50]);

  // Solutions transforms for sticky split and ending (3-stage sequence)
  // Set 1 range: scrollYProgress from 0 to 0.29
  const opacitySet1 = useTransform(scrollYProgress, [0, 0.05, 0.22, 0.29], [0, 1, 1, 0]);
  const blurSet1 = useTransform(scrollYProgress, [0, 0.05, 0.22, 0.29], ["blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"]);
  const yTopSet1 = useTransform(scrollYProgress, [0, 0.29], ["0px", "-120px"]);
  const yBottomSet1 = useTransform(scrollYProgress, [0, 0.29], ["0px", "120px"]);

  // Set 2 range: scrollYProgress from 0.33 to 0.65
  const opacitySet2 = useTransform(scrollYProgress, [0.33, 0.40, 0.58, 0.65], [0, 1, 1, 0]);
  const blurSet2 = useTransform(scrollYProgress, [0.33, 0.40, 0.58, 0.65], ["blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"]);
  const yTopSet2 = useTransform(scrollYProgress, [0.33, 0.65], ["0px", "-120px"]);
  const yBottomSet2 = useTransform(scrollYProgress, [0.33, 0.65], ["0px", "120px"]);

  // Set 3 range: scrollYProgress from 0.69 to 0.99
  const opacitySet3 = useTransform(scrollYProgress, [0.69, 0.76, 0.92, 0.99], [0, 1, 1, 0]);
  const blurSet3 = useTransform(scrollYProgress, [0.69, 0.76, 0.92, 0.99], ["blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"]);
  const yTopSet3 = useTransform(scrollYProgress, [0.69, 0.99], ["0px", "-120px"]);
  const yBottomSet3 = useTransform(scrollYProgress, [0.69, 0.99], ["0px", "120px"]);

  // Background image parallax zoom
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.0]);

  return (
    <div className="relative w-full min-h-screen selection:bg-white selection:text-brand-bg">
      
      {/* Header Navigation */}
      <header className="fixed top-4 lg:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] md:w-auto bg-slate-950/55 backdrop-blur-xl rounded-xl p-1 pl-1 pr-5 flex items-center justify-between md:gap-8 transition-all">
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/15 rounded-lg text-white text-xl select-none leading-none cursor-pointer transition-all duration-300 hover:rotate-45 active:scale-95 shrink-0">
          ✳
        </div>
        <nav className="flex items-center gap-4 lg:gap-5">
          <a href="#cortex" className="text-white/75 hover:text-white text-xs lg:text-[13.5px] font-medium tracking-tight whitespace-nowrap transition-colors">Cortex</a>
          <a href="#solutions" className="text-white/75 hover:text-white text-xs lg:text-[13.5px] font-medium tracking-tight whitespace-nowrap transition-colors">Interface</a>
          <a href="#developer" className="text-white/75 hover:text-white text-xs lg:text-[13.5px] font-medium tracking-tight whitespace-nowrap transition-colors">Developer</a>
          <a href="#support" className="text-white/75 hover:text-white text-xs lg:text-[13.5px] font-medium tracking-tight whitespace-nowrap transition-colors">Support</a>
        </nav>
      </header>

      {/* Scroll-driven Background Video */}
      <motion.div 
        style={{ opacity: videoOpacity }}
        className="fixed inset-0 w-full h-full z-0 select-none pointer-events-none overflow-hidden"
      >
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260704_111356_a61893e1-7df9-45d6-a986-a651b6cb7392.mp4"
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      </motion.div>

      {/* Wrapper containing the Hero and About sections for precise scroll tracking */}
      <div ref={scrollContainerRef} className="relative z-10 w-full bg-transparent">
        {/* Hero Content with Immersive Background */}
        <section ref={heroRef} className="relative w-full h-screen flex items-center overflow-hidden bg-transparent">
          <main className="relative z-10 w-full max-w-none mx-auto h-screen px-4 lg:px-[56px] pt-28 lg:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Giant Headline & Button */}
            <div className="lg:col-span-7 flex flex-col justify-center h-full lg:-translate-y-[112px] transform">
              <motion.div style={{ opacity: heroTitleOpacity, filter: heroTitleBlur, y: heroTitleY }}>
                <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight mb-10 text-white flex flex-col">
                  <span className="block">
                    <TextEffect
                      per="char"
                      variants={blurSlideVariants}
                      trigger={inViewHero}
                    >
                      Mind
                    </TextEffect>
                  </span>
                  <span className="block">
                    <TextEffect
                      per="char"
                      variants={blurSlideVariants}
                      trigger={inViewHero}
                      delay={0.15}
                    >
                      Amplified.
                    </TextEffect>
                  </span>
                </h1>
              </motion.div>
              
              <motion.div style={{ opacity: heroOtherOpacity, y: heroOtherY }}>
                <motion.div
                  variants={otherElementVariants}
                  initial="hidden"
                  animate={inViewHero ? "visible" : "exit"}
                >
                  <a href="#discover" className="group inline-flex items-center justify-center bg-white hover:bg-white/90 text-brand-bg rounded-full px-7 py-3.5 text-sm font-normal w-fit gap-3 shadow-none transition-all">
                    <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-brand-bg text-white transition-transform group-hover:scale-105">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span className="tracking-tight">Discover Cortex</span>
                  </a>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column: Concept paragraph */}
            <motion.div
              style={{ opacity: heroOtherOpacity, y: heroOtherY }}
              className="lg:col-span-4 lg:col-start-9 flex flex-col justify-center lg:self-end lg:mb-[56px] lg:justify-self-end w-full max-w-[328px]"
            >
              <motion.div
                variants={otherElementVariants}
                initial="hidden"
                animate={inViewHero ? "visible" : "exit"}
              >
                <div className="text-[11.5px] font-normal uppercase text-white/50 tracking-[0.15em] mb-3">
                  001 — Concept
                </div>
                <p className="text-[14.5px] font-normal leading-relaxed text-white tracking-tight">
                  A screen is a bottleneck. Cortex is a premium neural interface that streams your intention directly to AI, amplifying your natural mind.
                </p>
              </motion.div>
            </motion.div>
          </main>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="w-full max-w-none mx-auto px-4 lg:px-[56px] h-screen min-h-[600px] py-[56px] flex flex-col justify-between items-start bg-transparent">
          {/* Top: Caption & Big Text stretching full width */}
          <div className="w-full flex flex-col gap-6">
            <motion.div style={{ opacity: aboutOtherOpacity, y: aboutOtherY }}>
              <motion.div
                variants={otherElementVariants}
                initial="hidden"
                animate={inViewAbout ? "visible" : "exit"}
              >
                <span className="text-[11.5px] font-medium uppercase text-white/50 tracking-[0.15em]">
                  002 — Neural Extension
                </span>
              </motion.div>
            </motion.div>
            <div className="w-full">
              <motion.div style={{ opacity: aboutTitleOpacity, filter: aboutTitleBlur, y: aboutTitleY }}>
                <TextEffect
                  per="word"
                  as="p"
                  variants={blurSlideVariants}
                  trigger={inViewAbout}
                  className="text-[clamp(24px,3.2vw,40px)] font-medium leading-[1.25] tracking-tight text-white max-w-[1200px]"
                >
                  ① Cortex is a premium, circular neural interface that rests seamlessly on your temple, establishing a real-time thought connection that augments your cognition with advanced AI models.
                </TextEffect>
              </motion.div>
            </div>
          </div>

          {/* Bottom: Projects Table aligned to col-start-9 col-span-4 to match the hero section right-column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-8">
            <motion.div
              style={{ opacity: aboutOtherOpacity, y: aboutOtherY }}
              className="lg:col-start-9 lg:col-span-4 lg:justify-self-end flex flex-col w-full max-w-[328px]"
            >
              <motion.div
                variants={otherElementVariants}
                initial="hidden"
                animate={inViewAbout ? "visible" : "exit"}
                className="w-full"
              >
                <div className="text-[11.5px] font-medium uppercase text-white/50 tracking-[0.15em] mb-5">
                  Capabilities:
                </div>
                <div className="flex flex-col w-full border-b border-white/15">
                  <a href="#retrieval" className="group flex justify-between items-center py-4 border-t border-white/15 text-white transition-opacity">
                    <span className="text-[14.5px] font-medium tracking-tight">Instant Knowledge Retrieval</span>
                    <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white text-brand-bg transition-transform group-hover:scale-110 ml-3 shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </a>
                  <a href="#translation" className="group flex justify-between items-center py-4 border-t border-white/15 text-white transition-opacity">
                    <span className="text-[14.5px] font-medium tracking-tight">Seamless Thought Translation</span>
                    <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white text-brand-bg transition-transform group-hover:scale-110 ml-3 shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </a>
                  <a href="#problem-solving" className="group flex justify-between items-center py-4 border-t border-white/15 text-white transition-opacity">
                    <span className="text-[14.5px] font-medium tracking-tight">Generative Reasoning Flow</span>
                    <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white text-brand-bg transition-transform group-hover:scale-110 ml-3 shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Solutions Section (Scroll-driven Sticky Split Effect) */}
      <section id="solutions" ref={solutionsRef} className="w-full min-h-[350vh] bg-transparent relative">
        <div className="w-full h-screen sticky top-0 overflow-hidden flex flex-col justify-between">
          
          {/* Parallax Background Image with Overlays */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
            <motion.img 
              src="https://i.ibb.co/GQcNTzW7/Frame-8118.png"
              alt="Cortex Tech Background" 
              className="w-full h-full object-cover"
              style={{ scale: bgScale }}
            />
          </div>

          {/* Inner Content Layer */}
          <div className="relative z-10 w-full max-w-none mx-auto h-full px-4 lg:px-[56px] flex flex-col justify-center items-start">
            
            <div className="w-full max-w-[1000px] h-[320px] lg:h-[400px] relative flex items-center justify-start">
              
              {/* Set 1: Silent thought. / Cortex. */}
              <motion.div 
                style={{ opacity: opacitySet1, filter: blurSet1 }}
                className="absolute inset-0 flex flex-col gap-[40px] justify-center pointer-events-none"
              >
                <motion.div style={{ y: yTopSet1 }} className="w-full flex flex-col gap-6">
                  <span className="text-[11.5px] font-medium uppercase text-white/50 tracking-[0.15em]">
                    003 — Interface
                  </span>
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Silent thought.
                  </h1>
                </motion.div>
                <motion.div style={{ y: yBottomSet1 }} className="w-full">
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Cortex.
                  </h1>
                </motion.div>
              </motion.div>

              {/* Set 2: Cognitive flow. / Intuition. */}
              <motion.div 
                style={{ opacity: opacitySet2, filter: blurSet2 }}
                className="absolute inset-0 flex flex-col gap-[40px] justify-center pointer-events-none"
              >
                <motion.div style={{ y: yTopSet2 }} className="w-full flex flex-col gap-6">
                  <span className="text-[11.5px] font-medium uppercase text-white/50 tracking-[0.15em]">
                    004 — Performance
                  </span>
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Cognitive flow.
                  </h1>
                </motion.div>
                <motion.div style={{ y: yBottomSet2 }} className="w-full">
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Intuition.
                  </h1>
                </motion.div>
              </motion.div>

              {/* Set 3: Instant recall. / Insight. */}
              <motion.div 
                style={{ opacity: opacitySet3, filter: blurSet3 }}
                className="absolute inset-0 flex flex-col gap-[40px] justify-center pointer-events-none"
              >
                <motion.div style={{ y: yTopSet3 }} className="w-full flex flex-col gap-6">
                  <span className="text-[11.5px] font-medium uppercase text-white/50 tracking-[0.15em]">
                    005 — Symbiosis
                  </span>
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Instant recall.
                  </h1>
                </motion.div>
                <motion.div style={{ y: yBottomSet3 }} className="w-full">
                  <h1 className="text-[clamp(40px,6.5vw,105px)] font-normal leading-[0.95] tracking-tight text-white w-full">
                    Insight.
                  </h1>
                </motion.div>
              </motion.div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
