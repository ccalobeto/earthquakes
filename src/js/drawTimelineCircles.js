import { axisBottom } from 'https://cdn.jsdelivr.net/npm/d3-axis@3/+esm'
import { entries } from 'https://cdn.jsdelivr.net/npm/d3-collection@1.0.7/+esm'
import { multiFormat } from './utils.js'
import { innerWidth, margin, rowHeight, rowPadding } from './constants.js'

export function circleTimelineChart (data, {
  svg,
  vars,
  scaleX,
  scaleY,
  colorScale,
  types,
  numTypes,
  textOffset = 3
} = {}) {
  const xAxis = g => g.attr('transform', `translate(0, ${numTypes * (rowHeight + rowPadding) + rowHeight})`)
    .call(axisBottom(scaleX).ticks(innerWidth / 50).tickFormat(multiFormat))
    .call(g => g.select('.domain').remove())

  const chart = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'chart')

  const typeRows = chart.append('g')
    .selectAll('g')
    .data(entries(types))
    .join('g')

  typeRows.append('text')
    .text(d => `${d.key} (${d.value.count})`)
    .attr('x', -margin.left)
    .attr('y', d => scaleY(d.key) + textOffset)

  chart.append('g')
    .selectAll('circle')
    .attr('class', 'data')
    .data(data)
    .join('circle')
    .attr('cx', d => scaleX(d[vars.cx]))
    .attr('cy', d => scaleY(d[vars.cy]))
    .attr('r', d => types[d[vars.cy]].scale(d[vars.r]))
    .attr('fill', d => d.type === 'Historical' ? 'orange' : 'gray')
    .attr('stroke', 'red')
    .attr('stroke-width', d => types[d[vars.cy]].scale(d[vars.r]) / 5)
    .attr('opacity', 0.5)

  chart
    .append('g')
    .attr('class', 'xAxis')
    .call(xAxis)

  return svg.node()
}
