/* Timeline — a Bible companion. Traditional conservative chronology; dates approximate. */

const ERAS = [
  { name: "Beginnings",        start: -4000, end: -2091, color: "#8a6d1c" },
  { name: "Patriarchs",        start: -2091, end: -1876, color: "#a07d24" },
  { name: "Egypt & Exodus",    start: -1876, end: -1406, color: "#b5892e" },
  { name: "Conquest & Judges", start: -1406, end: -1050, color: "#c9a227" },
  { name: "United Kingdom",    start: -1050, end: -930,  color: "#d4af37" },
  { name: "Divided Kingdom",   start: -930,  end: -586,  color: "#b5892e" },
  { name: "Exile & Return",    start: -586,  end: -400,  color: "#a07d24" },
  { name: "Silent Years",      start: -400,  end: -4,    color: "#8a6d1c" },
  { name: "Life of Christ",    start: -4,    end: 30,    color: "#e8c766" },
  { name: "Early Church",      start: 30,    end: 100,   color: "#d4af37" },
];

/* y: negative = BC, positive = AD */
const EVENTS = [
  { t: "Creation", y: -4000, date: "In the beginning", major: true,
    d: "God forms the heavens, the earth, and mankind in His own image, and calls it very good.",
    refs: ["Genesis 1", "Genesis 2"] },
  { t: "The Fall", y: -3950, date: "c. 4000 BC",
    d: "Adam and Eve disobey; sin and death enter the world — and with them, the first promise of a Redeemer.",
    refs: ["Genesis 3", "Genesis 3:15"] },
  { t: "Cain and Abel", y: -3900, date: "c. 3900 BC",
    d: "The first murder. Humanity's bent toward violence shows itself within a single generation.",
    refs: ["Genesis 4"] },
  { t: "The Flood", y: -2348, date: "c. 2348 BC", major: true,
    d: "God judges a corrupt world with water, preserving Noah's family and the animals in the ark — then sets His rainbow in the clouds.",
    refs: ["Genesis 6", "Genesis 7", "Genesis 9"] },
  { t: "Tower of Babel", y: -2240, date: "c. 2240 BC",
    d: "Mankind's united rebellion is scattered when God confuses their language; the nations begin.",
    refs: ["Genesis 11"] },
  { t: "Call of Abraham", y: -2091, date: "c. 2091 BC", major: true,
    d: "God calls Abram out of Ur with a staggering promise: through his offspring, all nations will be blessed.",
    refs: ["Genesis 12", "Genesis 15"] },
  { t: "Isaac Born", y: -2066, date: "c. 2066 BC",
    d: "The child of promise arrives to Abraham and Sarah in their old age — laughter, at last.",
    refs: ["Genesis 21"] },
  { t: "Jacob and Esau", y: -2006, date: "c. 2006 BC",
    d: "Twin brothers, one birthright traded for stew. Jacob's line carries the covenant forward.",
    refs: ["Genesis 25", "Genesis 28"] },
  { t: "Joseph Sold into Egypt", y: -1898, date: "c. 1898 BC",
    d: "Betrayed by his brothers and sold as a slave, Joseph is carried down to Egypt — exactly where God intends him.",
    refs: ["Genesis 37"] },
  { t: "Joseph Rules Egypt", y: -1885, date: "c. 1885 BC",
    d: "From prison to prime minister in a day. Joseph's wisdom saves Egypt — and his own family — from famine.",
    refs: ["Genesis 41"] },
  { t: "Israel Enters Egypt", y: -1876, date: "c. 1876 BC",
    d: "Jacob's whole household settles in Goshen: seventy souls who will grow into a nation.",
    refs: ["Genesis 46"] },
  { t: "Israel Enslaved", y: -1600, date: "c. 1600 BC",
    d: "A new Pharaoh who never knew Joseph turns the Hebrews into slave labor for his building projects.",
    refs: ["Exodus 1"] },
  { t: "Birth of Moses", y: -1526, date: "c. 1526 BC", major: true,
    d: "A Hebrew mother hides her baby in a basket on the Nile; Pharaoh's own daughter raises him as a prince.",
    refs: ["Exodus 2"] },
  { t: "The Exodus", y: -1446, date: "c. 1446 BC", major: true,
    d: "After ten plagues, Israel walks out of Egypt through the parted Red Sea on dry ground.",
    refs: ["Exodus 12", "Exodus 14"] },
  { t: "Ten Commandments", y: -1446, date: "c. 1446 BC",
    d: "At Mount Sinai, God gives Moses the Law — the covenant terms for His rescued people.",
    refs: ["Exodus 20", "Deuteronomy 5"] },
  { t: "Wilderness Wanderings", y: -1426, date: "40 years",
    d: "A faithless generation circles the desert for forty years, fed daily by manna, until a new generation is ready.",
    refs: ["Numbers 14", "Deuteronomy 8"] },
  { t: "Death of Moses", y: -1406, date: "c. 1406 BC",
    d: "Moses views the Promised Land from Mount Nebo and dies; Joshua takes up the mantle.",
    refs: ["Deuteronomy 34"] },
  { t: "Crossing the Jordan", y: -1406, date: "c. 1406 BC",
    d: "The river parts as the priests' feet touch the water, and Israel enters Canaan at last.",
    refs: ["Joshua 3", "Joshua 4"] },
  { t: "Fall of Jericho", y: -1406, date: "c. 1406 BC",
    d: "Seven days of marching, one shout, and the walls come down. Rahab and her household are spared.",
    refs: ["Joshua 6", "Hebrews 11:31"] },
  { t: "Deborah and Barak", y: -1209, date: "c. 1209 BC",
    d: "The prophetess Deborah and commander Barak rout the Canaanites; Israel sings one of Scripture's oldest songs.",
    refs: ["Judges 4", "Judges 5"] },
  { t: "Gideon", y: -1162, date: "c. 1162 BC",
    d: "With three hundred men, trumpets, and jars, the least of his family routs the Midianite army.",
    refs: ["Judges 6", "Judges 7"] },
  { t: "Samson", y: -1105, date: "c. 1105 BC",
    d: "The strongman judge: Nazirite strength, Philistine defeats, and a final act of repentance in the temple of Dagon.",
    refs: ["Judges 13", "Judges 16"] },
  { t: "Ruth", y: -1100, date: "c. 1100 BC",
    d: "A Moabite widow's loyalty — 'your God shall be my God' — plants her in the line of King David, and of Christ.",
    refs: ["Ruth 1", "Ruth 4", "Matthew 1:5"] },
  { t: "Samuel Anoints Saul", y: -1050, date: "c. 1050 BC",
    d: "Israel demands a king 'like the nations.' Saul is anointed — tall, impressive, and soon disobedient.",
    refs: ["1 Samuel 8", "1 Samuel 10"] },
  { t: "David Anointed", y: -1025, date: "c. 1025 BC", major: true,
    d: "The shepherd boy, overlooked by his own family, is anointed king in secret. God looks at the heart.",
    refs: ["1 Samuel 16"] },
  { t: "David Becomes King", y: -1010, date: "c. 1010 BC",
    d: "After years as a fugitive, David takes the throne, captures Jerusalem, and receives the promise of an everlasting dynasty.",
    refs: ["2 Samuel 5", "2 Samuel 7"] },
  { t: "Solomon's Temple", y: -966, date: "c. 966 BC",
    d: "Seven years building; the glory of the Lord fills the house, and Solomon prays his great dedicatory prayer.",
    refs: ["1 Kings 6", "1 Kings 8"] },
  { t: "Kingdom Divides", y: -930, date: "930 BC", major: true,
    d: "Rehoboam's harsh answer splits the nation: ten tribes under Jeroboam in the north, Judah in the south.",
    refs: ["1 Kings 12"] },
  { t: "Elijah on Carmel", y: -865, date: "c. 865 BC",
    d: "One prophet against 450 of Baal. Fire falls from heaven, and Israel cries, 'The Lord — He is God!'",
    refs: ["1 Kings 18"] },
  { t: "Fall of Samaria", y: -722, date: "722 BC", major: true,
    d: "Assyria carries the northern kingdom into exile. Ten tribes scattered; the warnings of the prophets fulfilled.",
    refs: ["2 Kings 17"] },
  { t: "Hezekiah's Reform", y: -715, date: "c. 715 BC",
    d: "Judah's faithful king smashes the idols, reopens the temple, and sees Jerusalem delivered from Assyria's siege.",
    refs: ["2 Kings 18", "2 Kings 19"] },
  { t: "Josiah's Revival", y: -622, date: "c. 622 BC",
    d: "A lost Book of the Law is found during temple repairs; the boy king's reforms are Judah's last bright hour.",
    refs: ["2 Kings 22", "2 Kings 23"] },
  { t: "Fall of Jerusalem", y: -586, date: "586 BC", major: true,
    d: "Nebuchadnezzar destroys the city and the temple. Judah goes to Babylon in chains; the exile begins.",
    refs: ["2 Kings 25", "Lamentations 1"] },
  { t: "Daniel in Babylon", y: -580, date: "c. 580 BC",
    d: "A Jewish exile rises to the top of a pagan empire — lions' den, fiery furnace, and visions of coming kingdoms.",
    refs: ["Daniel 1", "Daniel 6"] },
  { t: "Fall of Babylon", y: -539, date: "539 BC",
    d: "The writing on the wall at Belshazzar's feast; Cyrus the Persian takes the city in a night.",
    refs: ["Daniel 5"] },
  { t: "Cyrus's Decree", y: -538, date: "538 BC",
    d: "The Persian king — named by Isaiah a century earlier — lets the exiles go home and rebuild.",
    refs: ["Ezra 1", "Isaiah 45"] },
  { t: "Temple Rebuilt", y: -516, date: "516 BC",
    d: "Seventy years after its ruin, the Second Temple is dedicated — smaller, but standing.",
    refs: ["Ezra 6", "Haggai 2"] },
  { t: "Esther", y: -483, date: "c. 483 BC",
    d: "A Jewish queen risks her life to expose Haman's plot; the Jews are saved, and Purim is born.",
    refs: ["Esther 4", "Esther 7"] },
  { t: "Ezra Returns", y: -458, date: "458 BC",
    d: "The scribe brings the Law back to Jerusalem and calls the people to repentance and renewal.",
    refs: ["Ezra 7", "Nehemiah 8"] },
  { t: "Nehemiah's Wall", y: -445, date: "445 BC",
    d: "Fifty-two days, swords in one hand and trowels in the other — Jerusalem's walls rise again.",
    refs: ["Nehemiah 4", "Nehemiah 6"] },
  { t: "Malachi", y: -430, date: "c. 430 BC",
    d: "The last prophet's voice: a coming messenger, and then — four hundred years of silence.",
    refs: ["Malachi 3", "Malachi 4"] },
  { t: "Alexander the Great", y: -332, date: "332 BC",
    d: "Greece conquers the known world; the Hebrew Scriptures are translated into Greek — the Septuagint.",
    refs: ["Daniel 8"] },
  { t: "Maccabean Revolt", y: -167, date: "167 BC",
    d: "Antiochus desecrates the temple; Judas Maccabeus revolts, cleanses it, and Hanukkah begins.",
    refs: ["Daniel 11"] },
  { t: "Rome Takes Judea", y: -63, date: "63 BC",
    d: "Pompey marches into Jerusalem. Judea becomes a Roman client state; Herod will soon be king.",
    refs: ["Psalm 2"] },
  { t: "Birth of Jesus", y: -4, date: "c. 4 BC", major: true,
    d: "In Bethlehem, to a virgin, in a stable: the Word becomes flesh. The silence breaks.",
    refs: ["Matthew 1", "Luke 2", "John 1:14"] },
  { t: "Baptism of Jesus", y: 27, date: "c. AD 27",
    d: "John baptizes Jesus in the Jordan; the heavens open and the Father speaks: 'This is my beloved Son.'",
    refs: ["Matthew 3", "Mark 1"] },
  { t: "Crucifixion & Resurrection", y: 30, date: "c. AD 30", major: true,
    d: "The cross on Friday, the empty tomb on Sunday. Death is undone from the inside.",
    refs: ["Matthew 27", "Matthew 28", "1 Corinthians 15"] },
  { t: "Pentecost", y: 30, date: "AD 30", major: true,
    d: "Wind and fire; three thousand baptized in a day. The Church is born.",
    refs: ["Acts 2"] },
  { t: "Paul's Conversion", y: 34, date: "c. AD 34",
    d: "The persecutor meets the risen Christ on the Damascus road and becomes the apostle to the nations.",
    refs: ["Acts 9", "Galatians 1"] },
  { t: "Jerusalem Council", y: 49, date: "c. AD 49",
    d: "The apostles settle it: Gentiles need not become Jews to follow Christ. Grace, not circumcision.",
    refs: ["Acts 15", "Galatians 2"] },
  { t: "Paul in Rome", y: 60, date: "c. AD 60",
    d: "In chains yet unhindered, Paul preaches the kingdom from rented rooms in the heart of the empire.",
    refs: ["Acts 28", "Philippians 1"] },
  { t: "Revelation", y: 95, date: "c. AD 95",
    d: "Exiled on Patmos, John sees the risen Christ and the end of all things: 'Behold, I make all things new.'",
    refs: ["Revelation 1", "Revelation 21"] },
];

