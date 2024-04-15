import { geoPath } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { format } from 'https://cdn.jsdelivr.net/npm/d3-format@3.1.0/+esm'

export function mapChart (data, {
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
  translationX,
  translationY
} = {}) {
  const formatted = format('.1f')
  const path = geoPath(projection)

  // add map
  const innerChart = svg
    .append('g')
    .attr('transform', `translate(${translationX}, ${translationY})`)
    .attr('class', 'map-container')

  innerChart
    .append('g')
    .attr('class', 'map-features')
    .selectAll('path')
    .data(feature.features)
    .join('path') // enter().append('path')
    .attr('d', path)
    .attr('fill', '#ddd')

  innerChart
    .append('g')
    .attr('class', 'map-borders')
    .selectAll('path')
    .data(border.features)
    .join('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.25)
    .attr('stroke-linejoin', 'round')
    .attr('pointer-events', 'none')

  // Add data
  const circles = innerChart
    .append('g')
    .attr('class', 'map-data')
    .selectAll(null)
    .data(data, d => d.eventId)
    .join('g')
    .attr('transform', d => {
      return 'translate(' + projection(d.geometry.coordinates) + ')'
    })

  // add circles
  circles
    .append('circle')
    .attr('stroke', 'black')
    .attr('fill-opacity', 0.8)
    .attr('stroke-width', d => d.magnitude >= thresholdBigMagnitude ? 2 : 0.3) //
    .attr('fill', d => colorScale(d[colorBy])) //
    .attr('r', d => radiusScale(d[radiusBy])) //

  // add text
  const textCircles = circles
    .append('text')
    .style('font-size', '15px')
    .attr('x', 0)
    .attr('y', 0)
    .attr('stroke-width', 0.25)
    .attr('text-anchor', 'middle')
    .attr('stroke', d => {
      return d.magnitude >= thresholdBigMagnitude
        ? 'black'
        : d.magnitude >= thresholdMidMagnitude ? '#f0f0f0' : null
    })

  textCircles
    .append('tspan')
    .attr('y', d => -(radiusScale(d[radiusBy]) + 20))
    .text(d => {
      const title = `${formatted(d[radiusBy])}M, ${d.year}`
      return d.magnitude >= thresholdMidMagnitude ? title : null
    })

  textCircles
    .append('tspan')
    .attr('x', d => {
      const title = `${d.description}, ${d.department}`
      return -(title.length - 10)
    })
    .attr('y', d => -(radiusScale(d[radiusBy]) + 5))
    .text(d => {
      const title = `${d.description}, ${d.department}`
      return d.magnitude >= thresholdMidMagnitude ? title : null
    })

  return innerChart.node()
}
