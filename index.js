import { csv, json } from 'https://cdn.skypack.dev/d3-fetch@3'
import { timeParse } from "https://cdn.skypack.dev/d3-time-format@4"
import { format } from 'https://cdn.jsdelivr.net/npm/d3-format@3.1.0/+esm'
import { geoCentroid } from 'https://cdn.jsdelivr.net/npm/d3-geo@3/+esm'
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'
import rewind from 'https://cdn.jsdelivr.net/npm/@turf/rewind@6.5.0/+esm'
import { getCountyId, closestLocation, capitalizeWords, getPropertyName } from './src/calculations.js'

const formatNumber = format(".1f")
const pathInst = "./data/IGP_datos_sismicos.csv"
const pathHist = "./data/IGP_datos_sismicos-historical.csv"

const pe = await json("https://cdn.jsdelivr.net/npm/latam-atlas@0.0.4/files/peru-100k.json")

const districts = topojson.feature(pe, pe.objects.level4)
const departments = topojson.feature(pe, pe.objects.level2)

const districtCentroids = (featureCollect) => {
  const rewindDistricts = rewind(featureCollect, { reverse: true })
  const rewindDistrictsArray = rewindDistricts.features.map(feature => ({
    type: "Feature",
    id: feature.id,
    properties: {
      name: capitalizeWords(feature.properties.name)
    },
    geometry: {
      type: "Point",
      coordinates: geoCentroid(feature)
    }
  }))
  return ({
    type: "featureCollection",
    features: rewindDistrictsArray
  })
}

const coastDistrictCentroids = (featureCollection) => {
  // Ancash("02"), Arequipa("04"), Callao("07"), Ica("11"), La Libertad(13), Lambayeque("14"), Lima("15"), Moquegua("18"), Piura("20"), Tacna("23"), Tumbes("24")
  const shoreDepartments = ["02", "04", "07", "11", "13", "14", "15", "18", "20", "23", "24"]
  return ({
    type: "FeatureCollection",
    features: featureCollection.features.filter(
      item => shoreDepartments.includes(item.id.substring(0, 2)))
  })
}

const rawDataInst = await csv(pathInst).then(d => {
  const parseDate = timeParse("%d/%m/%Y")
  const parseTime = timeParse("%d/%m/%Y %H:%M:%S")
  const rs = r => r.slice(0, 8)
  return d.map((row, i) => ({
    eventId: i,
    utcDate: parseTime(row["fecha UTC"] + " " + rs(row["hora UTC"])),
    geometry: {
      type: "Point",
      coordinates: [+ row["longitud (º)"], + row["latitud (º)"]]
    },
    depth: + row["profundidad (km)"],
    magnitude: + row["magnitud (M)"],
    year: parseDate(row["fecha UTC"]).getUTCFullYear(),
    type: "Instrumental",
  })).sort((a, b) => a.utcDate - b.utcDate)
})

const rawDataHist = await csv(pathHist).then(d => {
  // the data was imported without types due expecial parse dates, magnitudes needed to remove special characters and filter the null dates before sorting. Then the max magnitude field was selected.
  // 0 km depth was assigned by default in case there was no depth in the observation.
  const parseTime = timeParse("%d/%m/%Y %H:%M:%S")
  const parseDate = timeParse("%d/%m/%Y")
  return d.map((r, i) => ({
    eventId: i,
    utcDate: parseTime(r["fecha UTC"] + " " + r["hora UTC"].slice(0, 7) + "1"),
    utcDate2: parseDate(r["fecha UTC"]),
    lat: + r["latitud (º)"],
    lon: + r["longitud (º)"],
    depth:
      r["profundidad (km)"].includes("-") ? +r["profundidad (km)"].replace(/[-]/g, "") : +r["profundidad (km)"],
    magnitude_mb:
      r["magnitud (mb)"].includes("-") ? +r["magnitud (mb)"].replace(/[-]/g, "") : +r["magnitud (mb)"],
    magnitude_ms:
      r["magnitud (Ms)"].includes("-") ? +r["magnitud (Ms)"].replace(/[-]/g, "") : +r["magnitud (Ms)"],
    magnitude_mw:
      r["magnitud (Mw)"].includes("-") ? +r["magnitud (Mw)"].replace(/[-]/g, "") : +r["magnitud (Mw)"],
  })).filter(d => d.utcDate !== null).sort((a, b) => a.utcDate - b.utcDate).map(d => ({
    eventId: d.eventId,
    utcDate: d.utcDate,
    geometry: {
      type: "Point",
      coordinates: [d.lon, d.lat]
    },
    depth: d.depth,
    magnitude: Math.max(d.magnitude_mb, d.magnitude_ms, d.magnitude_mw),
    year: d.utcDate2.getUTCFullYear(),
    type: "Historical",
  }))
})

const coastCentroids = coastDistrictCentroids(districtCentroids(districts))

const rawData = rawDataHist.concat(rawDataInst).map(d => ({
  ...d,
  id: !!getCountyId(districts.features, d.geometry.coordinates)
    ? getCountyId(districts.features, d.geometry.coordinates)
    : closestLocation(d.geometry.coordinates, coastCentroids).id,
  distanceFromCoast: !!getCountyId(districts.features, d.geometry.coordinates)
    ? 0
    : + formatNumber(closestLocation(d.geometry.coordinates, coastCentroids).distance),
})).map(d => ({
  ...d,
  department: capitalizeWords(getPropertyName(d.id.slice(0, 2), departments.features)),
  description: !isNaN(d.id)
    ? capitalizeWords(getPropertyName(d.id, districts.features))
    : NaN,
}))


// console.log('rawData: ', rawData)

// export the data
const data = rawData.map(d => ({
  ...d,
  lon: d.geometry.coordinates[0],
  lat: d.geometry.coordinates[1],
}))

const titleKeys = Object.keys(data[0])
const refinedData = []
refinedData.push(titleKeys)
data.forEach(item => {
  refinedData.push(Object.values(item))
})

let csvContent = ''
refinedData.forEach(row => {
  csvContent += row.join(',') + '\n'
})

const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
const objUrl = URL.createObjectURL(blob)
const link = document.createElement('a')
link.setAttribute('href', objUrl)
link.setAttribute('download', 'output.csv')
link.textContent = 'Click to Download'

document.querySelector('body').append(link)