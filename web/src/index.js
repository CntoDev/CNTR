import { parse } from './parser.js';
import { createPlayer } from './player.js';
import { createUiController } from './ui/ui.js';
import { createMapController } from './map/map.js';

const mapIndexUrl = "images/maps/maps.json";
const captureIndexUrl = "data/index.json";

const map = createMapController(document.querySelector('#map'));
const {
  eventList,
  unitList,
  modalDialogs,
  playbackWidget,
} = createUiController(document.querySelector('#ui'));

(function initOcap() {
  return Promise.all([
    fetch(mapIndexUrl).then(response => response.json()),
    fetch(captureIndexUrl).then(response => response.json()),
  ]).then(([mapIndex, captureIndex]) => {

    return loadCaptureFile(captureIndex[0].file);

  }).catch(error => console.error(error));
}());

// Read operation JSON data and create unit objects
function loadCaptureFile(captureFilePath) {
  return fetch(captureFilePath).then(response => response.text()).then(parse).then(({ header, frames }) => {

    const state = {
      entities: [],
      events: [],
      shots: [],
    };

    const player = createPlayer(frames, state);
    const playbackControl = createPlaybackControl(player);

  });
}

function createPlaybackControl(player, map, update) {

  let interval = null;

  return {
    start() {

    },
    pause() {

    },
    stop() {
      player.reset();
    },
    goTo() {

    }
  };

}