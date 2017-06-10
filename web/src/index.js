/*global fetch, console*/
import React from 'react'
import ReactDom from 'react-dom'

import { createPlayer } from './player.js'
import { createMapController } from './map/map.js'
import { App } from './components/app.js'

import { DEFAULT_STATE, MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js'

const mapElement = document.querySelector('#map')
const appRootElement = document.querySelector('#root')

const initialState = {...DEFAULT_STATE}
const player = createPlayer()
const map = createMapController(mapElement, player, initialState)

;(function initCntr () {
  return readIndices().then(([mapIndex, captureIndex]) => ReactDom.render(
    <App initialState={initialState}
         map={map}
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
