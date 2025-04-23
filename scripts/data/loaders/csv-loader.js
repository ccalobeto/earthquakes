// csv-loader.js - Functions for loading CSV data
import fs from 'node:fs'
import { csvParse } from 'd3-dsv'
// import { logger } from '../../utils/logger.js'

import { validateInstrumentalData, validateHistoricalData } from '../validators/data-validator.js'

/**
 * Loads instrumental seismic data from CSV file
 * @param {string} filePath - Path to the instrumental data CSV
 * @returns {Array} Array of raw instrumental data objects
 * @throws {Error} If data cannot be loaded or validated
 */
export async function loadInstrumentalData (filePath) {
  try {
    // logger.debug(`Loading instrumental data from: ${filePath}`)
    const csv = fs.readFileSync(filePath, 'utf8')
    const data = csvParse(csv)
    // Validate the data structure
    validateInstrumentalData(data)
    // logger.debug(`Loaded ${data.length} instrumental data records`)

    return data
  } catch (error) {
    // logger.error('Error loading instrumental data:', error)
    throw new Error(`Failed to load instrumental data: ${error.message}`)
  }
}

/**
 * Loads historical seismic data from CSV file
 * @param {string} filePath - Path to the historical data CSV
 * @returns {Array} Array of raw historical data objects
 * @throws {Error} If data cannot be loaded or validated
 */
export async function loadHistoricalData (filePath) {
  try {
    // logger.debug(`Loading historical data from: ${filePath}`)
    const csv = fs.readFileSync(filePath, 'utf8')
    const data = csvParse(csv)

    // Validate the data structure
    validateHistoricalData(data)
    // logger.debug(`Loaded ${data.length} historical data records`)

    return data
  } catch (error) {
    // logger.error('Error loading historical data:', error)
    throw new Error(`Failed to load historical data: ${error.message}`)
  }
}
