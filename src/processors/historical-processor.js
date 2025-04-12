// historical-processor.js - Processing functions for historical seismic data
import { parseDateAndTime, parseDate } from '../data/transformers/date-transformer.js'
// import { logger } from '../utils/logger.js'

/**
 * Processes raw historical seismic data into standardized format
 * @param {Array} rawData - Array of raw historical data objects from CSV
 * @returns {Array} Processed historical data array
 */
export function processHistoricalData (rawData) {
  // logger.debug(`Processing ${rawData.length} historical data records`)

  return rawData.map((row, index) => {
    try {
      // Parse timestamps - add '1' to ensure second value for consistent parsing
      const utcDate = parseDateAndTime(row['fecha UTC'], row['hora UTC'].slice(0, 7) + '1')
      const utcDate2 = parseDate(row['fecha UTC'])

      if (!utcDate || !utcDate2) {
        // logger.warn(`Invalid date in historical record ${index}: ${row['fecha UTC']}`)
        return null
      }

      // Parse coordinates
      const latitude = parseFloat(row['latitud (º)'])
      const longitude = parseFloat(row['longitud (º)'])

      // Parse depth - handle special case with '-' characters
      let depth = row['profundidad (km)']
      depth = depth.includes('-')
        ? parseFloat(depth.replace(/[-]/g, ''))
        : parseFloat(depth)

      // Parse magnitude values - handle special case with '-' characters
      const magnitudeMb = parseMagnitude(row['magnitud (mb)'])
      const magnitudeMs = parseMagnitude(row['magnitud (Ms)'])
      const magnitudeMw = parseMagnitude(row['magnitud (Mw)'])

      // Calculate maximum magnitude
      const magnitude = Math.max(
        isNaN(magnitudeMb) ? 0 : magnitudeMb,
        isNaN(magnitudeMs) ? 0 : magnitudeMs,
        isNaN(magnitudeMw) ? 0 : magnitudeMw
      )

      return {
        eventId: index,
        utcDate,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        depth: isNaN(depth) ? 0 : depth,
        magnitude,
        year: utcDate2.getUTCFullYear(),
        type: 'Historical'
      }
    } catch (error) {
      // logger.error(`Error processing historical record ${index}:`, error)
      // Return null for invalid records to be filtered out later
      return null
    }
  }).filter(record => record !== null && record.utcDate !== null)
    .sort((a, b) => a.utcDate - b.utcDate)
}

/**
 * Parse magnitude value, handling special case with '-' characters
 * @param {string} value - Magnitude value from CSV
 * @returns {number} Parsed magnitude value
 */
function parseMagnitude (value) {
  if (!value) return 0
  return value.includes('-')
    ? parseFloat(value.replace(/[-]/g, ''))
    : parseFloat(value)
}
