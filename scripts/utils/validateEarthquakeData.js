import { readFileSync } from 'fs'
import { findOutOfBoundsRecords, printInvalidRecords } from './validateGeoBounds.js'
import * as d3 from 'd3'

try {
  // Read earthquake data from CSV file
  const rawData = readFileSync('./public/data/output/output.csv', 'utf8')

  // Parse CSV using d3
  const earthquakeData = d3.csvParse(rawData, d => ({
    eventId: d.eventId,
    latitude: +d.lat, // Convert to number using +
    longitude: +d.lon,
    depth: +d.depth,
    magnitude: +d.magnitude,
    id: d.id,
    department: d.department,
    year: +d.year
  }))

  const invalidRecords = findOutOfBoundsRecords(earthquakeData)
  printInvalidRecords(invalidRecords)
} catch (error) {
  console.error('Error validating earthquake data:', error)
  process.exit(1)
}
