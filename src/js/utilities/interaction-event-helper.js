module.exports = {
  getMousePosition (event) {
    return {
      x: event.clientX,
      y: event.clientY
    }
  },

  getTouchPosition (event) {
    let sumX = 0
    let sumY = 0
    for (const touch of event.touches) {
      sumX += touch.clientX
      sumY += touch.clientY
    }

    return {
      x: sumX / event.touches.length,
      y: sumY / event.touches.length
    }
  },

  getTouchDistance (event) {
    if (event.touches.length < 2) {
      return 0
    }

    return Math.sqrt(
      (event.touches[0].clientX - event.touches[1].clientX) ** 2 +
      (event.touches[0].clientY - event.touches[1].clientY) ** 2
    )
  },

  getWheelDistance (event) {
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
}
