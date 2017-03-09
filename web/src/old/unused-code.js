
var followColour = "#FFA81A";
var hitColour = "#FF0000";
var deadColour = "#000000";

function goFullscreen() {
  var element = document.getElementById("container");
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/*	getMarkerEditableGroup() {
 let doc = this._marker.getElement().contentDocument;
 return doc.getElementById("editable");
 };

 setMarkerColour(colour) {
 let g = this.getMarkerEditableGroup();

 // May be null if not loaded yet
 if (g != null) {
 g.style.fill = colour;
 };
 };*/

function createInitialMarkers() {
  /*	setTimeout(function() {
   let svg = marker.getElement().contentDocument;
   let g = svg.getElementById("layer1");
   console.log();

   g.setAttribute('fill', 'yellow');
   }, 100);*/
}

/*		// We pause playback while zooming to prevent icon visual glitches
 if (!playbackPaused) {
 playbackPaused = true;
 setTimeout(function() {
 playbackPaused = false;
 }, 250);
 };*/


/*		if (event.type == "hit") {
 if (this.showHitEvents) {
 el.style.display = "inherit";
 } else {
 el.style.display = "none";
 };
 };*/



// Add buttons
/*		var playButton = document.createElement("div");
 playButton.className = "modalButton";
 playButton.textContent = "Play";
 var cancelButton = document.createElement("div");
 cancelButton.className = "modalButton";
 cancelButton.textContent = "Cancel";
 var hideModal = this.hideModal;
 cancelButton.addEventListener("click", function() {
 this.hideModal();
 });

 this.modalButtons.appendChild(cancelButton);
 this.modalButtons.appendChild(playButton);



showCursorTooltip(text) {
  let tooltip = this.cursorTooltip;
  tooltip.textContent = text;
  tooltip.className = "cursorTooltip";

  // Attach text to cursor. Remove after timeout
  mapDiv.addEventListener("mousemove", this._moveCursorTooltip);
  setTimeout(() => {
    tooltip.className = "cursorTooltip hidden";

    // Remove listener once opacity transition ended
    tooltip.addEventListener("transitionend", () => {
      mapDiv.removeEventListener("mousemove", this._moveCursorTooltip);
    });
  }, 2500);
  console.log(this.cursorTooltip);
};

_moveCursorTooltip(event) {
  ui.cursorTooltip.style.transform = `translate3d(${event.pageX}px, ${event.pageY}px, 0px)`;
};

 */

// Add vehicle name tooltip on marker hover
/*		let markerEl = this.marker.element;
 markerEl.addEventListener("mouseover", (event) => {
 ui.cursorTargetBox.textContent = this.name;
 ui.showCursorTooltip(this.name);
 });*/

function test() {
  // Add marker to map on click
  map.on("click", function(e) {
    //console.log(e.latlng);
    console.log(map.project(e.latlng, mapMaxNativeZoom));
    var marker = L.circleMarker(e.latlng).addTo(map);
    marker.setRadius(5);
  });

  var marker = L.circleMarker(armaToLatLng([2438.21,820])).addTo(map);
  marker.setRadius(5);

  var marker = L.circleMarker(armaToLatLng([2496.58,5709.34])).addTo(map);
  marker.setRadius(5);
};

function goFullscreen() {
  var element = document.getElementById("container");
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/*
 ui.setMissionName(header.missionName);
 ui.setMissionEndTime(events.length);

 initMap(worlds.find(world => world.worldName.toLowerCase() == header.worldName.toLowerCase()), header.worldName);
 toggleHitEvents(false);
 startPlaybackLoop();
 ui.hideModal();
 */


//modalDialogs.showMissionSelectionDialog(mapIndex);
//window.addEventListener("keypress", event => event.charCode === 32 && event.preventDefault());
