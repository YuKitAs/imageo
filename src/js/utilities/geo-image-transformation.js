const math = require('mathjs')

function buildTransformation (samples) {
  if (samples.length < 2) {
    return null
  } else if (samples.length === 2) {
    return buildWithTwoSamples(samples)
  } else {
    return buildWithMoreSamples(samples)
  }
}

function buildWithTwoSamples (samples) {
  const pImage1 = [samples[0].imageCoord.x, -samples[0].imageCoord.y]
  const pImage2 = [samples[1].imageCoord.x, -samples[1].imageCoord.y]

  const pGeo1 = [samples[0].geoCoord.long, samples[0].geoCoord.lat]
  const pGeo2 = [samples[1].geoCoord.long, samples[1].geoCoord.lat]

  return function (newGeoCoord) {
    const pNewGeo = [newGeoCoord.long, newGeoCoord.lat]
    const pNewImage = math.add(
      pImage1,
      math.dotMultiply(
        math.dotDivide(
          math.subtract(pNewGeo, pGeo1),
          math.subtract(pGeo2, pGeo1)
        ),
        math.subtract(pImage2, pImage1)
      )
    )

    return { x: pNewImage[0], y: -pNewImage[1] }
  }
}

function buildWithMoreSamples (samples) {
  return buildWithTwoSamples(samples)
}

module.exports = {
  buildTransformation
}
