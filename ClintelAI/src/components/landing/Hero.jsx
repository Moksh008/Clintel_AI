import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion, useSpring, useAnimation } from 'framer-motion';
import GlobeScene from './GlobeScene';


const Hero = ({ onScrollStateChange }) => {
    const containerRef = useRef(null);
    const [countryClicked, setCountryClicked] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Initial Controls for Entry Animation (Auto-play on load)
    const textControls = useAnimation();
    const globeControls = useAnimation();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 50,
        damping: 20,
        restDelta: 0.001
    });

    // Auto-play animations on mount
    useEffect(() => {
        const sequence = async () => {
            // 1. Globe enters from right
            globeControls.start({
                x: "25%", // End position (Right side)
                opacity: 1,
                transition: { duration: 1.5, ease: "easeOut" }
            });

            // 2. Text words appear
            await textControls.start(i => ({
                opacity: 1,
                y: 0,
                transition: { delay: i * 0.2 + 0.5, duration: 0.8, ease: "easeOut" }
            }));
        };
        sequence();
    }, []);

    // Handle country click
    const handleCountryClick = (country) => {
        setCountryClicked(true);
        setSelectedCountry(country);

        // Optional: Auto-scroll to Phase 2? 
        // For now, we just enable the Phase 2 path.
        // window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };


    // ============================================
    // SCROLL TRANSFORMATIONS
    // ============================================

    // --- PAGE 1 EXIT (Scroll 0 -> 20%) ---
    // Text fades out
    const heroTextOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
    const heroTextY = useTransform(smoothProgress, [0, 0.2], ["0%", "-20%"]);

    // --- GLOBE MOVEMENT PATHS ---

    // PATH A: NO CLICK (Direct 1 -> 3)
    // Globe stays on right (25%) and just moves up/fades out
    const globeXDirect = useTransform(smoothProgress, [0, 1], ["25%", "25%"]);
    const globeYDirect = useTransform(smoothProgress, [0, 0.3], ["0%", "-100%"]); // Moves up quickly
    const globeScaleDirect = useTransform(smoothProgress, [0, 0.3], [1, 0.8]);
    const globeOpacityDirect = useTransform(smoothProgress, [0.1, 0.3], [1, 0]);

    // PATH B: CLICKED (1 -> 2 -> 3)
    // Globe moves Right (25%) -> Center (0%) -> Up (-60%)
    const globeXClicked = useTransform(smoothProgress, [0.1, 0.3], ["25%", "0%"]);
    const globeYClicked = useTransform(smoothProgress, [0.6, 0.8], ["0%", "-60%"]);
    const globeScaleClicked = useTransform(smoothProgress, [0.1, 0.3, 0.6], [1, 1.2, 1.2]);
    const globeOpacityClicked = useTransform(smoothProgress, [0.6, 0.8], [1, 0]);

    // Active Transforms
    const globeX = countryClicked ? globeXClicked : globeXDirect;
    const globeY = countryClicked ? globeYClicked : globeYDirect;
    // IMPORTANT: We need to merge the `animate` value (initial entry) with the scroll value.
    // Framer Motion handles this if we use `style` for scroll and `animate` for entry, 
    // but they might conflict. 
    // Better approach: The `x` value in `style` overrides `animate` once movement starts.
    // However, `animate` sets the "base" value.

    const globeScale = countryClicked ? globeScaleClicked : globeScaleDirect;
    const globeOpacity = countryClicked ? globeOpacityClicked : globeOpacityDirect;


    // --- PAGE 2: SEARCH BAR (Only if clicked) ---
    const searchOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65],
        countryClicked ? [0, 1, 1, 0] : [0, 0, 0, 0]
    );
    const searchY = useTransform(smoothProgress, [0.25, 0.35], ["50px", "0px"]);

    // --- PAGE 3: FINAL TEXT (Always appears at end) ---
    // If Direct: Appears earlier (since we skip P2)
    // If Clicked: Appears later (after P2)
    const p3Start = countryClicked ? 0.7 : 0.3; // Starts much earlier if direct

    const bgWhiteOpacity = useTransform(smoothProgress,
        countryClicked ? [0.6, 0.75] : [0.25, 0.4],
        [0, 1]
    );

    const fWord1Op = useTransform(smoothProgress, [p3Start, p3Start + 0.05], [0, 1]);
    const fWord1Y = useTransform(smoothProgress, [p3Start, p3Start + 0.05], [30, 0]);

    const fWord2Op = useTransform(smoothProgress, [p3Start + 0.03, p3Start + 0.08], [0, 1]);
    const fWord2Y = useTransform(smoothProgress, [p3Start + 0.03, p3Start + 0.08], [30, 0]);

    const fWord3Op = useTransform(smoothProgress, [p3Start + 0.06, p3Start + 0.11], [0, 1]);
    const fWord3Y = useTransform(smoothProgress, [p3Start + 0.06, p3Start + 0.11], [30, 0]);

    const fWord4Op = useTransform(smoothProgress, [p3Start + 0.09, p3Start + 0.14], [0, 1]);
    const fWord4Y = useTransform(smoothProgress, [p3Start + 0.09, p3Start + 0.14], [30, 0]);

    const fSubOp = useTransform(smoothProgress, [p3Start + 0.15, p3Start + 0.25], [0, 1]);

    // Navbar logic
    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (latest) => {
            if (latest > 0.05 && latest < 0.95) {
                onScrollStateChange?.(false);
            } else {
                onScrollStateChange?.(true);
            }
        });
        return () => unsubscribe();
    }, [smoothProgress, onScrollStateChange]);

    return (
        <section ref={containerRef} className="h-[500vh] relative w-full bg-background">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Backgrounds */}
                <div className="absolute inset-0 z-[-1] bg-background" />

                {/* Globe */}
                {/* Initial: x=50% (off), animate to 25% (right). Scroll takes over x. */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full z-[1] will-change-transform opacity-30 mix-blend-multiply pointer-events-none"
                    initial={{ x: "60%", opacity: 0 }} // Start further right
                    animate={globeControls}
                    style={{
                        // We apply scroll transforms. 
                        // Note: If countryClicked is false, globeXDirect is constant "25%".
                        // This matches the `animate` end state, so it should be seamless.
                        x: globeX,
                        y: globeY,
                        scale: globeScale,
                        opacity: globeOpacity
                    }}
                >
                    <GlobeScene onCountryClick={handleCountryClick} />
                </motion.div>

                {/* PAGE 1: Text (Left) */}
                <motion.div
                    className="absolute left-[8%] max-lg:left-[6%] max-md:left-[5%] top-1/2 -translate-y-1/2 max-w-[500px] max-lg:max-w-[450px] max-md:max-w-[65%] z-10 text-left will-change-transform"
                    style={{ opacity: heroTextOpacity, y: heroTextY }}
                >
                    <h1 className="font-sans font-bold text-[clamp(2rem,8vw,4.5rem)] leading-[1.1] text-primary tracking-tighter">
                        {["Transforming", "Data"].map((word, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={textControls}
                                className="will-change-transform inline-block mr-[0.25em]"
                            >
                                {word}
                            </motion.span>
                        ))}
                        <br />
                        {["Into", "Decisions"].map((word, i) => (
                            <motion.span
                                key={i + 2}
                                custom={i + 2}
                                initial={{ opacity: 0, y: 30 }}
                                animate={textControls}
                                className="font-serif italic font-normal text-primary inline-block mr-[0.25em]"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={textControls}
                        custom={4.5} // Delay after words
                    >
                        <p className="mt-6 text-[clamp(1rem,1.5vw,1.25rem)] text-text-light font-light leading-relaxed">
                            AI-powered intelligence for the pharmaceutical industry
                        </p>
                        <p className="mt-4 text-sm text-primary/80 font-medium">
                            Click a country to explore insights →
                        </p>
                    </motion.div>
                </motion.div>

                {/* PAGE 2: Search Bar */}
                <motion.div
                    className="absolute bottom-[15%] max-md:bottom-[10%] left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[650px] max-lg:max-w-[550px] max-md:w-[92%] will-change-transform"
                    style={{ opacity: searchOpacity, y: searchY }}
                >
                    <div className="bg-white/80 backdrop-blur-[40px] border border-primary/10 rounded-[60px] px-6 py-3.5 max-md:px-4 max-md:py-3 flex items-center gap-4 max-md:gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.05),0_1px_2px_rgba(255,255,255,0.8)_inset] transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-white/90 hover:border-primary/20">
                        {selectedCountry && (
                            <span className="bg-primary text-white px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0">
                                {selectedCountry?.properties?.ADMIN || selectedCountry?.properties?.name}
                            </span>
                        )}
                        <svg className="w-5 h-5 text-primary/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" strokeWidth="2" />
                        </svg>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-primary font-sans text-base max-md:text-sm font-normal py-2 placeholder:text-primary/40"
                            placeholder="Search therapeutic areas, drugs, or insights..."
                        />
                        <button className="bg-primary border-none rounded-full px-7 py-3 max-md:px-5 max-md:py-2.5 text-white font-sans text-sm max-md:text-xs font-semibold cursor-pointer transition-all duration-300 shrink-0 hover:-translate-y-0.5 hover:shadow-lg">
                            Explore
                        </button>
                    </div>
                </motion.div>

                {/* PAGE 3: Final Text */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-15 w-full max-w-[1000px] px-8">
                    <h2 className="font-serif font-semibold text-[clamp(2.5rem,6vw,5.5rem)] text-primary leading-[1.15] tracking-tighter mb-6">
                        {["Where", "Intelligence", "Meets"].map((word, i) => (
                            <motion.span
                                key={i}
                                style={{ opacity: [fWord1Op, fWord2Op, fWord3Op][i], y: [fWord1Y, fWord2Y, fWord3Y][i], display: "inline-block", marginRight: "0.25em" }}
                            >
                                {word}
                            </motion.span>
                        ))}
                        <motion.span
                            style={{ opacity: fWord4Op, y: fWord4Y, display: "inline-block" }}
                            className="text-primary"
                        >
                            Impact
                        </motion.span>
                    </h2>
                    <motion.p
                        className="font-sans text-[clamp(1rem,1.5vw,1.35rem)] text-text-light font-normal leading-relaxed will-change-transform"
                        style={{ opacity: fSubOp }}
                    >
                        Discover the future of pharmaceutical intelligence
                    </motion.p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
