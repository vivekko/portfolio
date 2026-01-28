import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import VisualizerTabs from '@/components/VisualizerTabs';
import CodeShowcase from '@/components/CodeShowcase';
import TechStack from '@/components/TechStack';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <About />
      <Experience />

      {/* System Design Visualizations */}
      <section id="visualizers" className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              System Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-emerald-400">in Action</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Interactive visualizations of distributed systems concepts — idempotency keys, database sharding, and event streaming
            </p>
          </div>
          <VisualizerTabs />
        </div>
      </section>

      <CodeShowcase />
      <TechStack />
      <Contact />
    </main>
  );
}
