import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import CodeShowcase from '@/components/CodeShowcase';
import TechStack from '@/components/TechStack';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <About />
      <Experience />
      <CodeShowcase />
      <TechStack />
      <Contact />
    </main>
  );
}
