/**
 * Date transformation utilities for seismic data processing
 * Handles parsing and formatting of dates in various formats
 */

import { timeParse } from 'd3-time-format'

/**
 * Parse a date string in the format DD/MM/YYYY
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @returns {Date|null} Parsed Date object or null if parsing fails
 */
export function parseDate (dateString) {
  try {
    const parser = timeParse('%d/%m/%Y')
    const result = parser(dateString)

    if (!result) {
      throw new Error(`Failed to parse date: ${dateString}`)
    }

    return result
  } catch (error) {
    console.error(`Date parsing error: ${error.message}`)
    return null
  }
}

/**
 * Parse a datetime string in the format DD/MM/YYYY HH:MM:SS
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @param {string} timeString - Time string in HH:MM:SS format
 * @returns {Date|null} Parsed Date object or null if parsing fails
 */
export function parseDateTime (dateString, timeString) {
  try {
    const parser = timeParse('%d/%m/%Y %H:%M:%S')

    // Ensure the time string is properly formatted
    const formattedTimeString = formatTimeString(timeString)

    const result = parser(`${dateString} ${formattedTimeString}`)

    if (!result) {
      throw new Error(`Failed to parse datetime: ${dateString} ${formattedTimeString}`)
    }

    return result
  } catch (error) {
    console.error(`DateTime parsing error: ${error.message}`)
    return null
  }
}

/**
 * Format time string to ensure it has proper HH:MM:SS format
 * @param {string} timeString - Time string to format
 * @returns {string} Formatted time string
 */
export function formatTimeString (timeString) {
  try {
    // For instrumental data that needs first 8 chars
    if (timeString.length >= 8) {
      return timeString.slice(0, 8)
    }

    // For historical data that needs special handling
    if (timeString.length === 7) {
      return timeString + '1' // Add second as in the original code
    }

    // If time string is shorter, pad with zeros
    return timeString.padEnd(8, '0')
  } catch (error) {
    console.error(`Time string formatting error: ${error.message}`)
    return '00:00:00'
  }
}

/**
 * Extract the year from a Date object
 * @param {Date} date - Date object
 * @returns {number|null} Year as a number or null if input is invalid
 */
export function extractYear (date) {
  try {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date object')
    }

    return date.getUTCFullYear()
  } catch (error) {
    console.error(`Year extraction error: ${error.message}`)
    return null
  }
}

/**
 * Validates if a string represents a valid date in DD/MM/YYYY format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
export function isValidDateString (dateString) {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return false
    }

    // Check basic format using regex
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/
    if (!dateRegex.test(dateString)) {
      return false
    }

    // Check if it parses to a valid date
    const parsed = parseDate(dateString)
    return parsed !== null && !isNaN(parsed)
  } catch (error) {
    console.error(`Date validation error: ${error.message}`)
    return false
  }
}
