export function createUnitList(element, state) {
  let entities = {};
  let list = {};

  return {
    reset,
    initialize,
  };

  function initialize() {
    state.on('update', update);
  }

  function update(state) {
    const change = state.entities.reduce((change, entity) => processEntity(entity) || change, false);
    if (change) {
      createList();
    }
  }

  function reset() {
    list = {};
    entities = {};
  }

  function processEntity(entity) {
    let changed = true;
    if (entity.kind === 'Man') {
      if (!list[entity.side]) {
        list[entity.side] = {};
        changed = true;
      }
      const side = list[entity.side];
      if (!side[entity.group]) {
        side[entity.group] = {};
        changed = true;
      }
      const group = side[entity.group];
      if (!group[entity.id]) {
        group[entity.id] = entity;
        changed = true;
      }
    }
    return changed;
  }

  function createList() {
    element.innerHTML = '';
    Object.keys(list).forEach(sideName => element.appendChild(createSideElement(sideName, list[sideName])));
  }

  function createSideElement(sideName, side) {
    const sideElement = document.createElement('li');

    const titleElement = document.createElement('span');
    titleElement.classList.add('sideTitle', sideName);
    titleElement.innerText = sideName.toUpperCase();
    sideElement.appendChild(titleElement);

    const listElement = document.createElement('ul');
    Object.keys(side).forEach(groupName => listElement.appendChild(createGroupElement(groupName, side[groupName])));
    sideElement.appendChild(listElement);

    return sideElement;
  }

  function createGroupElement(groupName, group) {
    const groupElement = document.createElement('li');

    const titleElement = document.createElement('span');
    titleElement.classList.add('groupTitle', 'liGroup');
    titleElement.innerText = groupName;
    groupElement.appendChild(titleElement);

    const listElement = document.createElement('ul');
    Object.values(group).forEach(unit => listElement.appendChild(createUnitElement(unit)));
    groupElement.appendChild(listElement);

    return groupElement;
  }

  function createUnitElement(unit) {
    const unitElement = document.createElement('li');
    unitElement.classList.add('unitName', 'liUnit');
    unitElement.innerText = unit.name;

    if (!unit.alive) {
      unitElement.innerText += ' ☠';
      unitElement.classList.add('unitName', 'dead');
      //unitElement.innerText += '⌖';
      //unitElement.innerText += '✝';
      //unitElement.innerText += '⊕';
    }

    if (unit.vehicle) {
      unitElement.innerText += ' ⊕';
    }


    unitElement.addEventListener('click', () => {
      state.followedUnit = unit;
      state.update();
    });

    return unitElement;
  }
}
