/* eslint-disable no-tabs */
import { csv, json } from 'd3-fetch'
import { select } from 'd3-selection'
import { group } from 'd3-array'
import { geoIdentity } from 'd3-geo'
import { scaleThreshold, scaleSqrt } from 'd3-scale'
import { timeParse } from 'd3-time-format'
import { annotation } from 'd3-svg-annotation'
import * as topojson from 'topojson-client'

import { circleLegendArr, height, magnitude, segmentation, maxRadius, width, innerWidth, innerHeight, regions } from './js/constants.js'
import { circleLegend, barLegend } from './js/legends.js'
import { mapLabels } from './js/labels.js'
import { responsivefy } from './js/responsiveness.js'
import { circleTimelineChart } from './js/drawTimelineCircles.js'
import { getRegion } from './js/utils.js'
import { mapChart } from './js/drawmap.js'

const url = '/earthquakes/data/input/peru-100k.json'
const file = '/earthquakes/data/output/output.csv'

const pe = await json(url)
let rawData = await csv(file).then(d => {
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
// the closest district is not precise for Pisco Eq, so we fix it
const piscoEqId = rawData.filter(d => d.magnitude >= 7.8 && d.year === 2007)[0].eventId

rawData = rawData.map(obj => {
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

const data = rawData.filter(d => d.type === 'Instrumental' && d.magnitude >= magnitude)

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
    y: (innerHeight - 210),
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
    x: 235,
    y: (innerHeight - 790),
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
    .attr('transform', 'translate(-70, ' + (innerHeight + 10) + ')'),
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

const chart2 = circleTimelineChart(transformedData, {
  vars,
  width
})

select('#vis-1').append(() => chart2).call(responsivefy)

const timeLineAnnotations = [
  {
    note: {
      label: '8.4M Atico, Arequipa (2001)',
      title: 'More Powerful since 1960',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 10 // More = text lower

    },
    color: ['#cc0000'],
    x: 1045,
    y: 35,
    dy: 250,
    dx: -2
  },
  {
    note: {
      label: '9.4M Ite, Tacna (1604)',
      title: 'More Powerful in History',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 10 // More = text lower

    },
    color: ['#cc0000'],
    x: 400,
    y: 123,
    dy: 5,
    dx: 10
  }]

const makeTimeLineAnnotations = annotation()
  .annotations(timeLineAnnotations)

select('.chart')
  .append('g')
  .attr('class', 'annotations2')
  .call(makeTimeLineAnnotations)

mapLabels({
  svg: select('svg')
    .append('g')
    .attr('class', 'label-2')
    .attr('transform', 'translate(-75, 725)'),
  message: '(*)The plot does not show the true area of the circle. Just per visualization purpuses'
})

// *** refs ***
// https://stackoverflow.com/questions/72893030/how-to-add-svg-object-in-html
// console.log('dataHist', dataHist)
// console.log('dataTransformed', transformedData)
// console.log('minEarthquake', minEarthquake.value)
