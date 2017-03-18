import { parse } from './parser.js';
import { createPlayer } from './player.js';
import { createUiController } from './ui/ui.js';
import { createMapController } from './map/map.js';
import { createPlaybackWidget } from './ui/playback-widget.js';
import { createUnitList } from './unit-list.js';

import { MAP_INDEX_URL, CAPTURE_INDEX_URL } from './constants.js';

const {
  eventList,
  unitList,
  modalDialogs,
  playbackWidget,
} = createUiController(document.querySelector('#ui'));

(function initOcap() {
  return readIndices()
      .then(([mapIndex, captureIndex]) => loadCaptureFile(captureIndex[0].file, mapIndex))
      .catch(error => console.error(error));
}());

function readIndices() {
  return Promise.all([
    fetch(MAP_INDEX_URL).then(response => response.json()),
    fetch(CAPTURE_INDEX_URL).then(response => response.json()),
  ]);
}

function loadCaptureFile(captureFilePath, mapIndex) {
  return fetch(captureFilePath).then(response => response.text()).then(parse).then(({ header, frames }) => {

    const state = {
      entities: [],
      events: [],
      shots: [],
    };

    const map = createMapController();
    const unitList = createUnitList(document.querySelector('#unitList'), map);
    const player = createPlayer(frames, state, map, unitList);
    const playback = createPlaybackWidget(document.querySelector('#playbackWidget'), player);

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === header.worldName.toLowerCase());

    map.initialize(document.querySelector('#map'), worldInfo);

    player.goTo(0);
    map.update(state);
    playback.initialize();

    window.frames = frames;
    window.state = state;
    window.player = player;
    window.playback = playback;
    window.map = map;
  });
}
