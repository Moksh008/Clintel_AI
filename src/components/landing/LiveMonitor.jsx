import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Clock,
    Target,
    Zap,
    Lock,
    Globe,
    Radio,
    ArrowUpRight,
    TrendingUp,
    ChevronRight,
    Database,
    BarChart3,
    Layers
} from 'lucide-react';

// Hook for mouse tracking within element
const useMousePosition = (ref) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (e) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        const element = ref.current;
        if (element) {
            element.addEventListener('mousemove', updateMousePosition);
            return () => element.removeEventListener('mousemove', updateMousePosition);
        }
    }, [ref]);

    return mousePosition;
};

// Interactive Card Wrapper with tilt and glow
const InteractiveCard = ({ children, className, glowColor = "rgba(8,32,82,0.15)" }) => {
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [0, 300], [5, -5]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [0, 300], [-5, 5]), { stiffness: 300, damping: 30 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        mouseX.set(150);
        mouseY.set(150);
    };

    return (
        <motion.div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{
                y: -6,
                boxShadow: `0 25px 50px ${glowColor}`,
                transition: { duration: 0.3 }
            }}
        >
            {children}
        </motion.div>
    );
};

// Component: Metric with minimal professional style
const MetricDisplay = ({ label, value, unit, trend, isPositive }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[0.7rem] text-primary/60">
            <span>{label}</span>
            {trend && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-[0.65rem] px-1 py-px rounded-sm ml-1.5 ${isPositive ? 'text-[#34C759] bg-[#34C759]/10' : 'text-red-500 bg-red-500/10'}`}
                >
                    {isPositive ? '↑' : '↓'} {trend}%
                </motion.span>
            )}
        </div>
        <div className="flex items-baseline gap-0.5">
            <motion.span
                className="text-[1.1rem] font-bold text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {value}
            </motion.span>
            <span className="text-xs text-primary/60">{unit}</span>
        </div>
    </div>
);

// Component: Feed Item with hover effect
const StreamItem = ({ time, category, title, delay = 0 }) => (
    <motion.div
        className="flex flex-col gap-1 pb-3 border-b border-primary/10 last:border-b-0 cursor-pointer group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        whileHover={{ x: 4, backgroundColor: "rgba(8,32,82,0.02)" }}
    >
        <div className="flex items-center gap-2.5">
            <span className="font-mono text-[0.7rem] text-primary/40">{time}</span>
            <motion.span
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded
                    ${category === 'LAUNCH' ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' : ''}
                    ${category === 'LABEL' ? 'bg-[#EAB308]/15 text-[#EAB308]' : ''}
                    ${category === 'MESSAGING' ? 'bg-primary/15 text-primary' : ''}
                `}
                whileHover={{ scale: 1.05 }}
            >
                {category}
            </motion.span>
        </div>
        <div className="text-[0.85rem] text-text-light flex items-center justify-between">
            <span>{title}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    </motion.div>
);

// Data Flow Visualization - Simple & Bold
const DataFlowViz = () => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg overflow-hidden">
            {/* Center Core */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center"
                animate={{
                    scale: [1, 1.1, 1],
                    borderColor: ['rgba(8,32,82,1)', 'rgba(8,32,82,0.5)', 'rgba(8,32,82,1)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Globe className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Orbiting Data Points */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        background: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#FCD34D' : '#34C759',
                        top: '50%',
                        left: '50%',
                    }}
                    animate={{
                        x: [
                            Math.cos((angle * Math.PI) / 180) * 50 - 6,
                            Math.cos(((angle + 360) * Math.PI) / 180) * 50 - 6
                        ],
                        y: [
                            Math.sin((angle * Math.PI) / 180) * 50 - 6,
                            Math.sin(((angle + 360) * Math.PI) / 180) * 50 - 6
                        ],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.3
                    }}
                />
            ))}

            {/* Corner Stats */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
                <motion.div
                    className="text-xs font-bold text-primary"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    GLOBAL
                </motion.div>
                <div className="text-[0.6rem] text-primary/60">6 Regions</div>
            </div>

            <div className="absolute bottom-3 right-3">
                <motion.div
                    className="text-lg font-bold text-[#34C759]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    98%
                </motion.div>
                <div className="text-[0.6rem] text-primary/60 text-right">Coverage</div>
            </div>
        </div>
    );
};

