export function createEntity(event) {
  switch (event[2]) {
    case 'Man': return createSoldier(event);
    default: return createVehicle(event);
  }
}

function createBaseEntity([, id, type]) {
  return {
    id,
    type,
    alive: true,
    visible: true,
    pose: {
      long: 0,
      lat: 0,
      dir: 0,
    },
  };
}

function createSoldier(event) {
  const [,, name, group, side, isPlayer, isCurator] = event;
  return Object.assign(createBaseEntity(event), {
    kind: 'Man',
    name,
    group,
    side,
    isPlayer,
    isCurator,
  })
}

function createVehicle(event) {
  const [,, kind, description] = event;
  return Object.assign(createBaseEntity(event), {
    kind,
    description,
  });
}
