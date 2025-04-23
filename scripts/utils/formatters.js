/**
 * Formatting utilities for seismic data processing
 * Handles string and number formatting
 */

import { format } from 'd3-format'

/**
 * Formats a number to a specified precision
 * @param {number} value - Number to format
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export function formatNumber (value, precision = 1) {
  try {
    const formatStr = `.${precision}f`
    const formatter = format(formatStr)
    return formatter(value)
  } catch (error) {
    console.error(`Number formatting error: ${error.message}`)
    return String(value)
  }
}

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - String to capitalize
 * @returns {string} String with each word capitalized
 */
export function capitalizeWords (str) {
  try {
    if (!str || typeof str !== 'string') {
      return ''
    }

    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  } catch (error) {
    console.error(`Word capitalization error: ${error.message}`)
    return str || ''
  }
}

/**
 * Formats a coordinate value for display
 * @param {number} coord - Coordinate value
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} Formatted coordinate string
 */
export function formatCoordinate (coord, precision = 4) {
  try {
    const formatStr = `.${precision}f`
    const formatter = format(formatStr)
    return formatter(coord)
  } catch (error) {
    console.error(`Coordinate formatting error: ${error.message}`)
    return String(coord)
  }
}

/**
 * Formats a date object to a string in DD/MM/YYYY format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate (date) {
  try {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date object')
    }

    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error(`Date formatting error: ${error.message}`)
    return ''
  }
}

/**
 * Formats a date object to a string in DD/MM/YYYY HH:MM:SS format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime (date) {
  try {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date object')
    }

    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error(`DateTime formatting error: ${error.message}`)
    return ''
  }
}

/**
 * Safely converts numeric strings to numbers
 * @param {string} value - String value to convert
 * @returns {number} Converted number or 0 if conversion fails
 */
export function safeNumberConversion (value) {
  try {
    if (value === null || value === undefined || value === '') {
      return 0
    }

    const number = Number(value)
    return isNaN(number) ? 0 : number
  } catch (error) {
    console.error(`Number conversion error: ${error.message}`)
    return 0
  }
}

/**
 * Formats an event ID to ensure consistency
 * @param {number|string} id - Event ID to format
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Formatted event ID
 */
export function formatEventId (id, prefix = 'EVT') {
  try {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      throw new Error('Invalid event ID')
    }

    return `${prefix}${String(numericId).padStart(6, '0')}`
  } catch (error) {
    console.error(`Event ID formatting error: ${error.message}`)
    return String(id)
  }
}
