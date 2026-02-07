import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    FileText,
    Target,
    Zap,
    MessageSquare,
    TrendingUp
} from 'lucide-react';


const BRIEFS = [
    {
        title: "GTM Strategy Update",
        content: "Shift focus to efficacy data immediately. Competitor 'Drug B' has weakened their position on long-term outcomes. We have a 6-month window to capture undecided prescribers.",
        icon: Target,
        color: "#4DA8DA",
        action: "View Full Strategy"
    },
    {
        title: "Competitor Alert",
        content: "Brand X has launched a new patient assistance program ($0 co-pay). This threatens our adherence rates in Tier 2 markets.",
        icon: Zap,
        color: "#FF3B30",
        action: "Analyze Impact"
    },
    {
        title: "Messaging Pivot",
        content: "Update visual aid Slide 4. Remove 'Equivalent Efficacy' claim; replace with 'Superior Safety Profile' based on new real-world evidence.",
        icon: MessageSquare,
        color: "#FFCC00",
        action: "Download Slides"
    },
    {
        title: "Digital Spend Reallocation",
        content: "Search volume for 'Weight Neutral Diabetes Drugs' is up 200%. Recommend shifting 15% of display budget to capture this intent.",
        icon: TrendingUp,
        color: "#34C759",
        action: "Approve Budget"
    }
];

const Card = ({ brief, index, range, targetScale, progress }) => {
    // Determine scale: when progress is within range, scale goes from 1 to targetScale
    const scale = useTransform(progress, range, [1, targetScale]);

    // Determine y offset (stacking effect) - Optional refinement
    // const y = useTransform(progress, range, [0, -20]);

    return (
        <div className="h-[80vh] max-lg:h-auto max-lg:relative max-lg:mb-8 flex items-start justify-center sticky top-0">
            <motion.div
                className="bg-white border border-primary/10 w-full max-w-[500px] h-[350px] max-lg:h-auto max-lg:min-h-[300px] rounded-3xl p-10 flex flex-col justify-between sticky max-lg:static origin-top shadow-[0_20px_50px_rgba(8,32,82,0.1)] top-[15vh]"
                style={{
                    scale,
                    backgroundColor: "#ffffff",
                    top: `calc(10% + ${index * 25}px)` // Offset slightly so we see the stack
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brief.color}20`, color: brief.color }}>
                        <brief.icon size={24} />
                    </div>
                    <h4 className="text-xl m-0 text-primary font-bold">{brief.title}</h4>
                </div>

                <p className="text-[1.1rem] leading-relaxed text-text-light">{brief.content}</p>

                <div className="flex justify-between items-center font-semibold text-sm border-t border-primary/10 pt-6">
                    <span style={{ color: brief.color }}>{brief.action}</span>
                    <div className="w-8 h-8 border border-primary/20 text-primary rounded-full flex items-center justify-center text-base">→</div>
                </div>
            </motion.div>
        </div>
    );
};

const StrategicBrief = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="bg-background text-primary min-h-[300vh] relative p-0 max-lg:min-h-auto">
            <div className="flex max-w-[1400px] mx-auto relative max-lg:flex-col">

                {/* LEFT COLUMN: Static Content */}
                <div className="w-[40%] max-lg:w-full relative px-16 py-24 max-lg:px-8 max-lg:py-16 z-10">
                    <div className="sticky top-[20vh]">
                        <span className="text-primary/60 text-[0.8rem] tracking-[0.2em] font-bold mb-4 block">THE OUTPUT</span>
                        <h2 className="text-[3.5rem] leading-[1.1] mb-8 text-primary font-serif">AI-Generated Marketing Briefs</h2>
                        <p className="text-[1.1rem] leading-[1.7] text-text-light mb-12 max-w-[400px]">
                            Don't just get alerted—get a plan.
                            <br /><br />
                            ClintelAI synthesizes millions of data points into ready-to-execute strategies, delivered instantly to your team.
                        </p>
                        <button className="bg-primary text-white border-none px-8 py-4 rounded-full font-bold cursor-pointer transition-transform hover:scale-105 shadow-xl shadow-primary/20">Deploy Systems</button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Stacking Cards */}
                <div className="w-[60%] max-lg:w-full py-24 pr-16 pl-0 max-lg:px-8 max-lg:py-16 flex flex-col">
                    {BRIEFS.map((brief, index) => {
                        // Calculate specific scroll range for each card's scaling
                        // Card 0 scales down as Card 1 arrives, etc.
                        const step = 1 / BRIEFS.length;
                        const start = step * index;
                        const end = start + step;

                        // Last card doesn't scale down
                        const targetScale = index === BRIEFS.length - 1 ? 1 : 0.9 + (0.05 * index); // 0.9, 0.95...

                        return (
                            <Card
                                key={index}
                                brief={brief}
                                index={index}
                                range={[start, end]}
                                targetScale={targetScale}
                                progress={scrollYProgress}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default StrategicBrief;
