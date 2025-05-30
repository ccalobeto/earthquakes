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
import { loadEarthquakeStats } from './utils/statsLoader.js'

// Import loading styles
import './styles/loading.css'

/**
 * Creates a loading indicator element in the specified container
 * @param {string} containerId - The ID of the container element
 * @param {string} message - The loading message to display
 */
function createLoadingIndicator (containerId, message) {
  const container = select(`#${containerId}`)

  const loadingContainer = container
    .append('div')
    .attr('class', 'loading-container')

  loadingContainer
    .append('div')
    .attr('class', 'loading-spinner')

  loadingContainer
    .append('div')
    .attr('class', 'loading-text')
    .text(message)

  return container
}

/**
 * Shows an error message in the specified container
 * @param {string} containerId - The ID of the container element
 * @param {string} message - The error message to display
 */
function showErrorMessage (containerId, message) {
  const container = select(`#${containerId}`)
  container.html('')

  container
    .append('div')
    .attr('class', 'error-message')
    .text(message)
}

async function initializeVisualization () {
  try {
    // Show loading indicators
    createLoadingIndicator('vis', 'Cargando mapa de sismos...')
    createLoadingIndicator('vis-1', 'Cargando línea de tiempo...')

    // Load and display earthquake statistics
    const stats = await loadEarthquakeStats()
    console.log('Earthquake statistics loaded', stats)

    // Load and transform data
    const [geoData, earthquakeData] = await Promise.all([
      json('/earthquakes/data/input/peru-100k.json'),
      csv('/earthquakes/data/output/output.csv').then(transformEarthquakeData)
    ])

    console.log('Cantidad de sismos', earthquakeData.length)
    console.log('Cantidad de sismos instrumentales', earthquakeData.filter(d => d.type === 'Instrumental').length)
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

    // Clear loading indicator and add map SVG
    select('#vis').html('')
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

    const totalEarthquakes = transformedData.reduce((acc, region) =>
      acc + region.earthquakes.length, 0
    )
    console.log('Cantidad de datos en timeline Chart', totalEarthquakes)

    // Clear loading indicator and add timeline SVG
    select('#vis-1').html('')
    const timelineSvg = select('#vis-1')
      .append('svg')

    createTimelineChart(transformedData, {
      svg: timelineSvg,
      vars: { cx: 'date', cy: 'department', r: 'magnitude' },
      width: VISUALIZATION_CONFIG.map.width
    })

    // select('#vis-1')
    //   .append(() => timelineChart)
  } catch (error) {
    console.error('Error initializing visualization:', error)
    showErrorMessage('vis', 'Error al cargar el mapa de sismos. Por favor, intente nuevamente.')
    showErrorMessage('vis-1', 'Error al cargar la línea de tiempo. Por favor, intente nuevamente.')
  }
}

document.addEventListener('DOMContentLoaded', initializeVisualization)
