const initIcon = L.Marker.prototype._initIcon;

L.SvgIcon = L.Icon.extend({
	options: {
    iconSize: [16, 16],
		iconUrl: '',
		className: '',
    classList: [],
	},

	createIcon: function () {
		const svg = Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {});
    svg.classList.add(...this.options.classList, 'leaflet-marker-icon');
    svg.style.width = this.options.iconSize[0];
    svg.style.height = this.options.iconSize[1];
    const iconAnchor = this.options.iconAnchor || [this.options.iconSize[0] / 2, this.options.iconSize[1] / 2];

    svg.style.marginLeft = (-iconAnchor[0]) + 'px';
    svg.style.marginTop  = (-iconAnchor[1]) + 'px';

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS("http://www.w3.org/1999/xlink", 'href', this.options.iconUrl);

    svg.appendChild(use);

    this.icon = svg;

		return svg;
	},

	createShadow: function () {
		return null;
	},

});

L.svgIcon = function (options) {
	return new L.SvgIcon(options);
};

L.Marker.include({
  setClasses (classes) {
    Object.keys(classes).forEach(className => this._icon.classList.toggle(className, classes[className]));
  }
});
