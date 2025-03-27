'use client'
import React, { useState, useEffect } from 'react';
import { MultiSelect } from './Multiselect'; // Import the enhanced component

// TypeScript interfaces
interface LocationItem {
  id: number;
  name: string;
}

interface District extends LocationItem {
  stateId: number;
}

interface SubDistrict extends LocationItem {
  districtId: number;
}

interface Village extends LocationItem {
  subDistrictId: number;
  population: number;
}

interface LocationSelectorProps {
  onConfirm?: (selectedData: {
    villages: Village[];
    subDistricts: SubDistrict[];
    totalPopulation: number;
  }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onConfirm }) => {
  // States for dropdown data
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  
  // Selected values
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<string[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  
  // New state to track if selections are locked after confirmation
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:9000/api/basic/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        const stateData: LocationItem[] = data.map((state: any) => ({
          id: state.state_code,
          name: state.state_name
        }));
        
        setStates(stateData);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async (): Promise<void> => {
        console.log('Fetching districts for state:', selectedState);
        try {
          const response = await fetch('http://localhost:9000/api/basic/district/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ state_code: selectedState }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const districtData: LocationItem[] = data.map((district: any) => ({
            id: district.district_code,
            name: district.district_name
          }));
          const mappedDistricts: District[] = districtData.map(district => ({ 
            ...district, 
            stateId: parseInt(selectedState) 
          }));
          
          setDistricts(mappedDistricts);
          setSelectedDistricts([]);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistricts([]);
    }
    // Reset dependent dropdowns
    setSubDistricts([]);
    setSelectedSubDistricts([]);
    setVillages([]);
    setSelectedVillages([]);
    // Reset total population when state changes
    setTotalPopulation(0);
  }, [selectedState]);

  // Fetch sub-districts when districts change
  useEffect(() => {
    if (selectedDistricts.length > 0) {
      const fetchSubDistricts = async (): Promise<void> => {
        try {
          const response = await fetch('http://localhost:9000/api/basic/subdistrict/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ district_code: selectedDistricts }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const subDistrictData: LocationItem[] = data.map((subDistrict: any) => ({
            id: subDistrict.subdistrict_code,
            name: subDistrict.subdistrict_name
          }));
          
          // Assuming each subdistrict is associated with a district
          // This might need to be adjusted based on your API response
          const mappedSubDistricts: SubDistrict[] = subDistrictData.map(subdistrict => ({ 
            ...subdistrict, 
            districtId: parseInt(selectedDistricts[0]) // This is simplified and might need adjustment
          }));

          setSubDistricts(mappedSubDistricts);
          setSelectedSubDistricts([]);
        } catch (error) {
          console.error('Error fetching sub-districts:', error);
        }
      };
      fetchSubDistricts();
    } else {
      setSubDistricts([]);
      setSelectedSubDistricts([]);
    }
    // Reset dependent dropdowns
    setVillages([]);
    setSelectedVillages([]);
    // Reset total population when districts change
    setTotalPopulation(0);
  }, [selectedDistricts]);

  // Fetch villages when sub-districts change
  useEffect(() => {
    if (selectedSubDistricts.length > 0) {
      // Example - replace with your API call
      const fetchVillages = async (): Promise<void> => {
        // Simulate API call with population data
        try{
          const response = await fetch('http://localhost:9000/api/basic/village/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ subdistrict_code: selectedSubDistricts }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const villageData: Village[] = data.map((village: any) => ({
            id: village.village_code,
            name: village.village_name,
            subDistrictId: parseInt(selectedSubDistricts[0]), // This might need adjustment based on your data structure
            population: village.population_2011 || 0 // Assuming population is part of the API response
          }));
          setVillages(villageData);
          setSelectedVillages([]);
        } catch (error) {
          console.error('Error fetching villages:', error);
          setVillages([]);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
      setSelectedVillages([]);
    }
    // Reset total population when sub-districts change
    setTotalPopulation(0);
  }, [selectedSubDistricts]);

  // Calculate total population when selected villages change
  useEffect(() => {
    if (selectedVillages.length > 0) {
      // Filter to get only selected villages
      const selectedVillageObjects = villages.filter(village => 
        selectedVillages.includes(village.id.toString())
      );
      
      // Calculate total population
      const total = selectedVillageObjects.reduce(
        (sum, village) => sum + village.population, 
        0
      );
      
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [selectedVillages, villages]);

  // Handle state selection
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectionsLocked) {
      setSelectedState(e.target.value);
    }
  };

  // Handle form reset
  const handleReset = (): void => {
    setSelectedState('');
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setTotalPopulation(0);
    setSelectionsLocked(false); // Also unlock selections when resetting
  };

  // Handle confirm - lock the selections and pass data to parent
  const handleConfirm = (): void => {
    if (selectedVillages.length > 0) {
      setSelectionsLocked(true);
      
      // Get the full objects for selected villages and subdistricts
      const selectedVillageObjects = villages.filter(village => 
        selectedVillages.includes(village.id.toString())
      );
      
      const selectedSubDistrictObjects = subDistricts.filter(subDistrict => 
        selectedSubDistricts.includes(subDistrict.id.toString())
      );
      
      // Pass the data to parent component if callback exists
      if (onConfirm) {
        onConfirm({
          villages: selectedVillageObjects,
          subDistricts: selectedSubDistrictObjects,
          totalPopulation: totalPopulation
        });
      }
    }
  };

  // Format village display to include population
  const formatVillageDisplay = (village: Village): string => {
    return `${village.name} (Pop: ${village.population.toLocaleString()})`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* State Dropdown */}
        <div>
          <label htmlFor="state-dropdown" className="block text-sm font-semibold text-gray-700 mb-2">
            State:
          </label>
          <select
            id="state-dropdown"
            className="w-full p-2 text-sm border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedState}
            onChange={handleStateChange}
            disabled={selectionsLocked}
          >
            <option value="">--Choose a State--</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Multiselect with "All" option */}
        <MultiSelect
          items={districts}
          selectedItems={selectedDistricts}
          onSelectionChange={selectionsLocked ? () => {} : setSelectedDistricts}
          label="District"
          placeholder="--Choose Districts--"
          disabled={!selectedState || selectionsLocked}
        />

        {/* Sub-District Multiselect with "All" option */}
        <MultiSelect
          items={subDistricts}
          selectedItems={selectedSubDistricts}
          onSelectionChange={selectionsLocked ? () => {} : setSelectedSubDistricts}
          label="Sub-District"
          placeholder="--Choose Sub-Districts--"
          disabled={selectedDistricts.length === 0 || selectionsLocked}
        />

        {/* Village Multiselect with "All" option and custom display */}
        <MultiSelect
          items={villages}
          selectedItems={selectedVillages}
          onSelectionChange={selectionsLocked ? () => {} : setSelectedVillages}
          label="Village"
          placeholder="--Choose Villages--"
          disabled={selectedSubDistricts.length === 0 || selectionsLocked}
          displayPattern={formatVillageDisplay}
        />
      </div>

      {/* Display selected values for demonstration */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">Selected Locations</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-medium">State:</span> {states.find(s => s.id.toString() === selectedState)?.name || 'None'}</p>
          <p><span className="font-medium">Districts:</span> {selectedDistricts.length > 0 
            ? (selectedDistricts.length === districts.length 
              ? 'All Districts' 
              : districts.filter(d => selectedDistricts.includes(d.id.toString())).map(d => d.name).join(', '))
            : 'None'}</p>
          <p><span className="font-medium">Sub-Districts:</span> {selectedSubDistricts.length > 0 
            ? (selectedSubDistricts.length === subDistricts.length 
              ? 'All Sub-Districts' 
              : subDistricts.filter(sd => selectedSubDistricts.includes(sd.id.toString())).map(sd => sd.name).join(', '))
            : 'None'}</p>
          <p><span className="font-medium">Villages:</span> {selectedVillages.length > 0 
            ? (selectedVillages.length === villages.length 
              ? 'All Villages' 
              : villages.filter(v => selectedVillages.includes(v.id.toString())).map(v => v.name).join(', '))
            : 'None'}</p>
          <p><span className="font-medium">Total Population:</span> {totalPopulation.toLocaleString()}</p>
          {selectionsLocked && (
            <p className="mt-2 text-green-600 font-medium">Selections confirmed and locked</p>
          )}
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button 
          className={`${
            selectedVillages.length > 0 && !selectionsLocked 
              ? 'bg-blue-500 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          onClick={handleConfirm}
          disabled={selectedVillages.length === 0 || selectionsLocked}
        >
          Confirm
        </button>
        <button 
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default LocationSelector;