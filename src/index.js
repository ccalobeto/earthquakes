import { csv, json } from 'https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/+esm'
import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'
import { max } from 'https://cdn.jsdelivr.net/npm/d3-array@3.2.0/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import { geoIdentity } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import { scaleThreshold, scaleSqrt } from 'https://cdn.jsdelivr.net/npm/d3-scale@4/+esm'
import { mapChart } from './js/drawmap.js'
import { width, height, segmentation, maxRadius } from './js/constants.js'
import { circleLegend, barLegend } from './js/legends.js'

const url = 'https://cdn.jsdelivr.net/npm/latam-atlas@0.0.4/files/peru-100k.json'
const file = '../data/output.csv'

const pe = await json(url)
const data = await csv(file).then(d => {
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

const features = topojson.feature(pe, pe.objects.level2)
// const districts = topojson.feature(pe, pe.objects.level4)
// const provinces = topojson.feature(pe, pe.objects.level3)

const departments = topojson.feature(pe, pe.objects.level2)
// const borders = topojson.mesh(pe, pe.objects.departments, (a, b) => a !== b)

// const scale = 2000
// return d3.geoMercator().scale(scale).translate([3/2 * scale, 30])
const projection = geoIdentity().reflectY(true).fitSize([width, height], features)

// scales
const depthScale = scaleThreshold()
  .domain(segmentation.map(d => d.depth))
  .range(segmentation.map(d => d.color))

// Mw moment magnitude
// M6 is 31.62 times M5. For visualization purpuses we took 10, related of an increase of amplitude between each scale.
function powerScale (magnitude) {
  const maxMagnitude = max(data, d => d.magnitude)
  const timesPerScale = 10
  const maxPower = Math.pow(timesPerScale, maxMagnitude)
  const scale = scaleSqrt().domain([0, maxPower]).range([0, maxRadius])
  return scale(Math.pow(timesPerScale, magnitude))
}

const svgCell = document.querySelector('#visualization')

// pass cartography and data
mapChart(data, {
  svg: select(svgCell).select('.map'),
  projection,
  feature: features,
  border: departments,
  colorScale: depthScale,
  colorBy: 'depth',
  radiusScale: powerScale,
  radiusBy: 'magnitude'
})

const circleLegendArr = [6, 7, 8, 9]
circleLegend(circleLegendArr, { // pass in array of values (e.g. min,mean/median & max)
  // overide defaults
  svg: select(svgCell).select('g.legendcl'),
  domain: [0, max(circleLegendArr)],
  range: [0, maxRadius],
  scale: powerScale,
  title: 'Magnitude'
})

barLegend({ // pass in array of values (e.g. min,mean/median & max)
  // overide defaults
  svg: select(svgCell).select('g.legendbar'),
  domain: segmentation.map(d => d.depth),
  range: segmentation.map(d => d.color),
  title: 'Depth (Km)'
})

console.log(width)
console.log(height)
console.log(svgCell)
