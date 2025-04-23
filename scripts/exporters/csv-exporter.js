/**
 * csv-exporter.js
 *
 * Handles the export of processed seismic data to CSV format.
 * Implements streaming for efficient handling of large datasets.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

/**
 * Converts an array of objects to CSV format
 *
 * @param {Array} data - The dataset to convert to CSV
 * @returns {string} - CSV formatted content
 * @throws {Error} - If data conversion fails
 */
export function convertToCSV (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data provided for CSV conversion: Expected non-empty array')
  }

  try {
    // Extract column headers from the first object
    const headers = Object.keys(data[0])

    // Create CSV content with headers as first row
    const csvRows = [headers.join(',')]

    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header]

        // Handle special cases (objects, arrays, dates)
        if (value === null || value === undefined) {
          return ''
        } else if (value instanceof Date) {
          return value.toISOString()
        } else if (typeof value === 'object') {
          // Convert objects/arrays to JSON strings
          return JSON.stringify(value).replace(/,/g, ';').replace(/"/g, '""')
        }

        // Convert regular values to strings and escape commas and quotes
        const valueStr = String(value)
        if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
          return `"${valueStr.replace(/"/g, '""')}"`
        }
        return valueStr
      })

      csvRows.push(values.join(','))
    })

    return csvRows.join('\n')
  } catch (error) {
    throw new Error(`Error converting data to CSV: ${error.message}`)
  }
}

/**
 * Exports data to a CSV file using standard file writing
 * Suitable for smaller datasets
 *
 * @param {Array} data - The dataset to export
 * @param {string} outputPath - Path where the CSV file should be saved
 * @returns {Promise<string>} - Path to the saved file
 * @throws {Error} - If export fails
 */
export async function exportToCSV (data, outputPath) {
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid data provided for export: Expected array')
  }

  if (!outputPath) {
    throw new Error('No output path specified for CSV export')
  }

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Convert data to CSV format
    const csvContent = convertToCSV(data)

    // Write CSV content to file
    await fs.writeFile(outputPath, csvContent, 'utf8')

    return outputPath
  } catch (error) {
    throw new Error(`Failed to export CSV file: ${error.message}`)
  }
}

/**
 * Exports large datasets to CSV files using streaming
 * More memory efficient for very large datasets
 *
 * @param {Array} data - The dataset to export
 * @param {string} outputPath - Path where the CSV file should be saved
 * @param {Object} options - Optional configuration for the export
 * @param {number} options.chunkSize - Number of records per chunk (default: 1000)
 * @returns {Promise<string>} - Path to the saved file
 * @throws {Error} - If export fails
 */
export async function streamExportToCSV (data, outputPath, options = { chunkSize: 1000 }) {
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid data provided for stream export: Expected array')
  }

  if (!outputPath) {
    throw new Error('No output path specified for CSV stream export')
  }

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Extract headers
    const headers = Object.keys(data[0])

    // Create readable stream from data
    const dataStream = Readable.from(function * generateCSV () {
      // Yield headers first
      yield headers.join(',') + '\n'

      // Process data in chunks
      for (let i = 0; i < data.length; i += options.chunkSize) {
        const chunk = data.slice(i, i + options.chunkSize)

        // Convert chunk to CSV rows
        const rows = chunk.map(item => {
          return headers.map(header => {
            const value = item[header]

            // Handle special cases
            if (value === null || value === undefined) {
              return ''
            } else if (value instanceof Date) {
              return value.toISOString()
            } else if (typeof value === 'object') {
              return JSON.stringify(value).replace(/,/g, ';').replace(/"/g, '""')
            }

            // Regular values
            const valueStr = String(value)
            if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
              return `"${valueStr.replace(/"/g, '""')}"`
            }
            return valueStr
          }).join(',')
        }).join('\n')

        yield rows + '\n'
      }
    }())

    // Create write stream
    const writeStream = createWriteStream(outputPath)

    // Pipe data to file
    await pipeline(dataStream, writeStream)

    return outputPath
  } catch (error) {
    throw new Error(`Failed to stream export CSV file: ${error.message}`)
  }
}

/**
 * Determines the appropriate export method based on data size
 * Uses streaming for large datasets, standard export for smaller ones
 *
 * @param {Array} data - The dataset to export
 * @param {string} outputPath - Path where the CSV file should be saved
 * @param {Object} options - Optional export configuration
 * @param {number} options.streamThreshold - Size threshold in records for using streaming (default: 10000)
 * @param {number} options.chunkSize - Chunk size for streaming export (default: 1000)
 * @returns {Promise<string>} - Path to the saved file
 */
export async function smartExportToCSV (data, outputPath, options = { streamThreshold: 10000, chunkSize: 1000 }) {
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid data provided for export')
  }

  try {
    // Choose export method based on data size
    if (data.length > options.streamThreshold) {
      console.log(`Large dataset detected (${data.length} records). Using streaming export.`)
      return streamExportToCSV(data, outputPath, { chunkSize: options.chunkSize })
    } else {
      return exportToCSV(data, outputPath)
    }
  } catch (error) {
    throw new Error(`Failed to export data: ${error.message}`)
  }
}

export default {
  convertToCSV,
  exportToCSV,
  streamExportToCSV,
  smartExportToCSV
}
