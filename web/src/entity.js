export function createEntity(event) {
  switch (event[2]) {
    case 'Man': return createSoldier(event);
    default: return createVehicle(event);
  }
}

function createBaseEntity([, id, type]) {
  const pose = {
    x: 0,
    y: 0,
    dir: 0,
  };

  return {
    id,
    type,
    alive: true,
    visible: true,
    vehicle: null,
    get pose() {
      return this.vehicle && this.vehicle.pose || pose;
    },
    set pose(newPose) {
      if (!this.vehicle) {
        Object.assign(pose, newPose);
      }
    },
  };
}

function createSoldier(event) {
  const [,,, name, group, side, isPlayer, isCurator] = event;
  return Object.assign(createBaseEntity(event), {
    kind: 'Man',
    name,
    group,
    side: side.toLowerCase(),
    isPlayer,
    isCurator,
  })
}

function createVehicle(event) {
  const [,, kind, description] = event;

  const vehicle = Object.assign(createBaseEntity(event), {
    kind,
    description,
    crew: [],

    addCrewMember,
    removeCrewMember,
  });

  Object.defineProperties(vehicle, {
    side: {
      get() {
        return this.crew.length ? this.crew[0].side : 'empty';
      },
      configurable: true,
      enumerable: true,
    },
  });

  return vehicle;

  function addCrewMember(unit) {
    if (!this.crew.includes(unit)) {
      this.crew.push(unit);
      unit.vehicle = this;
    }
  }

  function removeCrewMember(unit) {
    const index = this.crew.indexOf(unit);
    if (index !== -1) {
      this.crew.splice(index, 1);
      unit.vehicle = null;
    }
  }
}