// Intelligence Types Breakdown
const IntelligenceTypes = () => {
    const types = [
        { label: 'Clinical', value: 42, color: '#8B5CF6', icon: Database },
        { label: 'Market', value: 28, color: '#34C759', icon: BarChart3 },
        { label: 'Regulatory', value: 30, color: '#FCD34D', icon: Layers },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center gap-3">
                {types.map((type, i) => (
                    <motion.div
                        key={type.label}
                        className="group cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 4 }}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <type.icon size={12} className="text-primary/60" />
                                <span className="text-[0.7rem] text-primary/60">{type.label}</span>
                            </div>
                            <motion.span
                                className="text-xs font-bold text-primary"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            >
                                {type.value}%
                            </motion.span>
                        </div>
                        <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ backgroundColor: type.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${type.value}%` }}
                                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                            />
                            <motion.div
                                className="absolute inset-y-0 w-8 opacity-40"
                                style={{
                                    background: `linear-gradient(90deg, transparent, ${type.color}, transparent)`,
                                }}
                                animate={{
                                    x: ['-100%', '400%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * 0.5
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-primary/10">
                <div className="flex justify-between items-center">
                    <span className="text-[0.65rem] text-primary/50">Total Sources</span>
                    <motion.span
                        className="text-sm font-bold text-primary"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        15,402
                    </motion.span>
                </div>
            </div>
        </div>
    );
};

// Interactive Bar Chart
const InteractiveBarChart = () => {
    const [hoveredBar, setHoveredBar] = useState(null);
    const heights = [45, 60, 50, 75, 65, 80, 55, 70, 90, 60, 85, 95, 75, 50, 65, 70, 80, 60, 50, 40];

    return (
        <div className="flex-1 flex items-end gap-[6px] mb-6 pb-2 border-b border-primary/5 px-2">
            {heights.map((h, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-t-[2px] min-h-[4px] cursor-pointer relative group"
                    style={{
                        height: `${h}%`,
                        background: hoveredBar === i
                            ? 'linear-gradient(to top, rgba(8,32,82,0.4), rgba(8,32,82,0.8))'
                            : 'linear-gradient(to top, rgba(8,32,82,0.2), rgba(8,32,82,0.6))'
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
                    whileHover={{ scaleY: 1.1, scaleX: 1.2 }}
                    onHoverStart={() => setHoveredBar(i)}
                    onHoverEnd={() => setHoveredBar(null)}
                >
                    {/* Tooltip */}
                    {hoveredBar === i && (
                        <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white px-2 py-0.5 rounded text-[0.6rem] whitespace-nowrap"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {h}%
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

const LiveMonitor = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.95]);

    // Animation variants for staggered card entrance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <motion.section
            ref={containerRef}
            className="relative min-h-screen py-24 px-[5%] bg-background flex flex-col items-center text-primary overflow-hidden"
            style={{ opacity, scale }}
        >
            {/* Animated Grid Background */}
            <motion.div
                className="absolute inset-0 bg-[linear-gradient(rgba(8,32,82,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,32,82,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
                style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [0.3, 0.7]) }}
            />

            <div className="text-center mb-16 max-w-4xl z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-[20px] text-[0.7rem] font-bold tracking-[0.05em] text-primary mb-6"
                >
                    <motion.span
                        className="w-1.5 h-1.5 bg-[#34C759] rounded-full shadow-[0_0_8px_#34C759]"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    LIVE MONITORING ACTIVE
                </motion.div>
                <motion.h2
                    className="text-[3.5rem] font-light text-primary tracking-[-0.02em]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Ambient <span className="text-primary font-medium opacity-80">Intelligence System</span>
                </motion.h2>
            </div>

            {/* Bento Grid with Advanced Interactions */}
            <motion.div
                className="w-full max-w-[1200px]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="grid grid-cols-4 grid-rows-[240px_240px] gap-5 max-lg:grid-cols-2 max-lg:grid-rows-auto max-sm:grid-cols-1">

                    {/* BLOCK 1: INTELLIGENCE TYPES (Replaces Active Sources) */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-1 row-start-1"
                        glowColor="rgba(139,92,246,0.12)"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-5 uppercase tracking-[0.05em]">
                            <Layers size={14} className="text-primary opacity-80" /> INTELLIGENCE TYPES
                        </div>

                        <IntelligenceTypes />
                    </InteractiveCard>

                    {/* BLOCK 2: INTELLIGENCE VELOCITY */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-2 row-start-1 max-lg:col-span-2"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-5 uppercase tracking-[0.05em]">
                            <Activity size={14} className="text-primary opacity-80" /> SIGNAL VELOCITY (24H)
                        </div>
                        <InteractiveBarChart />
                        <div className="flex justify-around items-center">
                            <MetricDisplay label="Ingestion Rate" value="2.4k" unit="/s" trend="12" isPositive={true} />
                            <div className="w-px h-[30px] bg-primary/10"></div>
                            <MetricDisplay label="Processing Time" value="45" unit="ms" trend="2" isPositive={true} />
                        </div>
                    </InteractiveCard>

                    {/* BLOCK 3: DATA FLOW */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-1 row-start-1 relative"
                        glowColor="rgba(52,199,89,0.15)"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-3 uppercase tracking-[0.05em] relative z-10">
                            <Globe size={14} className="text-primary opacity-80" /> GLOBAL REACH
                        </div>
                        <div className="flex-1 relative z-10">
                            <DataFlowViz />
                        </div>
                    </InteractiveCard>

                    {/* BLOCK 4: CRITICAL FEED */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-2 row-start-2 max-lg:col-span-2"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-5 uppercase tracking-[0.05em]">
                            <Zap size={14} className="text-primary opacity-80" /> LIVE SIGNAL STREAM
                        </div>
                        <div className="flex flex-col gap-3">
                            <StreamItem time="10:42" category="LAUNCH" title="Competitor X: Phase III Efficacy Results Published" delay={0} />
                            <StreamItem time="10:15" category="LABEL" title="FDA Update: Safety Warning Added to Drug Y" delay={0.1} />
                            <StreamItem time="09:55" category="MESSAGING" title="New 'Patient First' Campaign Detected" delay={0.2} />
                        </div>
                    </InteractiveCard>

                    {/* BLOCK 5: IMPACT */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-1 row-start-2"
                        glowColor="rgba(255,107,107,0.15)"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-5 uppercase tracking-[0.05em]">
                            <AlertTriangle size={14} className="text-primary opacity-80" /> STRATEGIC RISK
                        </div>
                        <motion.div
                            className="flex-1 flex flex-col items-center justify-center bg-[#FF6B6B]/5 rounded-lg mb-2 border border-[#FF6B6B]/10 cursor-pointer"
                            whileHover={{
                                backgroundColor: "rgba(255,107,107,0.1)",
                                borderColor: "rgba(255,107,107,0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.span
                                className="text-2xl font-extrabold text-[#FF6B6B]"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                HIGH
                            </motion.span>
                            <span className="text-[0.6rem] text-[#FF6B6B]">Due to Launch Signal</span>
                        </motion.div>
                        <div className="mt-auto">
                            <motion.button
                                className="w-full py-2 bg-primary/5 border-none text-primary text-[0.7rem] rounded cursor-pointer"
                                whileHover={{ backgroundColor: "rgba(8,32,82,0.15)", scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Analyze
                            </motion.button>
                        </div>
                    </InteractiveCard>

                    {/* BLOCK 6: OUTPUT */}
                    <InteractiveCard
                        variants={cardVariants}
                        className="bg-white border border-primary/10 rounded-xl p-6 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(8,32,82,0.05)] col-span-1 row-start-2"
                    >
                        <div className="flex items-center gap-2.5 text-[0.7rem] font-bold text-primary/50 mb-5 uppercase tracking-[0.05em]">
                            <FileText size={14} className="text-primary opacity-80" /> GEN AI BRIEFS
                        </div>
                        <motion.div
                            className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mb-2 border border-primary/5 cursor-pointer"
                            whileHover={{
                                backgroundColor: "rgba(8,32,82,0.1)",
                                x: 4
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="text-[#34C759]"><CheckCircle2 size={16} /></div>
                            <div className="flex flex-col flex-1">
                                <span className="text-xs font-semibold text-primary">Launch Response</span>
                                <span className="text-[0.65rem] text-primary/60">Ready for Review</span>
                            </div>
                            <motion.div
                                className="text-[#34C759]"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowUpRight size={14} />
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mb-2 border border-primary/5"
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: [0.6, 0.8, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <motion.div
                                className="text-primary"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Clock size={16} />
                            </motion.div>
                            <div className="flex flex-col flex-1">
                                <span className="text-xs font-semibold text-primary">Label Analysis</span>
                                <span className="text-[0.65rem] text-primary/60">Generating...</span>
                            </div>
                        </motion.div>
                    </InteractiveCard>

                </div>
            </motion.div>
        </motion.section>
    );
};

export default LiveMonitor;
