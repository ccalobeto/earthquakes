// geo-validator.js - Validation functions for geographic data

/**
 * Validates geographic data structure
 * @param {Object} geoData - The TopoJSON geographic data object
 * @throws {Error} If data doesn't meet validation requirements
 */
export function validateGeoData (geoData) {
  if (!geoData || typeof geoData !== 'object') {
    throw new Error('Geographic data must be a valid object')
  }

  // Check for required TopoJSON structure
  if (!geoData.objects) {
    throw new Error('Geographic data missing "objects" property')
  }

  // Check for required geographic levels
  const requiredLevels = ['level2', 'level4']
  const missingLevels = requiredLevels.filter(level => !(level in geoData.objects))

  if (missingLevels.length > 0) {
    throw new Error(`Geographic data missing required levels: ${missingLevels.join(', ')}`)
  }

  // Check for valid topology
  if (!geoData.arcs || !Array.isArray(geoData.arcs)) {
    throw new Error('Geographic data has invalid topology structure')
  }

  console.log('Geographic data validation passed')
}

/**
 * Validates a GeoJSON feature collection
 * @param {Object} featureCollection - GeoJSON feature collection
 * @throws {Error} If the feature collection is invalid
 */
export function validateFeatureCollection (featureCollection) {
  if (!featureCollection || typeof featureCollection !== 'object') {
    throw new Error('Feature collection must be a valid object')
  }

  if (featureCollection.type !== 'FeatureCollection' && featureCollection.type !== 'GeometryCollection') {
    throw new Error(`Invalid feature collection type: ${featureCollection.type}`)
  }

  if (!Array.isArray(featureCollection.features)) {
    throw new Error('Feature collection missing features array')
  }

  if (featureCollection.features.length === 0) {
    console.log('Feature collection contains no features')
  }

  console.log('Feature collection validation passed')
}
