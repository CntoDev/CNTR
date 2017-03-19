/*global fetch*/
import React from 'react';
import ReactDom from 'react-dom';

import { parse } from './parser.js';
import { createPlayer } from './player.js';
import { createState } from './state.js';
import { createMapController } from './map/map.js';
import { createCaptureLoadDialog } from './ui/capture-load-dialog.js';
import { App } from './ui/ui.js';

import { DEFAULT_SETTINGS, MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js';

const settings = Object.assign({}, DEFAULT_SETTINGS);

const state = createState(settings);
const map = createMapController(document.querySelector('#map'), state, settings);
const player = createPlayer(state, settings);

(function initOcap() {

  ReactDom.render(<App settings={settings} map={map} state={state} player={player} />, document.querySelector('#root'));

  return readIndices()
      .then(([mapIndex, captureIndex]) => showLoadDialog(mapIndex, captureIndex))
      .catch(error => console.error(error));
}());

function readIndices() {
  return Promise.all([
    fetch(MAP_INDEX_URL).then(response => response.json()),
    fetch(CAPTURE_INDEX_URL).then(response => response.json()),
  ]);
}

function showLoadDialog(mapIndex, captureIndex) {

  const captureLoadDialog = createCaptureLoadDialog(document.querySelector('#modal'), captureIndex, handleSelectEntry);
  //document.querySelector('#openCaptureLoadDialog').addEventListener('click', () => captureLoadDialog.open());
  captureLoadDialog.initialize();
  captureLoadDialog.open();


  function handleSelectEntry(entry) {
    captureLoadDialog.close();
    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase());
    loadCaptureFile(entry.captureFilePath, worldInfo);
  }
}

function loadCaptureFile(captureFilePath, worldInfo) {
  return fetch(captureFilePath).then(response => response.text()).then(parse).then(({ frames }) => {
    state.reset();
    map.loadWorld(worldInfo);
    player.load(frames);
    player.reset();
  });
}
