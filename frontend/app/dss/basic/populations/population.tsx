'use client'
import React, { useState, useEffect } from "react"

import TimeMethods from "./components/timeseries";
import DemographicMethods from "./components/demographic";
interface Village {
    id: number;
    name: string;
    subDistrictId: number;
    population: number;
  }
  
  interface SubDistrict {
    id: number;
    name: string;
    districtId: number;
  }
  interface PopulationProps {
    villages_props: Village[];
    subDistricts_props: SubDistrict[];
    totalPopulation_props: number;
  }
const Population: React.FC<PopulationProps> = ({
    villages_props,
    subDistricts_props,
    totalPopulation_props
}) => {
    const [single_year, setSingleYear] = useState<number | null>(null);
    const [range_year_start, setRangeYearStart] = useState<number | null>(null);
    const [range_year_end, setRangeYearEnd] = useState<number | null>(null);
    const [inputMode, setInputMode] = useState<'single' | 'range' | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Add state for calculation methods
    const [methods, setMethods] = useState({
        timeseries: false,
        demographic: false,
        cohort: false
    });
    // Add state for results
    const [results, setResults] = useState<any[] | null>(null);

    // Update input mode when user interacts with fields
    useEffect(() => {
        if (single_year !== null && (single_year > 0)) {
            setInputMode('single');
            // Clear range inputs if single year is used
            if (range_year_start !== null || range_year_end !== null) {
                setRangeYearStart(null);
                setRangeYearEnd(null);
            }
        } else if ((range_year_start !== null && range_year_start > 0) || 
                  (range_year_end !== null && range_year_end > 0)) {
            setInputMode('range');
            // Clear single year input if range is used
            if (single_year !== null) {
                setSingleYear(null);
            }
        } else if (range_year_start === null && range_year_end === null && single_year === null) {
            // If all fields are empty, allow selecting either mode
            setInputMode(null);
        }
    }, [single_year, range_year_start, range_year_end]);

    // Validate all inputs
    useEffect(() => {
        // Validate single year
        if (inputMode === 'single') {
            if (single_year !== null && (single_year < 2011 || single_year > 2099)) {
                setError('Year must be between 2011 and 2099');
            } else {
                setError(null);
            }
        } 
        // Validate range years
        else if (inputMode === 'range') {
            if (range_year_start !== null && (range_year_start < 2011 || range_year_start > 2099)) {
                setError('Start year must be between 2011 and 2099');
            } else if (range_year_end !== null && (range_year_end < 2011 || range_year_end > 2099)) {
                setError('End year must be between 2011 and 2099');
            } else if (range_year_start !== null && range_year_end !== null && 
                range_year_start >= range_year_end) {
                setError('End year must be greater than start year');
            } else {
                setError(null);
            }
        } else {
            setError(null);
        }
    }, [inputMode, single_year, range_year_start, range_year_end]);

    // Handle single year input with validation
    const handleSingleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Allow empty input
        if (inputValue === '') {
            setSingleYear(null);
            return;
        }
        
        // Allow any input while typing, but enforce range on blur
        setSingleYear(parseInt(inputValue));
    };

    // Handle range start year input with validation
    const handleRangeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Allow empty input
        if (inputValue === '') {
            setRangeYearStart(null);
            return;
        }
        
        // Allow any input while typing, but enforce range on blur
        setRangeYearStart(parseInt(inputValue));
    };

    // Handle range end year input with validation
    const handleRangeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Allow empty input
        if (inputValue === '') {
            setRangeYearEnd(null);
            return;
        }
        
        // Allow any input while typing, but enforce range on blur
        setRangeYearEnd(parseInt(inputValue));
    };

    // Handle method selection
    const handleMethodChange = (method: 'timeseries' | 'demographic' | 'cohort') => {
        setMethods({
            ...methods,
            [method]: !methods[method]
        });
    };

    // Check if at least one method is selected
    const isMethodSelected = methods.timeseries || methods.demographic || methods.cohort;

    // Handle form submission - in a real app, you would make an API call here
    const handleSubmit = async () => {
        console.log('starts')
        const resp = await fetch('http://localhost:9000/api/basic/time_series/arthemitic/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "start_year": range_year_start,
                    "end_year": range_year_end,
                    "year": single_year,
                    "villages_props":villages_props,
                    "subdistrict_props":subDistricts_props,
                    "totalPopulation_props":totalPopulation_props                    
                })
            }
        );
        const res = await resp.json();
        console.log(res);

        // Mock data for demonstration purposes
        // const mockYears = inputMode === 'single' 
        //     ? [single_year!] 
        //     : Array.from({length: (range_year_end! - range_year_start!) + 1}, (_, i) => range_year_start! + i);
        
        // const mockResults = mockYears.map(year => {
        //     // Sample calculation logic (would be replaced by backend response)
        //     const basePopulation = 1000000;
        //     const yearsSince2011 = year - 2011;
        //     const growthRate = 1.5 - (yearsSince2011 * 0.02);
        //     const population = basePopulation * Math.pow(1 + (growthRate / 100), yearsSince2011);
            
        //     return {
        //         year,
        //         population: Math.round(population),
        //         growthRate: growthRate.toFixed(2),
        //         methods: Object.keys(methods).filter(m => methods[m as keyof typeof methods])
        //     };
        // });
        
        //setResults(mockResults);
        console.log('endsd')
    };

    return (
        <div className="p-4 mt-5 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Population Estimation and Forecasting</h1>
            
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Select Design Year</h2>
                <div className="bg-blue-50 p-4 mb-4 rounded-md text-sm text-blue-700">
                    Please use either a single year or a range of years, not both. Years must be between 2011 and 2099.
                </div>
            </div>

            {/* Year Input Options - All on a single line */}
            <div className="mb-4 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Select Year</h3>
                <div className="flex flex-wrap items-end gap-4">
                    {/* Single Year */}
                    <div className={`${inputMode === 'range' ? 'opacity-60' : ''}`}>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="single-year">
                            Single Year
                        </label>
                        <input 
                            id="single-year"
                            type="number" 
                            className={`w-32 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                                   ${inputMode === 'range' ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-blue-500 border-gray-300'}`}
                            value={single_year === null ? '' : single_year} 
                            onChange={handleSingleYearChange}
                            placeholder="Year"
                            disabled={inputMode === 'range'}
                            min="2011"
                            max="2099"
                        />
                    </div>
                    
                    <div className="mx-4 text-gray-500 self-center">OR</div>
                    
                    {/* Range Start Year */}
                    <div className={`${inputMode === 'single' ? 'opacity-60' : ''}`}>
                        <label className="block text-gray-700 mb-2" htmlFor="range-start">
                            Start Year
                        </label>
                        <input 
                            id="range-start"
                            type="number" 
                            className={`w-32 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                                      ${inputMode === 'single' ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-blue-500 border-gray-300'}`}
                            value={range_year_start === null ? '' : range_year_start} 
                            onChange={handleRangeStartChange}
                            placeholder="Start"
                            disabled={inputMode === 'single'}
                            min="2011"
                            max="2099"
                        />
                    </div>
                    
                    {/* Range End Year */}
                    <div className={`${inputMode === 'single' ? 'opacity-60' : ''}`}>
                        <label className="block text-gray-700 mb-2" htmlFor="range-end">
                            End Year
                        </label>
                        <input 
                            id="range-end"
                            type="number" 
                            className={`w-32 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                                      ${inputMode === 'single' ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-blue-500 border-gray-300'}`}
                            value={range_year_end === null ? '' : range_year_end} 
                            onChange={handleRangeEndChange}
                            placeholder="End"
                            disabled={inputMode === 'single'}
                            min="2011"
                            max="2099"
                        />
                    </div>
                </div>
                {error && (
                    <div className="mt-3 text-red-500 text-sm">{error}</div>
                )}
            </div>

            {/* Method Selection */}
            <div className="mb-4 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Calculation Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={methods.timeseries}
                            onChange={() => handleMethodChange('timeseries')}
                        />
                        <span className="ml-2 text-gray-700">Time Series</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={methods.demographic}
                            onChange={() => handleMethodChange('demographic')}
                        />
                        <span className="ml-2 text-gray-700">Demographic</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={methods.cohort}
                            onChange={() => handleMethodChange('cohort')}
                        />
                        <span className="ml-2 text-gray-700">Cohort</span>
                    </label>
                </div>
                {!isMethodSelected && (
                    <div className="mt-2 text-red-500 text-sm">Please select at least one calculation method</div>
                )}
            </div>

            {/* TimeMethods Component - Show when timeseries is selected */}
            {methods.timeseries && (
                <div className="mb-4 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3">Time Series Analysis</h3>
                    <TimeMethods />
                </div>
            )}
            {methods.demographic && (
                 <div className="mb-4 p-4 rounded-md border border-gray-200">
                 <h3 className="font-medium text-gray-700 mb-3">Demograhic  Analysis</h3>
                 <DemographicMethods />
             </div>
            )} {/* Add DemographicMethods component here.}

            {/* Submit Button */}
            <div className="mt-6">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={
                        (inputMode === 'single' && (single_year === null || single_year < 2011 || single_year > 2099)) || 
                        (inputMode === 'range' && (range_year_start === null || range_year_end === null || 
                                                range_year_start < 2011 || range_year_start > 2099 ||
                                                range_year_end < 2011 || range_year_end > 2099 ||
                                                error !== null)) ||
                        inputMode === null ||
                        !isMethodSelected
                    }
                    onClick={handleSubmit}
                >
                    Calculate
                </button>
            </div>

            {/* Results Table */}
            {results && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Population Forecasting Results</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="py-2 px-4 text-left border-r">Year</th>
                                    <th className="py-2 px-4 text-left border-r">Population</th>
                                    <th className="py-2 px-4 text-left border-r">Growth Rate (%)</th>
                                    <th className="py-2 px-4 text-left">Methods Used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4 border-r">{row.year}</td>
                                        <td className="py-2 px-4 border-r">{row.population.toLocaleString()}</td>
                                        <td className="py-2 px-4 border-r">{row.growthRate}%</td>
                                        <td className="py-2 px-4">{row.methods.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Method Descriptions */}
            {/* <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Population Prediction Methods</h2>
                <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Method Descriptions</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li><span className="font-medium">Time Series:</span> Analyzes historical population data to project future trends.</li>
                        <li><span className="font-medium">Demographic:</span> Takes into account birth rates, death rates, and migration patterns.</li>
                        <li><span className="font-medium">Cohort:</span> Tracks groups of individuals born in the same time period as they age.</li>
                    </ul>
                </div>
                
                <div className="mt-4 bg-white rounded-md shadow-sm p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Growth Calculation</h3>
                    <p className="text-gray-600">
                        Population growth is calculated with respect to the base year 2011, showing percentage change over time.
                    </p>
                </div>
            </div> */}
        </div>
    )
}

export default Population