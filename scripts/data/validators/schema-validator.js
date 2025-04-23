/**
 * Schema validation utilities for seismic data processing
 * Ensures data integrity and provides standardized validation mechanisms
 */

/**
 * Validates geographic data structure and properties
 * @param {Object} geoData - The geographic data to validate
 * @returns {Object} Validation result with success flag and errors
 */
export function validateGeoData (geoData) {
  const errors = []

  // Check if geoData is an object
  if (!geoData || typeof geoData !== 'object') {
    return {
      success: false,
      errors: ['Geographic data must be a valid object']
    }
  }

  // Check required properties for TopoJSON format
  if (!geoData.type) {
    errors.push('Missing "type" property in geographic data')
  } else if (geoData.type !== 'Topology') {
    errors.push(`Invalid geographic data type: expected "Topology", got "${geoData.type}"`)
  }

  // Check objects property
  if (!geoData.objects || typeof geoData.objects !== 'object') {
    errors.push('Missing or invalid "objects" property in geographic data')
  } else {
    // Validate required geographical levels
    const requiredLevels = ['level2', 'level4']
    for (const level of requiredLevels) {
      if (!geoData.objects[level]) {
        errors.push(`Missing required geographical level: "${level}"`)
      }
    }
  }

  // Check if arcs property exists and is an array
  if (!Array.isArray(geoData.arcs)) {
    errors.push('Missing or invalid "arcs" property in geographic data')
  }

  return {
    success: errors.length === 0,
    errors
  }
}

/**
 * Validates seismic CSV data column structure
 * @param {Array} headers - CSV headers array
 * @param {string} dataType - Type of seismic data ('instrumental' or 'historical')
 * @returns {Object} Validation result with success flag and errors
 */
export function validateSeismicDataHeaders (headers, dataType) {
  const errors = []

  if (!Array.isArray(headers)) {
    return {
      success: false,
      errors: ['Headers must be an array']
    }
  }

  // Define required fields for each data type
  const requiredFields = {
    instrumental: [
      'fecha UTC',
      'hora UTC',
      'latitud (º)',
      'longitud (º)',
      'profundidad (km)',
      'magnitud (M)'
    ],
    historical: [
      'fecha UTC',
      'hora UTC',
      'latitud (º)',
      'longitud (º)',
      'profundidad (km)',
      'magnitud (mb)',
      'magnitud (Ms)',
      'magnitud (Mw)'
    ]
  }

  // Check if dataType is valid
  if (!requiredFields[dataType]) {
    return {
      success: false,
      errors: [`Invalid data type: ${dataType}. Must be either 'instrumental' or 'historical'`]
    }
  }

  // Check for required fields
  for (const field of requiredFields[dataType]) {
    if (!headers.includes(field)) {
      errors.push(`Missing required field: "${field}" for ${dataType} data`)
    }
  }

  return {
    success: errors.length === 0,
    errors
  }
}

/**
 * Validates a single seismic data row
 * @param {Object} row - Data row object
 * @param {string} dataType - Type of seismic data ('instrumental' or 'historical')
 * @returns {Object} Validation result with success flag, errors, and cleaned data
 */
export function validateSeismicDataRow (row, dataType) {
  const errors = []
  const cleanedData = { ...row }

  // Define required fields and their validators
  const fieldValidators = {
    instrumental: {
      'fecha UTC': (val) => validateDateField(val, errors, 'fecha UTC'),
      'hora UTC': (val) => validateTimeField(val, errors, 'hora UTC'),
      'latitud (º)': (val) => validateCoordinate(val, errors, 'latitud (º)', -90, 90),
      'longitud (º)': (val) => validateCoordinate(val, errors, 'longitud (º)', -180, 180),
      'profundidad (km)': (val) => validateNumericField(val, errors, 'profundidad (km)', 0),
      'magnitud (M)': (val) => validateNumericField(val, errors, 'magnitud (M)', 0)
    },
    historical: {
      'fecha UTC': (val) => validateDateField(val, errors, 'fecha UTC'),
      'hora UTC': (val) => validateTimeField(val, errors, 'hora UTC'),
      'latitud (º)': (val) => validateCoordinate(val, errors, 'latitud (º)', -90, 90),
      'longitud (º)': (val) => validateCoordinate(val, errors, 'longitud (º)', -180, 180),
      'profundidad (km)': (val) => validateDepthWithSpecialChar(val, errors, 'profundidad (km)'),
      'magnitud (mb)': (val) => validateMagnitudeWithSpecialChar(val, errors, 'magnitud (mb)'),
      'magnitud (Ms)': (val) => validateMagnitudeWithSpecialChar(val, errors, 'magnitud (Ms)'),
      'magnitud (Mw)': (val) => validateMagnitudeWithSpecialChar(val, errors, 'magnitud (Mw)')
    }
  }

  // Check if dataType is valid
  if (!fieldValidators[dataType]) {
    return {
      success: false,
      errors: [`Invalid data type: ${dataType}`],
      data: cleanedData
    }
  }

  // Validate each field
  const validators = fieldValidators[dataType]
  for (const [field, validator] of Object.entries(validators)) {
    if (row[field] === undefined || row[field] === null) {
      errors.push(`Missing field: ${field}`)
    } else {
      cleanedData[field] = validator(row[field])
    }
  }

  return {
    success: errors.length === 0,
    errors,
    data: cleanedData
  }
}

