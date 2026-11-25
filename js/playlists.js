(function(){
"use strict";
/* ========= PLAYLIST CỦA BẠN (nút + ở "Thư viện" bên phải) =========
   - Bấm + (hoặc ô "Tạo playlist" trong trang Thư viện) -> popup đặt tên + chọn bài.
   - Playlist được lưu trong localStorage (khoá mj-user-playlists-v1), hiện ở panel phải và trang Thư viện.
   - Mở playlist dùng lại trang playlist() có sẵn; playlist của bạn có thêm nút "Xoá playlist". */
var KEY="mj-user-playlists-v1";
var $=function(i){return document.getElementById(i)};
var DEFAULT_COVERS=["lofi","little","texas","cyber","red"];
var HKEY="mj-hidden-builtin-v1";                       /* tên các playlist có sẵn mà người dùng đã xoá */
var lists=[],hidden=[],lastFocus=null,pendingId=null,delId=null;

function load(){try{var r=JSON.parse(localStorage.getItem(KEY)||"[]");lists=Array.isArray(r)?r:[]}catch(e){lists=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(lists))}catch(e){}}
function loadHidden(){try{var r=JSON.parse(localStorage.getItem(HKEY)||"[]");hidden=Array.isArray(r)?r:[]}catch(e){hidden=[]}}
function saveHidden(){try{localStorage.setItem(HKEY,JSON.stringify(hidden))}catch(e){}}
function nameOf(el){var b=el.querySelector("b");if(!b)return"";return(b.firstChild?b.firstChild.textContent:b.textContent).trim()}
/* các mục có sẵn trong HTML: dòng ở panel phải + ô ở trang Thư viện */
function staticRows(){return[].slice.call(document.querySelectorAll("#rcList > .row:not([data-upl])"))}
function staticTiles(){return[].slice.call(document.querySelectorAll("#lib-list > div:not([data-upl]):not(#plNewTile)"))}
function isHidden(name){return hidden.indexOf(name)>-1}
function applyHidden(){
  staticRows().forEach(function(el){el.style.display=isHidden(nameOf(el))?"none":""});
  staticTiles().forEach(function(el){
    var n=nameOf(el),dup=lists.some(function(x){return x.id===svId(n)});   /* bản đã lưu thay thế ô có sẵn, tránh trùng */
    el.style.display=(isHidden(n)||dup)?"none":"";
  });
}
function track(k){for(var i=0;i<MJ_TRACKS.length;i++)if(MJ_TRACKS[i].k===k)return MJ_TRACKS[i];return null}
function tracksOf(pl){return pl.tracks.map(track).filter(Boolean)}

function toast(m){
  var t=$("mjToast");if(!t)return;
  t.hidden=false;t.innerHTML="<i>✓</i><span></span>";t.querySelector("span").textContent=m;
  t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},3100);
}

/* ---------- vẽ danh sách ---------- */
function subOf(pl){return "Playlist · "+tracksOf(pl).length+" bài"}
function bindOpen(el,id){
  el.tabIndex=0;el.setAttribute("role","button");
  el.addEventListener("click",function(){openPL(id)});
  el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openPL(id)}});
}
function render(){
  document.querySelectorAll("[data-upl]").forEach(function(n){n.remove()});
  var right=$("rcList"),grid=$("lib-list"),tile=$("plNewTile");
  var after=right,afterG=tile;
  lists.forEach(function(pl){
    if(right){                                              /* panel phải: giống các dòng playlist có sẵn */
      var r=document.createElement("div");r.className="row";r.setAttribute("data-upl",pl.id);
      var cv=document.createElement("div");cv.className="cv im-"+pl.img;
      var n=document.createElement("div");n.className="n";
      var b=document.createElement("b");b.textContent=pl.name;
      var sp=document.createElement("span");sp.textContent=subOf(pl);
      n.appendChild(b);n.appendChild(sp);r.appendChild(cv);r.appendChild(n);
      bindOpen(r,pl.id);after.insertAdjacentElement(after===right?"afterbegin":"afterend",r);after=r;
    }
    if(grid&&tile){                                         /* trang Thư viện: giống ô playlist có sẵn */
      var g=document.createElement("div");g.setAttribute("data-upl",pl.id);
      var i=document.createElement("i");i.className="im-"+pl.img;
      var b2=document.createElement("b");b2.textContent=pl.name;
      var s2=document.createElement("span");s2.textContent=subOf(pl);
      g.appendChild(i);g.appendChild(b2);g.appendChild(s2);
      bindOpen(g,pl.id);afterG.insertAdjacentElement("afterend",g);afterG=g;
    }
  });
  applyHidden();
}


