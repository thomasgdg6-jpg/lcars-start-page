/* George's Station — LCARS start page logic. Dependency-free. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  /* ---------- Chronometer + stardate ---------- */
  var clockEl = $("clock");
  var dateEl = $("dateLine");
  var stardateEl = $("stardate");

  function pad(n, w) {
    n = String(n);
    while (n.length < w) { n = "0" + n; }
    return n;
  }

  function tickClock() {
    var now = new Date();
    clockEl.textContent =
      pad(now.getHours(), 2) + ":" + pad(now.getMinutes(), 2) + ":" + pad(now.getSeconds(), 2);

    var days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    dateEl.textContent =
      days[now.getDay()] + " // " + pad(now.getDate(), 2) + " " +
      months[now.getMonth()] + " " + now.getFullYear();

    // Playful stardate: ticks roughly every second through the day.
    var yy = String(now.getFullYear()).slice(2);
    var sod = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    var val = (sod / 86.4).toFixed(2);
    stardateEl.textContent = "[" + yy + "] " + pad(val, 6);
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Ship's status: gently fluctuating power levels ---------- */
  var warpEl = $("warpLevel");
  var shieldEl = $("shieldLevel");
  var hullEl = $("hullLevel");

  function fluctuate() {
    var warp = (97.5 + Math.random() * 2.2).toFixed(1);
    var shield = (99.1 + Math.random() * 0.9).toFixed(1);
    warpEl.textContent = warp + "%";
    shieldEl.textContent = shield + "%";
    hullEl.textContent = "100%";
  }

  fluctuate();
  setInterval(fluctuate, 5000);

  /* ---------- Rotating fleet advisories (playful, PG) ---------- */
  var tips = [
    "The replicator cannot replicate motivation. Try coffee.",
    "A tidy cargo bay is a happy cargo bay.",
    "All hands: the boutique sale ends Sunday. Tell a friend.",
    "Remember to water the station plants. They are counting on you.",
    "Stardates are approximate. Deadlines are not.",
    "Engage curiosity before warp drive.",
    "Today's forecast: clear skies over Brookhaven Station.",
    "A captain logs first, worries later."
  ];
  var tipEl = $("tipText");
  var tipIdx = 0;

  function rotateTip() {
    tipEl.textContent = tips[tipIdx % tips.length];
    tipIdx += 1;
  }

  rotateTip();
  setInterval(rotateTip, 12000);

  /* ---------- Red alert toggle (purely cosmetic) ---------- */
  var alertBtn = $("alertBtn");
  alertBtn.addEventListener("click", function () {
    var on = document.body.classList.toggle("red-alert");
    alertBtn.textContent = on ? "STAND DOWN" : "RED ALERT";
  });

  /* ---------- Captain's log: autosave to localStorage ---------- */
  var LOG_KEY = "lcars_captains_log";
  var logBox = $("captainsLog");
  var logStatus = $("logStatus");
  var clearBtn = $("clearLog");
  var saveTimer = null;

  function stamp() {
    var n = new Date();
    return pad(n.getHours(), 2) + ":" + pad(n.getMinutes(), 2) + ":" + pad(n.getSeconds(), 2);
  }

  try {
    var saved = window.localStorage.getItem(LOG_KEY);
    if (saved) {
      logBox.value = saved;
      logStatus.textContent = "LOG RESTORED";
    }
  } catch (e) { /* storage unavailable; log simply won't persist */ }

  logBox.addEventListener("input", function () {
    logStatus.textContent = "RECORDING...";
    if (saveTimer) { clearTimeout(saveTimer); }
    saveTimer = setTimeout(function () {
      try {
        window.localStorage.setItem(LOG_KEY, logBox.value);
        logStatus.textContent = "LOGGED // " + stamp();
      } catch (e) {
        logStatus.textContent = "LOG NOT SAVED — STORAGE OFFLINE";
      }
    }, 700);
  });

  clearBtn.addEventListener("click", function () {
    if (window.confirm("Purge the captain's log? This cannot be undone.")) {
      logBox.value = "";
      try { window.localStorage.removeItem(LOG_KEY); } catch (e) {}
      logStatus.textContent = "LOG PURGED";
    }
  });

  /* ---------- Footer year ---------- */
  $("year").textContent = String(new Date().getFullYear());
})();
