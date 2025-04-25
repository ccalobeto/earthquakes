import { group } from 'd3-array'
import { timeParse } from 'd3-time-format'
import { VISUALIZATION_CONFIG } from '../config/constants.js'
import { getRegionFromCategories } from './formatters.js'

const dateParser = timeParse('%a %b %d %Y %H:%M:%S')

/**
 * Transforms raw earthquake data into visualization-ready format
 * @param {Object[]} rawData Array of raw earthquake records
 * @returns {Object[]} Processed earthquake data
 */
export function transformEarthquakeData (rawData) {
  return rawData.map(row => ({
    eventId: +row.eventId,
    utcDate: row.utcDate,
    geometry: {
      type: 'Point',
      coordinates: [+row.lon, +row.lat]
    },
    depth: +row.depth,
    magnitude: +row.magnitude,
    year: +row.year,
    type: row.type,
    id: row.id,
    distanceFromCoast: +row.distanceFromCoast,
    department: row.department,
    description: row.description
  }))
}

/**
 * Transforms earthquake data for timeline visualization
 * @param {Object[]} earthquakeData Array of earthquake records
 * @param {number} minMagnitude Minimum magnitude to include
 * @returns {Object[]} Data formatted for timeline visualization
 */
export function transformTimelineData (earthquakeData, minMagnitude = 7) {
  const timelineData = earthquakeData
    .filter(d => d.magnitude >= minMagnitude)
    .map(d => ({
      eventId: d.eventId,
      year: d.year,
      magnitude: d.magnitude,
      department: d.department === 'Lima' || d.department === 'Callao'
        ? 'Lima y Callao'
        : d.department,
      date: dateParser(d.utcDate.slice(0, 24)),
      type: d.type,
      region: getRegionFromCategories(VISUALIZATION_CONFIG.regions, d.department)
    }))

  return Array.from(
    group(timelineData, d => d.region, d => d.department)
  ).map(d => ({
    region: d[0],
    departments: Array.from(d[1])
      .map(d2 => ({
        department: d2[0],
        earthquakes: d2[1],
        count: d2[1].length
      }))
      .sort((a, b) => b.count - a.count),
    earthquakes: Array.from(d[1])
      .map(e => e[1])
      .flat()
  }))
}

/**
 * Filter instrumental data based on magnitude threshold
 * @param {Object[]} earthquakeData Array of earthquake records
 * @param {number} minMagnitude Minimum magnitude threshold
 * @returns {Object[]} Filtered instrumental data
 */
export function filterInstrumentalData (earthquakeData, minMagnitude = VISUALIZATION_CONFIG.map.magnitudeThreshold) {
  return earthquakeData.filter(
    d => d.type === 'Instrumental' && d.magnitude >= minMagnitude
  )
}
