import { csv, json } from 'https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/+esm'
import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { max } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import { geoIdentity } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { scaleThreshold, scaleSqrt } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { mapChart } from './js/drawmap.js'
import { circleLegendArr, width, height, magnitude, histMagnitude, segmentation, maxRadius } from './js/constants.js'
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
// const districts = topojson.feature(pe, pe.objects.level4)
// const provinces = topojson.feature(pe, pe.objects.level3)

const departments = topojson.feature(pe, pe.objects.level2)
// const borders = topojson.mesh(pe, pe.objects.departments, (a, b) => a !== b)

// return d3.geoMercator().scale(scale).translate([3/2 * scale, 30])
const projection = geoIdentity().reflectY(true).fitSize([width, 0.65 * height], features)

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

// const margin = { top: 20, right: 20, bottom: 20, left: 40 }
// const width = parseInt(window.getComputedStyle(etendues).width) - margin.left - margin.right
// const svgCell = document.querySelector('#visualization')
const svgCell = select('#visualization').append('svg')
  .attr('viewBox', '0 0 ' + width + ' ' + height)

circleLegend(circleLegendArr, { // pass in array of values (e.g. min,mean/median & max)
  // overide defaults
  svg: svgCell.attr('transform', `translate(10, ${height - 210})`), // select(svgCell).select('g.legendcl')
  domain: [0, max(circleLegendArr)],
  range: [0, maxRadius],
  scale: powerScale,
  title: 'Magnitude'
})

barLegend({ // pass in array of values (e.g. min,mean/median & max)
  // overide defaults
  svg: svgCell.attr('transform', `translate(10, ${height - 150})`), // select(svgCell).select('g.legendbar')
  domain: segmentation.map(d => d.depth),
  range: segmentation.map(d => d.color),
  title: 'Depth (Km)'
})

// pass cartography and data
mapChart(data, {
  svg: svgCell.attr('transform', 'translate(10, 10)'), // select(svgCell).select('.map')
  projection,
  feature: features,
  border: departments,
  colorScale: depthScale,
  colorBy: 'depth',
  radiusScale: powerScale,
  radiusBy: 'magnitude'
})

// console.log('data: ', data)
// console.log('dataHist:', dataHist)
// console.log('svgCell:', svgCell)
