import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import KafkaVisualizer from '@/components/KafkaVisualizer';
import CodeShowcase from '@/components/CodeShowcase';
import TechStack from '@/components/TechStack';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <About />
      <Experience />

      {/* Kafka Visualizer Section */}
      <section id="kafka-demo" className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Event Streaming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">in Action</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Real-time Kafka cluster visualization showing producers, topics, partitions, and consumer groups
            </p>
          </div>
          <KafkaVisualizer />
        </div>
      </section>

      <CodeShowcase />
      <TechStack />
      <Contact />
    </main>
  );
}
