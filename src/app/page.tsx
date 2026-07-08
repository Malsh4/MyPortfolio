import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { IndexNav } from "@/components/index-nav";
import { Skills } from "@/components/skills";
import { Works } from "@/components/works";

export default function Home() {
  return (
    <>
      <IndexNav />
      <main className="flex-1">
        <Hero />
        <About />
        <Works />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
