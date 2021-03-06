const _setPos = L.Marker.prototype._setPos

L.SvgIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: '',
    className: '',
    classList: [],
  },

  createIcon () {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.classList.add(...this.options.classList, 'leaflet-marker-icon')
    svg.style.width = this.options.iconSize[0] + 'px'
    svg.style.height = this.options.iconSize[1] + 'px'
    const iconAnchor = this.options.iconAnchor || [this.options.iconSize[0] / 2, this.options.iconSize[1] / 2]

    svg.style.marginLeft = (-iconAnchor[0]) + 'px'
    svg.style.marginTop = (-iconAnchor[1]) + 'px'

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.options.iconUrl)

    svg.appendChild(use)
    svg.style[L.DomUtil.TRANSFORM + 'Origin'] = 'center'

    this.icon = svg

    return svg
  },

  createShadow () {
    return null
  },

})

L.svgIcon = function (options) {
  return new L.SvgIcon(options)
}

L.Marker.include({

  _setPos (pos) {
    _setPos.call(this, pos)

    if (this.shouldRotate) {
      this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)'
    }
  },

  setRotationAngle (angle) {
    this.shouldRotate = this.options.rotationAngle !== angle
    if (this.shouldRotate) {
      this.options.rotationAngle = angle
    }
    return this
  },

  setClasses (newClasses) {
    Object.keys(newClasses).forEach(className => {
      if (this._classes[className] !== newClasses[className]) {
        this._classes[className] = newClasses[className]
        this._icon.classList.toggle(className, newClasses[className])
      }
    })
  },
})

L.Marker.addInitHook(function () {
  this._classes = {}
  this.options.rotationOrigin = 'center'
  this.options.rotationAngle = this.options.rotationAngle || 0
})
