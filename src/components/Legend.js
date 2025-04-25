import { create } from 'd3-selection'
import { scaleLinear, scaleThreshold } from 'd3-scale'
import { axisBottom } from 'd3-axis'
import { quantize, interpolate, interpolateRound } from 'd3-interpolate'
// import styles from '../css/Visualization.module.css'

/**
 * Creates an accessible color or circle size legend
 */
function createLegend (color, {
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
  const svg = create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('role', 'img')
    .attr('aria-label', `Legend for ${title}`)
    .style('overflow', 'visible')
    .style('display', 'block')

  // Add descriptive title for screen readers
  svg.append('title')
    .text(`${title} Legend`)

  const g = svg.append('g')
    .attr('role', 'list')
    .attr('aria-label', `${title} scale values`)

  const tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height)
  let x

  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length)
    x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n))
  } else if (color.interpolator) {
    x = Object.assign(color.copy()
      .interpolator(interpolateRound(marginLeft, width - marginRight)), {
      range () { return [marginLeft, width - marginRight] }
    })
  } else {
    x = scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight])
  }

  g.append('g')
    .selectAll('rect')
    .data(color.range())
    .join('rect')
    .attr('x', (d, i) => x(i - 1))
    .attr('y', marginTop)
    .attr('width', (d, i) => x(i) - x(i - 1))
    .attr('height', height - marginTop - marginBottom)
    .attr('fill', d => d)
    .attr('role', 'presentation')

  g.append('g')
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
      .attr('class', 'titleLegend')
      .attr('role', 'heading')
      .attr('aria-level', '2')
      .text(title))

  return svg.node()
}

/**
 * Creates an accessible bar legend for depth scale
 */
export function createBarLegend ({
  svg = null,
  domain = [0, 100],
  range = [0, 80],
  title
} = {}) {
  const legend = createLegend(scaleThreshold(domain, range), {
    title,
    tickSize: 0,
    width: 200
  })

  svg.append('g')
    .attr('class', 'barLegend')
    .attr('role', 'complementary')
    .attr('aria-label', `${title} scale`)
    .attr('transform', 'translate(5, 0)')
    .append(() => legend)

  return svg.node()
}

/**
 * Creates an accessible circle legend for magnitude scale
 */
export function createCircleLegend (data, {
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
    .attr('class', 'circleLegend')
    .attr('role', 'complementary')
    .attr('aria-label', `${title} scale`)
    .attr('transform', 'translate(0, 0)')

  // Add title
  legend
    .append('text')
    .attr('class', 'titleLegend')
    .text(title)
    .attr('transform', 'translate(80, 0)')
    .attr('text-anchor', 'start')
    .attr('role', 'heading')
    .attr('aria-level', '2')

  // Create circles group
  const circles = legend
    .append('g')
    .attr('class', 'circleLegendWrap')
    .attr('role', 'list')
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('role', 'listitem')
    .attr('aria-label', d => `Magnitude ${d}${suffix}`)

  // Add circles
  circles
    .append('circle')
    .attr('r', d => scale(d))
    .attr('cx', width / 2)
    .attr('cy', d => height - scale(d))
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('stroke-width', d => d >= thresholdMagnitude ? 1.5 : 0.7)
    .style('opacity', 0.8)
    .attr('role', 'presentation')

  // Add labels
  circles
    .append('text')
    .attr('x', width / 2 + 3)
    .attr('y', d => height - 2 * scale(d) - 3)
    .attr('shape-rendering', 'crispEdges')
    .style('text-anchor', 'end')
    .style('fill', 'black')
    .style('font-size', fontSize)
    .text(d => d + suffix)
    .attr('role', 'presentation')

  return legend.node()
}
