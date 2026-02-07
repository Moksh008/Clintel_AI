import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
const STEPS = [
    { id: 1, line1: "Ingest", line2: "Global", line3: "Data" },
    { id: 2, line1: "Process", line2: "With", line3: "Context" },
    { id: 3, line1: "Generate", line2: "Actionable", line3: "Intel" },
    { id: 4, line1: "Execute", line2: "Strategic", line3: "Plans" }
];

// Text: Fully visible at 9 o'clock (steady state), types in/out during transition
const SequentialTextLayer = ({ text, scrollProgress, stepIndex, totalSteps }) => {
    // Each step owns a portion of scroll
    // Text should be FULLY VISIBLE at the center of each step (9 o'clock position)
    const stepSize = 1 / totalSteps;
    const stepStart = stepIndex * stepSize;
    const stepEnd = (stepIndex + 1) * stepSize;

    // Define phases: Type in -> Hold full -> Type out
    // Type in: First 20% of step
    // Hold: Middle 60% of step (FULL TEXT VISIBLE)
    // Type out: Last 20% of step
    const typeInEnd = stepStart + stepSize * 0.2;
    const holdEnd = stepStart + stepSize * 0.8;

    const charProgress = useTransform(
        scrollProgress,
        [stepStart, typeInEnd, holdEnd, stepEnd],
        [0, text.length, text.length, 0]
    );

    const [displayed, setDisplayed] = useState("");

    useMotionValueEvent(charProgress, "change", (latest) => {
        setDisplayed(text.substring(0, Math.round(latest)));
    });

    return <span className="inline-block">{displayed}</span>;
};

// Card on the Wheel
const WheelCard = ({ index, totalSteps, wheelRotation }) => {
    // INCREASED SPACING: 90 degrees between cards (6->9->12 path)
    const ANGULAR_SPACING = 90;
    const startAngle = 180 - (index * ANGULAR_SPACING);

    const currentAngle = useTransform(wheelRotation, rot => startAngle + rot);

    // Wheel geometry
    const RADIUS = 550;
    const CENTER_X = 850;
    const CENTER_Y = 0;

    const x = useTransform(currentAngle, (deg) => {
        const rad = deg * (Math.PI / 180);
        return CENTER_X + RADIUS * Math.cos(rad);
    });

    const y = useTransform(currentAngle, (deg) => {
        const rad = deg * (Math.PI / 180);
        return CENTER_Y + RADIUS * Math.sin(rad);
    });

    // Opacity: Only visible around 9 o'clock (180°), hidden at 6 o'clock (90°) and 12 o'clock (270°)
    // Tighter fade range so only one card shows at settled positions
    const opacity = useTransform(currentAngle, [140, 165, 195, 220], [0, 1, 1, 0]);

    const gradients = [
        "radial-gradient(circle at 30% 30%, rgba(77, 168, 218, 0.1), transparent)",
        "radial-gradient(circle at 70% 30%, rgba(168, 85, 247, 0.1), transparent)",
        "radial-gradient(circle at 30% 70%, rgba(255, 59, 48, 0.1), transparent)",
        "radial-gradient(circle at 70% 70%, rgba(52, 199, 89, 0.1), transparent)"
    ];

    return (
        <motion.div
            className="absolute top-[-275px] left-[-175px] w-[350px] h-[550px] rounded-[20px] bg-white border border-primary/10 overflow-hidden shadow-[0_20px_50px_rgba(8,32,82,0.1)] max-md:w-[280px] max-md:h-[400px] max-md:top-[-200px] max-md:left-[-140px]"
            style={{ x, y, rotate: 0, opacity }}
        >
            <div className="w-full h-full relative">
                <div className="absolute top-6 right-6 text-[5rem] font-black opacity-10 text-primary">0{index + 1}</div>
                <div
                    className="w-full h-full"
                    style={{ background: gradients[index % gradients.length] }}
                ></div>
            </div>
        </motion.div>
    );
};

const IntelligenceEngine = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Total rotation with 90 deg spacing: (4-1) * 90 = 270 deg
    const totalRotation = (STEPS.length - 1) * 90;

    // STIFF AT 9 O'CLOCK: Non-linear curve with plateaus
    const stiffRotation = useTransform(scrollYProgress, (t) => {
        const numTransitions = STEPS.length - 1; // 3
        const stepSize = 1 / numTransitions;

        if (t >= 1) return totalRotation;
        if (t <= 0) return 0;

        const activeStep = Math.min(Math.floor(t / stepSize), numTransitions - 1);
        const localT = (t - activeStep * stepSize) / stepSize;

        // Power 5 curve for strong resistance at positions
        const eased = localT < 0.5
            ? 16 * Math.pow(localT, 5)
            : 1 - 16 * Math.pow(1 - localT, 5);

        const startRot = activeStep * 90;
        const endRot = (activeStep + 1) * 90;

        return startRot + (endRot - startRot) * eased;
    });

    const smoothRot = useSpring(stiffRotation, {
        stiffness: 100,
        damping: 18,
        mass: 0.6
    });

    return (
        <section className="bg-background relative">
            <div ref={containerRef} className="h-[400vh] relative">
                <div className="sticky top-0 h-screen w-full overflow-hidden bg-background flex flex-row max-md:flex-col">

                    {/* LEFT: Card Wheel */}
                    <div className="w-[45%] max-md:w-full h-full max-md:h-[60%] relative flex items-center justify-start pl-[3%] max-md:justify-center max-md:pl-0">
                        <div className="relative w-[100px] h-[100px] max-md:scale-[0.6]">
                            {STEPS.map((step, index) => (
                                <WheelCard
                                    key={step.id}
                                    index={index}
                                    totalSteps={STEPS.length}
                                    wheelRotation={smoothRot}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Text */}
                    <div className="w-[55%] max-md:w-full h-full max-md:h-[40%] flex items-center justify-start pl-4 pr-8 max-md:px-6 relative max-md:justify-center">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="absolute left-4 max-md:left-6 text-left">
                                <h3 className="block text-5xl max-md:text-[1.8rem] font-bold text-primary leading-[1.2] mb-1.5 min-h-[1.2em]">
                                    <SequentialTextLayer
                                        text={step.line1}
                                        scrollProgress={scrollYProgress}
                                        stepIndex={index}
                                        totalSteps={STEPS.length}
                                    />
                                </h3>
                                <h3 className="block text-5xl max-md:text-[1.8rem] font-bold text-primary leading-[1.2] mb-1.5 min-h-[1.2em]">
                                    <SequentialTextLayer
                                        text={step.line2}
                                        scrollProgress={scrollYProgress}
                                        stepIndex={index}
                                        totalSteps={STEPS.length}
                                    />
                                </h3>
                                <h3 className="block text-5xl max-md:text-[1.8rem] font-bold text-primary leading-[1.2] mb-1.5 min-h-[1.2em]">
                                    <SequentialTextLayer
                                        text={step.line3}
                                        scrollProgress={scrollYProgress}
                                        stepIndex={index}
                                        totalSteps={STEPS.length}
                                    />
                                </h3>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default IntelligenceEngine;
