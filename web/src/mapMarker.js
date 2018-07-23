function colorPicker(color) { 
	switch (color) {
    case "Default": return 'rgba(0,0,0,1)'
    case "ColorBlack": return 'rgba(0,0,0,1)'
    case "ColorGrey": return 'rgba(128,128,128,1)'
    case "ColorRed": return	 'rgba(230,0,0,1)'
    case "ColorBrown": return	'rgba(128,64,0,1)'
    case "ColorOrange": return  'rgba(217,102,0,1)'
    case "ColorYellow": return	'rgba(217,217,0,1)'
    case "ColorKhaki": return	'rgba(128,153,102,1)'
    case "ColorGreen": return	'rgba(0,204,0,1)'
    case "ColorBlue": return	'rgba(0,0,255,1)'
    case "ColorPink": return	'rgba(255,77,102,1)'
    case "ColorWhite": return	'rgba(255,255,255,255)'
    case "ColorWEST": return	'rgba(0,77,153,1)'
    case "ColorEAST": return	'rgba(128,0,0,1)'
    case "ColorGUER": return	'rgba(0,128,0,1)'
    case "ColorCIV": return	'rgba(102,0,128,1)'
    case "ColorUNKNOWN": return	'rgba(179,153,0,1)'
    case "colorBLUFOR": return	'rgba(0,77,153,1)'
    case "colorOPFOR": return	'rgba(128,0,0,1)'
    case "colorIndependent": return	'rgba(0,128,0,1)'
    case "colorCivilian": return	'rgba(102,0,128,1)'
    case "Color1_FD_F": return	'rgba(177,51,57,1)'
    case "Color2_FD_F": return	'rgba(173,191,131,1)'
    case "Color3_FD_F": return	'rgba(240,130,49,1)'
    case "Color4_FD_F": return	'rgba(103,139,155,1)'
    case "Color5_FD_F": return	'rgba(176,64,167,1)'
    default: return 'rgba(0,0,0,1)'
  }
}

function createBaseMarker ([, id, type, text, color, x, y, dir], frameIndex) {
  const markerColor = colorPicker(color)

  return {
    id,
    type,
    text,
    markerColor,
    hidden: false,
    frameIndex,
    pose: {
      x,
      y,
      dir,
    }
  };
}

export function createMarker (event, frameIndex) {
  return Object.assign(createBaseMarker(event, frameIndex))
}