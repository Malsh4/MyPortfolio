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
      <About />
      <Skills />
      <Projects />
      <Certificates />
      <RevealSection />
      <Contact />
    </>
  );
}
