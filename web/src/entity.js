function createBaseEntity ([, id, kind, name, x, y, dir]) {
  return {
    id,
    kind,
    name,
    alive: true,
    visible: true,
    pose: {
      x,
      y,
      dir,
    },
  }
}

export function createUnit (event) {
  const [, , , , , , , group, side, isPlayer, isCurator] = event
  return Object.assign(createBaseEntity(event), {
    isUnit: true,
    group,
    side: side.toLowerCase(),
    isPlayer,
    isCurator,
    vehicle: null,
  })
}

export function createVehicle (event) {
  return Object.assign(createBaseEntity(event), {
    isVehicle: true,
    side: 'empty',
    crew: [],
  })
}
