// data-validator.js - Validation functions for seismic data
// import { logger } from '../../utils/logger.js'

/**
 * Required fields for instrumental data CSV
 */
const REQUIRED_INSTRUMENTAL_FIELDS = [
  'fecha UTC',
  'hora UTC',
  'latitud (º)',
  'longitud (º)',
  'profundidad (km)',
  'magnitud (M)'
]

/**
 * Required fields for historical data CSV
 */
const REQUIRED_HISTORICAL_FIELDS = [
  'fecha UTC',
  'hora UTC',
  'latitud (º)',
  'longitud (º)',
  'profundidad (km)',
  'magnitud (mb)',
  'magnitud (Ms)',
  'magnitud (Mw)'
]

/**
 * Validates instrumental data structure
 * @param {Array} data - The raw instrumental data array
 * @throws {Error} If data doesn't meet validation requirements
 */
export function validateInstrumentalData (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Instrumental data must be a non-empty array')
  }

  // Check for required fields in the first row
  const firstRow = data[0]
  const missingFields = REQUIRED_INSTRUMENTAL_FIELDS.filter(field => !(field in firstRow))

  if (missingFields.length > 0) {
    throw new Error(`Instrumental data missing required fields: ${missingFields.join(', ')}`)
  }

  // Check for valid coordinate data
  const invalidCoordinates = data.filter(row =>
    isNaN(parseFloat(row['latitud (º)'])) ||
    isNaN(parseFloat(row['longitud (º)']))
  )

  if (invalidCoordinates.length > 0) {
    // logger.warn(`Found ${invalidCoordinates.length} records with invalid coordinates`)
  }

  // logger.debug('Instrumental data validation passed')
}

/**
 * Validates historical data structure
 * @param {Array} data - The raw historical data array
 * @throws {Error} If data doesn't meet validation requirements
 */
export function validateHistoricalData (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Historical data must be a non-empty array')
  }

  // Check for required fields in the first row
  const firstRow = data[0]
  const missingFields = REQUIRED_HISTORICAL_FIELDS.filter(field => !(field in firstRow))

  if (missingFields.length > 0) {
    throw new Error(`Historical data missing required fields: ${missingFields.join(', ')}`)
  }

  // Check for valid date data
  const invalidDates = data.filter(row => {
    try {
      // Simple validation - just check if it's a parseable date string
      return !(new Date(row['fecha UTC'])).getTime() > 0
    } catch (e) {
      return true
    }
  })

  if (invalidDates.length > 0) {
    // logger.warn(`Found ${invalidDates.length} records with invalid dates`)
  }

  // logger.debug('Historical data validation passed')
}

/**
 * Validates geo-validated data structure
 * @param {Array} data - The geo-enriched data array
 * @throws {Error} If data doesn't meet validation requirements
 */
export function validateGeoEnrichedData (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Geo-enriched data must be a non-empty array')
  }

  // Check for required geo-enriched fields
  const requiredFields = ['id', 'department', 'distanceFromCoast']
  const sampleRow = data[0]

  const missingFields = requiredFields.filter(field => !(field in sampleRow))
  if (missingFields.length > 0) {
    throw new Error(`Geo-enriched data missing required fields: ${missingFields.join(', ')}`)
  }

  // logger.debug('Geo-enriched data validation passed')
}
