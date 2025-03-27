'use client'
import React, { useState } from "react"
import StatusBar from "./components/statusbar"
import LocationSelector from "./components/locations"
import Population from "./populations/population"

interface SelectedLocationData {
  villages: {
    id: number;
    name: string;
    subDistrictId: number;
    population: number;
  }[];
  subDistricts: {
    id: number;
    name: string;
    districtId: number;
  }[];
  totalPopulation: number;
}

const Basic: React.FC = () => {
  const [selectedLocationData, setSelectedLocationData] = useState<SelectedLocationData | null>(null);
  
  const handleLocationConfirm = (data: SelectedLocationData): void => {
    console.log('Received confirmed location data:', data);
    setSelectedLocationData(data);
  };

  return (
    <div className="flex w-full min-h-0">
      {/* Left side - Status Bar */}
      <div className="w-64 border-r border-gray-200">
        <StatusBar />
      </div>
      
      {/* Right side - Main Content */}
      <div className="flex-1 p-4">
        {/* Pass the onConfirm handler to LocationSelector */}
        <LocationSelector onConfirm={handleLocationConfirm} />
        
        {/* Only render Population when we have selected data */}
        {selectedLocationData && (
          <Population 
            villages_props={selectedLocationData.villages}
            subDistricts_props={selectedLocationData.subDistricts}
            totalPopulation_props={selectedLocationData.totalPopulation}
          />
        )}
      </div>
    </div>
  )
}

export default Basic