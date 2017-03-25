import { OCAP_FORMAT_VERSION } from './constants.js'

export function parse (dataString) {
  console.time('parse')

  const [headerLine, ...frameLines] = dataString.split(/[\r\n]+/)

  const header = processHeader (headerLine)

  if (header.formatVersion !== OCAP_FORMAT_VERSION) throw new Error ('Incompatible OCAP format!')

  const frames = frameLines
    .map(line => line.split(';')
      .filter(entry => entry)
      .map(entry => entry.split(',')
        .map(processEntry)))

  console.timeEnd('parse')

  return {
    header,
    frames,
  }
}

function processHeader (headerString) {
  const [formatVersion, worldName, missionName, author, captureInterval] = headerString.split(',')
  return {
    formatVersion: Number.parseFloat(formatVersion),
    worldName,
    missionName,
    author,
    captureInterval: Number.parseInt(captureInterval),
  }
}

function processEntry (entry) {
  const number = Number.parseFloat(entry)
  return Number.isNaN(number) ? (entry === 'true' ? true : entry === 'false' ? false : entry) : number
}