const MIN_YEAR = -4000, MAX_YEAR = 100;
const SPAN = MAX_YEAR - MIN_YEAR;
let pxPerYear = 1.6;
const ZOOMS = [0.8, 1.6, 3.2, 6.4];
let zoomIdx = 1;

const $ = id => document.getElementById(id);
const viewport = $("viewport"), track = $("track"), erasEl = $("eras"),
      axisEl = $("axis"), eventsEl = $("events");

const x = year => (year - MIN_YEAR) * pxPerYear;

function eraOf(year) {
  return ERAS.find(e => year >= e.start && year < e.end) || ERAS[ERAS.length - 1];
}

function render() {
  const W = SPAN * pxPerYear;
  track.style.width = W + "px";

  /* era bands */
  erasEl.innerHTML = "";
  ERAS.forEach(e => {
    const d = document.createElement("div");
    d.className = "era-band";
    d.style.left = x(e.start) + "px";
    d.style.width = (x(Math.min(e.end, MAX_YEAR)) - x(e.start)) + "px";
    d.style.background = `linear-gradient(${e.color}14, ${e.color}05)`;
    d.innerHTML = `<span>${e.name}</span>`;
    erasEl.appendChild(d);
  });

  /* axis ticks */
  axisEl.innerHTML = '<div class="center-line"></div>';
  for (let yr = -4000; yr <= 0; yr += 500) addTick(yr);
  for (let yr = 50; yr <= 100; yr += 50) addTick(yr);
  addTick(-4, "Christ");

  /* events */
  eventsEl.innerHTML = "";
  const showLabels = pxPerYear >= 1.6;
  EVENTS.forEach((ev, i) => {
    const dot = document.createElement("div");
    dot.className = "event-dot" + (ev.major ? " major" : "");
    dot.style.left = x(ev.y) + "px";
    dot.dataset.i = i;
    dot.addEventListener("click", () => openDetail(i));
    eventsEl.appendChild(dot);

    if (showLabels || ev.major) {
      const lab = document.createElement("div");
      lab.className = "event-label" + (i % 2 ? " above" : "");
      lab.style.left = x(ev.y) + "px";
      lab.textContent = ev.t;
      lab.dataset.i = i;
      lab.addEventListener("click", () => openDetail(i));
      eventsEl.appendChild(lab);
    }
  });
  applySearch($("search").value);
}

