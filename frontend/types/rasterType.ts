// src/types/rasterTypes.ts

export interface RasterCategory {
    id: string;
    name: string;
    description?: string;
  }
  
  export interface RasterFile {
    id: string;
    name: string;
    description?: string;
    date?: string;
    format?: string;
    size?: number;
  }
  
  export interface RasterMetadata {
    id?: string;
    category?: string;
    min?: number;
    max?: number;
    noData?: number;
    description?: string;
    units?: string;
    source?: string;
    date?: string;
    resolution?: string;
    bbox?: [number, number, number, number]; // [min_lng, min_lat, max_lng, max_lat]
    projection?: string;
    format?: string;
    statistics?: {
      mean?: number;
      median?: number;
      stdDev?: number;
      [key: string]: number | undefined;
    };
  }
  
  export interface RasterOperationOptions {
    operation: 'classify' | 'zonal-stats' | 'hillshade' | 'filter' | 'contour';
    params?: {
      [key: string]: any;
    };
  }
  
  export interface RasterClassBreak {
    min: number;
    max: number;
    color: string;
    label: string;
    description?: string;
  }
  
  export interface DrawingOptions {
    tool: 'point' | 'line' | 'polygon' | 'measure' | 'clear';
    style?: {
      color?: string;
      weight?: number;
      opacity?: number;
      fillColor?: string;
      fillOpacity?: number;
    };
  }
  
  export interface AnalysisOptions {
    type: 'elevation' | 'viewshed' | 'buffer' | 'statistics';
    params?: {
      [key: string]: any;
    };
  }
  
  export interface BasemapOptions {
    id: string;
    name: string;
    url: string;
    attribution: string;
    maxZoom?: number;
    subdomains?: string[];
    type?: 'tile' | 'wms';
  }
  
  export interface ExportOptions {
    title: string;
    layout: 'a4-portrait' | 'a4-landscape' | 'a3-portrait' | 'a3-landscape' | 'letter-portrait' | 'letter-landscape';
    dpi: '150' | '300' | '600';
    includeLegend: boolean;
    includeCoordinates: boolean;
    includeVectors: boolean;
    format?: 'png' | 'pdf' | 'jpg';
  }