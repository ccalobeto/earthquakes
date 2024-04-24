export const segmentation = ([
  { depth: 70, color: '#efedf5' },
  { depth: 300, color: '#bcbddc' },
  { depth: 700, color: '#756bb1' }
])

export const maxRadius = 1000
export const magnitude = 5.5
export const histMagnitude = 8
export const aspectRatio = 3 / 2
export const width = 1100
export const height = aspectRatio * width
export const circleLegendArr = [7, 8, 9]
export const margin = ({ top: 20, right: 20, bottom: 20, left: 0 })
export const innerWidth = width - margin.left - margin.right
export const innerHeight = height - margin.top - margin.bottom
export const regions = ({
  Coast: ['Lima y Callao', 'Moquegua', 'Tacna', 'Lambayeque', 'La Libertad', 'Ica', 'Piura', 'Tumbes', 'Ancash', 'Arequipa'],
  Mountains: ['Cajamarca', 'San Martin', 'Huanuco', 'Pasco', 'Junin', 'Ayacucho', 'Huancavelica', 'Apurimac', 'Cusco', 'Puno'],
  Jungle: ['Amazonas', 'Loreto', 'Madre De Dios', 'Ucayali']
})
