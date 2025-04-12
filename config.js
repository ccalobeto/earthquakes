import path from 'node:path'

const DEFAULT_CONFIG = {
  geoDataPath: path.join(process.cwd(), 'data/input/peru-100k.json'),
  instrumentalDataPath: path.join(process.cwd(), 'data/IGP_datos_sismicos.csv'),
  historicalDataPath: path.join(process.cwd(), 'data/IGP_datos_sismicos-historical.csv'),
  outputPath: path.join(process.cwd(), 'data/output/output.csv'),
  logLevel: 'info',
  numberFormat: '.1f'
}

/**
 * Loads configuration settings from environment variables or defaults
 * @returns {Object} Configuration object with all required settings
 */
export function loadConfig () {
  return {
    ...DEFAULT_CONFIG,
    geoDataPath: process.env.GEO_DATA_PATH || DEFAULT_CONFIG.geoDataPath,
    instrumentalDataPath: process.env.INSTRUMENTAL_DATA_PATH || DEFAULT_CONFIG.instrumentalDataPath,
    historicalDataPath: process.env.HISTORICAL_DATA_PATH || DEFAULT_CONFIG.historicalDataPath,
    outputPath: process.env.OUTPUT_PATH || DEFAULT_CONFIG.outputPath,
    logLevel: process.env.LOG_LEVEL || DEFAULT_CONFIG.logLevel
  }
}