/* ---------- Lưu playlist đang mở ở trang playlist (VD: MeloJam Mix) ---------- */
function svId(title){return "sv-"+String(title).toLowerCase().replace(/\s+/g,"-")}
function isBuiltin(title){return staticRows().some(function(el){return nameOf(el)===title})}
function isSaved(title){var id=svId(title);return lists.some(function(x){return x.id===id})}
function toggleCurrent(){
  var title=$("pl-name").textContent.trim(),cur=window._curPL||[];
  if(isBuiltin(title)){                                   /* playlist có sẵn đã xoá -> lưu lại = khôi phục */
    hidden=hidden.filter(function(n){return n!==title});saveHidden();applyHidden();
    toast("Đã lưu “"+title+"” vào thư viện");return true;
  }
  var id=svId(title);
  if(lists.some(function(x){return x.id===id})){
    lists=lists.filter(function(x){return x.id!==id});save();render();
    toast("Đã bỏ “"+title+"” khỏi thư viện");return false;
  }
  var ks=[];cur.forEach(function(s){var t=mjTrack(s[0],s[1]);if(t&&ks.indexOf(t.k)<0)ks.push(t.k)});
  if(!ks.length)return false;
  var m=($("pl-img").className||"").match(/im-(\S+)/);
  lists.unshift({id:id,name:title,img:m?m[1]:track(ks[0]).c,tracks:ks,ts:Date.now()});
  save();render();toast("Đã lưu “"+title+"” vào thư viện");return true;
}
window.savePlaylistBtn=function(btn){
  toggleCurrent();decorate(null);      /* cập nhật nút: Lưu / Đã lưu / Xoá playlist */
};

/* ---------- mở playlist ---------- */
function openPL(id){
  var pl=lists.filter(function(x){return x.id===id})[0];if(!pl)return;
  pendingId=id;
  playlist(pl.name,subOf(pl)+" · của bạn",pl.img,tracksOf(pl).map(function(t){return[t.t,t.a,t.c]}));
}
/* gắn nút "Xoá playlist" vào trang playlist (chỉ hiện với playlist của bạn) */
function decorate(id){
  var acts=document.querySelector("#view-playlist .acts"),sv=$("pl-save");if(!acts)return;
  var del=$("pl-del");
  if(!del){del=document.createElement("button");del.type="button";del.className="btn o";del.id="pl-del";del.textContent="Xoá playlist";acts.appendChild(del)}
  var title=$("pl-name").textContent.trim();
  if(id){del.hidden=false;del.dataset.id=id;if(sv)sv.hidden=true}
  else if(isBuiltin(title)&&!isHidden(title)){del.hidden=false;del.dataset.id="b:"+title;if(sv)sv.hidden=true}
  else{
    del.hidden=true;del.dataset.id="";
    if(sv){sv.hidden=false;var on=isSaved($("pl-name").textContent.trim());sv.dataset.s=on?"1":"0";sv.textContent=on?"✓ Đã lưu vào thư viện":"Lưu vào thư viện"}
  }
}
var origPlaylist=window.playlist;
if(typeof origPlaylist==="function"){
  window.playlist=function(){var id=pendingId;pendingId=null;var r=origPlaylist.apply(this,arguments);decorate(id);return r};
}

/* ---------- popup tạo playlist ---------- */
function buildSongs(){
  var box=$("plSongs");box.innerHTML="";
  MJ_TRACKS.forEach(function(t){
    var lb=document.createElement("label");lb.className="pl-song";
    var cb=document.createElement("input");cb.type="checkbox";cb.value=t.k;
    var im=document.createElement("i");im.className="im-"+t.c;
    var sp=document.createElement("span");
    var b=document.createElement("b");b.textContent=t.t;
    var sm=document.createElement("small");sm.textContent=t.a;
    sp.appendChild(b);sp.appendChild(sm);
    lb.appendChild(cb);lb.appendChild(im);lb.appendChild(sp);box.appendChild(lb);
  });
}
function showErr(msg){var e=$("plErr");e.textContent=msg;e.hidden=!msg;$("plName").classList.toggle("bad",!!msg&&msg.indexOf("tên")>-1)}
function openCreate(){
  lastFocus=document.activeElement;
  buildSongs();$("plName").value="";showErr("");
  $("plModal").hidden=false;
  setTimeout(function(){$("plName").focus()},30);
}
function closeCreate(){
  $("plModal").hidden=true;
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}
}
function create(){
  var name=$("plName").value.replace(/\s+/g," ").trim();
  var ks=[].slice.call($("plSongs").querySelectorAll("input:checked")).map(function(c){return c.value});
  if(!name){showErr("Vui lòng nhập tên playlist.");$("plName").focus();return}
  if(!ks.length){showErr("Hãy chọn ít nhất một bài hát.");return}
  var first=track(ks[0]);
  var pl={id:"u"+Date.now(),name:name,img:first?first.c:DEFAULT_COVERS[lists.length%DEFAULT_COVERS.length],tracks:ks,ts:Date.now()};
  lists.unshift(pl);save();render();
  $("plModal").hidden=true;
  toast("Đã tạo playlist “"+name+"”");
}

