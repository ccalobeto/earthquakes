/**
 * File utilities for seismic data processing
 * Handles file system operations and path management
 */

import fs from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
export async function fileExists (filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure
 * @returns {Promise<boolean>} True if successful
 */
export async function ensureDirectoryExists (dirPath) {
  try {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
    return true
  } catch (error) {
    console.error(`Directory creation error: ${error.message}`)
    throw error
  }
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object>} Parsed JSON object
 */
export async function readJsonFile (filePath) {
  try {
    const exists = await fileExists(filePath)
    if (!exists) {
      throw new Error(`File not found: ${filePath}`)
    }

    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`JSON file read error: ${error.message}`)
    throw error
  }
}

/**
 * Reads a file to a Buffer
 * @param {string} filePath - Path to file
 * @returns {Promise<Buffer>} File contents as Buffer
 */
export async function readFileToBuffer (filePath) {
  try {
    const exists = await fileExists(filePath)
    if (!exists) {
      throw new Error(`File not found: ${filePath}`)
    }

    return await fs.readFile(filePath)
  } catch (error) {
    console.error(`File read error: ${error.message}`)
    throw error
  }
}

/**
 * Gets the relative path from the project root
 * @param {string} absolutePath - Absolute path to convert
 * @returns {string} Relative path from project root
 */
export function getRelativePath (absolutePath) {
  try {
    const projectRoot = process.cwd()
    return path.relative(projectRoot, absolutePath)
  } catch (error) {
    console.error(`Path conversion error: ${error.message}`)
    return absolutePath
  }
}

/**
 * Resolves a path relative to the project root
 * @param {string} relativePath - Path relative to project root
 * @returns {string} Absolute path
 */
export function resolveProjectPath (relativePath) {
  try {
    const projectRoot = process.cwd()
    return path.resolve(projectRoot, relativePath)
  } catch (error) {
    console.error(`Path resolution error: ${error.message}`)
    return relativePath
  }
}

/**
 * Writes data to a file, creating directories if needed
 * @param {string} filePath - Path to write to
 * @param {string|Buffer} data - Data to write
 * @returns {Promise<boolean>} True if successful
 */
export async function writeFile (filePath, data) {
  try {
    await ensureDirectoryExists(path.dirname(filePath))
    await fs.writeFile(filePath, data)
    return true
  } catch (error) {
    console.error(`File write error: ${error.message}`)
    throw error
  }
}

/**
 * Validates that all required input files exist
 * @param {Array<string>} filePaths - Array of file paths to check
 * @returns {Promise<Object>} Validation result with missing files
 */
export async function validateInputFiles (filePaths) {
  const missingFiles = []

  try {
    for (const filePath of filePaths) {
      const exists = await fileExists(filePath)
      if (!exists) {
        missingFiles.push(filePath)
      }
    }

    return {
      isValid: missingFiles.length === 0,
      missingFiles
    }
  } catch (error) {
    console.error(`Input file validation error: ${error.message}`)
    return {
      isValid: false,
      missingFiles,
      error: error.message
    }
  }
}
