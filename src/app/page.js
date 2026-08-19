import Hero from "@/components/home/Hero";
import ServiceIntro from "@/components/home/ServiceIntro";
import Story from "@/components/home/Story";
import Benefits from "@/components/home/Benefits";
import Review from "@/components/home/Review";
import CTA from "@/components/home/CTA";
import LandingFooter from "@/components/layout/LandingFooter";
import GoToTop from "@/components/home/goToTop";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiceIntro />
      <Story />
      <Benefits />
      <Review />
      <CTA />
      <GoToTop />
      <LandingFooter />
    </main>
  );
}
