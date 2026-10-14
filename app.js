/* George's Station — LCARS start page logic. Dependency-free.
   Button sounds are 100% original, synthesized at runtime with the Web Audio
   API — clean sine/triangle tones in the TNG aesthetic (300–900Hz, 50–300ms).
   No sampled or copyrighted audio is used anywhere. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  /* ---------- TNG-style synthesized sound engine (original tones only) ---------- */
  var SND_KEY = "lcars_sound_on";
  var soundOn = true;
  try {
    var stored = window.localStorage.getItem(SND_KEY);
    if (stored === "0") { soundOn = false; }
  } catch (e) {}

  var audioCtx = null;

  function ctx() {
    if (!audioCtx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return null; }
        audioCtx = new AC();
      } catch (e) { return null; }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /* One clean tone: freq Hz, dur ms, sine|triangle, optional glide-to freq. */
  function tone(freq, durMs, type, glideTo, delayMs, gain) {
    if (!soundOn) { return; }
    var ac = ctx();
    if (!ac) { return; }
    try {
      var t0 = ac.currentTime + (delayMs || 0) / 1000;
      var osc = ac.createOscillator();
      var g = ac.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      if (glideTo) { osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + durMs / 1000); }
      var vol = gain || 0.12;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + durMs / 1000 + 0.05);
    } catch (e) { /* audio unavailable; stay silent */ }
  }

  var Sfx = {
    confirm: function () { tone(784, 90, "sine"); },                       /* button bleep */
    nav: function () { tone(587, 60, "sine"); tone(880, 70, "sine", null, 65); }, /* link press */
    alertOn: function () {                                                 /* red alert klaxon */
      for (var i = 0; i < 4; i++) {
        tone(i % 2 ? 659 : 494, 120, "triangle", null, i * 130, 0.10);
      }
    },
    alertOff: function () { tone(880, 160, "sine", 587, 0, 0.10); },       /* stand down */
    toggleOn: function () { tone(660, 60, "sine"); },
    toggleOff: function () { tone(440, 60, "sine"); }
  };

  var soundBtn = $("soundBtn");
  function renderSoundBtn() {
    soundBtn.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }
  renderSoundBtn();

  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    try { window.localStorage.setItem(SND_KEY, soundOn ? "1" : "0"); } catch (e) {}
    renderSoundBtn();
    if (soundOn) { Sfx.toggleOn(); }
  });

  /* ---------- Boot overlay ---------- */
  var boot = $("bootOverlay");
  window.addEventListener("load", function () {
    setTimeout(function () { boot.classList.add("done"); }, 900);
  });
  /* Fallback in case load already fired or stalls. */
  setTimeout(function () { boot.classList.add("done"); }, 2500);

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

  /* ---------- Ship's status: fluctuating systems + power distribution ---------- */
  var warpEl = $("warpLevel");
  var shieldEl = $("shieldLevel");
  var hullEl = $("hullLevel");
  var impulseEl = $("impulseLevel");
  var sensorEl = $("sensorLevel");
  var deflectorEl = $("deflectorLevel");

  var pwrWarp = $("pwrWarp"), pwrWarpVal = $("pwrWarpVal");
  var pwrImpulse = $("pwrImpulse"), pwrImpulseVal = $("pwrImpulseVal");
  var pwrShield = $("pwrShield"), pwrShieldVal = $("pwrShieldVal");
  var pwrSensor = $("pwrSensor"), pwrSensorVal = $("pwrSensorVal");

  function setBar(fill, valEl, pct) {
    fill.style.width = pct.toFixed(0) + "%";
    valEl.textContent = pct.toFixed(0) + "%";
  }

  function fluctuate() {
    var warp = 97.5 + Math.random() * 2.2;
    var shield = 99.1 + Math.random() * 0.9;
    var impulse = 98.2 + Math.random() * 1.5;
    var sensor = 99.0 + Math.random() * 1.0;
    var deflector = 97.0 + Math.random() * 2.5;
    warpEl.textContent = warp.toFixed(1) + "%";
    shieldEl.textContent = shield.toFixed(1) + "%";
    hullEl.textContent = "100%";
    impulseEl.textContent = impulse.toFixed(1) + "%";
    sensorEl.textContent = sensor.toFixed(1) + "%";
    deflectorEl.textContent = deflector.toFixed(1) + "%";
    setBar(pwrWarp, pwrWarpVal, 62 + Math.random() * 8);
    setBar(pwrImpulse, pwrImpulseVal, 14 + Math.random() * 5);
    setBar(pwrShield, pwrShieldVal, 12 + Math.random() * 4);
    setBar(pwrSensor, pwrSensorVal, 6 + Math.random() * 3);
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
    if (on) { Sfx.alertOn(); } else { Sfx.alertOff(); }
  });

  /* ---------- Button/link sounds ---------- */
  function wireSounds() {
    var btns = document.querySelectorAll(".lcars-btn");
    for (var i = 0; i < btns.length; i++) {
      (function (el) {
        if (el.id === "alertBtn") { return; } /* handled above */
        el.addEventListener("click", function () {
          if (el.tagName === "A") { Sfx.nav(); } else { Sfx.confirm(); }
        });
      })(btns[i]);
    }
    var minis = document.querySelectorAll(".mini-btn");
    for (var j = 0; j < minis.length; j++) {
      minis[j].addEventListener("click", function () { Sfx.confirm(); });
    }
  }
  wireSounds();

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
