
// Should not be instantiated directly. Intended only to be used as extender class
class Entity {
  constructor(startFrameNum, id, name, positions, marker) {
    this.id = id;
    this.name = name;
    this.marker = marker;
    this.element = null; // DOM element associated with this entity
    this.alive = false;
    this.side = '';

    this._positions = positions; // pos, dir, alive

    this.iconType = icons.unknown;
    this._realIcon = icons.unknown.dead;
    this._curIcon = icons.unknown.dead;

    this._sideColour = "#000000";
    this._markerRotationOrigin = "50% 50%";
    this._popupClassName = "";
    this._startFrameNum = startFrameNum;
  };

  updatePose(long, lat, rotation) {

  }

  initialize(map) {
    this.marker.addTo(map);
  }

  // Correct index by taking into account startFrameNum.
  // e.g. If requested frame is 31, and entity startFrameNum is 30,
  // then relative frame index is 1 (31-30).
  // If relative index is < 0, then entity doesn't exist yet
  getRelativeFrameIndex(f) {
    return (f - this._startFrameNum);
  };

  getPosAtFrame(f) {
    f = this.getRelativeFrameIndex(f);

    var notExistYet = f < 0; // Unit doesn't exist yet
    var notExistAnymore = f >= (this._positions.length-1); // Unit dead/doesn't exist anymore
    if (notExistYet || notExistAnymore) {
      return;
    } else {
      return this._positions[f].position;
    };
  };

  // Manage entity at given frame
  manageFrame(f) {
    f = this.getRelativeFrameIndex(f);

    if (this.isFrameOutOfBounds(f)) { // Entity does not exist on frame
      this.marker.hide();
    } else { // Entity does exist on frame
      this._updateAtFrame(f);
    };
  };

  // Get LatLng at specific frame
  getLatLngAtFrame(f) {
    var pos = this.getPosAtFrame(f);
    if (pos != null) {return armaToLatLng(pos)};
    return;
  };

  // Get LatLng at current frame
  getLatLng() {
    return this.getLatLngAtFrame(playbackFrame);
  };

  _createPopup(content) {
    let popup = L.popup({
      autoPan: false,
      autoClose: false,
      closeButton: false,
      className: this._popupClassName
    });
    popup.setContent(content);
    return popup;
  };

  createMarker(latLng) {
    let marker = L.marker(latLng).addTo(map);
    marker.setIcon(this._realIcon);
    marker.setRotationOrigin(this._markerRotationOrigin);
    this.marker = marker;
  };

  setMarkerIcon(icon) {
    this.marker.setIcon(icon);
    this._curIcon = icon;
  }

  setMarkerOpacity(opacity) {
    this.marker.setOpacity(opacity);

    let popup = this.marker.getPopup();
    if (popup != null) {
      popup.element.style.opacity = opacity;
    }
  }

  hideMarkerPopup(bool) {
    let popup = this.marker.getPopup();
    if (popup != null) {
      let element = popup.element;
      let display = "inherit";
      if (bool) {
        display = "none"
      }

      element.style.display = display;
    }
  }

  removeElement() {
    this.element.parentElement.removeChild(this.element);
    this.element = null;
  };

  // Does entity exist anymore (disconnected/garbage collected) at relativeFrameIndex
  _notExistAnymore(relativeFrameIndex) {
    return (relativeFrameIndex >= this._positions.length);
  };

  // Is relativeFrameIndex out of bounds
  isFrameOutOfBounds(relativeFrameIndex) {
    return ((relativeFrameIndex < 0) || (this._notExistAnymore(relativeFrameIndex)));
  };

  // Update entiy position, direction, and alive status at valid frame
  _updateAtFrame(relativeFrameIndex) {
    // Set pos
    const latLng = armaToLatLng(this._positions[relativeFrameIndex].position);

    this.marker.setLatLng(latLng);

    // Set direction
    this.marker.setRotationAngle(this._positions[relativeFrameIndex].direction);

    // Set alive status
    this.setAlive(this._positions[relativeFrameIndex].alive);
  };

  _flash(icon, framesToSpan) {
    this.setMarkerIcon(icon);
    this._lockMarkerIcon = true;
    setTimeout(() => {
      this._lockMarkerIcon = false;
    }, (frameCaptureDelay/playbackMultiplier) * framesToSpan);
  };

  flashHit() {
    this._flash(this.iconType.hit, 3);
  };

  flashHighlight() {
    this._flash(this.iconType.follow, 6);
  };

