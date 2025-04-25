import { csv, json } from 'd3-fetch'
import { select } from 'd3-selection'
import { group } from 'd3-array'
import { geoIdentity } from 'd3-geo'
import { scaleThreshold } from 'd3-scale'
import { timeParse } from 'd3-time-format'
import * as topojson from 'topojson-client'

import { VISUALIZATION_CONFIG, INNER_DIMENSIONS } from '../config/constants.js'
import { createMapChart } from '../components/MapChart.js'
import { createTimelineChart } from '../components/TimelineChart.js'
import { createCircleLegend, createBarLegend } from '../components/Legend.js'
import { makeResponsive, calculateResponsiveRadius } from '../utils/responsiveness.js'
import { getRegionFromCategories } from '../utils/formatters.js'
import styles from '../css/Visualization.module.css'

async function initializeVisualization () {
  try {
    const [geoData, earthquakeData] = await Promise.all([
      json('/earthquakes/data/input/peru-100k.json'),
      csv('/earthquakes/data/output/output.csv').then(data => data.map(row => ({
        eventId: +row.eventId,
        utcDate: row.utcDate,
        geometry: {
          type: 'Point',
          coordinates: [+row.lon, +row.lat]
        },
        depth: +row.depth,
        magnitude: +row.magnitude,
        year: +row.year,
        type: row.type,
        id: row.id,
        distanceFromCoast: +row.distanceFromCoast,
        department: row.department,
        description: row.description
      })))
    ])

    const piscoEarthquake = earthquakeData.find(d => d.magnitude >= 7.8 && d.year === 2007)
    if (piscoEarthquake) {
      piscoEarthquake.distanceFromCoast = '40'
      piscoEarthquake.department = 'Ica'
      piscoEarthquake.description = 'Pisco'
    }

    const instrumentalData = earthquakeData.filter(
      d => d.type === 'Instrumental' && d.magnitude >= VISUALIZATION_CONFIG.map.magnitudeThreshold
    )

    const features = topojson.feature(geoData, geoData.objects.level2)
    const departments = topojson.feature(geoData, geoData.objects.level2)
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([INNER_DIMENSIONS.width, INNER_DIMENSIONS.height], features)

    const depthScale = scaleThreshold()
      .domain(VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.depth))
      .range(VISUALIZATION_CONFIG.map.depthSegmentation.map(d => d.color))

    const mapSvg = select('#vis')
      .append('svg')
      .attr('width', VISUALIZATION_CONFIG.map.width)
      .attr('height', VISUALIZATION_CONFIG.map.height)
      .call(makeResponsive)
      .attr('class', styles.map)

    createMapChart(instrumentalData, {
      svg: mapSvg,
      projection,
      feature: features,
      border: departments,
      colorScale: depthScale,
      colorBy: 'depth',
      radiusScale: magnitude => calculateResponsiveRadius(magnitude, {
        maxRadius: VISUALIZATION_CONFIG.map.maxRadius
      }),
      radiusBy: 'magnitude'
    })

    const maxRadius9 = calculateResponsiveRadius(9, {
      maxRadius: VISUALIZATION_CONFIG.map.maxRadius
    })

    createCircleLegend(VISUALIZATION_CONFIG.legend.circle.magnitudes, {
      svg: mapSvg.append('g')
        .attr('class', styles.legendCircle)
        .attr('transform', `translate(0,${
          INNER_DIMENSIONS.height -
          2 * maxRadius9 -
          2 * VISUALIZATION_CONFIG.legend.barHeight -
          VISUALIZATION_CONFIG.legend.padding
        })`),
      scale: magnitude => calculateResponsiveRadius(magnitude, {
        maxRadius: VISUALIZATION_CONFIG.map.maxRadius
      }),
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

    const timelineData = earthquakeData
      .filter(d => d.magnitude >= 7)
      .map((d, i) => {
        const parseDate = timeParse('%a %b %d %Y %H:%M:%S')
        return {
          eventId: i,
          year: d.year,
          magnitude: d.magnitude,
          department: d.department === 'Lima' || d.department === 'Callao'
            ? 'Lima y Callao'
            : d.department,
          date: parseDate(d.utcDate.slice(0, 24)),
          type: d.type
        }
      })
      .map(d => ({
        ...d,
        region: getRegionFromCategories(VISUALIZATION_CONFIG.regions, d.department)
      }))

    const vars = {
      cx: 'date',
      cy: 'department',
      r: 'magnitude'
    }

    const transformedData = Array.from(
      group(timelineData, d => d.region, d => d.department)
    ).map(d => ({
      region: d[0],
      departments: Array.from(d[1])
        .map(d2 => ({
          department: d2[0],
          earthquakes: d2[1],
          count: d2[1].length
        }))
        .sort((a, b) => b.count - a.count),
      earthquakes: Array.from(d[1])
        .map(e => e[1])
        .flat()
    }))

    const timelineChart = createTimelineChart(transformedData, {
      vars,
      width: VISUALIZATION_CONFIG.map.width
    })

    select('#vis-1')
      .append(() => timelineChart)
      .call(makeResponsive)
  } catch (error) {
    console.error('Error initializing visualization:', error)
  }
}

document.addEventListener('DOMContentLoaded', initializeVisualization)
