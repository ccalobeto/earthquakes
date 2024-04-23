/* eslint-disable no-tabs */
import { csv, json } from 'https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/+esm'
import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { min, max, group } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
// import observablehqinputs from 'https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.10.6/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import { geoIdentity } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { scaleThreshold, scaleSqrt, scaleTime } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { timeParse } from 'https://cdn.jsdelivr.net/npm/d3-time-format@4.1.0/+esm'
import { timeYear } from 'https://cdn.jsdelivr.net/npm/d3-time@3.1.0/+esm'
import { mapChart } from './js/drawmap.js'
import { circleLegendArr, height, magnitude, segmentation, maxRadius, width, heightCircleTimelineChart, innerWidth, innerHeight, regions } from './js/constants.js'
import { circleLegend, barLegend } from './js/legends.js'
import { mapLabels } from './js/labels.js'
import { responsivefy } from './js/responsiveness.js'
import { annotation } from 'https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm'
import { circleTimelineChart } from './js/drawTimelineCircles.js'
import { getRegion } from './js/utils.js'

const url = 'https://cdn.jsdelivr.net/npm/latam-atlas@0.0.4/files/peru-100k.json'
const file = './data/output.csv'

const pe = await json(url)
const rawData = await csv(file).then(d => {
  return d.map(r => ({
    eventId: +r.eventId,
    utcDate: r.utcDate,
    geometry: {
      type: 'Point',
      coordinates: [+r.lon, +r.lat]
    },
    depth: +r.depth,
    magnitude: +r.magnitude,
    year: +r.year,
    type: r.type,
    id: r.id,
    distanceFromCoast: +r.distanceFromCoast,
    department: r.department,
    description: r.description
  }))
})

let data = rawData.filter(d => d.type === 'Instrumental' && d.magnitude >= magnitude)

// the closest district is not precise for Pisco Eq, so we fix it
const piscoEqId = data.filter(d => d.magnitude >= 7.8 && d.year === 2007)[0].eventId
data = data.map(obj => {
  if (obj.eventId === piscoEqId) {
    return {
      ...obj,
      distanceFromCoast: '40',
      department: 'Ica',
      description: 'Pisco'
    }
  }
  return obj
})

const features = topojson.feature(pe, pe.objects.level2)
const departments = topojson.feature(pe, pe.objects.level2)

const projection = geoIdentity().reflectY(true).fitSize([innerWidth, innerHeight], features)

// scales
const depthScale = scaleThreshold()
  .domain(segmentation.map(d => d.depth))
  .range(segmentation.map(d => d.color))

// Mw moment magnitude
// M6 is 31.62 times M5. For visualization purpuses we took 10, related of an increase of amplitude between each scale.
function powerScale (
  magnitude,
  timesPerScale = 30,
  maxMagnitude = 10
) {
  const maxPower = Math.pow(timesPerScale, maxMagnitude)
  const scaler = scaleSqrt().domain([0, maxPower]).range([0, maxRadius])
  return scaler(Math.pow(timesPerScale, magnitude))
}

// const translation = { translationX: 100, translationY: 0 }

const svgSelection = select('#vis')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  // .attr('viewBox', '0 0 1200 1800')
  .call(responsivefy)
  .attr('style', ' background-color: #c5a34f')
  .attr('class', 'map')

mapChart(data, {
  svg: svgSelection,
  projection,
  feature: features,
  border: departments,
  colorScale: depthScale,
  colorBy: 'depth',
  radiusScale: powerScale,
  radiusBy: 'magnitude'
  // translationX: translation.x,
  // translationY: translation.y
})

const maxRadius9 = powerScale(9)
const paddingLegends = 15
const barlegendHeigth = 40

