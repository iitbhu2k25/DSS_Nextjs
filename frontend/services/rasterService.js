// rasterService.js - API client for GIS raster data

/**
 * Service for fetching GIS raster data from backend API
 */
class RasterService {
    constructor(baseUrl = '/api/visuall') {
      this.baseUrl = baseUrl;
    }
  
    /**
     * Fetch available raster data categories
     * @returns {Promise<string[]>} Array of category names
     */
    async getCategories() {
      try {
        const response = await fetch(`${this.baseUrl}/categories/`);
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Return fallback categories if API fails
        return [
          "Rainfall",
          "Temperature",
          "Population",
          "Vegetation",
          "Air Quality",
          "Water Resources",
          "Soil Health",
          "Land Use"
        ];
      }
    }
  
    /**
     * Fetch raster files for a given category
     * @param {string} category - Category name
     * @returns {Promise<Object[]>} Array of raster file metadata
     */
    async getRasterFiles(category) {
      try {
        const response = await fetch(`${this.baseUrl}/raster_data/${category}/`);
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching raster files for ${category}:`, error);
        // Create mock data for demonstration
        return Array.from({ length: 5 }, (_, i) => ({
          id: `${category.toLowerCase()}_${i + 1}`,
          name: `${category} Data ${i + 1}`,
          description: `Sample ${category.toLowerCase()} data file ${i + 1}`
        }));
      }
    }
  
    /**
     * Fetch raster file metadata
     * @param {string} category - Category name
     * @param {string} fileId - Raster file ID
     * @returns {Promise<Object>} Raster metadata
     */
    async getRasterMetadata(category, fileId) {
      try {
        const response = await fetch(`${this.baseUrl}/metadata/${category}/${fileId}/`);
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching metadata for ${fileId}:`, error);
        
        // Return mock metadata based on category
        return {
          min: 0,
          max: category === 'Temperature' ? 50 : 
               category === 'Rainfall' ? 3000 : 
               category === 'Population' ? 10000 : 100,
          noData: -9999,
          description: `Sample ${category} data for demonstration purposes`,
          units: this.getUnitsForCategory(category),
          source: 'Sample Data',
          date: new Date().toISOString().split('T')[0],
          resolution: '1km'
        };
      }
    }
  
    /**
     * Fetch raster data
     * @param {string} category - Category name
     * @param {string} fileId - Raster file ID
     * @returns {Promise<ArrayBuffer>} Raw raster data as ArrayBuffer
     */
    async getRasterData(category, fileId) {
      try {
        const response = await fetch(`${this.baseUrl}/raster_file/${category}/${fileId}/`);
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return await response.arrayBuffer();
      } catch (error) {
        console.error(`Error fetching raster data for ${fileId}:`, error);
        throw error; // Rethrow as we can't easily mock a georaster
      }
    }
  
    /**
     * Helper function to get units for a category
     * @param {string} category - Category name 
     * @returns {string} Unit string
     */
    getUnitsForCategory(category) {
      switch (category) {
        case "Rainfall": return "mm";
        case "Temperature": return "°C";
        case "Population": return "people/km²";
        case "Vegetation": return "NDVI";
        case "Air Quality": return "AQI";
        case "Water Resources": return "km³";
        case "Soil Health": return "index";
        case "Land Use": return "category";
        default: return "";
      }
    }
  }
  
  // Export singleton instance
  const rasterService = new RasterService();
  export default rasterService;