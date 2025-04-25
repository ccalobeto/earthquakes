import { scaleThreshold, scaleSqrt } from 'd3-scale'
import { VISUALIZATION_CONFIG } from '../config/constants.js'

/**
 * Creates a depth color scale based on configuration thresholds
 * @returns {Function} D3 threshold scale for depth colors
 */
export function createDepthColorScale () {
  return scaleThreshold()
    .domain(VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.depth))
    .range(VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.color))
}

/**
 * Creates a magnitude scale for circle sizes
 * @param {Object} options Scale configuration options
 * @param {number} [options.timesPerScale=30] Scale factor per magnitude unit
 * @param {number} [options.maxMagnitude=10] Maximum magnitude value
 * @param {number} [options.maxRadius] Maximum radius in pixels
 * @returns {Function} Scale function that converts magnitude to radius
 */
export function createMagnitudeScale ({
  timesPerScale = 30,
  maxMagnitude = 10,
  maxRadius = VISUALIZATION_CONFIG.map.maxRadius
} = {}) {
  const maxPower = Math.pow(timesPerScale, maxMagnitude)
  return scaleSqrt()
    .domain([0, maxPower])
    .range([0, maxRadius])
}

/**
 * Calculates circle radius based on earthquake magnitude
 * @param {number} magnitude Earthquake magnitude
 * @param {Object} options Scale configuration options
 * @returns {number} Circle radius in pixels
 */
export function calculateMagnitudeRadius (magnitude, options = {}) {
  const scale = createMagnitudeScale(options)
  const { timesPerScale = 30 } = options
  return scale(Math.pow(timesPerScale, magnitude))
}