circleLegend(circleLegendArr, {
  // overide defaults
  svg: svgSelection
    .append('g')
    .attr('class', 'legend-circle')
    .attr('transform', 'translate(0, ' + (innerHeight - 2 * maxRadius9 - 2 * barlegendHeigth - paddingLegends) + ')'),
  domain: [0, 9],
  range: [0, 190], // 190 pixel is a 9 earthquake
  scale: powerScale,
  title: 'Magnitude (M)'
})

barLegend({
  // overide defaults
  svg: svgSelection
    .append('g')
    .attr('class', 'legend-bar')
    .attr('transform', 'translate(80,' + (innerHeight - 2 * barlegendHeigth) + ')'),
  domain: segmentation.map(d => d.depth),
  range: segmentation.map(d => d.color),
  title: 'Depth (Km)'
})

// reference for annotations https://d3-annotation.susielu.com/
const annotations = [
  {
    note: {
      label: '82km from Ocoña: 65 deads, 220,000 casualties and 24,500 destroyed homes.',
      title: 'More Powerful',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 10 // More = text lower

    },
    color: ['#cc0000'],
    x: 713,
    y: (innerHeight - 230),
    dy: 10,
    dx: 60
  },
  {
    note: {
      label: '70,000 deads, 880,000 casualties and 160,000 destroyed homes only in Callejón of Huaylas.',
      title: 'More Letal',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 10 // More = text lower

    },
    color: ['#cc0000'],
    x: 260,
    y: (innerHeight - 680),
    dy: 10,
    dx: 60
  }]

const makeAnnotations = annotation()
  .annotations(annotations)

svgSelection
  .append('g')
  .attr('class', 'annotations')
  .call(makeAnnotations)

mapLabels({
  svg: svgSelection
    .append('g')
    .attr('class', 'label-1')
    .attr('transform', 'translate(-70, ' + (innerHeight - 20) + ')'),
  message: 'The destruction between consecutive scales is 31.6 times more. Say an 8M earthquake is 31.6 x 31.6 ≈ 1,000 times  more powerful than a 6M!'
})

// construct the timeline chart
const dataHist = rawData.filter(d => d.magnitude >= 7).map((d, i) => {
  // manipulate strings dates like "Wed Nov 27 1630 15:30:01"
  const parseDate = timeParse('%a %b %d %Y %H:%M:%S')
  return ({
    eventId: i,
    year: d.year,
    magnitude: d.magnitude,
    department: d.department === 'Lima' || d.department === 'Callao' ? 'Lima y Callao' : d.department,
    date: parseDate(d.utcDate.slice(0, 24)),
    type: d.type
  })
}).map(d => ({
  ...d,
  region: getRegion(regions, d.department)
})
)
const vars = ({
  cx: 'date',
  cy: 'department',
  r: 'magnitude'
})

// const minMagnitude = min(dataHist, d => d[vars.r])
// const maxMagnitude = max(dataHist, d => d[vars.r])

const transformedData = Array.from(
  group(dataHist, d => d.region, d => d.department)
).map(d => {
  return {
    region: d[0], // region is the category
    departments: Array.from(d[1]).map(d2 => { // departments is subcategory
      return { department: d2[0], earthquakes: d2[1], count: d2[1].length }
    }).sort((a, b) => b.count - a.count),
    earthquakes: Array.from(d[1]) // earthquakes is the events
      .map(e => e[1]).flat()
  }
})

const scaleX = scaleTime()
  // If you’d like the domain to begin at the start of one year and end at the start of another year, we can use the time interval floor and ceil methods on the timeYear interval
  .domain([timeYear.floor(min(dataHist, d => d[vars.cx])), timeYear.ceil(max(dataHist, d => d[vars.cx]))])
  .range([100, innerWidth])

const svgCircles = select('#vis-2')
  .append('svg')
  .attr('width', width)
  .attr('height', heightCircleTimelineChart)
  .call(responsivefy)
  .attr('style', ' background-color: #c5a34f')
  .attr('class', 'circle-timeline')

circleTimelineChart(transformedData, {
  svg: svgCircles,
  vars,
  scaleX
})
