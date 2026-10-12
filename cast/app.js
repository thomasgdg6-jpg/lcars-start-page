/* Cast — your own character chatbot. Keys and chats stay on this device. */
(function(){
"use strict";

var LS_CHARS="cast_chars_v1", LS_CHATS="cast_chats_v1", LS_SET="cast_settings_v1";

var SEED=[
 {id:"vesper", name:"Vesper", tagline:"Lounge singer with a past she won't discuss",
  avatar:"🎤", custom:false,
  persona:"You are Vesper, a lounge singer in her early thirties with a smoky voice and a past she deflects with a joke. You are warm, witty, a little dangerous, and openly flirtatious when you like someone. You speak in a low, teasing cadence. You never break character. You may describe small physical actions in *asterisks* when it feels natural.",
  greeting:"*leans on the piano, studying you* Well. The night just got interesting. Buy a girl a drink, stranger?"},
 {id:"june", name:"June", tagline:"Mechanic, straight shooter, shameless flirt",
  avatar:"🔧", custom:false,
  persona:"You are June, a mechanic in her late twenties who says exactly what she thinks. You're confident, physical, funny, and direct about what — and who — you want. Grease under your nails, sunshine in your manner. You never break character. You may describe small physical actions in *asterisks* when it feels natural.",
  greeting:"*wipes her hands on a rag, grinning* Engine's done. You're not what I expected when the bell rang. Stick around?"},
 {id:"roxy", name:"Roxy", tagline:"Rockabilly drifter with a motorcycle and opinions",
  avatar:"🎸", custom:false,
  persona:"You are Roxy, a rockabilly drifter in her early thirties who rides a vintage motorcycle from town to town. Bold, playful, a little reckless, with a vintage soul and modern mouth. You flirt like it's a contact sport. You never break character. You may describe small physical actions in *asterisks* when it feels natural.",
  greeting:"*kicks the stand down, pulls off her helmet* That road was boring until you showed up. Got a name, handsome?"}
];

function load(k,d){ try{var v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;} }
function save(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function uid(){ return "c"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36); }

var chars=load(LS_CHARS,null);
if(!chars){ chars=SEED.slice(); save(LS_CHARS,chars); }
var chats=load(LS_CHATS,{});
var settings=load(LS_SET,{provider:"groq",key:"",base:"https://api.groq.com/openai/v1",model:"openai/gpt-oss-120b"});
if(!settings.provider) settings.provider="groq";

var $=function(id){return document.getElementById(id);};
var currentChar=null, sending=false;

function show(id){
  document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active");});
  $(id).classList.add("active");
}
function refreshKeyWarning(){ $("key-warning").classList.toggle("hidden",!!settings.key); }

/* ---------- roster ---------- */
function renderRoster(){
  var r=$("roster"); r.innerHTML="";
  chars.forEach(function(c){
    var d=document.createElement("div"); d.className="card";
    d.innerHTML='<button class="edit-dot" title="Edit">✎</button>'+
      '<span class="avatar">'+esc(c.avatar||"🎭")+'</span>'+
      '<div class="cname">'+esc(c.name)+'</div>'+
      '<div class="ctag">'+esc(c.tagline||"")+'</div>';
    d.querySelector(".edit-dot").addEventListener("click",function(e){e.stopPropagation();openEditor(c.id);});
    d.addEventListener("click",function(){openChat(c.id);});
    r.appendChild(d);
  });
}

/* ---------- chat ---------- */
function getHistory(id){ if(!chats[id]) chats[id]=[]; return chats[id]; }

function openChat(id){
  currentChar=chars.find(function(c){return c.id===id;});
  if(!currentChar) return;
  $("chat-avatar").textContent=currentChar.avatar||"🎭";
  $("chat-name").textContent=currentChar.name;
  var h=getHistory(id);
  if(!h.length && currentChar.greeting){ h.push({role:"them",text:currentChar.greeting}); save(LS_CHATS,chats); }
  renderMessages();
  show("screen-chat");
  setTimeout(function(){$("input").focus();},100);
}
function renderMessages(){
  var m=$("messages"); m.innerHTML="";
  getHistory(currentChar.id).forEach(function(t){
    var d=document.createElement("div");
    d.className="msg "+(t.role==="me"?"me":"them");
    d.innerHTML=esc(t.text);
    m.appendChild(d);
  });
  m.scrollTop=m.scrollHeight;
}
function addMsg(role,text){
  var h=getHistory(currentChar.id); h.push({role:role,text:text}); save(LS_CHATS,chats);
  renderMessages();
}
function systemPrompt(c){
  return "You are "+c.name+", a character in a private roleplay chat. "+(c.persona||"")+
   "\nStay in character at all times. Reply as "+c.name+" would: first person, natural and conversational. "+
   "Keep replies to a few sentences unless the moment calls for more. Never mention you are an AI, a language model, or that this is a prompt.";
}
function historyFor(c){
  return getHistory(c.id).map(function(t){return{role:t.role,text:t.text};});
}

function callGemini(system,history,userText){
  var model=(settings.model||"gemini-3.8-flash").trim();
  var url="https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(settings.key);
  var contents=history.map(function(t){
    return {role:t.role==="me"?"user":"model", parts:[{text:t.text}]};
  });
  contents.push({role:"user",parts:[{text:userText}]});
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:contents,generationConfig:{maxOutputTokens:500,temperature:0.9}})
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
function callOpenAI(system,history,userText){
  var base=(settings.provider==="groq"?"https://api.groq.com/openai/v1":(settings.base||"")).replace(/\/+$/,"");
  var model=(settings.model||"openai/gpt-oss-120b").trim();
  var msgs=[{role:"system",content:system}];
  history.forEach(function(t){msgs.push({role:t.role==="me"?"user":"assistant",content:t.text});});
  msgs.push({role:"user",content:userText});
  return fetch(base+"/chat/completions",{method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+settings.key},
    body:JSON.stringify({model:model,messages:msgs,max_tokens:500,temperature:0.9,reasoning_format:"hidden"})
  }).then(function(r){return r.json().then(function(d){return{ok:r.ok,status:r.status,body:d};});})
  .then(function(res){
    if(!res.ok) throw new Error("API: "+(res.body.error&&res.body.error.message||("HTTP "+res.status)));
    var text=res.body.choices&&res.body.choices[0]&&res.body.choices[0].message&&res.body.choices[0].message.content||"";
    text=String(text).replace(/<think>[\s\S]*?<\/think>/g,"").trim();
    if(!text) throw new Error("API returned an empty reply.");
    return text;
  });
}

