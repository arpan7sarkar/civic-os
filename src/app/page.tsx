import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsRibbon from "@/components/StatsRibbon";
import DepartmentGrid from "@/components/DepartmentGrid";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <StatsRibbon />
      <DepartmentGrid />
      <Footer />
    </main>
  );
}
