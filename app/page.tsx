import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Statement from '@/components/Statement';
import ChapterIntro from '@/components/ChapterIntro';
import Experience from '@/components/Experience';
import Pipeline from '@/components/Pipeline';
import CodeReview from '@/components/CodeReview';
import CommandPalette from '@/components/CommandPalette';
import ModelsSection from '@/components/ModelsSection';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="bg-ink">
      <Nav />
      <CommandPalette />

      {/* the hero pins while the statement slides over it */}
      <div className="relative">
        <div className="sticky top-0 h-screen">
          <Hero />
        </div>
        <Statement />
      </div>

      <Pipeline />

      <CodeReview />

      {/* full-screen chapter marker, then the work rail */}
      <ChapterIntro id="work" word="Where I&rsquo;ve built" kicker="2022 — present, four teams" />
      <Experience />

      <ModelsSection />

      <Stack />
      <Contact />
    </main>
  );
}
