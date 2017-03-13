import { parse } from './parser.js';
import { createPlayer } from './player.js';
import { createUiController } from './ui/ui.js';
import { createMapController } from './map/map.js';

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
    const player = createPlayer(frames, state);
    const playback = createPlayback(player, state, map);

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === header.worldName.toLowerCase());

    map.initialize(document.querySelector('#map'), worldInfo);

    window.frames = frames;
    window.state = state;
    window.player = player;
    window.playback = playback;
    window.map = map;
  });
}

function createPlayback(player, state, map) {

  let intervalHandle = null;

  return {
    start,
    pause,
    stop,
    goTo,
  };

  function start() {
    intervalHandle = setInterval(playFrame(), 1000);
  }

  function pause() {
    clearInterval(intervalHandle);
  }

  function stop() {
    pause();
    player.reset();
  }

  function goTo(frameIndex) {
    pause();
    player.goToFrame(frameIndex);
    start();
  }

  function playFrame() {
    player.playNextFrame();
    map.update(state);
  }

}

