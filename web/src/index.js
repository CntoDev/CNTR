/*global fetch, console*/
import React from 'react'
import ReactDom from 'react-dom'
import SparkMD5 from 'spark-md5'

import { createPlayer } from './player.js'
import { createMapController } from './map/map.js'
import { App } from './components/app.js'

import { DEFAULT_STATE, MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js'

const {m: missionHash, t: startTime} = searchToDictionary(window.location.search)
const mapElement = document.querySelector('#map')
const appRootElement = document.querySelector('#root')


const initialState = {...DEFAULT_STATE}
const player = createPlayer()
const map = createMapController(mapElement, player, initialState)

;(function initCntr ({missionHash, startTime}) {
  return readIndices().then(({mapIndex, captureIndex}) => {
    const mission = captureIndex.find(entry => entry.hash === missionHash)
    const loadCaptureDialogOpen = !mission;

    ReactDom.render(
      <App initialState={{...initialState, loadCaptureDialogOpen, mission, startTime}}
           map={map}
           player={player}
           mapIndex={mapIndex}
           captureIndex={captureIndex}/>,
      appRootElement)
  })
    .catch(error => console.error(error))
}({missionHash, startTime}))

function parseCaptureIndex(content) {
  return content.split(/[\n\r]+/)
    .filter(line => line)
    .map(line => {
      const [worldName, missionName, duration, date, captureFileName] = line.split('\t')
      return {
        missionName,
        worldName,
        duration: Number.parseInt(duration),
        date: Number.parseInt(date),
        captureFileName,
      }
    })
}

function readIndices () {
  return Promise.all([
    fetch(MAP_INDEX_URL).then(response => response.json()),
    fetch(CAPTURE_INDEX_URL).then(response => response.text()).then(parseCaptureIndex),
  ]).then(([mapIndex, captureIndex]) => {
    addWorldDisplayName(mapIndex, captureIndex)
    addMissionHashes(captureIndex)
    return {mapIndex, captureIndex}
  })
}

function addWorldDisplayName (mapIndex, captureIndex) {
  captureIndex.forEach(entry => {
    const map = mapIndex.find(map => map.worldName.toLowerCase() === entry.worldName.toLowerCase())
    if (map) {
      entry.worldDisplayName = map.name
    } else {
      entry.worldDisplayName = entry.worldName + ' (!)'
    }
  })
}

function addMissionHashes (captureIndex) {
  captureIndex.forEach(entry => entry.hash = SparkMD5.hash(entry.captureFileName).substr(0, 8))
}

function searchToDictionary (search) {
  return search.substr(1)
    .split('&')
    .map(part => part.split('='))
    .reduce((object, [key, value]) => Object.assign(object, {[key]: value}), {})
}