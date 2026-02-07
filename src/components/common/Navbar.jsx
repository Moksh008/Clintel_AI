import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = ({ visible }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const links = [
        { name: "Intelligence", href: "#intelligence", type: "anchor" },
        { name: "Live Monitor", href: "#monitor", type: "anchor" },
        { name: "Capabilities", href: "#capabilities", type: "anchor" },
        { name: "Dashboard", href: "/dashboard", type: "route" },
    ];

    return (
        <AnimatePresence>
            <motion.nav
                initial={{ y: -100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                exit={{ y: -100, x: "-50%", opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-8 left-1/2 z-50 flex items-center justify-between gap-4 px-2 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-primary/10 shadow-lg shadow-primary/5 w-full max-w-[90%] md:max-w-6xl"
            >
                {/* Logo Pill */}
                <Link to="/" className="flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white font-bold tracking-tight text-sm hover:scale-105 transition-transform duration-300 shadow-md whitespace-nowrap">
                    Clintel<span className="font-normal opacity-80">AI</span>
                </Link>

                {/* Navigation Pills */}
                <div className="flex items-center gap-1 bg-primary/5 rounded-full p-1 max-md:hidden flex-1 justify-center">
                    {links.map((link, index) => {
                        const LinkComponent = link.type === "route" ? Link : "a";
                        const linkProps = link.type === "route" ? { to: link.href } : { href: link.href };

                        return (
                            <LinkComponent
                                key={link.name}
                                {...linkProps}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="relative px-8 py-2 text-sm font-medium text-primary/80 hover:text-primary transition-colors whitespace-nowrap"
                            >
                                {hoveredIndex === index && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-white rounded-full shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.name}</span>
                            </LinkComponent>
                        );
                    })}
                </div>

                {/* Action Pill */}
                <button className="group relative flex items-center justify-center px-6 py-2.5 rounded-full bg-primary/5 text-primary text-sm font-semibold overflow-hidden hover:bg-primary hover:text-white transition-colors duration-300 whitespace-nowrap">
                    <span className="relative z-10 flex items-center gap-2">
                        Request Access
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>

                {/* Mobile Menu Trigger (Simple) */}
                <button className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-primary/5 text-primary">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </motion.nav>
        </AnimatePresence>
    );
};

export default Navbar;
