(function(){
"use strict";
/* ========= YÊU THÍCH =========
   - Danh sách lưu trong localStorage (mj-fav-v1), bài mới thích nằm trên cùng.
   - Mọi dòng bài hát có nút tim; tim ở panel phải / màn hình Đang phát là của bài đang phát.
   - Thích → bài hiện ở mục Yêu thích; bỏ thích → bài biến mất khỏi mục Yêu thích. Mọi nút tim luôn đồng bộ. */
var KEY="mj-fav-v1";
var SEED=[["Like You Do","Joji","joji"],["Lonely","Mac Ayres","mac"],["Birds Eye View","Alina Baraz","alina"],["Saturn (Gali Remix)","SZA","sos"],["Crescendolls","Daft Punk","daft"]];  /* 5 bài yêu thích mặc định của bản demo (lần chạy đầu tiên) */
var $=function(i){return document.getElementById(i)};
var favs=[];
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function key(t,a){return mjNorm(t)+"|"+mjNorm(a)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(favs))}catch(e){}}
function load(){
  var raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}
  if(raw==null){favs=SEED.map(function(x){return{t:x[0],a:x[1],c:x[2]}});save();return}
  try{var d=JSON.parse(raw);favs=(Array.isArray(d)?d:[]).map(function(x){var tr=x&&mjTrack(x.t,x.a);return tr?{t:tr.t,a:tr.a,c:tr.c}:null}).filter(Boolean)}catch(e){favs=[]}
}
function isFav(t,a){var k=key(t,a);return favs.some(function(x){return key(x.t,x.a)===k})}

/* ----- đọc bài hát từ giao diện ----- */
function rowTrack(row){
  if(!row)return null;var b=row.querySelector(".n b"),sp=row.querySelector(".n span");
  return b?mjTrack(b.textContent.trim(),sp?sp.textContent.trim():""):null;
}
function curTrack(){
  var n=$("npn");if(!n)return null;var t=n.querySelector(".np-t"),a=n.querySelector(".np-a");
  return t?mjTrack(t.textContent.trim(),a?a.textContent.trim():""):null;
}

/* ----- toast (dùng lại #mjToast của app) ----- */
function toast(msg){
  var t=$("mjToast");if(!t)return;
  t.hidden=false;t.innerHTML="<i>♥</i><span></span>";t.querySelector("span").textContent=msg;
  t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},2600);
}

/* ----- đồng bộ trạng thái mọi nút tim ----- */
function setState(h,on,tr){
  if(!h)return;h.classList.toggle("on",!!on);h.setAttribute("aria-pressed",on?"true":"false");
  if(tr){h.title=on?"Bỏ “"+tr.t+"” khỏi yêu thích":"Thêm “"+tr.t+"” vào yêu thích";h.setAttribute("aria-label",h.title)}
}
function decorate(){                                   /* thêm nút tim vào dòng bài hát nào chưa có */
  document.querySelectorAll(".main .row").forEach(function(r){
    if(r.querySelector(".heart")||!rowTrack(r))return;
    var h=document.createElement("span");h.className="heart";h.setAttribute("role","button");h.textContent="♥";r.appendChild(h);
  });
}
function syncAll(){
  document.querySelectorAll(".main .row .heart").forEach(function(h){var tr=rowTrack(h.closest(".row"));if(tr)setState(h,isFav(tr.t,tr.a),tr)});
  var ct=curTrack();setState($("npHeart"),ct&&isFav(ct.t,ct.a),ct);
}

