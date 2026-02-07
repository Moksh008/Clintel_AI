import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-primary text-background overflow-hidden pt-32">
            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 mb-40">
                <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    {/* Column 1: Brand Statement */}
                    <div className="col-span-1 max-sm:mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-pharma animate-pulse" />
                            <span className="text-sm font-mono opacity-60 uppercase tracking-widest">System Status: Online</span>
                        </div>
                        <p className="text-xl font-serif leading-relaxed opacity-80 max-w-xs">
                            Orchestrating the future of pharmaceutical intelligence through adaptive autonomous agents.
                        </p>
                    </div>

                    {/* Column 2: Platform */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Platform</h4>
                        {['Intelligence Engine', 'Live Monitor', 'Global Sense', 'API Access'].map((item) => (
                            <a key={item} href="#" className="flex items-center gap-2 group w-fit">
                                <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-4 opacity-50"></span>
                                <span className="text-sm font-medium opacity-60 transition-opacity group-hover:opacity-100">{item}</span>
                            </a>
                        ))}
                    </div>

                    {/* Column 3: Company */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Company</h4>
                        {['Manifesto', 'Careers', 'Press', 'Legal'].map((item) => (
                            <a key={item} href="#" className="flex items-center gap-2 group w-fit">
                                <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-4 opacity-50"></span>
                                <span className="text-sm font-medium opacity-60 transition-opacity group-hover:opacity-100">{item}</span>
                            </a>
                        ))}
                    </div>

                    {/* Column 4: Connect */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Connect</h4>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Github, Globe].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors hover:bg-white hover:text-primary hover:border-transparent">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <p className="text-xs opacity-40">© 2026 ClintelAI Inc.</p>
                            <p className="text-xs opacity-40 mt-1">San Francisco • London • Singapore</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MASSIVE FOOTER TEXT - STUCK TO BOTTOM */}
            <div className="w-full leading-none flex justify-center pointer-events-none select-none overflow-hidden">
                <motion.h1
                    initial={{ y: 200 }}
                    whileInView={{ y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="text-[28vw] font-bold text-background/10 whitespace-nowrap -mb-[6vw] tracking-tighter"
                >
                    CLINTEL AI
                </motion.h1>
            </div>
        </footer>
    );
};

export default Footer;
