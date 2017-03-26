function createBaseEntity ([, id, type, name, x, y, dir]) {
  const pose = {
    x,
    y,
    dir,
  }

  return {
    id,
    type,
    name,
    alive: true,
    visible: true,
    get pose () {
      return this.vehicle && this.vehicle.pose || pose
    },
    set pose (newPose) {
      if (!this.vehicle) {
        Object.assign(pose, newPose)
      }
    },
  }
}

export function createUnit (event) {
  const [, , , , , , , group, side, isPlayer, isCurator] = event
  return Object.assign(createBaseEntity(event), {
    group,
    side: side.toLowerCase(),
    isPlayer,
    isCurator,
    vehicle: null,
  })
}

export function createVehicle (event) {
  const vehicle = Object.assign(createBaseEntity(event), {
    crew: [],
    addCrewMember,
    removeCrewMember,
  })

  Object.defineProperties(vehicle, {
    side: {
      get() {
        return this.crew.length ? this.crew[0].side : 'empty'
      },
      configurable: true,
      enumerable: true,
    },
  })

  return vehicle

  function addCrewMember (unit) {
    if (!this.crew.includes(unit)) {
      this.crew.push(unit)
      unit.vehicle = this
    }
  }

  function removeCrewMember (unit) {
    const index = this.crew.indexOf(unit)
    if (index !== -1) {
      this.crew.splice(index, 1)
      unit.vehicle = null
    }
  }
}
