// Entry point for the seismic data processing pipeline
import path from 'node:path'
import { loadConfig } from './config.js'
import { loadGeoData } from './data/loaders/geo-loader.js'
import { loadInstrumentalData, loadHistoricalData } from './data/loaders/csv-loader.js'
import { processInstrumentalData } from './processors/instrumental-processor.js'
import { processHistoricalData } from './processors/historical-processor.js'
import { mergeDatasets } from './processors/merger.js'
import { exportToCSV } from './exporters/csv-exporter.js'
import { filterCoastalCentroids, calculateDistrictCentroids } from './processors/geo-processor.js'
import { addGeoBoundsValidation } from './processors/geo-validator.js'

async function main () {
  try {
    // Load configuration
    const config = loadConfig()
    console.log('Configuration loaded successfully')

    // Load geographic data
    const { districts, departments } = await loadGeoData(config.geoDataPath)
    console.log('Geographic data loaded successfully')

    // Process coastal districts for distance calculations
    const coastCentroids = filterCoastalCentroids(calculateDistrictCentroids(districts))
    console.log('Coastal centroids processed successfully')

    // Load and process instrumental data
    const rawInstrumentalData = await loadInstrumentalData(config.instrumentalDataPath)
    const processedInstrumentalData = processInstrumentalData(rawInstrumentalData)
    console.log(`Processed ${processedInstrumentalData.length} instrumental seismic events`)

    // Load and process historical data
    const rawHistoricalData = await loadHistoricalData(config.historicalDataPath)
    const processedHistoricalData = processHistoricalData(rawHistoricalData)
    console.log(`Processed ${processedHistoricalData.length} historical seismic events`)
    // Merge datasets and enrich with geographic information
    const mergedData = mergeDatasets(
      processedInstrumentalData,
      processedHistoricalData,
      districts,
      departments,
      coastCentroids
    )
    console.log(`Combined dataset contains ${mergedData.length} seismic events`)

    // Add geoBounds validation
    let validatedData = addGeoBoundsValidation(mergedData)

    // Calculate and log validation stats
    const stats = {
      total: validatedData.length,
      inBounds: validatedData.filter(d => d.geoInBounds === 'Yes').length,
      outOfBounds: validatedData.filter(d => d.geoInBounds === 'No').length
    }
    console.log('Geographic bounds validation stats:', stats)

    // Filter out records outside Peru's geographic bounds
    console.log('Filter out records outside Peru bounds')
    validatedData = validatedData.filter(record => record.geoInBounds === 'Yes')

    // Export the processed data
    const outputPath = path.resolve(config.outputPath)
    await exportToCSV(validatedData, outputPath)

    console.log(`Data successfully exported to: ${outputPath}`)
  } catch (error) {
    console.log('Error in data processing pipeline:', error)
    process.exit(1)
  }
}

main()
