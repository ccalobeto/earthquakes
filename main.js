// main.js - Entry point for the seismic data processing pipeline
import path from 'node:path'
import { loadConfig } from './config.js'
import { loadGeoData } from './src/data/loaders/geo-loader.js'
import { loadInstrumentalData, loadHistoricalData } from './src/data/loaders/csv-loader.js'
import { processInstrumentalData } from './src/processors/instrumental-processor.js'
import { processHistoricalData } from './src/processors/historical-processor.js'
import { mergeDatasets } from './src/processors/merger.js'
import { exportToCSV } from './src/exporters/csv-exporter.js'
// import { logger } from './src/utils/logger.js'

async function main () {
  try {
    // Load configuration
    const config = loadConfig()
    // logger.info('Configuration loaded successfully')

    // Load geographic data
    const { districts, departments } = await loadGeoData(config.geoDataPath)
    // logger.info('Geographic data loaded successfully')

    // Process coastal districts for distance calculations
    const { filterCoastalCentroids, calculateDistrictCentroids } = await import('./src/processors/geo-processor.js')
    const coastCentroids = filterCoastalCentroids(calculateDistrictCentroids(districts))
    // logger.info('Coastal centroids processed successfully')

    // Load and process instrumental data
    const rawInstrumentalData = await loadInstrumentalData(config.instrumentalDataPath)
    const processedInstrumentalData = processInstrumentalData(rawInstrumentalData)
    // logger.info(`Processed ${processedInstrumentalData.length} instrumental seismic events`)

    // Load and process historical data
    const rawHistoricalData = await loadHistoricalData(config.historicalDataPath)
    const processedHistoricalData = processHistoricalData(rawHistoricalData)
    // logger.info(`Processed ${processedHistoricalData.length} historical seismic events`)
    // Merge datasets and enrich with geographic information
    const mergedData = mergeDatasets(
      processedInstrumentalData,
      processedHistoricalData,
      districts,
      departments,
      coastCentroids
    )
    // logger.info(`Combined dataset contains ${mergedData.length} seismic events`)

    // Export the processed data
    const outputPath = path.resolve(config.outputPath)
    await exportToCSV(mergedData, outputPath)

    // logger.info(`Data successfully exported to: ${outputPath}`)
  } catch (error) {
    // logger.error('Error in data processing pipeline:', error)
    process.exit(1)
  }
}

main()
