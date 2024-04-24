import { axisTop } from 'https://cdn.jsdelivr.net/npm/d3-axis@3/+esm'
import { scaleLinear, scaleSqrt } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { create } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { timeYear } from 'https://cdn.jsdelivr.net/npm/d3-time@3.1.0/+esm'
import { format } from 'https://cdn.jsdelivr.net/npm/d3-format@3.1.0/+esm'
import { min, max, extent } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import { multiFormat } from './utils.js'
import { innerWidth, margin } from './constants.js'

export function circleTimelineChart (data, {
  vars,
  scaleX,
  width,
  rowSize = 40,
  fistRowOffset = 0,
  leftPositionGridLine = 100
} = {}) {
  const formatNum = format('.2f')
  let height = 0

  for (let i = 0; i < data.length; i++) {
    height += data[i].departments.length * rowSize
  }
  height = height + margin.top + margin.bottom
  console.log('height_1', height)

  const viz = create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svg')

  const chart = viz
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'chart')

  const xAxisExtent = [
    timeYear.floor(min(
      data
        .map(d => d.departments).flat()
        .map(d => d.earthquakes).flat(),
      d => d[vars.cx]
    )),
    timeYear.ceil(max(
      data
        .map(d => d.departments)
        .flat()
        .map(d => d.earthquakes)
        .flat(),
      d => d[vars.cx]
    ))]

  const xScale = scaleLinear()
    .domain(xAxisExtent) // TODO make this dynamic
    .range([310, width - margin.right - margin.left])

  const radiusCircleExtent = extent(data
    .map(d => d.departments).flat()
    .map(d => d.earthquakes).flat(), d => d[vars.r])

  const rScale = scaleSqrt()
    .domain(radiusCircleExtent)
    .range([1, rowSize / 2 - 2])

  const table = chart
    .append('g')
    .attr('class', 'earthquakes')
    .attr('transform', 'translate(0, 0)')

  // headers
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

  // body
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

      // grid line
      row
        .append('line')
        .attr('x1', leftPositionGridLine)
        .attr('x2', width)
        .attr('y1', rowSize * 0.25)
        .attr('y2', rowSize * 0.25)
        .style('stroke', '#eee')

      //  category name
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

      // subcategory name
      row.append('text')
        .attr('transform', `translate(${leftPositionGridLine}, 0)`)
        .text(departments[j].department + ' (' + departments[j].earthquakes.length + ')')
        .style('font-size', '14')
        .style('color', '#444')
        .style('font-family', 'sans-serif')

      // circle
      row.append('g')
        .attr('class', 'circle')
        .selectAll('.circle')
        .data(departments[j].earthquakes)
        .join('circle')
        .attr('cx', d => formatNum(scaleX(d[vars.cx])))
        .attr('cy', d => `${-rowSize / 2 + 8}`)
        .attr('r', d => formatNum(rScale(d[vars.r])))
        .attr('fill', d => d.type === 'Historical' ? 'orange' : 'gray')
        .attr('stroke', d => d.type === 'Historical' ? 'red' : 'black')
        .attr('opacity', 0.5)
    }
    yOffset += departments.length * rowSize
  }

  /* const xAxis = table
    .append('g')
    .attr("transform", 'translate(0, 8)')
    .call(d3.axisTop(scaleX).ticks(innerWidth/50).tickFormat(multiFormat))
    //.call(d3.axisTop(xScale).ticks(innerWidth/50).tickFormat(multiFormat))
    //.call(d3.axisTop().scale(xScale).tickSizeOuter(0).ticks(innerWidth/100).tickFormat(multiFormat))
    .call(g => g.select(".domain").remove()) */
  const xAxisGenerator = axisTop(scaleX).ticks(innerWidth / 50).tickFormat(multiFormat)
  const xAxis = table.append('g').attr('class', 'xAxis').attr('transform', 'translate(0, 8)')
  xAxis.call(xAxisGenerator).select('.domain').remove()
  xAxis.selectAll('text').style('font-size', '11px')

  return viz.node()
}
