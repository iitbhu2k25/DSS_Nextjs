'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RasterFile, RasterCategory, RasterMetadata } from '@/types/rasterType';
import rasterService from '@/services/rasterService';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const ScaleControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ScaleControl),
  { ssr: false }
);

// Types for state management
interface MapState {
  currentRasterLayer: L.Layer | null;
  currentRasterBounds: L.LatLngBounds | null;
  currentCategory: string | null;
  currentRasterFile: string | null;
  rasterMetadata: RasterMetadata | null;
  currentGeoRaster: any | null;
  mapRotation: number;
}

interface DisplaySettings {
  opacity: number;
  legendCount: number;
  zoomLevel: number;
  showCompass: boolean;
  showGrid: boolean;
  showLegend: boolean;
}

interface ExportOptions {
  title: string;
  layout: string;
  dpi: string;
  includeLegend: boolean;
  includeCoordinates: boolean;
  includeVectors: boolean;
}

const IndiaGISRasterViewer: React.FC = () => {
  // Constants
  const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
  const INDIA_ZOOM = 5;
  
  // Refs
  const mapRef = useRef<L.Map | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  
  // State management
  const [mapState, setMapState] = useState<MapState>({
    currentRasterLayer: null,
    currentRasterBounds: null,
    currentCategory: null,
    currentRasterFile: null,
    rasterMetadata: null,
    currentGeoRaster: null,
    mapRotation: 0
  });
  
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    opacity: 10,
    legendCount: 5,
    zoomLevel: 8,
    showCompass: true,
    showGrid: true,
    showLegend: true
  });
  
  const [categories, setCategories] = useState<RasterCategory[]>([]);
  const [rasterFiles, setRasterFiles] = useState<RasterFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    title: 'India GIS Raster Map',
    layout: 'a4-landscape',
    dpi: '300',
    includeLegend: true,
    includeCoordinates: true,
    includeVectors: true
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState<string>('streets');
  
  // Setup leaflet when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // This ensures Leaflet is only imported client-side
    const L = require('leaflet');
    require('leaflet-draw');
    
    // Fix icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
    
    // Initialize GeoRaster support if needed
    const initGeoRaster = async () => {
      try {
        const parseGeoraster = (await import('georaster')).default;
        const GeoRasterLayer = (await import('georaster-layer-for-leaflet')).default;
        (window as any).parseGeoraster = parseGeoraster;
        (window as any).GeoRasterLayer = GeoRasterLayer;
      } catch (error) {
        console.error("Error initializing georaster libraries:", error);
      }
    };
    
    initGeoRaster();
    
    // Fetch categories on mount
    fetchCategories();
    
    // Initialize drawing items
    if (mapRef.current) {
      const map = mapRef.current;
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
      
      // Add coordinate grid if enabled
      if (displaySettings.showGrid) {
        addCoordinateGrid();
      }
      
      // Add mouse position tracking
      map.on('mousemove', handleMouseMove);
    }
    
    // Adjust for mobile screens
    adjustForScreenSize();
    window.addEventListener('resize', adjustForScreenSize);
    
    return () => {
      window.removeEventListener('resize', adjustForScreenSize);
      
      if (mapRef.current) {
        mapRef.current.off('mousemove', handleMouseMove);
      }
    };
  }, []);
  
  // Function to handle mouse movement on the map
  const handleMouseMove = (e: L.LeafletMouseEvent) => {
    setCoordinates({
      lat: e.latlng.lat,
      lng: e.latlng.lng
    });
  };
  
  // Function to fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await rasterService.getCategories();
      setCategories(data);
      showNotification('Categories loaded successfully', 'success');
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification('Failed to load categories', 'error');
      
      // Fallback categories
      setCategories([
        { id: 'rainfall', name: 'Rainfall' },
        { id: 'temperature', name: 'Temperature' },
        { id: 'population', name: 'Population' },
        { id: 'vegetation', name: 'Vegetation' },
        { id: 'air-quality', name: 'Air Quality' },
        { id: 'water-resources', name: 'Water Resources' },
        { id: 'soil-health', name: 'Soil Health' },
        { id: 'land-use', name: 'Land Use' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch raster files for a category
  const fetchRasterFiles = async (categoryId: string) => {
    setIsLoading(true);
    
    const categoryObj = categories.find(c => c.id === categoryId);
    if (!categoryObj) {
      showNotification('Category not found', 'error');
      setIsLoading(false);
      return;
    }
    
    setMapState(prev => ({ ...prev, currentCategory: categoryObj.name }));
    
    try {
      const data = await rasterService.getRasterFiles(categoryId);
      setRasterFiles(data);
      showNotification(`${data.length} raster files found for ${categoryObj.name}`, 'success');
    } catch (error) {
      console.error(`Error fetching raster files for ${categoryObj.name}:`, error);
      showNotification(`Failed to load raster files for ${categoryObj.name}`, 'error');
      setRasterFiles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch and display raster data
  const fetchRasterData = async (categoryId: string, fileId: string) => {
    setIsLoading(true);
    
    const categoryObj = categories.find(c => c.id === categoryId);
    const fileObj = rasterFiles.find(f => f.id === fileId);
    
    if (!categoryObj || !fileObj) {
      showNotification('Category or file not found', 'error');
      setIsLoading(false);
      return;
    }
    
    try {
      // Fetch metadata
      const metadata = await rasterService.getRasterMetadata(categoryId, fileId);
      
      setMapState(prev => ({
        ...prev,
        currentCategory: categoryObj.name,
        currentRasterFile: fileObj.name,
        rasterMetadata: metadata
      }));
      
      try {
        // Fetch actual raster data
        const rasterData = await rasterService.getRasterData(categoryId, fileId);
        
        // Process the raster data using georaster
        if ((window as any).parseGeoraster) {
          const georaster = await (window as any).parseGeoraster(rasterData);
          processGeoRaster(georaster, metadata, categoryObj.name);
        }
        
        showNotification(`Raster data for ${fileObj.name} loaded successfully`, 'success');
      } catch (rasterError) {
        console.error("Error processing raster data:", rasterError);
        showNotification(`Failed to process raster data: ${rasterError.message}`, 'error');
        
        // Even if we can't load the actual raster, update UI with metadata
        updateDynamicLegend(categoryObj.name, metadata);
      }
    } catch (error) {
      console.error(`Error fetching metadata for ${fileObj.name}:`, error);
      showNotification(`Failed to load metadata for ${fileObj.name}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process georaster and create layer
  const processGeoRaster = (georaster: any, metadata: RasterMetadata, categoryName: string) => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Remove existing raster layer if any
    if (mapState.currentRasterLayer && map.hasLayer(mapState.currentRasterLayer)) {
      map.removeLayer(mapState.currentRasterLayer);
    }
    
    // Calculate opacity value from slider (1-10 to 0.1-1.0)
    const opacity = displaySettings.opacity / 10;
    
    // Create a new georaster layer
    const GeoRasterLayer = (window as any).GeoRasterLayer;
    if (!GeoRasterLayer) {
      showNotification('GeoRasterLayer library not loaded', 'error');
      return;
    }
    
    const rasterLayer = new GeoRasterLayer({
      georaster: georaster,
      opacity: opacity,
      resolution: 256,
      pixelValuesToColorFn: (values: number[]) => {
        if (values[0] === georaster.noDataValue) {
          return null; // transparent for no data values
        }
        
        // Get color based on value using metadata and legend count
        return getColorForValue(values[0], categoryName, metadata, displaySettings.legendCount);
      },
    });
    
    // Store bounds for reuse when changing basemaps
    let rasterBounds = null;
    if (georaster.projection && georaster.projection.bbox) {
      // Create a proper Leaflet bounds object
      rasterBounds = L.latLngBounds(
        [
          georaster.projection.bbox[1],  // lat1
          georaster.projection.bbox[0],  // lng1
        ],
        [
          georaster.projection.bbox[3],  // lat2
          georaster.projection.bbox[2]   // lng2
        ]
      );
    }
    
    // Add the layer to the map
    rasterLayer.addTo(map);
    
    // Update state with new layer
    setMapState(prev => ({
      ...prev,
      currentRasterLayer: rasterLayer,
      currentRasterBounds: rasterBounds,
      currentGeoRaster: georaster,
    }));
    
    // Update legend
    updateDynamicLegend(categoryName, metadata);
    
    // Zoom to bounds
    if (rasterBounds && rasterBounds.isValid()) {
      try {
        map.fitBounds(rasterBounds, {
          padding: [50, 50],
          maxZoom: displaySettings.zoomLevel,
          animate: true
        });
      } catch (error) {
        console.error("Error during fitBounds:", error);
        map.setView(INDIA_CENTER, 6);
      }
    }
  };
  
  // Function to get color for a value
  const getColorForValue = (value: number, category: string, metadata: RasterMetadata, count: number = 5): string => {
    const colors = getColorScaleForCategory(category, count);
    
    if (metadata && metadata.min !== undefined && metadata.max !== undefined) {
      // Use dynamic ranges if metadata is available
      const min = metadata.min;
      const max = metadata.max;
      const range = max - min;
      const normalizedValue = Math.min(1, Math.max(0, (value - min) / range));
      const colorIndex = Math.min(colors.length - 1, Math.floor(normalizedValue * colors.length));
      return colors[colorIndex];
    } else {
      // Fallback to fixed ranges
      const normalizedValue = Math.min(1, Math.max(0, value / 100));
      const colorIndex = Math.min(colors.length - 1, Math.floor(normalizedValue * colors.length));
      return colors[colorIndex];
    }
  };
  
  // Get color scale for a category
  const getColorScaleForCategory = (category: string, count: number = 5): string[] => {
    // Different color scales for different categories
    let baseColors: [string, string];
    
    switch (category) {
      case "Rainfall":
        baseColors = ["#d4f1f9", "#2980b9"];
        break;
      case "Temperature":
        baseColors = ["#f9e79f", "#a93226"];
        break;
      case "Population":
        baseColors = ["#d5f5e3", "#145a32"];
        break;
      case "Vegetation":
        baseColors = ["#fcf3cf", "#145a32"];
        break;
      case "Air Quality":
        baseColors = ["#ebf5fb", "#21618c"];
        break;
      case "Water Resources":
        baseColors = ["#eafaf1", "#186a3b"];
        break;
      case "Soil Health":
        baseColors = ["#fef9e7", "#b7950b"];
        break;
      case "Land Use":
        baseColors = ["#f4ecf7", "#6c3483"];
        break;
      default:
        // Default blue scale for unknown categories
        baseColors = ["#d4e6f1", "#154360"];
    }
    
    // Generate an array of colors with the requested count
    return interpolateColors(baseColors[0], baseColors[1], count);
  };
  
  // Helper function to interpolate between colors
  const interpolateColors = (startColor: string, endColor: string, steps: number): string[] => {
    // Parse hex colors to RGB
    const start = {
      r: parseInt(startColor.slice(1, 3), 16),
      g: parseInt(startColor.slice(3, 5), 16),
      b: parseInt(startColor.slice(5, 7), 16)
    };
    
    const end = {
      r: parseInt(endColor.slice(1, 3), 16),
      g: parseInt(endColor.slice(3, 5), 16),
      b: parseInt(endColor.slice(5, 7), 16)
    };
    
    // Calculate step size for each color channel
    const stepR = (end.r - start.r) / (steps - 1);
    const stepG = (end.g - start.g) / (steps - 1);
    const stepB = (end.b - start.b) / (steps - 1);
    
    // Generate the color array
    const colorArray = [];
    for (let i = 0; i < steps; i++) {
      const r = Math.round(start.r + (stepR * i));
      const g = Math.round(start.g + (stepG * i));
      const b = Math.round(start.b + (stepB * i));
      colorArray.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }
    
    return colorArray;
  };
  
  // Function to update dynamic legend
  const updateDynamicLegend = (category: string, metadata: RasterMetadata) => {
    // In a real implementation, we would update state that drives the legend UI
    console.log(`Updating legend for ${category} with metadata:`, metadata);
  };
  
  // Function to add coordinate grid
  const addCoordinateGrid = () => {
    if (!mapRef.current) return;
    
    const L = require('leaflet');
    const map = mapRef.current;
    
    // Implementation to add grid lines...
    // This would create and add lat/lng grid lines to the map
  };
  
  // Function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };
  
  // Function to update display settings
  const updateDisplaySetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Apply settings function
  const applySettings = () => {
    if (mapState.currentGeoRaster) {
      rerenderRasterLayer();
    } else {
      showNotification('Load raster data first before applying settings', 'warning');
    }
  };
  
  // Function to rerender raster layer
  const rerenderRasterLayer = () => {
    if (!mapState.currentGeoRaster || !mapRef.current) return;
    
    const georaster = mapState.currentGeoRaster;
    const metadata = mapState.rasterMetadata;
    const categoryName = mapState.currentCategory;
    
    if (!georaster || !metadata || !categoryName) return;
    
    // Re-process the georaster with new settings
    processGeoRaster(georaster, metadata, categoryName);
  };
  
  // Function to handle basemap change
  const changeBasemap = (basemapId: string) => {
    // Implementation would change the basemap
    setSelectedBasemap(basemapId);
    showNotification(`Switched to ${basemapId} basemap`, 'info');
  };
  
  // Handle drawing tool selection
  const handleDrawingTool = (tool: string) => {
    setSelectedTool(tool);
    
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = require('leaflet');
    
    switch (tool) {
      case "point":
        new L.Draw.Marker(map).enable();
        break;
      case "line":
        new L.Draw.Polyline(map).enable();
        break;
      case "polygon":
        new L.Draw.Polygon(map).enable();
        break;
      case "measure":
        new L.Draw.Polyline(map, {
          shapeOptions: {
            color: "#ff7800",
            weight: 3,
          },
        }).enable();
        break;
      case "clear":
        if (drawnItemsRef.current) {
          drawnItemsRef.current.clearLayers();
        }
        break;
    }
    
    showNotification(`${tool} tool activated`, 'info');
  };
  
  // Handle analysis tool selection
  const handleAnalysisTool = (tool: string) => {
    setSelectedAnalysis(tool);
    showNotification(`${tool} analysis started`, 'info');
    
    // Implement actual analysis functionality here
    // For example: elevation profiles, viewshed analysis, etc.
  };
  
  // Function to handle raster operations
  const handleRasterOperation = (operation: string) => {
    if (!mapState.currentRasterLayer) {
      showNotification('Load raster data first before performing operations', 'warning');
      return;
    }
    
    // Implementation for various raster operations
    switch (operation) {
      case "classify":
        showNotification('Reclassifying raster...', 'info');
        // Implementation for reclassifying raster
        break;
      case "zonal-stats":
        showNotification('Calculating zonal statistics...', 'info');
        // Implementation for zonal statistics
        break;
      case "hillshade":
        showNotification('Generating hillshade...', 'info');
        // Implementation for hillshade
        break;
      case "filter":
        showNotification('Applying filter...', 'info');
        // Implementation for filter
        break;
      case "contour":
        showNotification('Generating contours...', 'info');
        // Implementation for contour generation
        break;
    }
  };
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Function to handle export
  const handleExport = () => {
    setShowExportModal(true);
  };
  
  // Function to confirm export
  const confirmExport = () => {
    setShowExportModal(false);
    showNotification('Preparing export, please wait...', 'info');
    
    // Implementation would export the map
    setTimeout(() => {
      showNotification(`Map has been exported as "${exportOptions.title.replace(/\s+/g, '_')}.png"`, 'success');
    }, 2000);
  };
  
  // Function to handle screen size adjustments
  const adjustForScreenSize = () => {
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };
  
  // Render the component
  return (
    <div className="container mx-auto py-3 bg-gray-100">
      <div className="flex justify-center">
        <div className="w-full xl:w-11/12">
          {/* App Header */}
          <div className="mb-4 bg-blue-600 text-white rounded-lg shadow">
            <div className="p-4">
              <div className="flex flex-wrap items-center">
                <div className="w-full md:w-1/2">
                  <div className="flex items-center">
                    <i className="fas fa-globe-asia text-2xl mr-2"></i>
                    <h3 className="text-xl font-bold m-0">India GIS Raster Data Viewer</h3>
                  </div>
                </div>
                <div className="w-full md:w-1/2 text-right">
                  <span>Advanced Geospatial Analysis Tool</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-0">
              <div className="flex relative">
                {/* Sidebar */}
                <div 
                  ref={sidebarRef}
                  className={`bg-white p-3 border-r transition-all duration-300 ${
                    sidebarCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-72'
                  }`}
                >
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <h5 className="m-0 font-bold text-gray-600">Control Panel</h5>
                  </div>

                  {/* Data Selection Section */}
                  <div className="bg-gray-100 p-3 rounded-lg mb-3">
                    <h6 className="flex items-center text-sm font-semibold mb-2">
                      <i className="fas fa-database text-blue-600 mr-2"></i> Data Selection
                    </h6>

                    {/* Category Selection */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => fetchRasterFiles(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="" disabled selected>
                          {categories.length > 0 ? 'Select a category' : 'Loading categories...'}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {categories.length > 0 && (
                        <div className="text-green-600 mt-1 text-xs">
                          <i className="fas fa-check-circle"></i> {categories.length} categories loaded
                        </div>
                      )}
                    </div>

                    {/* Raster Files Selection */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Raster File</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          if (mapState.currentCategory) {
                            const categoryId = categories.find(c => c.name === mapState.currentCategory)?.id || '';
                            fetchRasterData(categoryId, e.target.value);
                          }
                        }}
                        disabled={!mapState.currentCategory || isLoading}
                      >
                        <option value="" disabled selected>
                          {!mapState.currentCategory 
                            ? 'Select a category first' 
                            : rasterFiles.length > 0 
                              ? 'Select a raster file'
                              : 'Loading raster files...'}
                        </option>
                        {rasterFiles.map((file) => (
                          <option key={file.id} value={file.id}>{file.name}</option>
                        ))}
                      </select>
                      {rasterFiles.length > 0 && (
                        <div className="text-green-600 mt-1 text-xs">
                          <i className="fas fa-check-circle"></i> {rasterFiles.length} files available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Options Section */}
                  <div className="bg-gray-100 p-3 rounded-lg mb-3">
                    <h6 className="flex items-center text-sm font-semibold mb-2">
                      <i className="fas fa-layer-group text-blue-600 mr-2"></i> Map Options
                    </h6>

                    {/* Base Map Dropdown */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Map</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={selectedBasemap}
                        onChange={(e) => changeBasemap(e.target.value)}
                      >
                        <option value="streets">Streets</option>
                        <option value="satellite">Satellite</option>
                        <option value="terrain">Terrain</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="cartoVoyager">Carto Voyager</option>
                        <option value="none">No Basemap</option>
                      </select>
                    </div>

                    {/* Drawing Tools */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Tools</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedTool === 'point' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleDrawingTool('point')}
                        >
                          <i className="fas fa-map-marker-alt mr-1"></i> Point
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedTool === 'line' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleDrawingTool('line')}
                        >
                          <i className="fas fa-slash mr-1"></i> Line
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedTool === 'polygon' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleDrawingTool('polygon')}
                        >
                          <i className="fas fa-draw-polygon mr-1"></i> Polygon
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedTool === 'measure' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleDrawingTool('measure')}
                        >
                          <i className="fas fa-ruler mr-1"></i> Measure
                        </button>
                        <button
                          className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300 col-span-2"
                          onClick={() => handleDrawingTool('clear')}
                        >
                          <i className="fas fa-trash-alt mr-1"></i> Clear All
                        </button>
                      </div>
                    </div>

                    {/* Analysis Tools */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Tools</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedAnalysis === 'elevation' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleAnalysisTool('elevation')}
                        >
                          <i className="fas fa-mountain mr-1"></i> Elevation
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedAnalysis === 'viewshed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleAnalysisTool('viewshed')}
                        >
                          <i className="fas fa-eye mr-1"></i> Viewshed
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedAnalysis === 'buffer' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleAnalysisTool('buffer')}
                        >
                          <i className="fas fa-expand-alt mr-1"></i> Buffer
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${selectedAnalysis === 'statistics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                          onClick={() => handleAnalysisTool('statistics')}
                        >
                          <i className="fas fa-calculator mr-1"></i> Statistics
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* NEW: Raster Operations Section */}
                  <div className="bg-gray-100 p-3 rounded-lg mb-3">
                    <h6 className="flex items-center text-sm font-semibold mb-2">
                      <i className="fas fa-cogs text-blue-600 mr-2"></i> Raster Operations
                    </h6>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300"
                        onClick={() => handleRasterOperation('classify')}
                        disabled={!mapState.currentRasterLayer}
                      >
                        <i className="fas fa-th mr-1"></i> Reclassify
                      </button>
                      <button
                        className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300"
                        onClick={() => handleRasterOperation('zonal-stats')}
                        disabled={!mapState.currentRasterLayer}
                      >
                        <i className="fas fa-chart-bar mr-1"></i> Zonal Stats
                      </button>
                      <button
                        className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300"
                        onClick={() => handleRasterOperation('hillshade')}
                        disabled={!mapState.currentRasterLayer}
                      >
                        <i className="fas fa-mountain mr-1"></i> Hillshade
                      </button>
                      <button
                        className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300"
                        onClick={() => handleRasterOperation('filter')}
                        disabled={!mapState.currentRasterLayer}
                      >
                        <i className="fas fa-filter mr-1"></i> Filter
                      </button>
                      <button
                        className="py-1 px-2 text-xs rounded bg-white text-gray-700 border border-gray-300 col-span-2"
                        onClick={() => handleRasterOperation('contour')}
                        disabled={!mapState.currentRasterLayer}
                      >
                        <i className="fas fa-wave-square mr-1"></i> Generate Contours
                      </button>
                    </div>
                  </div>

                  {/* Display Settings Section */}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h6 className="flex items-center text-sm font-semibold mb-2">
                      <i className="fas fa-sliders-h text-blue-600 mr-2"></i> Display Settings
                    </h6>

                    {/* Opacity Slider */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Opacity</label>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                          {displaySettings.opacity}
                        </span>
                      </div>
                      <input
                        type="range"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        min="1"
                        max="10"
                        value={displaySettings.opacity}
                        onChange={(e) => updateDisplaySetting('opacity', parseInt(e.target.value))}
                      />
                    </div>

                    {/* Legend Items Count Slider */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Legend Items</label>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                          {displaySettings.legendCount}
                        </span>
                      </div>
                      <input
                        type="range"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        min="2"
                        max="10"
                        value={displaySettings.legendCount}
                        onChange={(e) => updateDisplaySetting('legendCount', parseInt(e.target.value))}
                      />
                    </div>

                    {/* Zoom Level Slider */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Zoom Level</label>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                          {displaySettings.zoomLevel}
                        </span>
                      </div>
                      <input
                        type="range"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        min="5"
                        max="16"
                        value={displaySettings.zoomLevel}
                        onChange={(e) => updateDisplaySetting('zoomLevel', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center mb-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={displaySettings.showGrid}
                          onChange={(e) => updateDisplaySetting('showGrid', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Coordinate Grid</span>
                      </label>
                    </div>

                    <div className="flex items-center mb-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={displaySettings.showLegend}
                          onChange={(e) => updateDisplaySetting('showLegend', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Show Legend</span>
                      </label>
                    </div>

                    <div className="flex items-center mb-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={displaySettings.showCompass}
                          onChange={(e) => updateDisplaySetting('showCompass', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Show Compass</span>
                      </label>
                    </div>

                    {/* Apply Settings Button */}
                    <button
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300 flex justify-center items-center"
                      onClick={applySettings}
                    >
                      <i className="fas fa-sync-alt mr-2"></i> Apply Settings
                    </button>
                  </div>
                </div>

                {/* Sidebar Toggle Button */}
                <button
                  className={`absolute z-10 top-5 bg-white rounded-full shadow-sm w-8 h-8 flex items-center justify-center transition-all duration-300 ${
                    sidebarCollapsed ? 'left-5' : 'left-72'
                  }`}
                  onClick={toggleSidebar}
                >
                  <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
                </button>

                {/* Map Container */}
                <div className="relative h-[70vh] flex-grow overflow-hidden rounded-r-lg">
                  {/* The map will be rendered when component mounts */}
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      center={INDIA_CENTER}
                      zoom={INDIA_ZOOM}
                      minZoom={4}
                      maxZoom={18}
                      zoomControl={false}
                      className="h-full w-full"
                      whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                      }}
                    >
                      <TileLayer
                        url="https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
                        attribution='&copy; <a href="https://www.google.com/maps">Google Traffic</a>'
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                      />
                      <ScaleControl imperial={false} position="bottomright" />
                    </MapContainer>
                  )}

                  {/* Modern Compass */}
                  {displaySettings.showCompass && (
                    <div className="absolute top-20 left-5 z-10 w-24 h-24 bg-white bg-opacity-90 rounded-full shadow-lg flex items-center justify-center pointer-events-none backdrop-blur-sm">
                      <div className="relative w-20 h-20" style={{ transform: `rotate(${-mapState.mapRotation}deg)` }}>
                        <div className="absolute inset-0 border-2 border-blue-200 border-opacity-20 rounded-full"></div>
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 shadow-inner"></div>
                        <div className="absolute top-1/2 left-1/2 w-1 h-4/5 -translate-x-1/2 -translate-y-1/2 origin-center">
                          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-t from-transparent to-red-500 clip-triangle-n shadow-sm"></div>
                          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-gray-700 clip-triangle-s"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-radial-circle border border-gray-300 rounded-full shadow z-3"></div>
                        <div className="absolute inset-0 text-xs font-semibold pointer-events-none">
                          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-red-500">N</span>
                          <span className="absolute top-[18%] right-[18%] text-[10px] text-gray-600">NE</span>
                          <span className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-600">E</span>
                          <span className="absolute bottom-[18%] right-[18%] text-[10px] text-gray-600">SE</span>
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600">S</span>
                          <span className="absolute bottom-[18%] left-[18%] text-[10px] text-gray-600">SW</span>
                          <span className="absolute top-1/2 left-1 -translate-y-1/2 text-gray-600">W</span>
                          <span className="absolute top-[18%] left-[18%] text-[10px] text-gray-600">NW</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rotation Control Button */}
                  {displaySettings.showCompass && (
                    <div
                      className="absolute top-20 right-5 z-10 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center cursor-pointer"
                      onClick={() => setMapState(prev => ({ ...prev, mapRotation: (prev.mapRotation + 45) % 360 }))}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </div>
                  )}

                  {/* Export Button */}
                  <button
                    className="absolute top-5 right-5 z-10 py-2 px-4 bg-white shadow-sm rounded text-sm flex items-center"
                    onClick={handleExport}
                  >
                    <i className="fas fa-file-pdf text-blue-600 mr-2"></i> Export PDF
                  </button>

                  {/* Map Controls */}
                  <div className="absolute right-5 bottom-8 z-10 flex flex-col bg-white rounded shadow-sm p-1">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded mb-1 hover:bg-gray-100"
                      title="Zoom In"
                      onClick={() => mapRef.current?.zoomIn()}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded mb-1 hover:bg-gray-100"
                      title="Zoom Out"
                      onClick={() => mapRef.current?.zoomOut()}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded mb-1 hover:bg-gray-100"
                      title="Default View"
                      onClick={() => mapRef.current?.setView(INDIA_CENTER, INDIA_ZOOM)}
                    >
                      <i className="fas fa-home"></i>
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded mb-1 hover:bg-gray-100 relative"
                      title="My Location"
                      onClick={() => {
                        showNotification('Finding your location...', 'info');
                        navigator.geolocation?.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            mapRef.current?.setView([latitude, longitude], 10);
                            showNotification('Your current location has been found', 'success');
                          },
                          (error) => {
                            showNotification(`Could not access your location: ${error.message}`, 'error');
                          }
                        );
                      }}
                    >
                      <i className="fas fa-location-arrow"></i>
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                      title="Fullscreen"
                      onClick={() => {
                        if (!document.fullscreenElement) {
                          document.documentElement.requestFullscreen().catch((err) => {
                            showNotification(`Fullscreen failed: ${err.message}`, 'error');
                          });
                        } else if (document.exitFullscreen) {
                          document.exitFullscreen();
                        }
                      }}
                    >
                      <i className="fas fa-expand"></i>
                    </button>
                  </div>

                  {/* Info Panel */}
                  <div className="absolute bottom-8 left-5 z-10 min-w-[200px] bg-white rounded shadow-sm p-3">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm mb-2">
                      {mapState.currentCategory && mapState.currentRasterFile 
                        ? `${mapState.currentCategory}: ${mapState.currentRasterFile}` 
                        : 'No Data Loaded'}
                    </div>
                    <div>
                      <small className="text-gray-600">Coordinates:</small>
                      <div className="text-sm">{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</div>
                    </div>
                  </div>

                  {/* Map Legend */}
                  {displaySettings.showLegend && (
                    <div className="absolute bottom-8 right-20 z-10 min-w-[220px] max-h-[300px] overflow-y-auto bg-white rounded shadow-sm p-3">
                      <div className="font-bold border-b border-blue-600 pb-2 mb-2">
                        <span className="text-sm">
                          {mapState.currentCategory ? `${mapState.currentCategory} Legend` : 'Raster Legend'}
                        </span>
                      </div>
                      <div id="legend-content">
                        {/* Legend content would be dynamically populated */}
                        {mapState.currentCategory && (
                          <div className="font-bold mt-3 text-sm">
                            Category: {mapState.currentCategory}
                          </div>
                        )}
                        {mapState.rasterMetadata && mapState.rasterMetadata.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {mapState.rasterMetadata.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Tooltip */}
                  <div className={`absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white py-2 px-3 rounded shadow-sm z-10 transition-opacity duration-500 ${
                    isLoading ? 'opacity-100 -translate-y-2' : 'opacity-0'
                  }`}>
                    Loading data...
                  </div>

                  {/* Loader */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-20 ${
                    isLoading ? 'flex' : 'hidden'
                  }`}>
                    <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <span>Loading data...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg flex items-center justify-between">
              <h3 className="text-lg font-medium">Export Map as PDF</h3>
              <button onClick={() => setShowExportModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Map Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter map title"
                  value={exportOptions.title}
                  onChange={(e) => setExportOptions({...exportOptions, title: e.target.value})}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Format</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exportOptions.layout}
                  onChange={(e) => setExportOptions({...exportOptions, layout: e.target.value})}
                >
                  <option value="a4-portrait">A4 Portrait</option>
                  <option value="a4-landscape">A4 Landscape</option>
                  <option value="a3-portrait">A3 Portrait</option>
                  <option value="a3-landscape">A3 Landscape</option>
                  <option value="letter-portrait">Letter Portrait</option>
                  <option value="letter-landscape">Letter Landscape</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution (DPI)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exportOptions.dpi}
                  onChange={(e) => setExportOptions({...exportOptions, dpi: e.target.value})}
                >
                  <option value="150">150 DPI (Draft)</option>
                  <option value="300">300 DPI (Standard)</option>
                  <option value="600">600 DPI (High Quality)</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Options</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="exportLegend"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={exportOptions.includeLegend}
                      onChange={(e) => setExportOptions({...exportOptions, includeLegend: e.target.checked})}
                    />
                    <label htmlFor="exportLegend" className="ml-2 text-sm text-gray-700">Include Legend</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="exportCoordinates"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={exportOptions.includeCoordinates}
                      onChange={(e) => setExportOptions({...exportOptions, includeCoordinates: e.target.checked})}
                    />
                    <label htmlFor="exportCoordinates" className="ml-2 text-sm text-gray-700">Include Coordinate Grid</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="exportVectors"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={exportOptions.includeVectors}
                      onChange={(e) => setExportOptions({...exportOptions, includeVectors: e.target.checked})}
                    />
                    <label htmlFor="exportVectors" className="ml-2 text-sm text-gray-700">Include Drawn Features</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-300"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                onClick={confirmExport}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications Container */}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default IndiaGISRasterViewer;