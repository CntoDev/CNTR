export function createEventListController() {
  return {
    addEvent,
    removeEvent,
    filterEvents,
    toggle,
  };
}

function toggle() {
  if (this.rightPanel.style.display == "none") {
    this.rightPanel.style.display = "initial";
  } else {
    this.rightPanel.style.display = "none";
  }
}

function filterEvents() {

}

function removeEvent(event) {
  var el = event.element;

  // Remove element if not already removed
  if (el.parentNode != null) {
    this.eventList.removeChild(el);
  }
}

function addEvent(event) {
  var el = event.element;

  // Add element if not already added
  if (el.parentNode == null) {
    this.eventList.insertBefore(el, this.eventList.childNodes[0]);

    // Fade element in if occured on current frame
    if (event.frameNum != playbackFrame) {
      el.className = "liEvent reveal";
    } else {
      el.className = "liEvent";
      setTimeout(() => {
        el.className = "liEvent reveal";
      }, 100);
    }
  }

  this.filterEvent(event);
}


function filterEvent(event) {
  var el = event.element;
  var filterText = this.filterEventsInput.value.toLowerCase();

  var isHitEvent = (event.type == "hit");

  //if (filterText == "") {return};

  //TODO: Use .textContent instead of .innerHTML for increased performance
  if (isHitEvent && !this.showHitEvents) {
    el.style.display = "none";
  } else if (el.innerHTML.toLowerCase().includes(filterText)) {
    el.style.display = "inherit";
    //console.log("Matches filter (" + filterText + ")");
  } else {
    el.style.display = "none";
  }
}
