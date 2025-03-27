'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';
type DropdownState = {
  [key: string]: boolean;
};

const Navbar = (): JSX.Element => {
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openDropdowns, setOpenDropdowns] = useState<DropdownState>({});
  const navRef = useRef<HTMLElement | null>(null);

  // Handle sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdowns and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdowns({});
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dropdown visibility (close others when opening one)
  const toggleDropdown = (key: string): void => {
    setOpenDropdowns((prev) => {
      // Create a new object with all dropdowns closed
      const updatedDropdowns = Object.keys(prev).reduce<DropdownState>((acc, curr) => {
        acc[curr] = false;
        return acc;
      }, {});

      // Toggle the current dropdown
      updatedDropdowns[key] = !prev[key];
      return updatedDropdowns;
    });
  };

  // Toggle submenu visibility (don't close parent dropdown)
  const toggleSubmenu = (e: React.MouseEvent, key: string): void => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <nav 
      ref={navRef}
      className={`${isSticky ? 'bg-orange-300 shadow-md fixed top-0 left-0 w-full z-50' : 'bg-opacity-10 bg-[#081F5C]'} 
        border-b border-white border-opacity-20 py-4 relative transition-all duration-300 z-40`}
    >
      <div className="container mx-auto px-4">
        {/* Mobile menu button */}
        <div className="flex justify-between items-center lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Navbar items */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
          <ul className="flex flex-col lg:flex-row lg:justify-center space-y-2 lg:space-y-0">
            {/* Home */}
            <li className="relative group">
              <Link href="/dss/home" className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Home
              </Link>
            </li> 

            {/* About */}
            <li className="relative group">
              <Link href="/dss/about" className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                About
              </Link>
            </li>

            {/* Basic Modules */}
            <li className="relative group">
              <Link href="/dss/basic" className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Basic module
              </Link>
            </li>

            {/* GWM */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('gwm')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                GWM 
                <span className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 bg-orange-500 bg-opacity-90 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-solid after:border-t-blue-900 after:border-r-transparent after:border-b-transparent after:border-l-transparent">
                  Ground Water Management
                </span>
              </button>
              <ul className={`${openDropdowns.gwm ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[400px] p-3 z-50`}>
                {/* Groundwater Potential Assessment */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'gwPotential')}
                  >
                    Groundwater Potential Assessment
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.gwPotential ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.gwPotential ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Pumping Location Identification
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        GW Potential Zone
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Resource Estimation */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'gwResource')}
                  >
                    Resource Estimation
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.gwResource ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.gwResource ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[320px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Regional Scale Quantification
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Quality Assessment
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Identification Of Vulnerable zones
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Managed Aquifer Recharge */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'gwAquifer')}
                  >
                    Managed Aquifer Recharge
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.gwAquifer ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.gwAquifer ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Local Scale Water Estimation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Climate Change
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Site suitability For MAR
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Optimized Solution
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* River Aquifer Interaction */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'gwRiver')}
                  >
                    River Aquifer Interaction
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.gwRiver ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.gwRiver ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Baseflow Estimation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Climate Change and Mitigation
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* RWM */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('rwm')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                RWM
                <span className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 bg-orange-500 bg-opacity-90 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-solid after:border-t-blue-900 after:border-r-transparent after:border-b-transparent after:border-l-transparent">
                  River Water Management
                </span>
              </button>
              <ul className={`${openDropdowns.rwm ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[400px] p-3 z-50`}>
                {/* River Estimation */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'rwEstimation')}
                  >
                    Resource Estimation
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.rwEstimation ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.rwEstimation ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[320px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Availability
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Flow and Storage Estimation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Quality Assessment
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Vulnerability Assessment
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Contamination Risk Assessment
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Flood Forecasting and Management */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'rwFlood')}
                  >
                    Flood Forecasting and Management
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.rwFlood ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.rwFlood ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[320px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Flood Simulation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        River Routing
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Contamination Transport Modelling
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Water Bodies Management */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'rwWaterBodies')}
                  >
                    Water Bodies Management
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.rwWaterBodies ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.rwWaterBodies ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Storage and Forecasting
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Climate Change
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Reservoir Operation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Quality and Monitoring
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Waste Water Treatment */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'rwWasteWater')}
                  >
                    Waste Water Treatment
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.rwWasteWater ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.rwWasteWater ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Water Pollution and Inventory
                      </Link>
                    </li>
                    <li>
                      <Link href="/stp" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Site Priority and Suitability
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Treatment Technology
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* WRM */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('wrm')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                WRM 
                <span className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 bg-orange-500 bg-opacity-90 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-solid after:border-t-blue-900 after:border-r-transparent after:border-b-transparent after:border-l-transparent">
                  Water Resource Management
                </span>
              </button>
              <ul className={`${openDropdowns.wrm ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[300px] p-3 z-50`}
              >
                {/* Demand and Forecasting */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'wrmDemand')}
                  >
                    Demand and Forecasting
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.wrmDemand ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.wrmDemand ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[300px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Current Consumption Pattern
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Future Demand Projection
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Resource Allocation */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'wrmAllocation')}
                  >
                    Resource Allocation
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.wrmAllocation ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.wrmAllocation ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[220px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Source Sustainability
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Source Demarcation
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* SHSD */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('shsd')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                System Dynamics
                <span className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 bg-orange-500 bg-opacity-90 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-solid after:border-t-blue-900 after:border-r-transparent after:border-b-transparent after:border-l-transparent">
                  Hydrological System Dynamics
                </span>
              </button>
              <ul className={`${openDropdowns.shsd ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[250px] p-3 z-50`}>
                {/* Resource Management */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'shsdResource')}
                  >
                    Resource Management
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.shsdResource ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.shsdResource ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[360px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Optimum and Sustainable Management
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Sensitive Socio-Economic Factors
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        System Dynamics Modelling
                      </Link>
                    </li>
                  </ul>
                </li>
                {/* Impact Assessment */}
                <li className="relative group/submenu">
                  <div
                    className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200 flex justify-between items-center cursor-pointer"
                    onClick={(e) => toggleSubmenu(e, 'shsdImpact')}
                  >
                    Impact Assessment
                    <ChevronRight className={`w-4 h-4 ${openDropdowns.shsdImpact ? 'rotate-90' : ''} lg:group-hover/submenu:rotate-90 transition-transform duration-200`} />
                  </div>
                  <ul className={`${openDropdowns.shsdImpact ? 'block' : 'hidden'} lg:hidden lg:group-hover/submenu:block lg:absolute lg:left-full lg:top-0 lg:bg-white lg:bg-opacity-95 lg:border lg:border-gray-200 lg:border-opacity-10 lg:rounded-lg lg:shadow-lg lg:min-w-[250px] lg:p-3 lg:ml-1 lg:z-50 ml-4`}>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Plant Solutions
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                        Optimization Framework
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* Activities */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('activities')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Activities
              </button>
              <ul
                className={`${openDropdowns.activities ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[220px] p-3 z-50`}
              >
                <li>
                  <Link
                    href="#"
                    className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200"
                  >
                    Training and Workshop
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200"
                  >
                    Gallery
                  </Link>
                </li>
              </ul>
            </li>

            {/* Report and Publication */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('reportandpublication')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Report and Publication
              </button>
              <ul className={`${openDropdowns.reportandpublication ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[200px] p-3 z-50`}>
                <li>
                  <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Brochure
                  </Link>
                </li>
              </ul>
            </li>

            {/* Visualization */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('visualization')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Visualization
              </button>
              <ul className={`${openDropdowns.visualization ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[150px] p-3 z-50`}>
                <li>
                  <Link href="/dss/vector_visual" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Vector
                  </Link>
                </li>
                <li>
                  <Link href="/dss/raster_visual" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Raster
                  </Link>
                </li>
              </ul>
            </li>

            {/* Contact */}
            <li className="relative group">
              <Link href="/dss/contact" className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Contact
              </Link>
            </li>
            
            {/* Account */}
            <li className="relative group">
              <button
                onClick={() => toggleDropdown('account')}
                className="text-white font-semibold text-lg px-5 py-2 inline-block relative hover:translate-y-[-2px] transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300">
                Account 
              </button>
              <ul className={`${openDropdowns.account ? 'block' : 'hidden'} lg:hidden lg:group-hover:block absolute left-0 top-full bg-white bg-opacity-95 border border-gray-200 border-opacity-10 rounded-lg shadow-lg min-w-[150px] p-3 z-50`}>
                <li>
                  <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="#" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 hover:bg-opacity-10 rounded-md transition duration-200">
                    Log Out
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;