/* Selah — a Bible companion. Keys and chats stay on this device. */
(function(){
"use strict";

var LS_CHAT="selah_chat_v1", LS_SET="cast_settings_v1"; /* shares Cast's key */

var VOTD=[
 "John 3:16","Psalm 23:1","Proverbs 3:5","Romans 8:28","Philippians 4:13",
 "Jeremiah 29:11","Isaiah 41:10","Psalm 46:1","Matthew 11:28","Romans 10:9",
 "Psalm 91:1","1 Corinthians 13:4","Galatians 5:22","Ephesians 2:8","Hebrews 11:1",
 "James 1:5","1 Peter 5:7","Psalm 119:105","Matthew 6:33","John 14:6",
 "Romans 12:2","Isaiah 43:1","Psalm 37:4","Proverbs 16:3","Lamentations 3:22",
 "Micah 6:8","Zephaniah 3:17","John 8:12","Revelation 21:4","Psalm 19:1","Colossians 3:23"
];

function load(k,d){ try{var v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;} }
function save(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

var settings=load(LS_SET,{provider:"groq",key:"",base:"",model:"openai/gpt-oss-120b"});
if(!settings.provider) settings.provider="groq";
if(!settings.model) settings.model = settings.provider==="gemini" ? "gemini-3.8-flash" : "openai/gpt-oss-120b";
var history=load(LS_CHAT,[]);

var $=function(id){return document.getElementById(id);};
var sending=false;

function show(id){
  ["screen-ask","screen-verse","screen-settings"].forEach(function(s){$(s).classList.remove("active");});
  $(id).classList.add("active");
  $("tab-ask").classList.toggle("active",id==="screen-ask");
  $("tab-verse").classList.toggle("active",id==="screen-verse");
}
function refreshKeyWarning(){ $("key-warning").classList.toggle("hidden",!!settings.key); }

var SYSTEM=
"You are Selah, a warm and reverent Bible study companion in a private app. "+
"Answer questions about Scripture, faith, theology, and Christian living. "+
"Ground your answers in the Bible: quote or cite specific passages with book, chapter, and verse. "+
"Prefer well-established interpretations shared across mainstream Christian traditions; when traditions differ, say so honestly. "+
"Keep answers focused and readable — a few short paragraphs, not essays. "+
"Never claim pastoral authority; you are a study aid. If you are unsure of something, say so plainly. "+
"Never mention you are an AI or a language model unless asked directly.";

function renderMessages(){
  var m=$("messages"); m.innerHTML="";
  history.forEach(function(t){
    var d=document.createElement("div");
    d.className="msg "+(t.role==="me"?"me":"them");
    d.innerHTML=esc(t.text);
    m.appendChild(d);
  });
  m.scrollTop=m.scrollHeight;
}
function addMsg(role,text){
  history.push({role:role,text:text});
  if(history.length>60) history=history.slice(-60);
  save(LS_CHAT,history); renderMessages();
}

function askGroq(system,history,userText){
  var model=(settings.model||"openai/gpt-oss-120b").trim();
  var msgs=[{role:"system",content:system}];
  history.forEach(function(t){msgs.push({role:t.role==="me"?"user":"assistant",content:t.text});});
  msgs.push({role:"user",content:userText});
  return fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+settings.key},
    body:JSON.stringify({model:model,messages:msgs,max_tokens:800,temperature:0.7,reasoning_format:"hidden"})})
  .then(function(r){return r.json().then(function(d){return{ok:r.ok,status:r.status,body:d};});})
  .then(function(res){
    if(!res.ok) throw new Error("Groq: "+(res.body.error&&res.body.error.message||("HTTP "+res.status)));
    var m=res.body.choices&&res.body.choices[0]&&res.body.choices[0].message;
    var text=String((m&&m.content)||"").replace(/<think>[\s\S]*?<\/think>/g,"").trim();
    if(!text) throw new Error("Groq returned an empty reply.");
    return text;
  });
}

function askGemini(userText){
  var model=(settings.model||"gemini-3.8-flash").trim();
  var url="https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(settings.key);
  var contents=history.map(function(t){
    return {role:t.role==="me"?"user":"model",parts:[{text:t.text}]};
  });
  contents.push({role:"user",parts:[{text:userText}]});
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents:contents,
      generationConfig:{maxOutputTokens:800,temperature:0.7}})
  }).then(function(r){return r.json().then(function(d){return{ok:r.ok,status:r.status,body:d};});})
  .then(function(res){
    if(!res.ok) throw new Error("Gemini: "+(res.body.error&&res.body.error.message||("HTTP "+res.status)));
    var cand=res.body.candidates&&res.body.candidates[0];
    var parts=cand&&cand.content&&cand.content.parts||[];
    var text=parts.map(function(p){return p.text||"";}).join("").trim();
    if(!text) throw new Error("Gemini returned an empty reply.");
    return text;
  });
}