function addTick(yr, label) {
  const t = document.createElement("div");
  t.className = "tick";
  t.style.left = x(yr) + "px";
  t.textContent = label || (yr < 0 ? Math.abs(yr) + " BC" : "AD " + yr);
  axisEl.appendChild(t);
}

/* era nav */
function renderEraNav() {
  const nav = $("era-nav");
  nav.innerHTML = "";
  ERAS.forEach(e => {
    const b = document.createElement("button");
    b.className = "era-chip";
    b.style.setProperty("--c", e.color);
    b.textContent = e.name;
    b.addEventListener("click", () => {
      viewport.scrollTo({ left: Math.max(0, x(e.start) - 60), behavior: "smooth" });
    });
    nav.appendChild(b);
  });
}

/* detail sheet */
function openDetail(i) {
  const ev = EVENTS[i];
  $("detail-era").textContent = eraOf(ev.y).name;
  $("detail-title").textContent = ev.t;
  $("detail-date").textContent = ev.date;
  $("detail-desc").textContent = ev.d;
  $("verse-box").classList.add("hidden");
  const refs = $("detail-refs");
  refs.innerHTML = "";
  ev.refs.forEach(r => {
    const c = document.createElement("button");
    c.className = "ref-chip";
    c.textContent = r;
    c.addEventListener("click", () => lookupVerse(r));
    refs.appendChild(c);
  });
  $("detail").classList.remove("hidden");
}
$("detail-close").addEventListener("click", () => $("detail").classList.add("hidden"));

