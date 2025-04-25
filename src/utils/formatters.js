import { timeFormat } from 'd3-time-format'
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from 'd3-time'

/**
 * Formats a date using the appropriate time scale
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 * @throws {Error} If the input date is invalid
 */
export function formatMultiTimeScale (date) {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date object')
    }

    const formatMillisecond = timeFormat('.%L')
    const formatSecond = timeFormat(':%S')
    const formatMinute = timeFormat('%I:%M')
    const formatHour = timeFormat('%I %p')
    const formatDay = timeFormat('%a %d')
    const formatWeek = timeFormat('%b %d')
    const formatMonth = timeFormat('%B')
    const formatYear = timeFormat('%Y')

    return (
      timeSecond(date) < date
        ? formatMillisecond
        : timeMinute(date) < date
          ? formatSecond
          : timeHour(date) < date
            ? formatMinute
            : timeDay(date) < date
              ? formatHour
              : timeWeek(date) < date
                ? formatDay
                : timeMonth(date) < date
                  ? formatWeek
                  : timeYear(date) < date
                    ? formatMonth
                    : formatYear
    )(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return date.toString()
  }
}

/**
 * Gets the region for a given department from a regions configuration object
 * @param {Object} regions - Object mapping regions to arrays of departments
 * @param {string} department - The department to find the region for
 * @returns {string|null} The region name or null if not found
 */
export function getRegionFromCategories (regions, department) {
  try {
    if (!regions || typeof regions !== 'object') {
      throw new Error('Invalid regions configuration')
    }

    if (!department || typeof department !== 'string') {
      throw new Error('Invalid department name')
    }

    for (const [region, departments] of Object.entries(regions)) {
      if (Array.isArray(departments) && departments.includes(department)) {
        return region
      }
    }

    console.warn(`No region found for department: ${department}`)
    return null
  } catch (error) {
    console.error('Error finding region:', error)
    return null
  }
}

/**
 * Formats a magnitude value to a fixed number of decimal places
 * @param {number} value - The magnitude value to format
 * @param {number} [precision=1] - Number of decimal places
 * @returns {string} The formatted magnitude string
 */
export function formatMagnitude (value, precision = 1) {
  try {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Invalid magnitude value')
    }

    if (typeof precision !== 'number' || precision < 0) {
      throw new Error('Invalid precision value')
    }

    return value.toFixed(precision)
  } catch (error) {
    console.error('Error formatting magnitude:', error)
    return String(value)
  }
}
