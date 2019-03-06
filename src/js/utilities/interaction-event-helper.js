function getMousePosition (event) {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

function getWheelDistance (event) {
  const PIXEL_SCALE_RATIO = 0.2
  const LINE_SCALE_RATIO = PIXEL_SCALE_RATIO * 150
  const PAGE_SCALE_RATIO = PIXEL_SCALE_RATIO * 900

  switch (event.deltaMode) {
    case 0x00:
      return -event.deltaY * PIXEL_SCALE_RATIO
    case 0x01:
      return -event.deltaY * LINE_SCALE_RATIO
    case 0x02:
      return -event.deltaY * PAGE_SCALE_RATIO
    default:
      return 1
  }
}

function getTouchPosition (event) {
  const touches = event.type === 'touchend'
    ? event.changedTouches
    : event.touches

  let sumX = 0
  let sumY = 0
  for (const touch of touches) {
    sumX += touch.clientX
    sumY += touch.clientY
  }

  return {
    x: sumX / touches.length,
    y: sumY / touches.length
  }
}

function getTouchDistance (event) {
  const touches = event.type === 'touchend'
    ? event.changedTouches
    : event.touches

  if (touches.length < 2) {
    return 0
  }

  return Math.sqrt(
    (touches[0].clientX - touches[1].clientX) ** 2 +
    (touches[0].clientY - touches[1].clientY) ** 2
  )
}

module.exports = {
  getMousePosition,
  getWheelDistance,
  getTouchPosition,
  getTouchDistance
}
