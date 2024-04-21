/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'
import { multiFormat } from './utils'
import { innerWidth, margin, rowHeight, rowPadding } from './constants'

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
    .call(d3.axisBottom(scaleX).ticks(innerWidth / 50).tickFormat(multiFormat))
    .call(g => g.select('.domain').remove())

  const chart = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'chart')

  const typeRows = chart.append('g')
  	.selectAll('g')
  	.data(d3.entries(types))
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
