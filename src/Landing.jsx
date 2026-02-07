import { useState } from 'react'
import Navbar from './components/common/Navbar'
import Hero from './components/landing/Hero'
import SmoothScroll from './components/landing/SmoothScroll'
import LiveMonitor from './components/landing/LiveMonitor'
import IntelligenceEngine from './components/landing/IntelligenceEngine'
import { Testimonial } from './components/landing/Testimonial'
import Footer from './components/common/Footer'

const Landing = () => {
    const [navbarVisible, setNavbarVisible] = useState(true);
    const [lightMode, setLightMode] = useState(false);

    return (
        <SmoothScroll>
            <div className="min-h-screen relative bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
                <Navbar visible={navbarVisible} lightMode={lightMode} />
                <Hero onScrollStateChange={setNavbarVisible} />

                {/* Content section appears after the long scroll sequence */}
                <div className="relative z-10 bg-background">
                    <LiveMonitor />
                    <IntelligenceEngine />
                    <Testimonial />
                    <Footer />
                </div>
            </div>
        </SmoothScroll>
    )
}

export default Landing
