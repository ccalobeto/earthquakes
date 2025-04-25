import { select } from 'd3-selection'
import { scaleSqrt } from 'd3-scale'

/**
 * Makes an SVG element responsive by maintaining aspect ratio when resizing
 * @param {SVGElement} svg - The SVG element to make responsive
 * @returns {SVGElement} The responsive SVG element
 * @throws {Error} If the SVG element is invalid or missing parent node
 */
export function makeResponsive (svg) {
  try {
    if (!svg || !svg.node() || !svg.node().parentNode) {
      throw new Error('Invalid SVG element or missing parent node')
    }

    const container = select(svg.node().parentNode)
    const width = parseInt(svg.style('width'), 10)
    const height = parseInt(svg.style('height'), 10)

    if (isNaN(width) || isNaN(height)) {
      throw new Error('Invalid SVG dimensions')
    }

    const aspect = width / height

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize)

    const resizeListener = `resize.${container.attr('id') || 'responsive'}`
    select(window).on(resizeListener, resize)

    function resize () {
      const targetWidth = parseInt(container.style('width'), 10)
      if (!isNaN(targetWidth)) {
        svg.attr('width', targetWidth)
        svg.attr('height', Math.round(targetWidth / aspect))
      }
    }

    return svg
  } catch (error) {
    console.error('Error making SVG responsive:', error)
    throw error
  }
}

/**
 * Calculates a responsive radius based on magnitude
 * @param {number} magnitude - The earthquake magnitude
 * @param {Object} options - Configuration options
 * @param {number} [options.timesPerScale=30] - Scale factor per magnitude unit
 * @param {number} [options.maxMagnitude=10] - Maximum magnitude value
 * @param {number} [options.maxRadius] - Maximum radius in pixels
 * @returns {number} The calculated radius
 * @throws {Error} If invalid parameters are provided
 */
export function calculateResponsiveRadius (magnitude, {
  timesPerScale = 30,
  maxMagnitude = 10,
  maxRadius
} = {}) {
  try {
    if (typeof magnitude !== 'number' || isNaN(magnitude)) {
      throw new Error('Invalid magnitude value')
    }

    if (!maxRadius || typeof maxRadius !== 'number') {
      throw new Error('Invalid maxRadius value')
    }

    const maxPower = Math.pow(timesPerScale, maxMagnitude)
    const scaler = scaleSqrt()
      .domain([0, maxPower])
      .range([0, maxRadius])

    return scaler(Math.pow(timesPerScale, magnitude))
  } catch (error) {
    console.error('Error calculating responsive radius:', error)
    return 0
  }
}