function send(){
  var inp=$("input"), text=inp.value.trim();
  if(!text||sending) return;
  if(!settings.key){
    addMsg("them",""); // placeholder replaced below
    var h=getHistory(currentChar.id); h.pop(); save(LS_CHATS,chats); renderMessages();
    show("screen-settings");
    return;
  }
  sending=true; inp.value="";
  addMsg("me",text);
  $("typing").classList.remove("hidden");
  var sys=systemPrompt(currentChar), hist=historyFor(currentChar).slice(0,-1);
  var p = settings.provider==="gemini" ? callGemini(sys,hist,text) : callOpenAI(sys,hist,text);
  p.then(function(reply){
    $("typing").classList.add("hidden"); sending=false; addMsg("them",reply);
  }).catch(function(err){
    $("typing").classList.add("hidden"); sending=false;
    var m=$("messages"), d=document.createElement("div");
    d.className="msg error"; d.textContent="Couldn't reach the model: "+err.message;
    m.appendChild(d); m.scrollTop=m.scrollHeight;
  });
}

/* ---------- editor ---------- */
var editingId=null;
function openEditor(id){
  editingId=id||null;
  var c=id?chars.find(function(x){return x.id===id;}):null;
  $("editor-title").textContent=c?("Edit "+c.name):"New Character";
  $("f-name").value=c?c.name:"";
  $("f-tagline").value=c?(c.tagline||""):"";
  $("f-avatar").value=c?(c.avatar||""):"";
  $("f-persona").value=c?(c.persona||""):"";
  $("f-greeting").value=c?(c.greeting||""):"";
  $("btn-delete-char").classList.toggle("hidden",!c);
  show("screen-editor");
}
function saveEditor(){
  var name=$("f-name").value.trim();
  if(!name){ alert("Give your character a name."); return; }
  var data={name:name,tagline:$("f-tagline").value.trim(),avatar:$("f-avatar").value.trim()||"🎭",
    persona:$("f-persona").value.trim(),greeting:$("f-greeting").value.trim(),custom:true};
  if(editingId){
    var c=chars.find(function(x){return x.id===editingId;});
    Object.assign(c,data);
  }else{
    data.id=uid(); chars.push(data);
  }
  save(LS_CHARS,chars); renderRoster(); show("screen-roster");
}

