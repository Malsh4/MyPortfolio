import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Certificates from "@/components/sections/Certificates";
import Contact from "@/components/sections/Contact";
import RevealSection from "@/components/reveal/RevealSection";
import HashScroll from "@/components/HashScroll";

export default function Home() {
  return (
    <>
      <HashScroll />
      <Hero />
      {/* No content here: scrolling this stretch walks in from the door to Amandi's desk before About turns in. */}
      <div id="entry" aria-hidden="true" className="h-[200vh]" />
      <About />
      <Skills />
      <Projects />
      <Certificates />
      <RevealSection />
      <Contact />
    </>
  );
}
