/* eslint-disable brace-style */
import d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'
import { max, range } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import { create } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { scaleThreshold, scaleLinear } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { axisBottom } from 'https://cdn.jsdelivr.net/npm/d3-axis@3/+esm'

// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
function Legend (color, {
  title,
  tickSize = 6,
  width = 320,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {
  function ramp (color, n = 256) {
    const canvas = document.createElement('canvas')
    canvas.width = n
    canvas.height = 1
    const context = canvas.getContext('2d')
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1))
      context.fillRect(i, 0, 1, 1)
    }
    return canvas
  }

  const svg = create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('overflow', 'visible')
    .style('display', 'block')

  let tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height)
  let x

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length)

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n))

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL())
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
    { range () { return [marginLeft, width - marginRight] } })

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.interpolator()).toDataURL())

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1)
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)))
      }
      if (typeof tickFormat !== 'function') {
        tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat)
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds = color.thresholds
      ? color.thresholds() // scaleQuantize
      : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain() // scaleThreshold

    const thresholdFormat =
        tickFormat === undefined
          ? d => d
          : typeof tickFormat === 'string'
            ? d3.format(tickFormat)
            : tickFormat

    x = scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight])

    svg.append('g')
      .selectAll('rect')
      .data(color.range())
      .join('rect')
      .attr('x', (d, i) => x(i - 1))
      .attr('y', marginTop)
      .attr('width', (d, i) => x(i) - x(i - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', d => d)

    tickValues = range(thresholds.length)
    tickFormat = i => thresholdFormat(thresholds[i], i)
  }

  // Ordinal
  else {
    x = d3.scaleBand()
      .domain(color.domain())
      .rangeRound([marginLeft, width - marginRight])

    svg.append('g')
      .selectAll('rect')
      .data(color.domain())
      .join('rect')
      .attr('x', x)
      .attr('y', marginTop)
      .attr('width', Math.max(0, x.bandwidth() - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', color)

    tickAdjust = () => {}
  }

  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(axisBottom(x)
      .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
      .tickFormat(typeof tickFormat === 'function' ? tickFormat : undefined)
      .tickSize(tickSize)
      .tickValues(tickValues))
    .call(tickAdjust)
    .call(g => g.select('.domain').remove())
    .call(g => g.append('text')
      .attr('x', marginLeft)
      .attr('y', marginTop + marginBottom - height - 6)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .attr('class', 'title')
      .text(title))

  return svg.node()
}
export function barLegend ({
  svg = null, // pass in a d3 selection
  domain = [0, 100], // the values min and max
  range = [0, 80], // the circle area/size mapping
  title
} = {}) {
  const theLegend = Legend(scaleThreshold(domain,
    range), {
    title,
    tickSize: 0,
    width: 200
  })

  svg.append('g')
    .attr('class', 'bar-wrap')
    .attr('transform', 'translate(5, 20)')
    .append(() => theLegend)

  return svg.node()
}
export function circleLegend (data, {
  svg = null, // pass in a d3 selection
  domain = [0, 100], // the values min and max
  range = [0, 80], // the circle area/size mapping
  width = range[1] * 2,
  height = range[1] * 2,
  suffix = '', // ability to pass in a suffix
  textPadding = 30,
  fontSize = 11,
  scale,
  title,
  thresholdMagnitude = 8
} = {}) {
  svg.selectAll('g').remove()
  // const maxData = max(data)
  const legend = svg.append('g')
    .attr('class', 'cl-wrap')
    // push down to radius of largest circle
    .attr('transform', 'translate(0, 20)')

  // set the title legend
  legend
    .append('text')
    .text(title)
    .attr('transform', 'translate(80, 0)') // `translate(0, -90)`
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold')
    .style('font-size', fontSize)

  // append the values for circles
  legend
    .append('g')
    .attr('class', 'cl-circle-wrap')
    // .attr('transform', 'translate(200, 200')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', d => scale(d))
    .attr('cx', width / 2)
    .attr('cy', d => height - scale(d)) // - margin.bottom
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('stroke-width', d => d >= thresholdMagnitude ? 1.5 : 0.7)
    .style('opacity', 0.8)

  // // append some lines based on values
  // legend
  //   .append('g')
  //   .attr('class', 'cl-line-wrap')
  //   .selectAll('line')
  //   .data(data)
  //   .join('line')
  //   .attr('x1', width)
  //   .attr('x2', width + scale(domain[1]) + 10)
  //   .attr('y1', d => height - 2 * scale(d)) // - scale(d)
  //   .attr('y2', d => height - 2 * scale(d))
  //   .style('stroke', 'black')
  //   .style('stroke-dasharray', ('2,2'))

  // append some labels from values
  legend
    .append('g')
    .attr('class', 'cl-text-wrap')
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('x', width / 2 + 3)
    .attr('y', d => height - 2 * scale(d) - 3)
    .attr('shape-rendering', 'crispEdges')
    .style('text-anchor', 'end')
    .style('fill', 'black')
    .style('font-size', fontSize)
    .text(d => d + suffix)

  return legend.node()
}
