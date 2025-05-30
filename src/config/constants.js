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
      { depth: 70, color: '#FF9457' },
      { depth: 300, color: '#CD4A00' },
      { depth: 700, color: '#8F451B' }
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
      left: 30
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

// reference for annotations https://d3-annotation.susielu.com/
export const mapAnnotations = [
  {
    note: {
      label: '70,000 muertos, 880,000 víctimas y 160,000 casas destruidas solo en Callejón de Huaylas.',
      title: 'Más Letal',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 20 // More = text lower

    },
    color: ['#2E5751'],
    x: 235,
    y: (INNER_DIMENSIONS.height - 280),
    dy: 10,
    dx: 60
  },
  {
    note: {
      label: '82 km de Ocoña: 65 muertos, 220,000 bajas y 24,500 casas destruidas.',
      title: 'Mas Poderoso',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 20 // More = text lower

    },
    color: ['#2E5751'],
    x: 713,
    y: (INNER_DIMENSIONS.height + 320),
    dy: 10,
    dx: 60
  }
]

export const timeLineAnnotations = [
  {
    note: {
      label: '8.4M Atico, Arequipa (2001)',
      title: 'Mas Poderoso desde 1960',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 10

    },
    color: ['#2E5751'],
    x: 1110,
    y: 35,
    dy: 250,
    dx: -2
  },
  {
    note: {
      label: '9.4M Ite, Tacna (1604)',
      title: 'Mas Poderoso en la Historia',
      wrap: 250, // try something smaller to see text split in several lines
      padding: 20 // More = text lower

    },
    color: ['#2E5751'],
    x: 510,
    y: 178,
    dy: 20,
    dx: -10
  }]