  setAlive(alive) {
    this.alive = alive;
    if (alive) {
      if ((!this._lockMarkerIcon) && (this._curIcon != this._realIcon)) {
        this.setMarkerIcon(this._realIcon);
      }

      this.setMarkerOpacity(1);
    } else {
      let icon = this.iconType.dead;

      if (this._curIcon != icon) {
        this.setMarkerIcon(icon);
      }

      this._tempIcon = (icon);
      this.setMarkerOpacity(0.4);
    };
  };

  // Change unit's marker colour (highlight) and set as entity to follow
  follow() {
    this._lockMarkerIcon = true; // Prevent marker colour from being changed
    if (entityToFollow != null) {entityToFollow.unfollow()}; // Unfollow current followed entity (if any)

    let icon = this.iconType.follow;
    this.setMarkerIcon(icon);
    this._tempIcon = icon;
    entityToFollow = this;
  };

  // Reset unit's marker colour and clear entityToFollow
  unfollow() {
    this._lockMarkerIcon = false;

    let marker = this.marker;
    if (marker != null) {
      this.setMarkerIcon(this._tempIcon);
    };
    entityToFollow = null;
  };
};

class Unit extends Entity {
  constructor(startFrameNum, id, name, group, side, isPlayer, positions, framesFired) {
    super(startFrameNum, id, name, positions);
    this.group = group;
    this.side = side;
    this.isPlayer = isPlayer;
    this._framesFired = framesFired;
    this.killCount = 0;
    this.deathCount = 0;
    this._sideClass = "";
    this._sideColour = "#FFFFFF";
    this._isInVehicle = false;
    this.iconType = icons.man;
    this._popupClassName = "leaflet-popup-unit";

    // Set colour and icon of unit depeneding on side
    let sideClass = "";
    let sideColour = "";
    switch (this.side) {
      case "WEST":
        sideClass = "blufor";
        sideColour = "#004d99";
        break;
      case "EAST":
        sideClass  = "opfor";
        sideColour = "#800000";
        break;
      case "GUER":
        sideClass  = "ind";
        sideColour = "#007f00";
        break;
      case "CIV":
        sideClass  = "civ";
        sideColour = "#650080";
        break;
    };

    this._sideClass = sideClass;
    this._sideColour = sideColour;
    this._realIcon = this.iconType[sideClass];
    this._tempIcon = this.iconType[sideClass];
    this._markerRotationOrigin = "50% 60%";
  };

  createMarker(latLng) {
    super.createMarker(latLng);

    // Only create a nametag label (popup) for players
    if (this.isPlayer) {
      let popup = this._createPopup(this.name);
      this.marker.bindPopup(popup).openPopup();
    };
  };

  _updateAtFrame(relativeFrameIndex) {
    super._updateAtFrame(relativeFrameIndex);
    this.hideMarkerPopup(ui.hideMarkerPopups);
    this.setIsInVehicle(this._positions[relativeFrameIndex].isInVehicle);
  };

  setIsInVehicle(isInVehicle) {
    this._isInVehicle = isInVehicle;

    if (isInVehicle) {
      this.setMarkerOpacity(0);
    } else if (!isInVehicle && this.alive) {
      this.setMarkerOpacity(1);
    };
  };

  get sideClass() {return this._sideClass};

  // Check if unit fired on given frame
  // If true, return position of projectile impact
  firedOnFrame(f) {
    for (let i = 0; i < (this._framesFired.length-1); i++) {
      let frameNum = this._framesFired[i][0];
      let projectilePos = this._framesFired[i][1];
      if (frameNum == f) {return projectilePos};
    };
    return;
  };

  remove() {
    super.remove();
    this.group.removeUnit(this);
  };

  makeElement(liTarget) { // Make and add element to UI target list
    let liUnit = document.createElement("li");
    liUnit.className = "liUnit";
    liUnit.textContent = this.name;
    liUnit.addEventListener("click", () => {
      let marker = this.marker;
      if (marker != null) {
        map.setView(marker.getLatLng(), map.getZoom(), {animate: true});
        this.follow();
      };
    });
    this.element = liUnit;
    liTarget.appendChild(liUnit);
  };

  getSideColour() {return this._sideColour};

  getSideClass() {return this._sideClass};

  setAlive(alive) {
    super.setAlive(alive);

    if (alive) {
      this.group.addUnit(this);
    } else {
      this.group.removeUnit(this);
    };
  };
};

