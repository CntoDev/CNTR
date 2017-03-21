export function parse (dataString) {
  const [headerData, ...frames] = dataString.split(/[\r\n]+/)
    .map(line => line.split(';').filter(entry => entry)
      .map(entry => entry.split(',')
        .map(processEntry)))

  return {
    header: processHeaderData(headerData),
    frames,
  }
}

function processHeaderData (data) {
  const [worldName, missionName, author, captureInterval] = data[0]
  return {
    worldName,
    missionName,
    author,
    captureInterval,
  }
}

function processEntry (entry) {
  const number = Number.parseFloat(entry)
  return Number.isNaN(number) ? (entry === 'true' ? true : entry === 'false' ? false : entry) : number
}
