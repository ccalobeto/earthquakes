import { axisTop } from 'd3-axis'
import { scaleTime, scaleSqrt } from 'd3-scale'
import { create } from 'd3-selection'
import { timeYear } from 'd3-time'
import { format } from 'd3-format'
import { min, max } from 'd3-array'
import { timeFormat } from 'd3-time-format'
import { annotation } from 'd3-svg-annotation'

import { VISUALIZATION_CONFIG, timeLineAnnotations } from '../config/constants.js'
// import styles from '../css/Visualization.module.css'

/**
 * Creates an accessible timeline visualization of earthquakes
 */
export function createTimelineChart (data, {
  vars,
  width,
  rowSize = 40,
  firstRowOffset = 0,
  leftPositionGridLine = 100
} = {}) {
  const margins = VISUALIZATION_CONFIG.timeline.margins

  const formatNum = format('.2f')
  const formatYear = timeFormat('%Y')

  // Adjust height calculation to include margins
  let height = data.reduce((acc, region) =>
    acc + region.departments.length * rowSize, 0)
  height += margins.top + margins.bottom

  // Create main SVG container with accessibility attributes
  const viz = create('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'timeline-chart')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('role', 'img')
    .attr('aria-label', 'Timeline of earthquakes in Peru')

  const chart = viz
    .append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`)
    .attr('class', 'timeline-content')
    .attr('role', 'graphics-document')
    .attr('aria-roledescription', 'Timeline visualization')

  // Process and flatten earthquake events
  const events = data.map(d => d.earthquakes).flat()
  const xAxisExtent = [
    timeYear.floor(min(events, d => d[vars.cx])),
    timeYear.ceil(max(events, d => d[vars.cx]))
  ]

  const xScale = scaleTime()
    .domain(xAxisExtent)
    .range([leftPositionGridLine + 210, width - VISUALIZATION_CONFIG.timeline.margins.right - 30])

  const rScale = scaleSqrt()
    .domain([7, 10])
    .range([0.1, rowSize / 2 - 2])

  // Create main table structure
  const table = chart
    .append('g')
    .attr('class', 'earthquake-table')
    .attr('transform', 'translate(0, 0)')

  // Add header section with proper ARIA labels
  const yAxis = table.append('g')
    .attr('class', 'axisY')
    .attr('role', 'graphics-symbol')
    .attr('aria-label', 'Timeline headers')
    .style('font-size', VISUALIZATION_CONFIG.timeline.fontSizes.header)
    .style('font-weight', 'bold')
    .style('font-family', 'sans-serif')
    .attr('fill', '#444')

  // Add region header
  yAxis
    .append('text')
    .text('REGIÓN')
    .attr('role', 'columnheader')
    .attr('transform', `translate(0, ${firstRowOffset})`)
    .attr('aria-label', 'Region column header')

  // Add department header
  yAxis
    .append('text')
    .text('DEPARTMENTO')
    .attr('role', 'columnheader')
    .attr('transform', `translate(${leftPositionGridLine}, ${firstRowOffset})`)
    .attr('aria-label', 'Department column header')

  // Add separator line
  yAxis
    .append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', rowSize * 0.25)
    .attr('y2', rowSize * 0.25)
    .attr('role', 'separator')
    .style('stroke', '#444')

  // Create table body
  const tbody = table.append('g')
    .attr('class', 'timelinePlot')
    .attr('transform', `translate(0, ${rowSize})`)

  // Render data rows
  let yOffset = 0
  for (let i = 0; i < data.length; i++) {
    const region = data[i].region
    const departments = data[i].departments

    for (let j = 0; j < departments.length; j++) {
      const row = tbody
        .append('g')
        .attr('transform', `translate(0, ${j * rowSize + yOffset})`)
        .attr('role', 'row')
        .attr('aria-label', `${region} - ${departments[j].department}`)

      // Add grid line
      row
        .append('line')
        .attr('x1', leftPositionGridLine)
        .attr('x2', width)
        .attr('y1', rowSize * 0.25)
        .attr('y2', rowSize * 0.25)
        .style('stroke', '#eee')

      // Add region name
      const regionCell = row
        .append('text')
        .attr('role', 'cell')
        .style('font-size', VISUALIZATION_CONFIG.timeline.fontSizes.text)
        .style('font-family', 'sans-serif')
        .style('fill', '#444')
        .attr('transform', 'translate(0, 0)')

      if (j === 0) {
        regionCell
          .text(region)
          .style('font-weight', 'bold')
          .attr('aria-label', `Region: ${region}`)
      }

      // Add department name and earthquake count
      row.append('text')
        .attr('role', 'cell')
        .attr('transform', `translate(${leftPositionGridLine}, 0)`)
        .text(`${departments[j].department} (${departments[j].earthquakes.length})`)
        .style('font-size', VISUALIZATION_CONFIG.timeline.fontSizes.text)
        .style('font-family', 'sans-serif')
        .attr('aria-label', `Department: ${departments[j].department}, ${departments[j].earthquakes.length} earthquakes`)

      // Add earthquake circles
      const earthquakeGroup = row.append('g')
        .attr('class', 'earthquake-circles')
        .attr('role', 'graphics-symbol')
        .attr('aria-label', `Earthquakes in ${departments[j].department}`)

      earthquakeGroup
        .selectAll('circle')
        .data(departments[j].earthquakes)
        .join('circle')
        .attr('cx', d => formatNum(xScale(d[vars.cx])))
        .attr('cy', `-${rowSize / 2 - 8}`)
        .attr('r', d => formatNum(rScale(d[vars.r])))
        .attr('fill', d => d.type === 'Historical' ? '#666' : '#4CAF50')
        .attr('stroke', d => d.type === 'Historical' ? '#000' : '#2E7D32')
        .attr('opacity', 0.7)
        .attr('role', 'graphics-symbol')
        .attr('aria-label', d => `${d.type} earthquake, magnitude ${d[vars.r]}, year ${formatYear(d[vars.cx])}`)
    }

    yOffset += departments.length * rowSize
  }

  // Add x-axis with proper ARIA labels
  const xAxisGenerator = axisTop(xScale)
    .ticks(timeYear.every(20)) // Show ticks every 20 years
    .tickSize(6)
    .tickPadding(8)
    .tickFormat(formatYear)

  const xAxis = table.append('g')
    .attr('class', 'xAxis')
    .attr('role', 'graphics-symbol')
    .attr('aria-label', 'Timeline years')
    .attr('transform', 'translate(0, 10)')
    .style('font-family', 'sans-serif')

  xAxis.call(xAxisGenerator)
    .selectAll('.tick text')
    .style('text-anchor', 'middle')
    .attr('dy', '-0.5em')

  xAxis.select('.domain')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)

  xAxis.selectAll('.tick line')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)

  xAxis.selectAll('text')
    .style('font-size', VISUALIZATION_CONFIG.timeline.fontSizes.axis)
    .attr('aria-hidden', 'false')

  // Add annotations
  const makeAnnotations = annotation()
    .annotations(timeLineAnnotations)

  chart
    .append('g')
    .attr('class', 'annotations2')
    .call(makeAnnotations)

  return viz.node()
}
