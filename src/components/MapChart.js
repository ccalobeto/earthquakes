import { geoPath } from 'd3-geo'
import { annotation } from 'd3-svg-annotation'
import { VISUALIZATION_CONFIG, mapAnnotations } from '../config/constants.js'
import { formatMagnitude } from '../utils/formatters.js'

/**
 * Creates an accessible map chart visualization for earthquake data
 */
export function createMapChart (data, {
  svg,
  projection,
  feature,
  border,
  colorScale,
  colorBy,
  radiusScale,
  radiusBy,
  thresholdBigMagnitude = 8,
  thresholdMidMagnitude = 7.8,
  translationX = 0,
  translationY = 0
} = {}) {
  // Set viewBox for responsive scaling
  const width = VISUALIZATION_CONFIG.map.width
  const height = width * (3 / 2)
  const margins = VISUALIZATION_CONFIG.map.margin

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('class', 'map')
    .style('pointer-events', 'all')

  projection.fitSize([width - margins.left - margins.right, height - margins.top - margins.bottom], feature)

  const path = geoPath(projection)

  const mapContainer = svg
    .append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`)
    .attr('class', 'map-container')
    .attr('width', width - margins.left - margins.right)
    .attr('height', height - margins.top - margins.bottom)
    .style('pointer-events', 'all')

  // Render map features
  mapContainer
    .append('g')
    .attr('class', 'map-features')
    .attr('role', 'graphics-symbol')
    .attr('aria-label', 'Peru regions boundaries')
    .selectAll('path')
    .data(feature.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#ddd')
    .attr('pointer-events', 'none')

  // Render borders
  mapContainer
    .append('g')
    .attr('class', 'map-borders')
    .selectAll('path')
    .data(border.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#90ABA0')
    .attr('opacity', 0.3)
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.25)
    .attr('stroke-linejoin', 'round')
    .attr('pointer-events', 'none')

  // Render earthquake data points
  const circles = mapContainer
    .append('g')
    .attr('class', 'map-chart')
    .attr('role', 'graphics-symbol')
    .attr('aria-label', 'Earthquake locations')
    .selectAll('g')
    .data(data, d => d.eventId)
    .join('g')
    .attr('transform', d => `translate(${projection(d.geometry.coordinates)})`)
    .attr('role', 'graphics-symbol')
    .style('pointer-events', 'all')
    .attr('aria-label', d => `Earthquake of magnitude ${d.magnitude} at ${d.department}`)

  // Add circles for earthquakes
  circles
    .append('circle')
    .attr('stroke', '#E41A1C')
    .attr('fill-opacity', 0.8)
    .attr('stroke-width', d => d.magnitude >= thresholdBigMagnitude ? 2 : 0.3)
    .attr('fill', d => colorScale(d[colorBy]))
    .attr('r', d => radiusScale(d[radiusBy]))
    .style('pointer-events', 'none')

  // Add labels
  const textCircles = circles
    .append('text')
    .attr('role', 'graphics-symbol')
    .style('font-size', VISUALIZATION_CONFIG.timeline.fontSizes.title)
    .attr('x', 0)
    .attr('y', 0)
    .attr('stroke-width', 0.25)
    .attr('text-anchor', 'middle')
    .attr('pointer-events', 'none')
    .attr('stroke', d => d.magnitude >= thresholdBigMagnitude ? 'black' : d.magnitude >= thresholdMidMagnitude ? '#f0f0f0' : null)
    .attr('aria-hidden', d => d.magnitude < thresholdMidMagnitude ? 'true' : 'false')

  // Add magnitude and year
  textCircles
    .append('tspan')
    .attr('y', d => -(radiusScale(d[radiusBy]) + 20))
    .attr('pointer-events', 'none')
    .text(d => {
      const title = `${formatMagnitude(d[radiusBy])}M, ${d.year}`
      return d.magnitude >= thresholdMidMagnitude ? title : null
    })

  // Add location description
  textCircles
    .append('tspan')
    .attr('x', d => {
      const title = `${d.description}, ${d.department}`
      return -(title.length - 10)
    })
    .attr('y', d => -(radiusScale(d[radiusBy]) + 5))
    .attr('pointer-events', 'none')
    .text(d => {
      const title = `${d.description}, ${d.department}`
      return d.magnitude >= thresholdMidMagnitude ? title : null
    })

  const makeAnnotations = annotation()
    .annotations(mapAnnotations)

  mapContainer
    .append('g')
    .attr('class', 'map-annotations')
    .attr('pointer-events', 'none')
    .call(makeAnnotations)

  return mapContainer.node()
}
