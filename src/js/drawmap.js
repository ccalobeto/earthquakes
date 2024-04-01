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
  thresholdMidMagnitude = 7.8
} = {}) {
  const formatted = format('.1f')
  const path = geoPath(projection)

  // add map
  const innerChart = svg
    .append('g')
    .attr('transform', 'translate(0, 0)')
    .attr('class', 'map')

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
  const circleG = innerChart
    .append('g')
    .attr('class', 'map-data')
    .selectAll(null)
    .data(data, d => d.eventId)
    .join('g')
    .attr('transform', d => {
      return 'translate(' + projection(d.geometry.coordinates) + ')'
    })

  // add circles
  circleG
    .append('circle')
    .attr('stroke', 'black')
    .attr('fill-opacity', 0.8)
    .attr('stroke-width', d => d.magnitude >= thresholdBigMagnitude ? 2 : 0.3) //
    .attr('fill', d => colorScale(d[colorBy])) //
    .attr('r', d => radiusScale(d[radiusBy])) //

  // add legend
  circleG
    .append('text')
    .attr('text-anchor', 'end')
    .style('font-size', '15px')
    .attr('x', -40)
    .attr('y', -30)
    .attr('stroke-width', 0.25)
    .attr('stroke', d => {
      return d.magnitude >= thresholdBigMagnitude
        ? 'black'
        : d.magnitude >= thresholdMidMagnitude ? '#f0f0f0' : null
    })
    .text(d => {
      const title = `M${formatted(d[radiusBy])}, ${d.year}\n ${d.description} `
      return d.magnitude >= thresholdMidMagnitude ? title : null
    })

  // add lines guides
  circleG.append('line')
    .attr('stroke', d => {
      return d.magnitude >= thresholdBigMagnitude
        ? 'black'
        : d.magnitude >= thresholdMidMagnitude ? 'gray' : null
    })
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', -40)
    .attr('y2', -30)

  return innerChart.node()
}
