export const VISUALIZATION_CONFIG = {
  // Map constants
  map: {
    width: 1200,
    height: 1200,
    margin: { top: 10, right: 30, bottom: 10, left: 80 },
    maxRadius: 1000,
    magnitudeThreshold: 5.5,
    historicalMagnitudeThreshold: 8,
    depthSegmentation: [
      { depth: 70, color: '#efedf5' },
      { depth: 300, color: '#bcbddc' },
      { depth: 700, color: '#756bb1' }
    ]
  },

  // Geographic regions
  regions: {
    Costa: [
      'Lima', 'Callao', 'Moquegua', 'Tacna', 'Lambayeque',
      'La Libertad', 'Ica', 'Piura', 'Tumbes', 'Ancash', 'Arequipa'
    ],
    Sierra: [
      'Cajamarca', 'San Martin', 'Huanuco', 'Pasco', 'Junin',
      'Ayacucho', 'Huancavelica', 'Apurimac', 'Cusco', 'Puno'
    ],
    Selva: [
      'Amazonas', 'Loreto', 'Madre De Dios', 'Ucayali'
    ]
  },

  // Legend configuration
  legend: {
    circle: {
      magnitudes: [9, 8, 7, 6, 5],
      domain: [0, 9],
      range: [0, 190]
    },
    barHeight: 40,
    padding: 15
  },

  // Timeline configuration
  timeline: {
    rowSize: 40,
    firstRowOffset: 0,
    leftPositionGridLine: 100,
    fontSizes: {
      labels: '12px',
      title: '15px',
      text: '14px',
      axis: '11px',
      header: '13px'
    },
    margins: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 0
    }
  }
}

// Computed constants
export const INNER_DIMENSIONS = {
  width: VISUALIZATION_CONFIG.map.width - VISUALIZATION_CONFIG.map.margin.left - VISUALIZATION_CONFIG.map.margin.right,
  height: VISUALIZATION_CONFIG.map.height - VISUALIZATION_CONFIG.map.margin.top - VISUALIZATION_CONFIG.map.margin.bottom
}

// Export margin constant for direct use
export const margin = VISUALIZATION_CONFIG.timeline.margins