/* ---------- settings ---------- */
function loadSettings(){
  $("s-provider").value=settings.provider;
  $("s-key").value=settings.key;
  $("s-base").value=settings.base;
  $("s-model").value=settings.model;
  $("openai-extra").classList.toggle("hidden",settings.provider!=="openai");
}
function saveSettings(){
  settings.provider=$("s-provider").value;
  settings.key=$("s-key").value.trim();
  settings.base=$("s-base").value.trim();
  settings.model=$("s-model").value.trim()||(settings.provider==="gemini"?"gemini-3.8-flash":"openai/gpt-oss-120b");
  save(LS_SET,settings); refreshKeyWarning();
  $("openai-extra").classList.toggle("hidden",settings.provider!=="openai");
}
function testKey(){
  saveSettings();
  var out=$("test-result"); out.textContent="Testing…";
  if(!settings.key){ out.textContent="Enter a key first."; return; }
  var p;
  if(settings.provider==="gemini"){
    var model=(settings.model||"gemini-3.8-flash").trim();
    p=fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(settings.key),
      {method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({contents:[{parts:[{text:"Reply with the word OK."}]}],generationConfig:{maxOutputTokens:10}})})
      .then(function(r){return r.json().then(function(d){return{ok:r.ok,body:d};});})
      .then(function(res){ if(!res.ok) throw new Error(res.body.error&&res.body.error.message||"failed"); return "Key works — model replied."; });
  }else{
    var base=(settings.provider==="groq"?"https://api.groq.com/openai/v1":(settings.base||"")).replace(/\/+$/,"");
    p=fetch(base+"/models",{headers:{"Authorization":"Bearer "+settings.key}})
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(function(){ return "Key works — provider reachable."; });
  }
  p.then(function(m){out.textContent="✓ "+m;out.style.color="#7ddf9a";})
   .catch(function(e){out.textContent="✗ "+e.message;out.style.color="#f08a8a";});
}

/* ---------- wiring ---------- */
$("btn-send").addEventListener("click",send);
$("input").addEventListener("keydown",function(e){if(e.key==="Enter")send();});
$("btn-back").addEventListener("click",function(){show("screen-roster");});
$("btn-clear-chat").addEventListener("click",function(){
  if(!currentChar) return;
  if(confirm("Clear this conversation?")){ chats[currentChar.id]=[]; save(LS_CHATS,chats); openChat(currentChar.id); }
});
$("btn-settings").addEventListener("click",function(){loadSettings();show("screen-settings");});
$("btn-settings-back").addEventListener("click",function(){saveSettings();show("screen-roster");});
$("btn-key-warning").addEventListener("click",function(){loadSettings();show("screen-settings");});
$("s-provider").addEventListener("change",function(){
  settings.provider=$("s-provider").value;
  if(settings.provider==="gemini"&&!$("s-model").value) $("s-model").value="gemini-3.8-flash";
  if(settings.provider==="groq"&&!$("s-model").value) $("s-model").value="openai/gpt-oss-120b";
  if(settings.provider==="openai"&&!$("s-base").value) $("s-base").value="https://api.groq.com/openai/v1";
  saveSettings();
});
$("btn-test-key").addEventListener("click",testKey);
$("btn-new-char").addEventListener("click",function(){openEditor(null);});
$("btn-editor-back").addEventListener("click",function(){show("screen-roster");});
$("btn-editor-save").addEventListener("click",saveEditor);
$("btn-delete-char").addEventListener("click",function(){
  if(!editingId) return;
  if(confirm("Delete this character and their chats?")){
    chars=chars.filter(function(x){return x.id!==editingId;});
    delete chats[editingId];
    save(LS_CHARS,chars); save(LS_CHATS,chats); renderRoster(); show("screen-roster");
  }
});

renderRoster(); refreshKeyWarning();
})();
