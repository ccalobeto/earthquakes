// geo-loader.js - Functions for loading and processing geographic data
import fs from 'node:fs/promises'
import * as topojson from 'topojson-client'
import { validateGeoData } from '../validators/geo-validator.js'

/**
 * Loads TopoJSON geographic data from a file and converts to GeoJSON features
 * @param {string} filePath - Path to the TopoJSON file
 * @returns {Object} Object containing districts and departments as GeoJSON features
 * @throws {Error} If file cannot be read or parsed
 */
export async function loadGeoData (filePath) {
  try {
    // Read and parse the file
    const fileContent = await fs.readFile(filePath, 'utf8')
    const geoData = JSON.parse(fileContent)

    // Validate the geo data structure
    validateGeoData(geoData)

    // Convert TopoJSON to GeoJSON features
    const districts = topojson.feature(geoData, geoData.objects.level4)
    const departments = topojson.feature(geoData, geoData.objects.level2)

    return { districts, departments }
  } catch (error) {
    throw new Error(`Failed to load geographic data: ${error.message}`)
  }
}
