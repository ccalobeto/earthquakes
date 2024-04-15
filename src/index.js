import { csv, json } from 'https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/+esm'
import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
// import { max } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import { geoIdentity } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { scaleThreshold, scaleSqrt } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { mapChart } from './js/drawmap.js'
import { circleLegendArr, height, magnitude, segmentation, maxRadius, margin, innerHeight, width } from './js/constants.js'
import { circleLegend, barLegend } from './js/legends.js'
import { mapLabels } from './js/labels.js'
import { annotation } from 'https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm'

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

// const dataHist = rawData.filter(d => d.type === 'Historical' && d.magnitude >= histMagnitude)

const features = topojson.feature(pe, pe.objects.level2)
const departments = topojson.feature(pe, pe.objects.level2)

const projection = geoIdentity().reflectY(true).fitSize([width, height], features)

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

// pass cartography and data
const translation = { translationX: 100, translationY: 0 }

const svgSelection = select('#vis')
  .append('svg')
  .attr('viewBox', `0 0 ${width + translation.translationX + margin.right} ${height}`)
  .attr('width', width)
  .attr('height', height)
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
  radiusBy: 'magnitude',
  translationX: translation.translationX,
  translationY: translation.translationY
})

const maxRadius9 = powerScale(9)
const paddingLegends = 15
const barlegendHeigth = 40

circleLegend(circleLegendArr, {
  // overide defaults
  svg: svgSelection
    .append('g')
    .attr('class', 'legend-circle')
    .attr('transform', 'translate(0, ' + (innerHeight - 2 * maxRadius9 - barlegendHeigth - paddingLegends) + ')'),
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
    .attr('transform', 'translate(80,' + (innerHeight - barlegendHeigth) + ')'),
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
    y: (innerHeight - 135),
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
    x: 328,
    y: (innerHeight - 615),
    dy: 10,
    dx: 60
  }]

const makeAnnotations = annotation()
  .annotations(annotations)

svgSelection
  .append('g')
  .call(makeAnnotations)

mapLabels({
  svg: svgSelection
    .append('g')
    .attr('class', 'label-1')
    .attr('transform', 'translate(-50, ' + (innerHeight + 40) + ')'),
  message: 'The destruction between consecutive scales is 31.6 times more. Say an 8M earthquake is 31.6 x 31.6 ≈ 1,000 times more powerful than a 6M!'
})
