import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import OrderForm from "@/components/OrderForm";

export default function Order() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Minimal top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/">
          <button
            data-testid="button-back-home"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <SiTiktok className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">
            TIKTOK<span className="text-[#FE2C55]">BOOST</span>
          </span>
        </div>

        <div className="w-16" />
      </div>

      {/* Order form */}
      <div className="pt-20">
        <OrderForm />
      </div>
    </div>
  );
}
