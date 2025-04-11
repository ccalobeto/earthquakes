/**
 * merger.js
 *
 * Responsible for merging different datasets (instrumental and historical)
 * into a unified dataset with consistent structure.
 */

import { format } from 'd3-format'
import { getCountyId, closestLocation, capitalizeWords, getPropertyName } from '../utils/geo-utils.js'

/**
 * Configuration for number formatting
 */
const formatNumber = format('.1f')

/**
 * Merges instrumental and historical seismic datasets and adds geographic context
 *
 * @param {Array} instrumentalData - The processed instrumental seismic data
 * @param {Array} historicalData - The processed historical seismic data
 * @param {Object} districts - Feature collection of districts
 * @param {Object} departments - Feature collection of departments
 * @param {Object} coastCentroids - Feature collection of coastal centroids
 * @returns {Array} - Combined and enriched dataset
 * @throws {Error} - If input data is invalid
 */
export function mergeDatasets (instrumentalData, historicalData, districts, departments, coastCentroids) {
  if (!Array.isArray(instrumentalData) || !Array.isArray(historicalData)) {
    throw new Error('Invalid input data: Both instrumental and historical data must be arrays')
  }

  if (!districts || !districts.features || !Array.isArray(districts.features)) {
    throw new Error('Invalid districts data: Missing or malformed features array')
  }

  if (!departments || !departments.features || !Array.isArray(departments.features)) {
    throw new Error('Invalid departments data: Missing or malformed features array')
  }

  if (!coastCentroids || !coastCentroids.features || !Array.isArray(coastCentroids.features)) {
    throw new Error('Invalid coast centroids data: Missing or malformed features array')
  }

  try {
    // Combine the datasets
    const combinedData = [...historicalData, ...instrumentalData]

    // Add geographic context
    return enrichWithGeographicContext(combinedData, districts, departments, coastCentroids)
  } catch (error) {
    throw new Error(`Error merging datasets: ${error.message}`)
  }
}

/**
 * Enriches seismic data with geographic context and additional information
 *
 * @param {Array} rawData - Combined raw seismic data
 * @param {Object} districts - Feature collection of districts
 * @param {Object} departments - Feature collection of departments
 * @param {Object} coastCentroids - Feature collection of coastal centroids
 * @returns {Array} - Enriched dataset with geographic context
 */
function enrichWithGeographicContext (rawData, districts, departments, coastCentroids) {
  try {
    // First pass: Add district IDs and distance from coast
    const dataWithGeoContext = rawData.map(record => {
      if (!record.geometry || !Array.isArray(record.geometry.coordinates)) {
        throw new Error(`Invalid geometry for record: ${JSON.stringify(record)}`)
      }

      const coordinates = record.geometry.coordinates
      const countyId = getCountyId(districts.features, coordinates)

      // If we have a valid county ID, use it; otherwise find the closest coastal location
      const id = countyId || (coastCentroids ? closestLocation(coordinates, coastCentroids).id : null)

      // Calculate distance from coast if point is not within a county
      const distanceFromCoast = countyId
        ? 0
        : (coastCentroids ? +formatNumber(closestLocation(coordinates, coastCentroids).distance) : null)

      return {
        ...record,
        id,
        distanceFromCoast
      }
    })

    // Second pass: Add department and district descriptions
    return dataWithGeoContext.map(record => {
      // Get department name from the first two digits of the ID
      const departmentCode = record.id ? record.id.slice(0, 2) : null
      const department = departmentCode
        ? capitalizeWords(getPropertyName(departmentCode, departments.features))
        : null

      // Get district description from the full ID
      const description = record.id && !isNaN(record.id)
        ? capitalizeWords(getPropertyName(record.id, districts.features))
        : null

      return {
        ...record,
        department,
        description
      }
    })
  } catch (error) {
    throw new Error(`Error enriching data with geographic context: ${error.message}`)
  }
}

/**
 * Normalize the format of all records in the merged dataset
 * by extracting coordinates from geometry object and standardizing properties
 *
 * @param {Array} mergedData - The merged and enriched dataset
 * @returns {Array} - Normalized dataset ready for export
 */
export function normalizeDataFormat (mergedData) {
  if (!Array.isArray(mergedData)) {
    throw new Error('Invalid merged data: Expected an array')
  }

  try {
    return mergedData.map(record => {
      if (!record.geometry || !Array.isArray(record.geometry.coordinates)) {
        throw new Error(`Invalid geometry in record: ${JSON.stringify(record)}`)
      }

      return {
        ...record,
        lon: record.geometry.coordinates[0],
        lat: record.geometry.coordinates[1]
      }
    })
  } catch (error) {
    throw new Error(`Error normalizing data format: ${error.message}`)
  }
}

export default {
  mergeDatasets,
  normalizeDataFormat
}
