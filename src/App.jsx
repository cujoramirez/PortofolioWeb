import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./components/TempNavbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Technologies from "./components/Technologies";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/certificates";
import Contact from "./components/Contact";

const App = () => {
  const { scrollYProgress } = useScroll();
  
  // Transform values based on scroll position
  const gradientStart = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["125% 125% at 50% 10%", "150% 150% at 60% 30%", "125% 125% at 50% 50%"]
  );
  
  const primaryColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#000 40%", "#050520 40%", "#000 40%", "#050520 40%", "#000 40%"]
  );
  
  const accentColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#63e 100%", "#60c 100%", "#70e 100%", "#50e 100%", "#63e 100%"]
  );

  // Update CSS variable on scroll
  useEffect(() => {
    const updateGradient = () => {
      document.documentElement.style.setProperty(
        "--gradient-position", 
        gradientStart.get()
      );
      document.documentElement.style.setProperty(
        "--primary-color", 
        primaryColor.get()
      );
      document.documentElement.style.setProperty(
        "--accent-color", 
        accentColor.get()
      );
    };

    const unsubscribe = scrollYProgress.on("change", updateGradient);
    return () => unsubscribe();
  }, [scrollYProgress, gradientStart, primaryColor, accentColor]);

  return (
    <div className="overflow-x-hidden text-neutral-300 
    antialiased selection:bg-cyan-300 selection:text-cyan-900">
      {/* Background gradient - fixed positioning to cover entire viewport */}
      <motion.div 
        className="fixed inset-0 -z-10 h-full w-full"
        style={{
          background: "radial-gradient(var(--gradient-position), var(--primary-color), var(--accent-color))",
          transition: "background 0.5s ease"
        }}
      />
      
      {/* Parallax stars effect */}
      <div className="fixed inset-0 -z-5 opacity-30">
        <motion.div 
          className="absolute h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            y: useTransform(scrollYProgress, [0, 1], [0, -100])
          }}
        />
        <motion.div 
          className="absolute h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            y: useTransform(scrollYProgress, [0, 1], [0, -50])
          }}
        />
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-8 relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Technologies />
        <Experience />
        <Projects />
        <Certifications />
        <Contact />
      </div>
      
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
};

export default App;