import moment from 'moment';

export function createCaptureLoadDialog(modalDialogElement, captureIndex, loadCapture) {

  let dialogElements = null;

  return {
    initialize,
    open,
    close,
  };

  function initialize() {
    dialogElements = createContainer();
    prepareCaptureList(dialogElements.body);
  }

  function createContainer() {
    const container = document.querySelector('#captureLoadDialog');
    const body = container.querySelector('.modalBody');

    container.querySelector('.modalCloseButton').addEventListener('click', close);

    return { container, body };
  }

  function prepareCaptureList(body) {
    const tableBody = body.querySelector('tbody');
    const tableHeader = body.querySelector('thead');
    tableHeader.appendChild(Object.assign(document.createElement('th'), {innerText: 'Mission'}));
    tableHeader.appendChild(Object.assign(document.createElement('th'), {innerText: 'World'}));
    tableHeader.appendChild(Object.assign(document.createElement('th'), {innerText: 'Duration'}));
    tableHeader.appendChild(Object.assign(document.createElement('th'), {innerText: 'Date'}));
    captureIndex.forEach(entry => tableBody.appendChild(createEntry(entry)));
  }

  function createEntry(entry) {
    const listItem = document.createElement('tr');

    const missionName = document.createElement('td');
    missionName.classList.add('captureItem-missionName');
    missionName.innerText = entry.missionName;
    listItem.appendChild(missionName);

    const worldName = document.createElement('td');
    worldName.classList.add('captureItem-worldName');
    worldName.innerText = entry.worldName;
    listItem.appendChild(worldName);

    const duration = document.createElement('td');
    duration.classList.add('captureItem-duration');
    duration.innerText = moment.utc(entry.duration * 1000).format("HH:mm:ss");
    listItem.appendChild(duration);

    const date = document.createElement('td');
    date.classList.add('captureItem-date');
    date.innerText = moment.unix(entry.date).format("DD.MM.YYYY");
    listItem.appendChild(date);

    listItem.addEventListener('click', () => loadCapture(entry));

    return listItem;
  }

  function open() {
    modalDialogElement.classList.toggle('visible', true);
    if (modalDialogElement.firstChild) {
      modalDialogElement.replaceChild(dialogElements.container, modalDialogElement.firstChild);
    } else {
      modalDialogElement.appendChild(dialogElements.container);
    }
  }

  function close() {
    modalDialogElement.classList.toggle('visible', false);
  }
}