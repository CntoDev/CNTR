
function setModal(modal, modalHeader, modalBody, modalButtons) {
  this.modal = modal;
  this.modalHeader = modalHeader;
  this.modalBody = modalBody;
  this.modalButtons = modalButtons;
};

function showModalOpSelection() {
  // Set header/body
  this.modalHeader.textContent = "Operation selection";
  this.modalBody.textContent = "Retrieving list...";

  // Show modal
  this.showModal();
};

function setModalOpList(data) {
  this.modalHeader.textContent = "Operation Selection";

  // Set body
  var table = document.createElement("table");
  var headerRow = document.createElement("tr");

  var columnNames = ["Mission", "Terrain", "Date", "Duration"];
  columnNames.forEach(function(name) {
    var th = document.createElement("th");
    th.textContent = name;
    th.className = "medium";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);


  data.forEach((op) => {
    var row = document.createElement("tr");
    var cell = document.createElement("td");

    var vals = [
      op.mission_name,
      op.world_name,
      dateToLittleEndianString(new Date(op.date)),
      secondsToTimeString(op.mission_duration)
    ];
    vals.forEach(function(val) {
      var cell = document.createElement("td");
      cell.textContent = val;
      row.appendChild(cell);
    });

    row.addEventListener("click", () => {
      this.modalBody.textContent = "Loading...";
      loadCaptureFile("data/" + op.filename);
    });
    table.insertBefore(row, table.childNodes[1]);
  });
  this.modalBody.textContent = "";
  this.modalBody.appendChild(table);
};

function makeModalButton(text, func) {
  var button = document.createElement("div");
  button.className = "modalButton";
  button.textContent = text;
  button.addEventListener("click", func);

  return button;
};

function showModalAbout() {
  this.modalHeader.textContent = "About";

  this.modalBody.innerHTML = `
			<img src="images/ocap-logo.png" height="60px" alt="OCAP">
			<h4 style=line-height:0>${appDesc} (BETA)</h4>
			<h5 style=line-height:0>v${appVersion}</h5>
			Created by ${appAuthor}<br/>
			Originally made for <a href="http://www.3commandobrigade.com" target="_blank">3 Commando Brigade</a>
			<br/>
			<br/>
			<a href="" target="_blank">BI Forum Post</a><br/>
			<a href="" target="_blank">GitHub Link</a>
			<br/>
			<br/>
			Press space to play/pause<br/>
			Press E/R to hide/show side panels`;
  this.modalButtons.innerHTML = "";
  this.modalButtons.appendChild(this.makeModalButton("Close", function() {
    ui.hideModal();
  }));

  this.showModal();
};

function showModal() {
  this.modal.style.display = "inherit";
};

function hideModal() {
  this.modal.style.display = "none";
};
