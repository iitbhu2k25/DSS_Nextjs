'use client'
import React, { useEffect, useState } from "react"
import StatusBar from "./components/statusbar"
import LocationSelector from "./components/locations"
import Population from "./populations/population"
import Water_Demand from "./water_demand/page"
import Water_Supply from "./water_supply/page"
import Sewage from "./seawage/page"

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
  const [count, setCount] = useState<Number[]>([0, 1, 2, 3]);
  const [currentCount, setCurrentCount] = useState<Number | null>();

  const handleLocationConfirm = (data: SelectedLocationData): void => {
    console.log('Received confirmed location data:', data);
    setSelectedLocationData(data);
  };

  const handleClick = () => {
    if (currentCount == 1) {
      setCurrentCount(2);
    } else if (currentCount == 2) {
      setCurrentCount(3);
    }
    
  } 

  useEffect(() => {
    if (selectedLocationData) {
      setCurrentCount(0);
    }
  }, [selectedLocationData]);

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
        {(currentCount == 0 && selectedLocationData) && (
          <Population
            villages_props={selectedLocationData.villages}
            subDistricts_props={selectedLocationData.subDistricts}
            totalPopulation_props={selectedLocationData.totalPopulation}
          />
        )}
        {
          (currentCount == 1) && (
            <Water_Supply />
          )
        }
        {
          (currentCount == 2) && (
            <Water_Demand />
          )
        }
        {
          (currentCount == 3) && (
            <Sewage />
          )
        }
        <div className="mt-6 flex justify-between">
          <button
            className={`${currentCount == 0 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            disabled={currentCount == 0}
            onClick={handleClick}
          >
            Skip
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            // disabled={
            //     (inputMode === 'single' && (single_year === null || single_year < 2011 || single_year > 2099)) || 
            //     (inputMode === 'range' && (range_year_start === null || range_year_end === null || 
            //                             range_year_start < 2011 || range_year_start > 2099 ||
            //                             range_year_end < 2011 || range_year_end > 2099 ||
            //                             error !== null)) ||
            //     inputMode === null ||
            //     !isMethodSelected
            // }
            onClick={() => {
              if (currentCount == 0) {
                setCurrentCount(1);
              } else if (currentCount == 1) {
                setCurrentCount(2);
              } else if (currentCount == 2) {
                setCurrentCount(3)
              }
            }}
          >
            Save and Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Basic