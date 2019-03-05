module.exports = {
  calculateMapImageTransform (
    viewportDimension,
    mapImageDimension,
    currentTransform,
    {
      position,
      distance,
      lastPosition,
      lastDistance
    }
  ) {
    const MINIMUM_SCALE = 0.2
    const MAXIMUM_SCALE = 5.0

    const newTransform = {
      offset: { x: 0, y: 0 },
      scale: 1
    }

    const displayDimension = {
      width: mapImageDimension.width * currentTransform.scale,
      height: mapImageDimension.height * currentTransform.scale
    }

    const imagePivot = {
      x: lastPosition.x - currentTransform.offset.x,
      y: lastPosition.y - currentTransform.offset.y
    }

    let scaleRatio = distance / lastDistance || 1

    newTransform.scale = currentTransform.scale * scaleRatio
    if (newTransform.scale > MAXIMUM_SCALE) {
      newTransform.scale = MAXIMUM_SCALE
      scaleRatio = newTransform.scale / currentTransform.scale
    } else if (newTransform.scale < MINIMUM_SCALE) {
      newTransform.scale = MINIMUM_SCALE
      scaleRatio = newTransform.scale / currentTransform.scale
    }
    displayDimension.width *= scaleRatio
    displayDimension.height *= scaleRatio
    imagePivot.x *= scaleRatio
    imagePivot.y *= scaleRatio

    newTransform.offset.x = position.x - imagePivot.x
    newTransform.offset.y = position.y - imagePivot.y

    if (displayDimension.width > viewportDimension.width) {
      if (newTransform.offset.x > 0) {
        newTransform.offset.x = 0
      }
      if (newTransform.offset.x < viewportDimension.width - displayDimension.width) {
        newTransform.offset.x = viewportDimension.width - displayDimension.width
      }
    } else {
      newTransform.offset.x = (viewportDimension.width - displayDimension.width) / 2
    }

    if (displayDimension.height > viewportDimension.height) {
      if (newTransform.offset.y > 0) {
        newTransform.offset.y = 0
      }
      if (newTransform.offset.y < viewportDimension.height - displayDimension.height) {
        newTransform.offset.y = viewportDimension.height - displayDimension.height
      }
    } else {
      newTransform.offset.y = (viewportDimension.height - displayDimension.height) / 2
    }

    return newTransform
  }
}
