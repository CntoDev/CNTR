export function createUiController() {
  return {};
}


function setMissionName(name) {
  this.missionName.textContent = name;
}

function showHint(text) {
  this.hint.textContent = text;
  this.hint.style.display = "inherit";

  setTimeout(() => {
    this.hint.style.display = "none";
  }, 5000);
}
