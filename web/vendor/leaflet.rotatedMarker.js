(function () {
  // save these original methods before they are overwritten
  const proto_initIcon = L.Marker.prototype._initIcon;
  const proto_setPos = L.Marker.prototype._setPos;

  L.Marker.addInitHook(function () {
    this.options.rotationOrigin = 'center';
    this.options.rotationAngle = this.options.rotationAngle || 0;
  });

  L.Marker.include({
    _initIcon: function () {
      proto_initIcon.call(this);
    },

    _setPos: function (pos) {
      proto_setPos.call(this, pos);

      if (this.options.rotationAngle) {
        this._icon.style[L.DomUtil.TRANSFORM + 'Origin'] = this.options.rotationOrigin;

        this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
      }
    },

    setRotationAngle: function (angle) {
      this.options.rotationAngle = angle;
      //this.update(); // We handle this in our own playback loop instead
      return this;
    },

    setRotationOrigin: function (origin) {
      this.options.rotationOrigin = origin;
      //this.update();
      return this;
    }
  });
})();
