import { useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FollowerForm from "@/components/FollowerForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col font-inter text-gray-900">
      <Header />
      <Hero scrollToForm={scrollToForm} />
      <StatsCounter />
      <HowItWorks />
      <Features />
      <Testimonials />
      <div ref={formRef}>
        <FollowerForm />
      </div>
      <FAQ />
      <Footer />
    </div>
  );
}
