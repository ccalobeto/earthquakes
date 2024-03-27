import { polygonContains } from 'https://cdn.jsdelivr.net/npm/d3-polygon@3.0.1/+esm'
import turfdistance from 'https://cdn.jsdelivr.net/npm/@turf/distance@6.5.0/+esm'

import turfhelpers from 'https://cdn.jsdelivr.net/npm/@turf/helpers@6.5.0/+esm'

export function capitalizeWords(str) {
  // str is a string with uppercase by default
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0) + txt.substr(1).toLowerCase();
  });
}
export function getPropertyName(fips, features) {
  const map = new Map(features.map(d => [d.id, d.properties.name]))
  return map.get(fips)
}

export function getCountyId(features, point) {
  // ref https://stackoverflow.com/questions/71272770/using-d3-to-retrieve-a-topojson-u-s-county-from-coordinates
  const n = features.length
  if (point) {
    for (let i = 0; i < n; i++) {
      const geometry = features[i].geometry
      // treat Polygon as MultiPolygon
      for (const coordinates of geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.coordinates) {
        if (polygonContains(coordinates[0], point)) {
          return features[i].id
        }
      }
    }
    return NaN
  }
}

export function closestLocation(target, data) {
  // return the distance in kilometers
  let closestDistance = Infinity;
  let closestFeature = null

  // Iterate over each feature and calculate the closest distance to the two coordinates
  var point = turfhelpers.point([-75.343, 39.984]);
  data.features.forEach(feature => {
    const distance = turfdistance(point, feature, { units: 'kilometers' })
    closestFeature = closestDistance < distance ? closestFeature : feature
    closestDistance = Math.min(closestDistance, distance)
  })

  return ({
    ...closestFeature,
    distance: closestDistance
  })
}