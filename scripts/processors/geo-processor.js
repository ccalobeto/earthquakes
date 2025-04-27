/**
 * geo-processor.js
 *
 * Handles geographic data processing for seismic events, including:
 * - Extracting and processing district features
 * - Creating centroid calculations
 * - Identifying coastal regions
 * - Processing geographic coordinates
 */

import { geoCentroid } from 'd3-geo'
import rewind from '@turf/rewind'
import * as topojson from 'topojson-client'
import { capitalizeWords } from '../utils/formatters.js'

/**
 * Extracts geographic features from TopoJSON data
 *
 * @param {Object} topoData - TopoJSON data object containing Peru's geographic information
 * @returns {Object} - Object containing extracted district and department features
 * @throws {Error} - If extraction fails or data is invalid
 */
export function extractGeoFeatures (topoData) {
  if (!topoData || !topoData.objects) {
    throw new Error('Invalid TopoJSON data: Missing required objects')
  }

  try {
    // Extract districts (level4) and departments (level2) from TopoJSON
    const districts = topojson.feature(topoData, topoData.objects.level4)
    const departments = topojson.feature(topoData, topoData.objects.level2)

    // Validate extracted features
    if (!districts || !districts.features || !Array.isArray(districts.features)) {
      throw new Error('Failed to extract district features')
    }

    if (!departments || !departments.features || !Array.isArray(departments.features)) {
      throw new Error('Failed to extract department features')
    }

    return { districts, departments }
  } catch (error) {
    throw new Error(`Error extracting geographic features: ${error.message}`)
  }
}

/**
 * Calculates centroids for all districts in a feature collection
 *
 * @param {Object} featureCollection - GeoJSON feature collection of districts
 * @returns {Object} - GeoJSON feature collection of district centroids
 * @throws {Error} - If centroid calculation fails
 */
export function calculateDistrictCentroids (featureCollection) {
  if (!featureCollection || !featureCollection.features || !Array.isArray(featureCollection.features)) {
    throw new Error('Invalid feature collection for centroid calculation')
  }

  try {
    // Rewind polygon vertices to ensure correct orientation for centroid calculation
    const rewindedDistricts = rewind(featureCollection, { reverse: true })

    // Calculate centroid for each district
    const centroidFeatures = rewindedDistricts.features.map(feature => {
      // Validate feature
      if (!feature.id || !feature.properties || !feature.properties.name) {
        throw new Error(`Invalid feature structure: ${JSON.stringify(feature)}`)
      }

      // Calculate centroid coordinates
      const centroidCoords = geoCentroid(feature)
      if (!centroidCoords || centroidCoords.length !== 2) {
        throw new Error(`Failed to calculate centroid for feature: ${feature.id}`)
      }

      return {
        type: 'Feature',
        id: feature.id,
        properties: {
          name: capitalizeWords(feature.properties.name)
        },
        geometry: {
          type: 'Point',
          coordinates: centroidCoords
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features: centroidFeatures
    }
  } catch (error) {
    throw new Error(`Error calculating district centroids: ${error.message}`)
  }
}

/**
 * Filters district centroids to only include those in coastal departments
 *
 * @param {Object} centroidCollection - GeoJSON feature collection of district centroids
 * @returns {Object} - GeoJSON feature collection of coastal district centroids
 * @throws {Error} - If filtering fails
 */
export function filterCoastalCentroids (centroidCollection) {
  if (!centroidCollection || !centroidCollection.features || !Array.isArray(centroidCollection.features)) {
    throw new Error('Invalid centroid collection for coastal filtering')
  }

  try {
    // Department codes for coastal regions of Peru
    // Ancash("02"), Arequipa("04"), Callao("07"), Ica("11"), La Libertad(13), Lambayeque("14"),
    // Lima("15"), Moquegua("18"), Piura("20"), Tacna("23"), Tumbes("24")
    const coastalDepartmentCodes = ['02', '04', '07', '11', '13', '14', '15', '18', '20', '23', '24']

    // Filter centroids by department code (first 2 characters of ID)
    const coastalCentroids = centroidCollection.features.filter(feature => {
      if (!feature.id || typeof feature.id !== 'string') {
        console.warn(`Feature missing valid ID: ${JSON.stringify(feature)}`)
        return false
      }

      const departmentCode = feature.id.substring(0, 2)
      return coastalDepartmentCodes.includes(departmentCode)
    })

    return {
      type: 'FeatureCollection',
      features: coastalCentroids
    }
  } catch (error) {
    throw new Error(`Error filtering coastal centroids: ${error.message}`)
  }
}

/**
 * Process geographic data to prepare for seismic data enrichment
 *
 * @param {Object} geoData - Raw TopoJSON data for Peru
 * @returns {Object} - Processed geographic data including districts, departments, and coastal centroids
 * @throws {Error} - If processing fails
 */

/**
 * Validates geographic coordinates are within expected boundaries for Peru
 *
 * @param {Array} coordinates - [longitude, latitude] coordinates to validate
 * @returns {boolean} - True if coordinates are valid, false otherwise
 */
export function validatePeruCoordinates (coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false
  }

  const [longitude, latitude] = coordinates

  // Check if coordinates are numbers
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false
  }

  // Rough boundaries for Peru and surrounding seismic areas
  // Longitude: -84 to -68 (West)
  // Latitude: -20 to 0 (South)
  const validLongitude = longitude >= -84 && longitude <= -68
  const validLatitude = latitude >= -18.5 && latitude <= 0

  return validLongitude && validLatitude
}

/**
 * Checks if a point is located offshore based on district identification
 *
 * @param {string|null} districtId - District ID where the point is located
 * @param {Array} coordinates - [longitude, latitude] coordinates of the point
 * @returns {boolean} - True if the point is offshore
 */
export function isOffshorePoint (districtId, coordinates) {
  // If we have a valid district ID, the point is on land
  if (districtId) {
    return false
  }

  // Validate coordinates
  if (!validatePeruCoordinates(coordinates)) {
    throw new Error(`Invalid coordinates for offshore check: ${coordinates}`)
  }

  // No district ID but valid coordinates means it's offshore
  return true
}

export default {
  extractGeoFeatures,
  calculateDistrictCentroids,
  filterCoastalCentroids,
  validatePeruCoordinates,
  isOffshorePoint
}
