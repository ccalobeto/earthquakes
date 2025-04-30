import * as d3 from 'd3'

/**
 * Loads earthquake statistics from JSON and updates the DOM
 */
export const loadEarthquakeStats = async () => {
  try {
    // Use d3.json to fetch the statistics data
    const stats = await d3.json('/earthquakes/data/input/earthquakes-stats.json')

    // Update the DOM elements with the loaded statistics
    d3.select('#total-earthquakes')
      .text(d3.format(',')(stats.totalEarthquakes))

    d3.select('#modern-recorded')
      .text(d3.format(',')(stats.modernInstrumentRecorded))

    d3.select('#high-magnitude-count')
      .text(stats.highMagnitudeEvents)

    d3.select('#recent-high-magnitude')
      .text(d3.format(',')(stats.recentHighMagnitude))

    d3.select('#most-recent-event')
      .text(stats.mostRecentEvent)

    d3.select('#most-recent-year')
      .text(stats.mostRecentEvent.substring(0, 4))

    return stats
  } catch (error) {
    console.error('Error loading earthquake statistics:', error)
    // Display error message in the statistics elements
    const errorElements = [
      '#total-earthquakes',
      '#modern-recorded',
      '#high-magnitude-count',
      '#recent-high-magnitude'
    ]

    errorElements.forEach(selector => {
      d3.select(selector).text('Error loading data')
    })

    throw error
  }
}
