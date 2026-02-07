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

        // Scroll to Page 2 position (scroll progress ~0.3)
        const containerHeight = containerRef.current?.offsetHeight || window.innerHeight * 5;
        window.scrollTo({ top: containerHeight * 0.3, behavior: 'smooth' });
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
    // Globe moves Right (25%) -> Center (0%) -> stays centered in Screen 2 -> Up (-60%) in Screen 3
    const globeXClicked = useTransform(smoothProgress, [0.1, 0.3, 0.6], ["25%", "0%", "0%"]); // Stay at center 0% during Screen 2
    const globeYClicked = useTransform(smoothProgress, [0.3, 0.6, 0.8], ["0%", "0%", "-60%"]); // Stay at 0% during Screen 2, then move up
    const globeScaleClicked = useTransform(smoothProgress, [0.1, 0.3, 0.6], [1, 1.0, 1.0]); // Keep scale at 1.0 (no zoom)
    const globeOpacityClicked = useTransform(smoothProgress, [0.6, 0.8], [1, 0]);

    // Active Transforms
    const globeX = countryClicked ? globeXClicked : globeXDirect;
    const globeY = countryClicked ? globeYClicked : globeYDirect;
    const globeScale = countryClicked ? globeScaleClicked : globeScaleDirect;
    const globeOpacity = countryClicked ? globeOpacityClicked : globeOpacityDirect;


    // --- PAGE 2: SEARCH BAR & COUNTRY DETAILS (Only if clicked) ---
    const searchOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65],
        countryClicked ? [0, 1, 1, 0] : [0, 0, 0, 0]
    );
    const searchY = useTransform(smoothProgress, [0.25, 0.35], ["50px", "0px"]);

    // Country Details Panel - only visible in Page 2 (scroll 0.3-0.6)
    const countryDetailsOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65],
        countryClicked ? [0, 1, 1, 0] : [0, 0, 0, 0]
    );

    // --- PAGE 3: FINAL TEXT (Always appears at end) ---
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

    // Prevent page scroll when interacting with the details panel
    // (we stop wheel / touch events from propagating to the page)
    const stopScrollPropagation = (e) => {
        // prevent default scrolling behavior and stop propagation up to window
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    };

    return (
        <section ref={containerRef} className="h-[500vh] relative w-full bg-background">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Backgrounds */}
                <div className="absolute inset-0 z-[-1] bg-background" />

                {/* Globe */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full z-[1] will-change-transform opacity-30 mix-blend-multiply pointer-events-none"
                    initial={{ x: "60%", opacity: 0 }} // Start further right
                    animate={globeControls}
                    style={{
                        x: globeX,
                        y: globeY,
                        scale: globeScale,
                        opacity: globeOpacity
                    }}
                >
                    <GlobeScene onCountryClick={handleCountryClick} />
                </motion.div>

                {/* PAGE 1: Text (Left Side, Upper Third) */}
                <motion.div
                    className="absolute left-12 md:left-24 top-[30%] -translate-y-1/2 max-w-[600px] max-lg:max-w-[500px] max-md:max-w-[85%] max-md:left-8 z-10 text-left will-change-transform"
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
                        custom={4.5}
                    >
                        <p className="mt-6 text-[clamp(1rem,1.5vw,1.25rem)] text-text-light font-light leading-relaxed">
                            AI-powered intelligence for the pharmaceutical industry
                        </p>
                        <p className="mt-4 text-sm text-primary/80 font-medium">
                            Click a country to explore insights →
                        </p>
                    </motion.div>
                </motion.div>

                {/* PAGE 2: Search Bar (Bottom Center) */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[650px] max-lg:max-w-[550px] max-md:w-[92%] max-md:bottom-24 will-change-transform"
                    style={{ opacity: searchOpacity }}
                >
                    {/* Centered pill — removed the Explore button per request */}
                    <div className="bg-white/20 backdrop-blur-[60px] border border-white/30 rounded-[60px] px-6 py-4 max-md:px-4 max-md:py-3 flex items-center gap-4 max-md:gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.1),0_1px_1px_rgba(255,255,255,0.4)_inset,0_-1px_1px_rgba(0,0,0,0.05)_inset] transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-white/30 hover:border-white/40">

                        <svg className="w-5 h-5 text-primary/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" strokeWidth="2" />
                        </svg>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-primary font-sans text-base max-md:text-sm font-normal py-2 placeholder:text-primary/50"
                            placeholder="Search therapeutic areas, drugs, or insights..."
                        />
                        {/* Explore button removed */}
                    </div>
                </motion.div>

                {/* Country Details Panel (Bottom Right) - Enhanced with News & Data */}
                {selectedCountry && (
                    <motion.div
                        // prevent wheel/touch events inside this panel from scrolling the page
                        onWheel={(e) => stopScrollPropagation(e)}
                        onTouchStart={(e) => stopScrollPropagation(e)}
                        onTouchMove={(e) => stopScrollPropagation(e)}
                        style={{ touchAction: 'none', opacity: countryDetailsOpacity }}
                        className="absolute bottom-8 right-8 max-md:bottom-4 max-md:right-4 z-30 w-[320px] max-md:w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-[0_8px_32px_rgba(8,32,82,0.15)] overflow-hidden"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="p-5 max-md:p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-primary">
                                    {selectedCountry?.properties?.ADMIN || selectedCountry?.properties?.name}
                                </h3>
                                <button
                                    onClick={() => setSelectedCountry(null)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary/60 hover:bg-primary/20 transition-colors text-lg"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Key Metrics */}
                            <div className="bg-primary/5 rounded-xl p-4 mb-4">
                                <h4 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-3">Market Overview</h4>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-primary/70">Market Size</span>
                                        <span className="font-semibold text-primary">$24.8B</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-primary/70">Growth Rate</span>
                                        <span className="font-semibold text-green-600">+8.3% YoY</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-primary/70">Active Trials</span>
                                        <span className="font-semibold text-primary">1,247</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-primary/70">Key Area</span>
                                        <span className="font-medium text-primary">Oncology</span>
                                    </div>
                                </div>
                            </div>

                            {/* Latest News */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-3">Latest Insights</h4>
                                <div className="space-y-3">
                                    <div className="bg-white/50 rounded-lg p-3 border border-primary/5 hover:border-primary/20 transition-colors">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                            <div>
                                                <p className="text-xs text-primary/90 leading-relaxed">New immunotherapy trial shows 42% improvement in patient outcomes</p>
                                                <span className="text-[10px] text-primary/50 mt-1 block">2 hours ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-3 border border-primary/5 hover:border-primary/20 transition-colors">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                            <div>
                                                <p className="text-xs text-primary/90 leading-relaxed">Regulatory approval granted for breakthrough diabetes treatment</p>
                                                <span className="text-[10px] text-primary/50 mt-1 block">5 hours ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-3 border border-primary/5 hover:border-primary/20 transition-colors">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                                            <div>
                                                <p className="text-xs text-primary/90 leading-relaxed">Market expansion in rare disease therapeutics sector</p>
                                                <span className="text-[10px] text-primary/50 mt-1 block">1 day ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                View Full Report →
                            </button>
                        </div>
                    </motion.div>
                )}

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
