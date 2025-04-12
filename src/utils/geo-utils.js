/**
 * Geo-related utility functions for processing geographic data and calculations
 * Used primarily for seismic data processing in Peru
 */

import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { distance } from '@turf/distance'

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The input string to be capitalized
 * @returns {string} The string with each word capitalized
 * @throws {TypeError} If input is not a string
 */
export function capitalizeWords (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string')
  }

  if (!str) return ''

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Gets the ID of the county/district that contains the given coordinates
 * @param {Array} features - Array of GeoJSON features representing districts
 * @param {Array} coordinates - [longitude, latitude] coordinates
 * @returns {string|null} The ID of the containing district or null if not found
 * @throws {TypeError} If inputs are invalid
 */
export function getCountyId (features, coordinates) {
  if (!Array.isArray(features) || !Array.isArray(coordinates)) {
    throw new TypeError('Invalid input: features must be an array and coordinates must be an array [lon, lat]')
  }

  if (coordinates.length !== 2 ||
      typeof coordinates[0] !== 'number' ||
      typeof coordinates[1] !== 'number') {
    throw new TypeError('Coordinates must be an array of two numbers [longitude, latitude]')
  }

  const point = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    }
  }

  // Find the feature that contains the point
  for (const feature of features) {
    try {
      if (booleanPointInPolygon(point, feature)) {
        return feature.id
      }
    } catch (error) {
      console.warn(`Error checking point in polygon for feature ${feature.id}:`, error)
    }
  }

  return null
}

/**
 * Finds the closest location from a collection to the given coordinates
 * @param {Array} coordinates - [longitude, latitude] coordinates
 * @param {Object} featureCollection - GeoJSON FeatureCollection of points
 * @returns {Object} The closest feature and its distance in kilometers
 * @throws {TypeError} If inputs are invalid
 * @throws {Error} If featureCollection has no features
 */
export function closestLocation (coordinates, featureCollection) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new TypeError('Coordinates must be an array [longitude, latitude]')
  }

  if (!featureCollection || !featureCollection.features || !Array.isArray(featureCollection.features)) {
    throw new TypeError('Invalid feature collection')
  }

  if (featureCollection.features.length === 0) {
    throw new Error('Feature collection has no features')
  }

  const point = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    }
  }

  let closestFeature = null
  let minDistance = Infinity

  for (const feature of featureCollection.features) {
    try {
      const dist = distance(point, feature)
      if (dist < minDistance) {
        minDistance = dist
        closestFeature = feature
      }
    } catch (error) {
      console.warn(`Error calculating distance for feature ${feature.id}:`, error)
    }
  }

  if (!closestFeature) {
    throw new Error('Failed to find closest location')
  }

  return {
    id: closestFeature.id,
    distance: minDistance,
    feature: closestFeature
  }
}

/**
 * Gets the property name from a feature by ID
 * @param {string} id - The ID to search for
 * @param {Array} features - Array of GeoJSON features
 * @param {string} propertyName - The property to return (default: 'name')
 * @returns {string|null} The property value or null if not found
 * @throws {TypeError} If inputs are invalid
 */
export function getPropertyName (id, features, propertyName = 'name') {
  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new TypeError('ID must be a string or number')
  }

  if (!Array.isArray(features)) {
    throw new TypeError('Features must be an array')
  }

  if (typeof propertyName !== 'string') {
    throw new TypeError('Property name must be a string')
  }

  const feature = features.find(f => f.id === id || f.id === String(id))

  if (!feature || !feature.properties || !feature.properties[propertyName]) {
    return null
  }

  return feature.properties[propertyName]
}

/**
 * Creates district centroids from a feature collection
 * @param {Object} featureCollection - GeoJSON FeatureCollection
 * @returns {Object} FeatureCollection of centroid points
 * @throws {TypeError} If input is invalid
 */
export function createDistrictCentroids (featureCollection) {
  if (!featureCollection || !featureCollection.features || !Array.isArray(featureCollection.features)) {
    throw new TypeError('Invalid feature collection')
  }

  const { geoCentroid } = require('d3-geo')
  const rewind = require('@turf/rewind').default

  try {
    const rewindDistricts = rewind(featureCollection, { reverse: true })

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
    throw new Error(`Failed to create district centroids: ${error.message}`)
  }
}

/**
 * Filters district centroids to only include coastal regions
 * @param {Object} featureCollection - GeoJSON FeatureCollection of centroids
 * @returns {Object} FeatureCollection of coastal centroids
 * @throws {TypeError} If input is invalid
 */
export function filterCoastalDistricts (featureCollection) {
  if (!featureCollection || !featureCollection.features || !Array.isArray(featureCollection.features)) {
    throw new TypeError('Invalid feature collection')
  }

  // Ancash("02"), Arequipa("04"), Callao("07"), Ica("11"), La Libertad(13),
  // Lambayeque("14"), Lima("15"), Moquegua("18"), Piura("20"), Tacna("23"), Tumbes("24")
  const coastalDepartments = ['02', '04', '07', '11', '13', '14', '15', '18', '20', '23', '24']

  return {
    type: 'FeatureCollection',
    features: featureCollection.features.filter(
      item => item.id && coastalDepartments.includes(item.id.substring(0, 2))
    )
  }
}
