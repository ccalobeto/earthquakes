import { axisTop } from 'd3-axis'
import { scaleTime, scaleSqrt } from 'd3-scale'
import { create } from 'd3-selection'
import { timeYear } from 'd3-time'
import { format } from 'd3-format'
import { min, max } from 'd3-array'
import { timeFormat } from 'd3-time-format'

import { margin } from './constants.js'

export function circleTimelineChart (data, {
  vars,
  width,
  rowSize = 40,
  fistRowOffset = 0,
  leftPositionGridLine = 100
} = {}) {
  const formatNum = format('.2f')
  const formatYear = timeFormat('%Y')
  let height = 0

  for (let i = 0; i < data.length; i++) {
    height += data[i].departments.length * rowSize
  }

  height = height + margin.top + margin.bottom

  const viz = create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svg')

  const chart = viz
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'chart')

  const events = data.map(d => d.earthquakes).flat()
  const xAxisExtent = [
    timeYear.floor(min(events, d => d[vars.cx])),
    timeYear.ceil(max(events, d => d[vars.cx]))
  ]

  const xScale = scaleTime()
    .domain(xAxisExtent)
    .range([310, width - margin.right - margin.left])

  const rScale = scaleSqrt()
    .domain([7, 10])
    .range([0.1, rowSize / 2 - 2])

  const table = chart
    .append('g')
    .attr('class', 'earthquakes')
    .attr('transform', 'translate(0, 0)')

  const yAxis = table.append('g')
    .attr('class', 'axisY')
    .style('font-size', '12')
    .style('font-weight', 'bold')
    .style('font-family', 'sans-serif')
    .style('fill', '#444')

  yAxis
    .append('text')
    .text('REGION')
    .attr('transform', `translate(0, ${fistRowOffset})`)

  yAxis
    .append('text')
    .text('DEPARTMENT')
    .attr('transform', `translate(100, ${fistRowOffset})`)

  yAxis
    .append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', rowSize * 0.25)
    .attr('y2', rowSize * 0.25)
    .style('stroke', '#444')

  const tbody = table.append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(0, ${rowSize})`)

  let yOffset = 0
  for (let i = 0; i < data.length; i++) {
    const region = data[i].region
    const departments = data[i].departments

    for (let j = 0; j < departments.length; j++) {
      const row = tbody
        .append('g')
        .attr('transform', `translate(0, ${j * rowSize + yOffset})`)

      row
        .append('line')
        .attr('x1', leftPositionGridLine)
        .attr('x2', width)
        .attr('y1', rowSize * 0.25)
        .attr('y2', rowSize * 0.25)
        .style('stroke', '#eee')

      const regionCell = row
        .append('text')
        .style('font-size', '12')
        .style('font-family', 'sans-serif')
        .style('fill', '#444')
        .attr('transform', 'translate(0, 0)')

      if (j === 0) {
        regionCell
          .text(region)
          .style('font-weight', 'bold')
      }

      row.append('text')
        .attr('transform', `translate(${leftPositionGridLine}, 0)`)
        .text(departments[j].department + ' (' + departments[j].earthquakes.length + ')')
        .style('font-size', '14')
        .style('color', '#444')
        .style('font-family', 'sans-serif')

      row.append('g')
        .attr('class', 'circle')
        .selectAll('.circle')
        .data(departments[j].earthquakes)
        .join('circle')
        .attr('cx', d => formatNum(xScale(d[vars.cx])))
        .attr('cy', d => `${-rowSize / 2 + 8}`)
        .attr('r', d => formatNum(rScale(d[vars.r])))
        .attr('fill', d => d.type === 'Historical' ? 'gray' : 'green')
        .attr('stroke', d => d.type === 'Historical' ? 'black' : 'yellow')
        .attr('opacity', 0.5)
    }

    yOffset += departments.length * rowSize
  }

  const xAxisGenerator = axisTop(xScale)
    .ticks(timeYear.every(20)) // Set ticks to show every 20 years
    .tickFormat(formatYear) // Use year format

  const xAxis = table.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0, 8)')

  xAxis.call(xAxisGenerator)
    .select('.domain')
    .remove()

  xAxis.selectAll('text')
    .style('font-size', '11px')
    .style('font-family', 'sans-serif')

  return viz.node()
}
