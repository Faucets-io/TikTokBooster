import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="border-b border-gray-200 py-4 px-4 md:px-8 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="h-9 w-9 rounded-full tiktok-btn-gradient flex items-center justify-center">
                <span className="text-white text-lg transform -translate-y-0.5 font-bold">♪</span>
              </div>
              <h1 className="text-xl md:text-2xl font-montserrat font-bold">TikBoost</h1>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#how-it-works" className="hover:text-[#FE2C55] transition">How It Works</a>
          <a href="#features" className="hover:text-[#FE2C55] transition">Features</a>
          <a href="#testimonials" className="hover:text-[#FE2C55] transition">Results</a>
          <a href="#boost-now" className="hover:text-[#FE2C55] transition">Get Followers</a>
        </nav>
        
        <div className="flex items-center">
          <Button className="px-4 py-2 bg-black hover:bg-[#1D1D1D] text-white text-sm font-medium rounded-full transition">
            Login
          </Button>
          
          <div className="md:hidden ml-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white shadow-lg z-50">
          <div className="flex flex-col space-y-4 p-4">
            <a 
              href="#how-it-works" 
              className="px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              className="px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Results
            </a>
            <a 
              href="#boost-now" 
              className="px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Followers
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
