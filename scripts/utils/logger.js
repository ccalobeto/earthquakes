/**
 * Logger utility for seismic data processing application
 *
 * Provides structured logging capabilities with different severity levels,
 * timestamp formatting, and flexible output options.
 *
 * @module utils/logger
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { format } from 'd3-format'

/**
 * Log levels with corresponding numeric values for filtering
 * @enum {number}
 */
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
}

/**
 * Maps log levels to their string representations
 * @type {Object}
 */
const LogLevelNames = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE'
}

/**
 * Default configuration for the logger
 * @type {Object}
 */
const DEFAULT_CONFIG = {
  level: LogLevel.INFO,
  outputToConsole: true,
  outputToFile: false,
  logFilePath: './logs/seismic-processor.log',
  formatTimestamp: true,
  includeContext: true
}

export class Logger {
  /**
   * Creates a new Logger instance
   * @param {Object} config - Logger configuration options
   * @param {number} config.level - Minimum log level to output
   * @param {boolean} config.outputToConsole - Whether to output logs to console
   * @param {boolean} config.outputToFile - Whether to output logs to file
   * @param {string} config.logFilePath - Path to log file
   * @param {boolean} config.formatTimestamp - Whether to include formatted timestamps
   * @param {boolean} config.includeContext - Whether to include context information
   */
  constructor (config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Create a buffer for logs that will be written to file
    this.logBuffer = []

    // Flag to track if the log directory has been created
    this.logDirCreated = false
  }

  /**
   * Formats a log entry with timestamp and contextual information
   * @private
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Additional contextual information
   * @returns {string} Formatted log entry
   */
  _formatLogEntry (level, message, context = {}) {
    const parts = []

    if (this.config.formatTimestamp) {
      const now = new Date()
      parts.push(`[${now.toISOString()}]`)
    }

    parts.push(`[${LogLevelNames[level]}]`)
    parts.push(message)

    if (this.config.includeContext && Object.keys(context).length > 0) {
      parts.push(JSON.stringify(context))
    }

    return parts.join(' ')
  }

  /**
   * Writes a log entry to console if enabled in config
   * @private
   * @param {number} level - Log level
   * @param {string} formattedMessage - Formatted log message
   */
  _writeToConsole (level, formattedMessage) {
    if (!this.config.outputToConsole) return

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedMessage)
        break
      default:
        console.log(formattedMessage)
    }
  }

  /**
   * Buffers a log entry for file output if enabled in config
   * @private
   * @param {string} formattedMessage - Formatted log message
   */
  _bufferForFile (formattedMessage) {
    if (!this.config.outputToFile) return
    this.logBuffer.push(formattedMessage)

    // Flush buffer if it reaches a certain size
    if (this.logBuffer.length >= 100) {
      this.flushLogs()
    }
  }

  /**
   * Creates log directory if it doesn't exist
   * @private
   * @returns {Promise<void>}
   */
  async _ensureLogDirectory () {
    if (this.logDirCreated) return

    try {
      const dirPath = path.dirname(this.config.logFilePath)
      await fs.mkdir(dirPath, { recursive: true })
      this.logDirCreated = true
    } catch (error) {
      console.error(`Failed to create log directory: ${error.message}`)
    }
  }

  /**
   * Writes buffered logs to file
   * @returns {Promise<void>}
   */
  async flushLogs () {
    if (!this.config.outputToFile || this.logBuffer.length === 0) return

    try {
      await this._ensureLogDirectory()

      const logContent = this.logBuffer.join('\n') + '\n'
      await fs.appendFile(this.config.logFilePath, logContent, 'utf8')

      // Clear the buffer after successful write
      this.logBuffer = []
    } catch (error) {
      console.error(`Failed to write logs to file: ${error.message}`)
    }
  }

  /**
   * Logs a message with the specified level
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {Object} [context={}] - Additional contextual information
   */
  log (level, message, context = {}) {
    // Skip if log level is higher than configured level
    if (level > this.config.level) return

    const formattedMessage = this._formatLogEntry(level, message, context)

    this._writeToConsole(level, formattedMessage)
    this._bufferForFile(formattedMessage)
  }

  /**
   * Logs an error message
   * @param {string} message - Error message
   * @param {Object} [context={}] - Additional contextual information
   */
  error (message, context = {}) {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * Logs a warning message
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional contextual information
   */
  warn (message, context = {}) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Logs an informational message
   * @param {string} message - Informational message
   * @param {Object} [context={}] - Additional contextual information
   */
  info (message, context = {}) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Logs a debug message
   * @param {string} message - Debug message
   * @param {Object} [context={}] - Additional contextual information
   */
  debug (message, context = {}) {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Logs a trace message
   * @param {string} message - Trace message
   * @param {Object} [context={}] - Additional contextual information
   */
  trace (message, context = {}) {
    this.log(LogLevel.TRACE, message, context)
  }

  /**
   * Creates a formatted logger for a specific module
   * @param {string} moduleName - Name of the module
   * @returns {Object} Module-specific logger functions
   */
  forModule (moduleName) {
    return {
      error: (message, context = {}) => this.error(`[${moduleName}] ${message}`, context),
      warn: (message, context = {}) => this.warn(`[${moduleName}] ${message}`, context),
      info: (message, context = {}) => this.info(`[${moduleName}] ${message}`, context),
      debug: (message, context = {}) => this.debug(`[${moduleName}] ${message}`, context),
      trace: (message, context = {}) => this.trace(`[${moduleName}] ${message}`, context)
    }
  }

  /**
   * Logs timing information for performance analysis
   * @param {string} label - Label for the timed operation
   * @param {Function} fn - Function to time
   * @returns {Promise<*>} Result of the timed function
   */
  async timeAsync (label, fn) {
    const startTime = process.hrtime.bigint()

    try {
      const result = await fn()
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds

      this.debug(`Timer [${label}] completed in ${format('.2f')(duration)}ms`)
      return result
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds

      this.error(`Timer [${label}] failed after ${format('.2f')(duration)}ms`, { error: error.message })
      throw error
    }
  }

  /**
   * Logs timing information for synchronous operations
   * @param {string} label - Label for the timed operation
   * @param {Function} fn - Function to time
   * @returns {*} Result of the timed function
   */
  time (label, fn) {
    const startTime = process.hrtime.bigint()

    try {
      const result = fn()
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds

      this.debug(`Timer [${label}] completed in ${format('.2f')(duration)}ms`)
      return result
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds

      this.error(`Timer [${label}] failed after ${format('.2f')(duration)}ms`, { error: error.message })
      throw error
    }
  }
}

/**
 * Creates and returns a preconfigured logger instance
 * @param {Object} [config={}] - Logger configuration options
 * @returns {Logger} Configured logger instance
 */
export function createLogger (config = {}) {
  return new Logger(config)
}

// Default logger instance with standard configuration
export default createLogger()
