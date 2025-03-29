'use client'

import { CircleDot, Circle } from 'lucide-react'

export default function StaticStatusBar() {
  // Define steps
  const steps = [
    { id: 'population', name: 'Population Forecasting', status: 'current' },
    { id: 'demand', name: 'Water Demand', status: 'upcoming' },
    { id: 'supply', name: 'Water Supply', status: 'upcoming' },
    { id: 'quality', name: 'Sewage', status: 'upcoming' }
    
  ]

  return (
    <div className="flex h-screen  bg-gray-50">
      {/* Sidebar with static display */}
      <div className="w-72 bg-white  border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Basic Module</h2>
          <p className="text-sm text-gray-500 mt-1"></p>
        </div>
        
        <nav aria-label="Progress" className="p-4">
          <ol className="space-y-6">
            {steps.map((step, stepIdx) => {
              return (
                <li key={step.id} className="relative">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {step.status === 'current' ? (
                        <CircleDot className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <div
                        className={`text-sm font-medium ${
                          step.status === 'current' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {step.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting line */}
                  {stepIdx < steps.length - 1 && (
                    <div className={`absolute left-2.5 top-7 -ml-px h-6 w-0.5 ${
                      step.status === 'current' ? 'bg-blue-200' : 'bg-gray-200'
                    }`} />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        
        <div className="mt-auto p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* <div className="text-xs text-gray-500">
              Project ID: <span className="font-medium">WRP-{Math.floor(10000 + Math.random() * 90000)}</span>
            </div> */}
            <div className="text-xs text-gray-500">
              <span className="font-medium">1/{steps.length}</span> steps
            </div>
          </div>
          
          <div className="mt-6">
            
          </div>
        </div>
      </div>
    </div>
  )
}