function send(){
  var inp=$("input"), text=inp.value.trim();
  if(!text||sending) return;
  if(!settings.key){ show("screen-settings"); return; }
  sending=true; inp.value="";
  addMsg("me",text);
  $("typing").classList.remove("hidden");
  var hist=history.slice(0,-1);
  /* temporarily swap history for the API call shape */
  var savedHistory=history;
  history=hist;
  var p = settings.provider==="gemini" ? askGemini(text) : askGroq(SYSTEM,hist,text);
  p.then(function(reply){
    history=savedHistory;
    $("typing").classList.add("hidden"); sending=false; addMsg("them",reply);
  }).catch(function(err){
    history=savedHistory;
    $("typing").classList.add("hidden"); sending=false;
    var m=$("messages"), d=document.createElement("div");
    d.className="msg error"; d.textContent="Couldn't reach the model: "+err.message;
    m.appendChild(d); m.scrollTop=m.scrollHeight;
  });
}

/* verse lookup via free bible-api.com (KJV) */
function fetchVerse(ref,cb){
  fetch("https://bible-api.com/"+encodeURIComponent(ref))
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.error) throw new Error(d.error);
      cb(null,{ref:d.reference,text:d.text.trim()});
    })
    .catch(function(e){cb(e);});
}
function loadVOTD(){
  var day=Math.floor(Date.now()/864e5);
  var ref=VOTD[day%VOTD.length];
  $("votd-ref").textContent=ref;
  $("votd-text").textContent="Loading…";
  fetchVerse(ref,function(e,v){
    $("votd-text").textContent=e?"Could not load — check your connection.":("\u201C"+v.text+"\u201D");
  });
}
function doLookup(){
  var q=$("lookup-input").value.trim();
  if(!q) return;
  var box=$("lookup-result");
  box.innerHTML='<span class="ref">Looking up…</span>';
  fetchVerse(q,function(e,v){
    if(e){ box.innerHTML='<span class="ref">Not found.</span>Try a reference like "John 3:16".'; return; }
    box.innerHTML='<span class="ref">'+esc(v.ref)+'</span>'+esc(v.text);
  });
}

/* settings */
function defaultModelFor(p){ return p==="gemini" ? "gemini-3.8-flash" : "openai/gpt-oss-120b"; }
function loadSettings(){
  $("s-provider").value=settings.provider||"groq";
  $("s-key").value=settings.key||"";
  $("s-model").value=settings.model||defaultModelFor(settings.provider);
}
function saveSettings(){
  settings.provider=$("s-provider").value;
  settings.key=$("s-key").value.trim();
  settings.model=$("s-model").value.trim()||defaultModelFor(settings.provider);
  save(LS_SET,settings); refreshKeyWarning();
}
function testKey(){
  saveSettings();
  var out=$("test-result"); out.textContent="Testing…"; out.style.color="";
  if(!settings.key){ out.textContent="Enter a key first."; return; }
  var model=(settings.model||defaultModelFor(settings.provider)).trim();
  var req;
  if(settings.provider==="gemini"){
    req=fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(settings.key),
      {method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({contents:[{parts:[{text:"Reply with the word OK."}]}],generationConfig:{maxOutputTokens:10}})});
  }else{
    req=fetch("https://api.groq.com/openai/v1/chat/completions",
      {method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+settings.key},
       body:JSON.stringify({model:model,messages:[{role:"user",content:"Reply with the word OK."}],max_tokens:10})});
  }
  req.then(function(r){return r.json().then(function(d){return{ok:r.ok,body:d};});})
    .then(function(res){
      if(!res.ok) throw new Error((res.body.error&&res.body.error.message)||"failed");
      out.textContent="✓ Key works."; out.style.color="#7ddf9a";
    })
    .catch(function(e){ out.textContent="✗ "+e.message; out.style.color="#f08a8a"; });
}

/* wiring */
$("btn-send").addEventListener("click",send);
$("input").addEventListener("keydown",function(e){if(e.key==="Enter")send();});
$("btn-clear").addEventListener("click",function(){
  if(confirm("Clear this conversation?")){ history=[]; save(LS_CHAT,history); renderMessages(); }
});
$("btn-settings").addEventListener("click",function(){loadSettings();show("screen-settings");});
$("btn-settings-back").addEventListener("click",function(){saveSettings();show("screen-ask");});
$("btn-key-warning").addEventListener("click",function(){loadSettings();show("screen-settings");});
$("btn-test-key").addEventListener("click",testKey);
$("tab-ask").addEventListener("click",function(){show("screen-ask");});
$("tab-verse").addEventListener("click",function(){show("screen-verse");});
$("btn-lookup").addEventListener("click",doLookup);
$("lookup-input").addEventListener("keydown",function(e){if(e.key==="Enter")doLookup();});

if(!history.length){
  history=[{role:"them",text:"Welcome to Selah. Ask me anything about Scripture — a question, a theme, a verse you half-remember. I'll walk through it with you."}];
  save(LS_CHAT,history);
}
renderMessages(); refreshKeyWarning(); loadVOTD();
})();