class Vehicle extends Entity {
  constructor(startFrameNum, id, type, name, positions) {
    super(startFrameNum, id, name, positions);
    this._popupClassName = "leaflet-popup-vehicle";
    this._crew = []; // Crew in order: [driver,gunner,commander,turrets,cargo]

    const iconType = icons[type] || icons['unknown']; // check for sea
    this.iconType = iconType;
    this._realIcon = iconType.dead;
    this._tempIcon = iconType.dead;
  };

  createMarker(latLng) {
    super.createMarker(latLng);

    let popup = this._createPopup(this.name);
    this.marker.bindPopup(popup).openPopup();

    // Wait until popup loads, set permanent size
    var checkPopupLoad = setInterval(() => {
      if (popup._contentNode != null) {
        popup._contentNode.style.width = "200px";
        clearInterval(checkPopupLoad);
      };
    }, 100);
  };

  _updateAtFrame(relativeFrameIndex) {
    super._updateAtFrame(relativeFrameIndex);
    this.setCrew(this._positions[relativeFrameIndex].crew);
  };

  setCrew(crew) {
    this._crew = crew;
    //this.marker.getPopup().setContent(`Test`); // Very slow (no need to recalc layout), use ._content instead

    let crewLength = crew.length;
    let content = `${this.name} <i>(0)</i>`;
    if (crewLength > 0) {
      let crewLengthString = `<i>(${crewLength})</i>`;
      let crewString = this.getCrewString();

      if (crewString.length > 0) {
        let title = `<u>${this.name}</u> ${crewLengthString}`;
        content = `${title}<br>${crewString}`;
      } else {
        content = `${this.name} ${crewLengthString}`;
      };

      // Change vehicle icon depending on driver's side
      let driverId = crew[0];
      let driver = entities[driverId];
      //console.log(this);
      //console.log(driver);
      let icon = this.iconType[driver.sideClass];
      if (this._realIcon != icon) {
        this.setMarkerIcon(icon);
        this._realIcon = icon; // Vehicle icon will now remain this colour until a unit of a differet side becomes driver
      };
    };

    let popupNode = this.marker.getPopup()._contentNode;
    if (popupNode.innerHTML != content) {
      popupNode.innerHTML = content;
    };
  };

  getCrewString() {
    if (this._crew.length == 0) {return " "};

    let str = "";
    this._crew.forEach(function(unitId) {
      //if (unitId != -1) {
      let unit = entities[unitId];

      // Only include player names
      if (unit.isPlayer) {
        str += (unit.name + "<br/>");
      };
      //};
    });
    return str;
  };

  // If vehicle has crew, return side colour of 1st crew member. Else return black.
  getSideColour() {
    let crew = this._crew;
    if (crew.length > 0) {
      return entities[crew[0]].getSideColour();
    } else {
      return "black";
    };
  };
};

class Group {
  constructor(name, side) {
    this.name = name;
    this.side = side;
    this.units = [];
    this.element = null; // DOM element associated with this group
  }

  isEmpty() {
    return this.units.length == 0;
  }

  // Add unit to group (if not already added)
  addUnit(unit) {
    if (!this.units.includes(unit)) {
      var wasEmpty = this.isEmpty();
      this.units.push(unit);

      if (wasEmpty) {
        this.makeElement(); // Make element for group
        //groups.addGroup(this); // Add self to groups list
      }

      // Make element for unit too
      unit.makeElement(this.element);
    }
  }

  // Remove unit from group (if not already removed)
  removeUnit(unit) {
    var index = this.units.indexOf(unit);
    if (index == -1) {return};

    this.units.splice(index, 1);


    // Handle what to do if group empty
    if (this.isEmpty()) {
      //groups.removeGroup(this); // Remove self from global groups object
      this.removeElement();
    };

    // Remove element for unit too
    unit.removeElement();
  }

  // Remove element from UI groups list
  removeElement() {
    this.element.parentElement.removeChild(this.element);
    this.element = null;
  }

  makeElement() { // Make and add element to UI groups list
    var targetList;

    switch (this.side) {
      case "WEST":
        targetList = ui.listWest;
        break;
      case "EAST":
        targetList = ui.listEast;
        break;
      case "GUER":
        targetList = ui.listGuer;
        break;
      case "CIV":
        targetList = ui.listCiv;
        break;
      default:
        targetList = ui.listCiv;
    };

    // Create DOM element
    var liGroup = document.createElement("li");
    liGroup.className = "liGroup";
    liGroup.textContent = this.name;

    this.element = liGroup;
    targetList.appendChild(liGroup);
  }
}
