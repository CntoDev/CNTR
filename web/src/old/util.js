export function armaToLatLng(coords, map) {
  const pixelCoords = [(coords[0]*multiplier)+trim, (imageSize-(coords[1]*multiplier))+trim];
  return map.unproject(pixelCoords, mapMaxNativeZoom);
}

export function dateToLittleEndianString(date) {
  return (date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear());
}

export function dateToTimeString(date) {
  return date.toISOString().slice(11,19);
}

export function secondsToTimeString(seconds) {
  const mins =  Math.round(seconds / 60);

  if (mins < 60) {
    let minUnit = (mins > 1 ? "mins" : "min");

    return `${mins} ${minUnit}`;
  } else {
    let hours = Math.floor(mins/60);
    let remainingMins = mins % 60;
    let hourUnit = (hours > 1 ? "hrs" : "hr");
    let minUnit = (remainingMins > 1 ? "mins" : "min");

    return `${hours} ${hourUnit}, ${remainingMins} ${minUnit}`;
  }
}