/* ---------- popup xoá playlist ---------- */
function askDelete(id){
  var pl=id.indexOf("b:")===0?{name:id.slice(2)}:lists.filter(function(x){return x.id===id})[0];if(!pl)return;
  delId=id;lastFocus=document.activeElement;
  $("pdText").textContent="Playlist “"+pl.name+"” sẽ bị xoá khỏi thư viện của bạn. Các bài hát vẫn còn trong MeloJam.";
  $("plDelModal").hidden=false;
  setTimeout(function(){$("pdCancel").focus()},30);
}
function closeDelete(){
  $("plDelModal").hidden=true;delId=null;
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}
}
function doDelete(){
  var id=delId,builtin=id&&id.indexOf("b:")===0;
  var pl=builtin?{name:id.slice(2)}:lists.filter(function(x){return x.id===id})[0];
  $("plDelModal").hidden=true;delId=null;
  if(!pl)return;
  if(builtin){if(!isHidden(pl.name)){hidden.push(pl.name);saveHidden()}applyHidden()}
  else{lists=lists.filter(function(x){return x.id!==id});save();render()}
  if(typeof nav==="function")nav("library","list");
  toast("Đã xoá playlist “"+pl.name+"”");
}


/* ---------- API cho nơi khác (VD: nút "Lưu vào thư viện" ở trang Gợi ý) ---------- */
function sgId(ctx){return "sg-"+String(ctx).replace(/\s+/g,"-")}
window.MJPlaylists={
  /* đã lưu playlist gợi ý của hoàn cảnh này chưa */
  hasSuggest:function(ctx){var id=sgId(ctx);return lists.some(function(x){return x.id===id})},
  /* bật/tắt lưu: trả về true nếu giờ đã lưu, false nếu vừa bỏ lưu */
  toggleSuggest:function(ctx,songs){
    var id=sgId(ctx),name="Gợi ý: "+ctx;
    if(this.hasSuggest(ctx)){
      lists=lists.filter(function(x){return x.id!==id});save();render();
      toast("Đã bỏ “"+name+"” khỏi thư viện");return false;
    }
    var ks=[];songs.forEach(function(s){var t=mjTrack(s[0],s[1]);if(t&&ks.indexOf(t.k)<0)ks.push(t.k)});
    if(!ks.length)return false;
    lists.unshift({id:id,name:name,img:track(ks[0]).c,tracks:ks,ts:Date.now()});
    save();render();toast("Đã lưu “"+name+"” vào thư viện");return true;
  }
};

/* ---------- gắn sự kiện ---------- */
function init(){
  load();loadHidden();render();
  var add=$("plAddBtn");if(add)add.addEventListener("click",openCreate);
  var tile=$("plNewTile");
  if(tile){tile.addEventListener("click",openCreate);tile.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openCreate()}})}
  var m=$("plModal"),d=$("plDelModal");
  m.addEventListener("click",function(e){if(e.target===m)closeCreate()});
  d.addEventListener("click",function(e){if(e.target===d)closeDelete()});
  $("plCancel").addEventListener("click",closeCreate);
  $("plOk").addEventListener("click",create);
  $("plName").addEventListener("input",function(){showErr("")});
  $("plName").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();create()}});
  $("plSongs").addEventListener("change",function(){showErr("")});
  $("pdCancel").addEventListener("click",closeDelete);
  $("pdOk").addEventListener("click",doDelete);
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("#pl-del");if(b&&b.dataset.id)askDelete(b.dataset.id)});
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape")return;
    if(!d.hidden)closeDelete();else if(!m.hidden)closeCreate();
  });
  window.addEventListener("storage",function(e){if(e.key===KEY||e.key===HKEY){load();loadHidden();render()}});   /* đồng bộ giữa các tab */
}
init();
})();
