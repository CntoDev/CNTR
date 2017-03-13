L.SvgIcon = L.Icon.extend({
	options: {
		iconUrl: '',
		className: '',
    classList: [],
	},

	createIcon: function () {
		const svg = Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {});
    svg.classList.add(...this.options.classList, 'leaflet-marker-icon');
    svg.style.width = this.options.iconSize[0];
    svg.style.height = this.options.iconSize[1];

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const xlinkns = "http://www.w3.org/1999/xlink";
    use.setAttributeNS(xlinkns, 'href', this.options.iconUrl);

    svg.appendChild(use);

		return svg;
	},

	createShadow: function () {
		return null;
	},

});

L.svgIcon = function (options) {
	return new L.SvgIcon(options);
};