async function lookupVerse(ref) {
  const box = $("verse-box");
  box.classList.remove("hidden");
  $("verse-ref").textContent = ref;
  $("verse-text").textContent = "Looking it up…";
  try {
    const res = await fetch("https://bible-api.com/" + encodeURIComponent(ref));
    if (!res.ok) throw 0;
    const j = await res.json();
    $("verse-ref").textContent = j.reference;
    $("verse-text").textContent = j.text.trim();
  } catch {
    $("verse-text").textContent = "Couldn't reach the verse service just now — check your connection and try again.";
  }
}

/* search */
function applySearch(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll(".event-dot,.event-label").forEach(el => {
    if (!q) { el.classList.remove("dim"); return; }
    const ev = EVENTS[+el.dataset.i];
    const hit = (ev.t + " " + ev.d + " " + ev.refs.join(" ")).toLowerCase().includes(q);
    el.classList.toggle("dim", !hit);
  });
  return q;
}
$("search").addEventListener("input", e => {
  const q = applySearch(e.target.value);
  if (q) {
    const i = EVENTS.findIndex(ev =>
      (ev.t + " " + ev.d + " " + ev.refs.join(" ")).toLowerCase().includes(q));
    if (i >= 0) viewport.scrollTo({ left: Math.max(0, x(EVENTS[i].y) - viewport.clientWidth / 2), behavior: "smooth" });
  }
});

/* zoom */
$("btn-zoom-in").addEventListener("click", () => {
  if (zoomIdx < ZOOMS.length - 1) { zoomIdx++; pxPerYear = ZOOMS[zoomIdx]; render(); }
});
$("btn-zoom-out").addEventListener("click", () => {
  if (zoomIdx > 0) { zoomIdx--; pxPerYear = ZOOMS[zoomIdx]; render(); }
});
$("btn-today").addEventListener("click", () => {
  viewport.scrollTo({ left: Math.max(0, x(-4) - viewport.clientWidth / 2), behavior: "smooth" });
});

renderEraNav();
render();
/* start near the beginning */
viewport.scrollTo({ left: 0 });
