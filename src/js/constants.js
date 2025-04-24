export const circleLegendArr = [
  9,
  8,
  7,
  6,
  5
]

export const regions = ({
  Coast: ['Lima y Callao', 'Moquegua', 'Tacna', 'Lambayeque', 'La Libertad', 'Ica', 'Piura', 'Tumbes', 'Ancash', 'Arequipa'],
  Mountains: ['Cajamarca', 'San Martin', 'Huanuco', 'Pasco', 'Junin', 'Ayacucho', 'Huancavelica', 'Apurimac', 'Cusco', 'Puno'],
  Jungle: ['Amazonas', 'Loreto', 'Madre De Dios', 'Ucayali']
})

export const segmentation = [
  { depth: 70, color: '#efedf5' },
  { depth: 300, color: '#bcbddc' },
  { depth: 700, color: '#756bb1' }
]

export const margin = { top: 10, right: 30, bottom: 10, left: 80 }
export const width = 1200
export const height = 1800
export const innerWidth = width - margin.left - margin.right
export const innerHeight = height - margin.top - margin.bottom
export const maxRadius = 1000
export const magnitude = 5.5