/* ----- vẽ lại mục Yêu thích từ danh sách ----- */
function rowHtml(x){
  var t=esc(x.t),a=esc(x.a);
  return '<div class="row" data-k="'+esc(key(x.t,x.a))+'" onclick="setNowPlaying(\''+t+'\',\''+a+'\',\''+esc(x.c)+'\')"><div class="cv im-'+esc(x.c)+'"></div><div class="n"><b>'+t+'</b><span>'+a+'</span></div><em>'+mjDur(x.t,x.a)+'</em><span class="heart on" role="button">♥</span></div>';
}
function renderFavorites(){
  var v=$("view-favorites");if(!v)return;
  var n=favs.length,sub=(n?n+" bài hát · ":"")+"Những giai điệu bạn muốn nghe đi nghe lại.";
  var h='<h2>Yêu thích</h2><p style="color:var(--mu);margin:-8px 0 16px;font-size:13px">'+esc(sub)+'</p>';
  h+=n?'<div class="box" id="favBox">'+favs.map(rowHtml).join("")+'</div>'
      :'<div class="fav-empty"><div class="fav-ic">♡</div><b>Chưa có bài hát yêu thích</b><p>Bấm vào biểu tượng ♥ ở bất kỳ bài hát nào để thêm vào đây.</p><button type="button" class="btn" onclick="nav(\'genre\')">Khám phá thể loại</button></div>';
  /* FLIP: ghi lại vị trí các hàng cũ, vẽ lại, rồi cho các hàng trượt từ chỗ cũ lên chỗ mới thay vì nhảy */
  var live=v.classList.contains("on")&&!matchMedia("(prefers-reduced-motion:reduce)").matches,oldTop={},oldBox=$("favBox"),oh=oldBox?oldBox.offsetHeight:0;
  if(live&&oldBox)v.querySelectorAll(".row[data-k]").forEach(function(r){oldTop[r.dataset.k]=r.getBoundingClientRect().top});
  v.innerHTML=h;
  var nb=$("favBox");
  if(live&&oldBox&&nb){
    var rows=[].slice.call(nb.querySelectorAll(".row[data-k]")),nh=nb.offsetHeight;
    rows.forEach(function(r){var k=r.dataset.k,dy=k in oldTop?oldTop[k]-r.getBoundingClientRect().top:0;
      r.style.transition="none";
      if(!(k in oldTop)){r.style.opacity="0";r.style.transform="translateY(-10px)"}
      else if(dy){r.style.transform="translateY("+dy+"px)"}});
    if(nh!==oh){nb.style.height=oh+"px";nb.style.overflow="hidden"}
    void nb.offsetHeight;
    rows.forEach(function(r){r.style.transition="transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s ease";r.style.transform="";r.style.opacity=""});
    if(nh!==oh){nb.style.transition="height .3s cubic-bezier(.2,.8,.2,1)";nb.style.height=nh+"px"}
    setTimeout(function(){rows.forEach(function(r){r.style.transition=r.style.transform=r.style.opacity=""});nb.style.height=nb.style.overflow=nb.style.transition=""},340);
  }
}

/* ----- thích / bỏ thích ----- */
function toggle(t,a,src){
  var tr=mjTrack(t,a);if(!tr)return false;
  var was=isFav(tr.t,tr.a),inFav=!!(src&&src.closest&&src.closest("#view-favorites"));
  if(was)favs=favs.filter(function(x){return key(x.t,x.a)!==key(tr.t,tr.a)});
  else favs.unshift({t:tr.t,a:tr.a,c:tr.c});
  save();syncAll();
  if(!was&&src){src.classList.remove("pop");void src.offsetWidth;src.classList.add("pop")}
  if(was&&inFav){var row=src.closest(".row");if(row)row.classList.add("leaving");setTimeout(function(){renderFavorites();syncAll()},200)}   /* hàng mờ dần rồi biến mất, các hàng dưới trượt lên */
  else{renderFavorites();syncAll()}
  toast(was?"Đã xoá “"+tr.t+"” khỏi Yêu thích":"Đã thêm “"+tr.t+"” vào Yêu thích");
  return !was;
}
function toggleCurrent(){var tr=curTrack();if(tr)return toggle(tr.t,tr.a,$("npHeart"));return false}

/* bắt click vào mọi nút tim (capture): không để click lọt xuống dòng bài hát làm phát nhạc */
document.addEventListener("click",function(e){
  var h=e.target.closest&&e.target.closest(".heart,#npHeart");
  if(!h||h.classList.contains("nps-ic"))return;                  /* tim của màn hình Đang phát tự gọi toggleCurrent() */
  e.stopPropagation();e.preventDefault();
  var tr=h.id==="npHeart"?curTrack():rowTrack(h.closest(".row"));
  if(tr)toggle(tr.t,tr.a,h);
},true);

/* theo dõi giao diện: danh sách mới được vẽ (playlist, nghệ sĩ, tìm kiếm, quay lại...) → gắn tim + đồng bộ */
var pend=false,mainEl=document.querySelector(".main");
function schedule(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;decorate();syncAll()})}
if(mainEl)new MutationObserver(schedule).observe(mainEl,{childList:true,subtree:true});
var npn=$("npn");if(npn)new MutationObserver(schedule).observe(npn,{childList:true,subtree:true});
window.addEventListener("storage",function(e){if(e.key===KEY){load();renderFavorites();decorate();syncAll()}});   /* đồng bộ giữa các tab */

load();renderFavorites();decorate();syncAll();
window.mjFav={isFav:isFav,toggle:toggle,toggleCurrent:toggleCurrent,list:function(){return favs.slice()},sync:syncAll};
})();
