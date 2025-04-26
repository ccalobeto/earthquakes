/**
 * Validates earthquake coordinates against Peru's geographic bounds
 * @param {Array} earthquakeData - Array of earthquake records
 * @returns {Array} Invalid records that fall outside Peru's latitude bounds
 */
export const findOutOfBoundsRecords = (earthquakeData) => {
  // Peru's approximate latitude bounds
  const PERU_BOUNDS = {
    minLat: -18.5, // Southernmost point (near Tacna)
    maxLat: -0.0 // Northernmost point (near Loreto)
  }

  return earthquakeData.filter(record => {
    const latitude = parseFloat(record.latitude)

    // Check if latitude is outside Peru's bounds
    return latitude < PERU_BOUNDS.minLat || latitude > PERU_BOUNDS.maxLat
  })
}

/**
 * Prints invalid records to console in table format
 * @param {Array} invalidRecords - Array of records outside bounds
 */
export const printInvalidRecords = (invalidRecords) => {
  if (invalidRecords.length === 0) {
    console.log('No records found outside Peru\'s geographic bounds')
    return
  }

  console.log(`Found ${invalidRecords.length} records outside Peru's bounds:`)
  console.table(invalidRecords.map(record => ({
    year: record.year,
    eventId: record.eventId,
    department: record.department,
    latitude: record.latitude,
    longitude: record.longitude,
    magnitude: record.magnitude,
    depth: record.depth
  })))
}
