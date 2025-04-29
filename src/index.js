import { csv, json } from 'd3-fetch'
import { select } from 'd3-selection'
import { geoIdentity } from 'd3-geo'
import * as topojson from 'topojson-client'

import { VISUALIZATION_CONFIG, INNER_DIMENSIONS } from './config/constants.js'
import { createMapChart } from './components/MapChart.js'
import { createTimelineChart } from './components/TimelineChart.js'
import { createCircleLegend, createBarLegend } from './components/Legend.js'
import { createDepthColorScale, calculateMagnitudeRadius } from './utils/scales.js'
import { transformEarthquakeData, transformTimelineData, filterInstrumentalData } from './utils/transformers.js'
// import styles from './css/Visualization.module.css'

async function initializeVisualization () {
  try {
    // Load and transform data
    const [geoData, earthquakeData] = await Promise.all([
      json('/earthquakes/data/input/peru-100k.json'),
      csv('/earthquakes/data/output/output.csv').then(transformEarthquakeData)
    ])
    console.log('Cantidad de sismos', earthquakeData.length)
    console.log(`Lugar de máximo sismo: ${earthquakeData.find(d => d.magnitude === Math.max(...earthquakeData.map(d => d.magnitude))).department}, ${Math.max(...earthquakeData.map(d => d.magnitude))}(M)`)
    // Fix Pisco earthquake data
    const piscoEarthquake = earthquakeData.find(d => d.magnitude >= 7.8 && d.year === 2007)
    if (piscoEarthquake) {
      piscoEarthquake.distanceFromCoast = 40
      piscoEarthquake.department = 'Ica'
      piscoEarthquake.description = 'Pisco'
    }

    // Process geographic data
    const features = topojson.feature(geoData, geoData.objects.level2)
    const departments = topojson.feature(geoData, geoData.objects.level2)
    const projection = geoIdentity()
      .reflectY(true)

    // Filter instrumental data and create map visualization
    const instrumentalData = filterInstrumentalData(earthquakeData)
    const depthScale = createDepthColorScale()

    const mapSvg = select('#vis')
      .append('svg')

    console.log('Cantidad de sismos en map Chart', instrumentalData.length)
    // Create map visualization
    createMapChart(instrumentalData, {
      svg: mapSvg,
      projection,
      feature: features,
      border: departments,
      colorScale: depthScale,
      colorBy: 'depth',
      radiusScale: magnitude => calculateMagnitudeRadius(magnitude),
      radiusBy: 'magnitude'
    })

    createCircleLegend(VISUALIZATION_CONFIG.legend.circle.magnitudes, {
      svg: mapSvg.append('g')
        .attr('transform', `translate(${VISUALIZATION_CONFIG.map.margin.left + 50}, ${
          INNER_DIMENSIONS.height + 300
        })`),
      scale: magnitude => calculateMagnitudeRadius(magnitude),
      title: 'Magnitud (M)'
    })

    createBarLegend({
      svg: mapSvg.append('g')
        .attr('transform', `translate(${
      VISUALIZATION_CONFIG.map.margin.left + 20
    }, ${INNER_DIMENSIONS.height + 470})`),
      domain: VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.depth),
      range: VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.color),
      title: 'Profundidad (Km)'
    })

    // Create timeline visualization
    const transformedData = transformTimelineData(earthquakeData)
    const timelineChart = createTimelineChart(transformedData, {
      vars: { cx: 'date', cy: 'department', r: 'magnitude' },
      width: VISUALIZATION_CONFIG.map.width
    })

    const totalEarthquakes = transformedData.reduce((acc, region) =>
      acc + region.earthquakes.length, 0
    )
    console.log('Cantidad de datos en timeline Chart', totalEarthquakes)
    select('#vis-1')
      .append(() => timelineChart)
  } catch (error) {
    console.error('Error initializing visualization:', error)
  }
}

document.addEventListener('DOMContentLoaded', initializeVisualization)