/**
 * Validates a processed seismic event object
 * @param {Object} event - Processed seismic event
 * @returns {Object} Validation result with success flag and errors
 */
export function validateProcessedEvent (event) {
  const errors = []

  // Required fields for a processed event
  const requiredFields = [
    'eventId', 'utcDate', 'geometry', 'depth', 'magnitude', 'year', 'type'
  ]

  // Check for required fields
  for (const field of requiredFields) {
    if (event[field] === undefined) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate geometry
  if (event.geometry) {
    if (event.geometry.type !== 'Point') {
      errors.push('Geometry must be of type "Point"')
    }

    if (!Array.isArray(event.geometry.coordinates) ||
        event.geometry.coordinates.length !== 2 ||
        typeof event.geometry.coordinates[0] !== 'number' ||
        typeof event.geometry.coordinates[1] !== 'number') {
      errors.push('Geometry coordinates must be an array of two numbers [longitude, latitude]')
    }
  }

  // Validate numeric fields
  if (event.depth !== undefined && (isNaN(event.depth) || event.depth < 0)) {
    errors.push('Depth must be a non-negative number')
  }

  if (event.magnitude !== undefined && (isNaN(event.magnitude) || event.magnitude < 0)) {
    errors.push('Magnitude must be a non-negative number')
  }

  // Validate date
  if (event.utcDate && !(event.utcDate instanceof Date) && isNaN(new Date(event.utcDate).getTime())) {
    errors.push('utcDate must be a valid date')
  }

  // Validate type
  if (event.type && !['Instrumental', 'Historical'].includes(event.type)) {
    errors.push('Type must be either "Instrumental" or "Historical"')
  }

  return {
    success: errors.length === 0,
    errors
  }
}

/**
 * Helper function to validate a date field
 * @private
 */
function validateDateField (value, errors, fieldName) {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  if (!dateRegex.test(value)) {
    errors.push(`Invalid date format for ${fieldName}: ${value}. Expected format: DD/MM/YYYY`)
    return value
  }

  // Additional validation could be added here (valid month/day ranges, etc.)
  return value
}

/**
 * Helper function to validate a time field
 * @private
 */
function validateTimeField (value, errors, fieldName) {
  const timeRegex = /^\d{2}:\d{2}:\d{2}$/

  if (!timeRegex.test(value)) {
    errors.push(`Invalid time format for ${fieldName}: ${value}. Expected format: HH:MM:SS`)
    return value
  }

  return value
}

/**
 * Helper function to validate a coordinate field
 * @private
 */
function validateCoordinate (value, errors, fieldName, min, max) {
  let numValue

  if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    errors.push(`Invalid type for ${fieldName}: ${typeof value}. Expected number or string.`)
    return value
  }

  if (isNaN(numValue)) {
    errors.push(`Invalid value for ${fieldName}: ${value}. Expected a number.`)
    return value
  }

  if (numValue < min || numValue > max) {
    errors.push(`Value out of range for ${fieldName}: ${numValue}. Expected between ${min} and ${max}.`)
  }

  return numValue
}

/**
 * Helper function to validate a numeric field
 * @private
 */
function validateNumericField (value, errors, fieldName, min = null) {
  let numValue

  if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    errors.push(`Invalid type for ${fieldName}: ${typeof value}. Expected number or string.`)
    return value
  }

  if (isNaN(numValue)) {
    errors.push(`Invalid value for ${fieldName}: ${value}. Expected a number.`)
    return value
  }

  if (min !== null && numValue < min) {
    errors.push(`Value out of range for ${fieldName}: ${numValue}. Expected >= ${min}.`)
  }

  return numValue
}

/**
 * Helper function to validate a depth field with special character handling
 * @private
 */
function validateDepthWithSpecialChar (value, errors, fieldName) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    errors.push(`Invalid type for ${fieldName}: ${typeof value}. Expected number or string.`)
    return value
  }

  const strValue = String(value)
  const cleanValue = strValue.includes('-')
    ? strValue.replace(/[-]/g, '')
    : strValue

  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    errors.push(`Invalid value for ${fieldName}: ${value}. Expected a number or '-' placeholder.`)
    return value
  }

  if (numValue < 0) {
    errors.push(`Value out of range for ${fieldName}: ${numValue}. Expected >= 0.`)
  }

  return numValue
}

/**
 * Helper function to validate a magnitude field with special character handling
 * @private
 */
function validateMagnitudeWithSpecialChar (value, errors, fieldName) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    errors.push(`Invalid type for ${fieldName}: ${typeof value}. Expected number or string.`)
    return value
  }

  const strValue = String(value)
  const cleanValue = strValue.includes('-')
    ? strValue.replace(/[-]/g, '')
    : strValue

  const numValue = parseFloat(cleanValue)

  if (isNaN(numValue)) {
    errors.push(`Invalid value for ${fieldName}: ${value}. Expected a number or '-' placeholder.`)
    return value
  }

  return numValue
}
