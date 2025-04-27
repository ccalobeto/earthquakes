import { validatePeruCoordinates } from './geo-processor.js'

/**
 * Adds geoInBounds field to merged seismic data
 * @param {Array} mergedData - The merged seismic dataset
 * @returns {Array} Dataset with geoInBounds field added
 */
export function addGeoBoundsValidation (mergedData) {
  if (!Array.isArray(mergedData)) {
    throw new Error('Invalid merged data: Expected an array')
  }

  return mergedData.map(record => ({
    ...record,
    geoInBounds: validatePeruCoordinates([record.geometry.coordinates[0], record.geometry.coordinates[1]]) ? 'Yes' : 'No'
  }))
}
