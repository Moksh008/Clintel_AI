import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.8,  // Slower, more cinematic feel
            easing: (t) => 1 - Math.pow(1 - t, 4),  // Smooth ease-out-quart
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,  // Slower wheel scrolling for more control
            touchMultiplier: 1.5,
            infinite: false,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        // Expose lenis to window for debugging if needed
        window.lenis = lenis

        return () => {
            lenis.destroy()
        }
    }, [])

    return <div className="w-full h-full">{children}</div>
}
