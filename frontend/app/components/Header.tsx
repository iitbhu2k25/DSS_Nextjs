'use client'
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-3 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg border-b border-blue-200"
    style={{
      backgroundImage: "url('/images/header/header_bg.gif')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      <div className="container mx-auto ">
        <div className="flex items-center justify-between">
          {/* Left Logos Container */}
          <div className="flex items-center space-x-6 w-1/4">
            <div className="flex items-center space-x-6">
              <Link href="https://www.india.gov.in/" className="transition-transform hover:scale-105">
                <img
                  src="/images/header/left1_ashok.png"
                  alt="Logo 1"
                  title="अशोक स्तंभ"
                  className="w-20 h-auto"
                />
              </Link>
              <Link href="https://iitbhu.ac.in/" className="transition-transform hover:scale-105">
                <img
                  src="/images/header/left2_IIt_logo.png"
                  alt="Logo 3"
                  title="iitbhu"
                  className="w-32 h-auto transform scale-150 ml-6 transition-transform duration-300"
                />
              </Link>
            </div>
          </div>

          {/* Middle Section with Title and Running Tagline */}
          <div className="text-center w-1/2 px-3">
            <h2 className="text-2xl font-bold text-blue-800 tracking-wide">Decision Support System</h2>
            <div className="w-full overflow-hidden mt-1">
              <p className="text-sm text-blue-600 font-medium whitespace-nowrap overflow-hidden relative">
                <span 
                  className="inline-block whitespace-nowrap"
                  style={{
                    animation: 'marquee 15s linear infinite',
                  }}
                >
                  Small Rivers Management Tool (SRMT) for Holistic Water Resources
                  Management in India
                </span>
              </p>
            </div>
            {/* Add the CSS animation */}
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>

          {/* Right Logos Container */}
          <div className="flex items-center justify-end space-x-6 w-1/4">
            <div className="flex items-center space-x-6">
              <Link href="https://www.slcrvaranasi.com/" className="transition-transform hover:scale-105">
                <img
                  src="/images/header/right1_slcr.png"
                  alt="Right Logo"
                  title="Smart Laboratory on Clean River"
                  className="max-w-full h-auto w-40"
                />
              </Link>
              <Link href="https://nmcg.nic.in/" className="transition-transform hover:scale-105">
                <img
                  src="/images/header/right2_namami_ganga.gif"
                  alt="Logo 3"
                  title="Namami Gange"
                  className="w-26 h-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}