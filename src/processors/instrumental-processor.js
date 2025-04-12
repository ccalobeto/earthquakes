// instrumental-processor.js - Processing functions for instrumental seismic data
import { parseDateAndTime } from '../data/transformers/date-transformer.js'
// import { logger } from '../utils/logger.js'

/**
 * Processes raw instrumental seismic data into standardized format
 * @param {Array} rawData - Array of raw instrumental data objects from CSV
 * @returns {Array} Processed instrumental data array
 */
export function processInstrumentalData (rawData) {
  // logger.debug(`Processing ${rawData.length} instrumental data records`)

  return rawData.map((row, index) => {
    try {
      // Parse date and time
      const utcDate = parseDateAndTime(row['fecha UTC'], row['hora UTC'].slice(0, 8))

      // Parse coordinates
      const latitude = parseFloat(row['latitud (º)'])
      const longitude = parseFloat(row['longitud (º)'])

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        // logger.warn(`Invalid coordinates in instrumental record ${index}: [${longitude}, ${latitude}]`)
      }

      // Parse numeric values
      const depth = parseFloat(row['profundidad (km)'])
      const magnitude = parseFloat(row['magnitud (M)'])

      // Get year from date
      const year = utcDate.getUTCFullYear()

      return {
        eventId: index,
        utcDate,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        depth: isNaN(depth) ? 0 : depth,
        magnitude: isNaN(magnitude) ? 0 : magnitude,
        year,
        type: 'Instrumental'
      }
    } catch (error) {
      // logger.error(`Error processing instrumental record ${index}:`, error)
      // Return null for invalid records to be filtered out later
      return null
    }
  }).filter(record => record !== null)
    .sort((a, b) => a.utcDate - b.utcDate)
}
