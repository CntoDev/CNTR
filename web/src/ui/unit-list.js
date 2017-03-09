export function createUnitListController() {
  return {
    addUnit,
    removeUnit,
    refresh,
    toggle,
  };
}

function toggle() {
  if (this.leftPanel.style.display == "none") {
    this.leftPanel.style.display = "initial";
  } else {
    this.leftPanel.style.display = "none";
  }
}

function addUnit() {

}

function removeUnit() {

}

function refresh() {

}