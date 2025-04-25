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
import styles from './css/Visualization.module.css'

async function initializeVisualization () {
  try {
    // Load and transform data
    const [geoData, earthquakeData] = await Promise.all([
      json('/earthquakes/data/input/peru-100k.json'),
      csv('/earthquakes/data/output/output.csv').then(transformEarthquakeData)
    ])

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
      .fitSize([INNER_DIMENSIONS.width, INNER_DIMENSIONS.height], features)

    // Filter instrumental data and create map visualization
    const instrumentalData = filterInstrumentalData(earthquakeData)
    const depthScale = createDepthColorScale()

    const mapSvg = select('#vis')
      .append('svg')
      .attr('width', VISUALIZATION_CONFIG.map.width)
      .attr('height', VISUALIZATION_CONFIG.map.height)
      .attr('class', styles.map)

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

    // Add legends to map
    const maxRadius9 = calculateMagnitudeRadius(9)

    createCircleLegend(VISUALIZATION_CONFIG.legend.circle.magnitudes, {
      svg: mapSvg.append('g')
        .attr('class', styles.legendCircle)
        .attr('transform', `translate(0,${
          INNER_DIMENSIONS.height -
          2 * maxRadius9 -
          2 * VISUALIZATION_CONFIG.legend.barHeight -
          VISUALIZATION_CONFIG.legend.padding
        })`),
      scale: magnitude => calculateMagnitudeRadius(magnitude),
      title: 'Magnitude (M)'
    })

    createBarLegend({
      svg: mapSvg.append('g')
        .attr('class', styles.legendBar)
        .attr('transform', `translate(80,${
          INNER_DIMENSIONS.height -
          2 * VISUALIZATION_CONFIG.legend.barHeight
        })`),
      domain: VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.depth),
      range: VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.color),
      title: 'Depth (Km)'
    })

    // Create timeline visualization
    const transformedData = transformTimelineData(earthquakeData)
    const timelineChart = createTimelineChart(transformedData, {
      vars: { cx: 'date', cy: 'department', r: 'magnitude' },
      width: VISUALIZATION_CONFIG.map.width
    })

    select('#vis-1')
      .append(() => timelineChart)
  } catch (error) {
    console.error('Error initializing visualization:', error)
  }
}

document.addEventListener('DOMContentLoaded', initializeVisualization)
