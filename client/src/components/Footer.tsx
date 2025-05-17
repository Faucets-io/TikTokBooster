import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-9 w-9 rounded-full tiktok-btn-gradient flex items-center justify-center">
                  <span className="text-white text-lg transform -translate-y-0.5 font-bold">♪</span>
                </div>
                <h1 className="text-xl md:text-2xl font-montserrat font-bold">TikBoost</h1>
              </div>
            </Link>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-montserrat font-semibold mb-4">About TikBoost</h4>
            <p className="text-gray-400 text-sm">
              We help TikTok creators boost their presence and reach more followers through our specialized growth service.
            </p>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#boost-now" className="text-gray-400 hover:text-white transition">
                  Get Followers
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TikBoost. All rights reserved. Not affiliated with TikTok.</p>
          <p className="mt-2">TikTok is a registered trademark of ByteDance Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
