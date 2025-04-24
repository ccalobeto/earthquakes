import { create } from 'd3-selection'
import { scaleLinear, scaleThreshold, scalePoint } from 'd3-scale'
import { axisBottom } from 'd3-axis'
import { range, quantile } from 'd3-array'
import { interpolate, quantize, interpolateRound } from 'd3-interpolate'
import { format } from 'd3-format'

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

    x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n))

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL())
  } else if (color.interpolator) { // Sequential
    x = Object.assign(color.copy()
      .interpolator(interpolateRound(marginLeft, width - marginRight)), {
      range () { return [marginLeft, width - marginRight] }
    })

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(color.interpolator()).toDataURL())

    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1)
        tickValues = range(n).map(i => quantile(color.domain(), i / (n - 1)))
      }
      if (typeof tickFormat !== 'function') {
        tickFormat = format(tickFormat === undefined ? ',f' : tickFormat)
      }
    }
  } else if (color.invertExtent) { // Threshold
    const thresholds = color.thresholds
      ? color.thresholds() // scaleQuantize
      : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain() // scaleThreshold

    const thresholdFormat = tickFormat === undefined
      ? d => d
      : typeof tickFormat === 'string'
        ? format(tickFormat)
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
  } else { // Ordinal
    x = scalePoint()
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
      .attr('class', 'title-legend')
      .text(title))

  return svg.node()
}

export function barLegend ({
  svg = null,
  domain = [0, 100],
  range = [0, 80],
  title
} = {}) {
  const theLegend = Legend(scaleThreshold(domain, range), {
    title,
    tickSize: 0,
    width: 200
  })

  svg.append('g')
    .attr('class', 'bar-wrap')
    .attr('transform', 'translate(5, 0)')
    .append(() => theLegend)

  return svg.node()
}

export function circleLegend (data, {
  svg = null,
  domain = [0, 100],
  range = [0, 80],
  width = range[1] * 2,
  height = range[1] * 2,
  suffix = '',
  textPadding = 30,
  fontSize = 15,
  scale,
  title,
  thresholdMagnitude = 8
} = {}) {
  svg.selectAll('g').remove()
  const legend = svg.append('g')
    .attr('class', 'cl-wrap')
    .attr('transform', 'translate(0, 0)')

  legend
    .append('text')
    .attr('class', 'title-legend')
    .text(title)
    .attr('transform', 'translate(80, 0)')
    .attr('text-anchor', 'start')

  legend
    .append('g')
    .attr('class', 'cl-circle-wrap')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', d => scale(d))
    .attr('cx', width / 2)
    .attr('cy', d => height - scale(d))
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('stroke-width', d => d >= thresholdMagnitude ? 1.5 : 0.7)
    .style('opacity', 0.8)

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
