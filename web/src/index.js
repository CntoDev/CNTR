/*global fetch*/
import React from 'react';
import ReactDom from 'react-dom';

import { parse } from './parser.js';
import { createPlayer } from './player.js';
import { createState } from './state.js';
import { createMapController } from './map/map.js';
import { createCaptureLoadDialog } from './ui/capture-load-dialog.js';
import { OcapUi } from './ui/ui.js';

import { MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js';

const state = createState();
const map = createMapController(document.querySelector('#map'), state);
//const unitList = createUnitList(document.querySelector('#unitList'), state);
const player = createPlayer(state);
//const playback = createPlaybackWidget(document.querySelector('#playbackWidget'), player);

(function initOcap() {
  ReactDom.render(<OcapUi map={map} state={state} player={player} />, document.querySelector('#ui'));

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
