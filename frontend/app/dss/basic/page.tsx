'use client'
import React from "react"
import StatusBar from "./components/statusbar"
import LocationSelector from "./components/locations"
import Population from "./populations/population"

export default function Basic() {
    return (
        <div className="flex w-full min-h-0">
            {/* Left side - Status Bar */}
            <div className="w-64 border-r border-gray-200">
                <StatusBar />
            </div>
            
            {/* Right side - Main Content */}
            <div className="flex-1 p-4">
                <LocationSelector />
                <Population />
            </div>
        </div>
    )
}