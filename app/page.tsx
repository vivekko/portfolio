import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import KafkaVisualizer from '@/components/KafkaVisualizer';
import DatabaseShardingVisualizer from '@/components/DatabaseShardingVisualizer';
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

      {/* Database Sharding Section */}
      <section id="sharding-demo" className="py-20 px-6 md:px-12 lg:px-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Horizontal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Scalability</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Interactive database sharding visualization with multiple partitioning strategies
            </p>
          </div>
          <DatabaseShardingVisualizer />
        </div>
      </section>

      <CodeShowcase />
      <TechStack />
      <Contact />
    </main>
  );
}
