/*global fetch, console*/
import React from 'react'
import ReactDom from 'react-dom'

import { createPlayer } from './player.js'
import { createState } from './state.js'
import { createMapController } from './map/map.js'
import { App } from './components/app.js'

import { DEFAULT_SETTINGS, MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js'

const mapElement = document.querySelector('#map')
const appRootElement = document.querySelector('#root')

const settings = Object.assign({}, DEFAULT_SETTINGS)
const state = createState(settings)
const map = createMapController(mapElement, state, settings)
const player = createPlayer(state, settings)

;(function initOcap () {
  return readIndices().then(([mapIndex, captureIndex]) => ReactDom.render(
    <App settings={settings}
         map={map}
         state={state}
         player={player}
         mapIndex={mapIndex}
         captureIndex={captureIndex}/>,
    appRootElement))
    .catch(error => console.error(error))
}())

function readIndices () {
  return Promise.all([
    fetch(MAP_INDEX_URL).then(response => response.json()),
    fetch(CAPTURE_INDEX_URL).then(response => response.json()),
  ])
}
