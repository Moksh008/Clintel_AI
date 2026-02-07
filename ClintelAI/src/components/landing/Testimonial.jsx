"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"

const features = [
    {
        headline: "Orchestrate your entire market strategy from a single interface.",
        detail: "Global Command",
        sub: "Centralized Control",
        tag: "System Core",
    },
    {
        headline: "Turn raw signals into high-confidence execution plans.",
        detail: "Signal Processing",
        sub: "Noise Filtering",
        tag: "Intelligence",
    },
    {
        headline: "Realign resources instantly as the market shifts.",
        detail: "Adaptive Response",
        sub: "Agile Deployment",
        tag: "Velocity",
    },
]

export function Testimonial() {
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef(null)

    // Mouse position for magnetic effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 200 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    // Transform for parallax on the large number
    const numberX = useTransform(x, [-200, 200], [-30, 30])
    const numberY = useTransform(y, [-200, 200], [-15, 15])

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            mouseX.set(e.clientX - centerX)
            mouseY.set(e.clientY - centerY)
        }
    }

    const goNext = () => setActiveIndex((prev) => (prev + 1) % features.length)
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + features.length) % features.length)

    useEffect(() => {
        const timer = setInterval(goNext, 3500)
        return () => clearInterval(timer)
    }, [])

    const current = features[activeIndex]

    return (
        <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden relative">
            <div ref={containerRef} className="relative w-full max-w-5xl" onMouseMove={handleMouseMove}>

                {/* Oversized index number - positioned behind text */}
                <motion.div
                    className="absolute left-10 top-0 text-[28rem] font-bold text-primary/5 select-none pointer-events-none leading-none tracking-tighter z-0"
                    style={{ x: numberX, y: numberY }}
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={activeIndex}
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="block font-serif"
                        >
                            {String(activeIndex + 1).padStart(2, "0")}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                {/* Main content - asymmetric layout based on user snippet */}
                <div className="relative flex max-lg:flex-col z-10">
                    {/* Left column - vertical text */}
                    <div className="flex flex-col items-center justify-center pr-16 border-r border-primary/10 max-lg:border-r-0 max-lg:border-b max-lg:pb-8 max-lg:mb-8 max-lg:pr-0">
                        <motion.span
                            className="text-xs font-serif text-primary/60 tracking-[0.2em] uppercase max-lg:writing-mode-horizontal"
                            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Capabilities
                        </motion.span>

                        {/* Vertical progress line */}
                        <div className="relative h-32 w-px bg-primary/10 mt-8 max-lg:hidden">
                            <motion.div
                                className="absolute top-0 left-0 w-full bg-primary origin-top"
                                animate={{
                                    height: `${((activeIndex + 1) / features.length) * 100}%`,
                                }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>
                    </div>

                    {/* Center - main content */}
                    <div className="flex-1 pl-16 py-12 max-lg:pl-0 max-lg:py-0">
                        {/* Tag/Badge */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="mb-8"
                            >
                                <span className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.2em] uppercase font-bold text-primary/60 border-b border-primary/20 pb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pharma shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    {current.tag}
                                </span>
                            </motion.div>
                        </AnimatePresence>

                        {/* Headline with character reveal */}
                        <div className="relative mb-12 min-h-[140px] flex items-center">
                            <AnimatePresence mode="wait">
                                <motion.blockquote
                                    key={activeIndex}
                                    className="text-4xl md:text-5xl font-serif text-primary leading-[1.15] tracking-tight"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    {current.headline.split(" ").map((word, i) => (
                                        <motion.span
                                            key={i}
                                            className="inline-block mr-[0.3em]"
                                            variants={{
                                                hidden: { opacity: 0, y: 20, rotateX: 90 },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    rotateX: 0,
                                                    transition: {
                                                        duration: 0.5,
                                                        delay: i * 0.05,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    },
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    y: -10,
                                                    transition: { duration: 0.2, delay: i * 0.02 },
                                                },
                                            }}
                                        >
                                            {word}
                                        </motion.span>
                                    ))}
                                </motion.blockquote>
                            </AnimatePresence>
                        </div>

                        {/* Details row */}
                        <div className="flex items-end justify-between">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className="flex items-center gap-4"
                                >
                                    {/* Animated line before name */}
                                    <motion.div
                                        className="w-8 h-px bg-primary"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                        style={{ originX: 0 }}
                                    />
                                    <div>
                                        <p className="text-base font-bold text-primary font-serif">{current.detail}</p>
                                        <p className="text-sm text-primary/60 font-sans tracking-wide uppercase">{current.sub}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={goPrev}
                                    className="group relative w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-primary"
                                        initial={{ x: "-100%" }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="relative z-10 text-primary group-hover:text-background transition-colors"
                                    >
                                        <path
                                            d="M10 12L6 8L10 4"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    onClick={goNext}
                                    className="group relative w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-primary"
                                        initial={{ x: "100%" }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="relative z-10 text-primary group-hover:text-background transition-colors"
                                    >
                                        <path
                                            d="M6 4L10 8L6 12"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                                    
            </div>
        </div>
    )
}
