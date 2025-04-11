// geo-processor.js - Geographic processing functions
import rewind from '@turf/rewind'
import { geoCentroid } from 'd3-geo'
import { capitalizeWords } from '../utils/string-utils.js'
import { logger } from '../utils/logger.js'

/**
 * Generates district centroids from a feature collection
 * @param {Object} featureCollection - GeoJSON feature collection
 * @returns {Object} Feature collection of district centroids
 */
export function districtCentroids (featureCollection) {
  logger.debug('Generating district centroids')

  try {
    // Ensure polygon winding order is correct for geospatial operations
    const rewindDistricts = rewind(featureCollection, { reverse: true })

    // Create centroid for each district
    const rewindDistrictsArray = rewindDistricts.features.map(feature => ({
      type: 'Feature',
      id: feature.id,
      properties: {
        name: capitalizeWords(feature.properties.name)
      },
      geometry: {
        type: 'Point',
        coordinates: geoCentroid(feature)
      }
    }))

    return {
      type: 'FeatureCollection',
      features: rewindDistrictsArray
    }
  } catch (error) {
    logger.error('Error generating district centroids:', error)
    throw new Error(`Failed to generate district centroids: ${error.message}`)
  }
}

/**
 * Filters centroids to include only coastal districts
 * @param {Object} featureCollection - GeoJSON feature collection of centroids
 * @returns {Object} Feature collection of coastal district centroids
 */
export function coastalCentroids (featureCollection) {
  logger.debug('Filtering coastal district centroids')

  try {
    // Department codes for coastal regions
    // Ancash("02"), Arequipa("04"), Callao("07"), Ica("11"), La Libertad(13),
    // Lambayeque("14"), Lima("15"), Moquegua("18"), Piura("20"), Tacna("23"), Tumbes("24")
    const shoreDepartments = ['02', '04', '07', '11', '13', '14', '15', '18', '20', '23', '24']

    // Filter centroids by department code (first 2 characters of ID)
    const coastalFeatures = featureCollection.features.filter(
      item => shoreDepartments.includes(item.id.substring(0, 2))
    )

    logger.debug(`Identified ${coastalFeatures.length} coastal districts`)

    return {
      type: 'FeatureCollection',
      features: coastalFeatures
    }
  } catch (error) {
    logger.error('Error filtering coastal centroids:', error)
    throw new Error('Failed to filter coastal centr')
  }
}
