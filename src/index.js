import { csv, json } from 'https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/+esm'
import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { max } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import { geoIdentity } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { scaleThreshold, scaleSqrt } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { mapChart } from './js/drawmap.js'
import { circleLegendArr, width, height, magnitude, histMagnitude, segmentation, maxRadius, innerWidth, innerHeight } from './js/constants.js'
import { circleLegend, barLegend } from './js/legends.js'

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

const data = rawData.filter(d => d.type === 'Instrumental' && d.magnitude >= magnitude)
const dataHist = rawData.filter(d => d.type === 'Historical' && d.magnitude >= histMagnitude)

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

// document.getElementById('svg').setAttribute('viewBox', `0 0 ${width} ${height}`)
const svgSelection = select('#visualization')
  .append('svg')
  .attr('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
  .attr('style', ' background-color: #d1e5f0')

// pass cartography and data
mapChart(data, {
  svg: svgSelection
    .append('g')
    .attr('class', 'map')
    .attr('transform', 'translate(0, 0)'),
  projection,
  feature: features,
  border: departments,
  colorScale: depthScale,
  colorBy: 'depth',
  radiusScale: powerScale,
  radiusBy: 'magnitude'
})

circleLegend(circleLegendArr, {
  // overide defaults
  svg: svgSelection
    .append('g')
    .attr('class', 'legend-circle')
    .attr('transform', 'translate(0, ' + (innerHeight - 340) + ')'),
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
    .attr('transform', 'translate(80,' + (innerHeight + 50) + ')'),
  domain: segmentation.map(d => d.depth),
  range: segmentation.map(d => d.color),
  title: 'Depth (Km)'
})

console.log('height: ', height)
console.log('innerheight: ', innerHeight)
