/**
 * Magnitude transformation utilities for seismic data processing
 * Handles parsing, validation, and calculation of seismic magnitude values
 */

/**
 * Cleans and parses a magnitude string that might contain special characters
 * @param {string} magnitudeString - Raw magnitude string to process
 * @returns {number} Parsed magnitude value
 */
export function parseMagnitude (magnitudeString) {
  try {
    if (magnitudeString === null || magnitudeString === undefined) {
      return 0
    }

    // Convert to string if not already
    const strValue = String(magnitudeString)

    // Check if it contains hyphens and clean them
    const cleanedValue = strValue.includes('-')
      ? strValue.replace(/[-]/g, '')
      : strValue

    // Parse to float and handle NaN
    const value = parseFloat(cleanedValue)
    return isNaN(value) ? 0 : value
  } catch (error) {
    console.error(`Magnitude parsing error: ${error.message}`)
    return 0
  }
}

/**
 * Calculates the maximum magnitude from multiple magnitude scale readings
 * Often seismic events have multiple magnitude measurements (mb, MS, MW)
 * @param {Object} magnitudes - Object with different magnitude scales
 * @param {number|string} magnitudes.mb - Body wave magnitude
 * @param {number|string} magnitudes.ms - Surface wave magnitude
 * @param {number|string} magnitudes.mw - Moment magnitude
 * @returns {number} The maximum magnitude value
 */
export function calculateMaxMagnitude (magnitudes) {
  try {
    // Parse each magnitude value
    const mb = parseMagnitude(magnitudes.mb)
    const ms = parseMagnitude(magnitudes.ms)
    const mw = parseMagnitude(magnitudes.mw)

    // Find the maximum value
    return Math.max(mb, ms, mw)
  } catch (error) {
    console.error(`Maximum magnitude calculation error: ${error.message}`)
    return 0
  }
}

/**
 * Parses a single instrumental magnitude value
 * @param {string|number} magnitude - Magnitude value to parse
 * @returns {number} Parsed magnitude value
 */
export function parseInstrumentalMagnitude (magnitude) {
  try {
    return parseMagnitude(magnitude)
  } catch (error) {
    console.error(`Instrumental magnitude parsing error: ${error.message}`)
    return 0
  }
}

/**
 * Parses and calculates depth value from raw depth string
 * @param {string|number} depthValue - Raw depth value that might contain special characters
 * @returns {number} Parsed depth value in kilometers
 */
export function parseDepth (depthValue) {
  try {
    if (depthValue === null || depthValue === undefined) {
      return 0
    }

    // Convert to string if not already
    const strValue = String(depthValue)

    // Check if it contains hyphens and clean them
    const cleanedValue = strValue.includes('-')
      ? strValue.replace(/[-]/g, '')
      : strValue

    // Parse to float and handle NaN
    const value = parseFloat(cleanedValue)
    return isNaN(value) ? 0 : value
  } catch (error) {
    console.error(`Depth parsing error: ${error.message}`)
    return 0
  }
}

/**
 * Validates if a magnitude value is within a plausible range for earthquakes
 * @param {number} magnitude - Magnitude value to validate
 * @returns {boolean} True if magnitude is valid, false otherwise
 */
export function isValidMagnitude (magnitude) {
  try {
    const numValue = Number(magnitude)

    // Most earthquake magnitudes are between 0 and 10
    // Theoretical upper limit for moment magnitude is around 10
    return !isNaN(numValue) && numValue >= 0 && numValue <= 10
  } catch (error) {
    console.error(`Magnitude validation error: ${error.message}`)
    return false
  }
}

/**
 * Validates if a depth value is within a plausible range for earthquakes
 * @param {number} depth - Depth value to validate in km
 * @returns {boolean} True if depth is valid, false otherwise
 */
export function isValidDepth (depth) {
  try {
    const numValue = Number(depth)

    // Most earthquakes occur at depths between 0 and 700 km
    return !isNaN(numValue) && numValue >= 0 && numValue <= 700
  } catch (error) {
    console.error(`Depth validation error: ${error.message}`)
    return false
  }
}
