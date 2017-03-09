function _init() {
    // Setup top panel
    this.missionName = document.getElementById("missionName");

    // Load operation button
    var loadOpButton = document.getElementById("loadOpButton");
    loadOpButton.addEventListener("click", function() {
      //TODO: Show op selection menu, reset all variables + clear all panels.
      ui.showHint("Not yet implemented.");
    });
    this.loadOpButton = loadOpButton;

    // About button
    var aboutButton = document.getElementById("aboutButton");
    aboutButton.addEventListener("click", () => {
      this.showModalAbout();
    });
    this.aboutButton = aboutButton;

    // Toggle firelines button
    var toggleFirelinesButton = document.getElementById("toggleFirelines");
    toggleFirelinesButton.addEventListener("click", () => {
      this.firelinesEnabled = !this.firelinesEnabled;

      var text;
      if (this.firelinesEnabled) {
        toggleFirelinesButton.style.opacity = 1;
        text = "enabled";
      } else {
        toggleFirelinesButton.style.opacity = 0.5;
        text = "disabled (excluding kills)";
      };

      this.showHint("Projectile lines " + text);
    });
    this.toggleFirelinesButton = toggleFirelinesButton;


    // Setup left panel
    this.leftPanel = document.getElementById("leftPanel");

    // Define group side elements
    this.listWest = document.getElementById("listWest");
    this.listEast = document.getElementById("listEast");
    this.listGuer = document.getElementById("listGuer");
    this.listCiv = document.getElementById("listCiv");

    // Setup right panel
    this.rightPanel = document.getElementById("rightPanel");
    this.eventList = document.getElementById("eventList");
    this.filterHitEventsButton = document.getElementById("filterHitEventsButton");
    this.filterHitEventsButton.addEventListener("click", () => {
      toggleHitEvents();
    });
    this.filterEventsInput = document.getElementById("filterEventsInput");

    // Cursor target box
    this.cursorTargetBox = document.getElementById("cursorTargetBox");

    // Cursor tooltip
    let cursorTooltip = document.createElement("div");
    cursorTooltip.className = "cursorTooltip";
    document.body.appendChild(cursorTooltip);
    this.cursorTooltip = cursorTooltip;

    // Setup bottom panel
    this.bottomPanel = document.getElementById("bottomPanel");
    this.missionCurTime = document.getElementById("missionCurTime");
    this.missionEndTime = document.getElementById("missionEndTime");
    this.frameSlider = document.getElementById("frameSlider");
    this.frameSlider.addEventListener("input", (event) => {
      var val = event.srcElement.value;
      this.setMissionCurTime(val);
    });
    this.playPauseButton = document.getElementById("playPauseButton");

    // Events timeline
    this.eventTimeline = document.getElementById("eventTimeline");

    // Hide/show ui on keypress
    mapDiv.addEventListener("keypress", (event) => {
      //console.log(event.charCode);

      switch (event.charCode) {
        case 101: // e
          this.toggleLeftPanel();
          break;
        case 114: // r
          this.toggleRightPanel();
          break;
      };
    });


    // Modal
    this.setModal(
        document.getElementById("modal"),
        document.getElementById("modalHeader"),
        document.getElementById("modalBody"),
        document.getElementById("modalButtons")
    );
    this.showModalOpSelection();

    // Small popup
    this.hint = document.getElementById("hint");

    // Playback speed slider
    this.playbackSpeedSliderContainer = document.getElementById("playbackSpeedSliderContainer");
    this.playbackSpeedSlider = document.getElementById("playbackSpeedSlider");

    this.playbackSpeedVal = document.getElementById("playbackSpeedVal");
    this.playbackSpeedVal.textContent = playbackMultiplier + "x";
    this.playbackSpeedVal.addEventListener("mouseover", () => {
      this.showPlaybackSpeedSlider();
    });
    this.playbackSpeedSliderContainer.addEventListener("mouseleave", () => {
      this.hidePlaybackSpeedSlider();
    });

    this.playbackSpeedSlider.max = maxPlaybackMultiplier;
    this.playbackSpeedSlider.min = minPlaybackMultiplier;
    this.playbackSpeedSlider.step = playbackMultiplierStep;
    this.playbackSpeedSlider.value = playbackMultiplier;
    this.playbackSpeedSlider.addEventListener("input", () => {
      let sliderVal = this.playbackSpeedSlider.value;
      this.playbackSpeedVal.textContent = sliderVal + "x";
      playbackMultiplier = sliderVal;
    });

    this.frameSliderWidthInPercent = (this.frameSlider.offsetWidth / this.frameSlider.parentElement.offsetWidth) * 100;
  }


