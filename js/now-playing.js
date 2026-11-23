(function(){
var $=function(i){return document.getElementById(i)};

/* ===== Toast (dùng lại #mjToast của app) ===== */
function toast(msg){
  var t=$("mjToast");if(!t)return;
  t.hidden=false;t.innerHTML="<i>✓</i><span></span>";t.querySelector("span").textContent=msg;
  t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},3100);
}

/* biểu tượng đang là "tạm dừng" (2 thanh dọc) tức là nhạc đang phát; innerHTML của SVG bị trình duyệt chuẩn hoá nên so khớp theo dữ liệu path */
function isPlaying(){var ic=$("plIcon");return !!ic&&/M6\s?5h4v14/.test(ic.innerHTML)}

/* ===== Đọc bài đang phát từ DOM của app ===== */
function curSong(){
  var n=$("npn"),sm=n&&n.querySelector("small"),
      tb=n&&n.querySelector(".np-t"),
      t=(tb?tb.textContent:(n&&n.firstChild&&n.firstChild.nodeType===3?n.firstChild.textContent:(n?n.textContent:""))).trim(),
      m=/im-([\w-]+)/.exec(($("art")||{}).className||"");
  return {title:t||"MeloJam",sub:sm?sm.textContent.trim():"",img:m?m[1]:"super"};
}

/* ===== CHIA SẺ LIÊN KẾT BÀI HÁT ===== */
function clean(x){return String(x||"").replace(/[<>&"'`\\\u0000-\u001f]/g,"").trim().slice(0,80)}
function shareUrl(s){
  var e=function(x){return encodeURIComponent(x).replace(/~/g,"%7E")};
  return location.href.split("#")[0]+"#song="+e(s.title)+"~"+e(s.sub)+"~"+e(s.img);
}
function legacyCopy(text){
  var ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");
  ta.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";document.body.appendChild(ta);
  ta.select();ta.setSelectionRange(0,text.length);var ok=false;try{ok=document.execCommand("copy")}catch(e){}
  document.body.removeChild(ta);return ok;
}
function copyLink(url,s){
  var done=function(ok){toast(ok?"Đã sao chép liên kết: "+s.title+(s.sub?" – "+s.sub:""):"Không sao chép được, hãy sao chép thủ công: "+url)};
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(function(){done(true)},function(){done(legacyCopy(url))})}
  else done(legacyCopy(url));
}
window.shareSong=function(song){
  var s=song||curSong(),url=shareUrl(s),text='Nghe "'+s.title+'"'+(s.sub?" – "+s.sub:"")+" trên MeloJam";
  var touch=window.matchMedia&&matchMedia("(pointer:coarse)").matches;
  if(touch&&navigator.share){
    navigator.share({title:s.title+" · MeloJam",text:text,url:url}).catch(function(err){if(err&&err.name==="AbortError")return;copyLink(url,s)});
  }else copyLink(url,s);
};

/* mở bài hát từ liên kết được chia sẻ (đã lọc ký tự lạ để tránh chèn mã) */
(function(){
  var m=/^#song=([^~]+)~([^~]*)~([\w-]+)$/.exec(location.hash||"");if(!m)return;
  var t,s2;try{t=clean(decodeURIComponent(m[1]));s2=clean(decodeURIComponent(m[2]))}catch(e){return}
  if(!t)return;
  var img=m[3],probe=document.createElement("div");probe.className="im-"+img;probe.style.cssText="position:absolute;left:-9999px;width:1px;height:1px";
  document.body.appendChild(probe);var ok=getComputedStyle(probe).backgroundImage!=="none";document.body.removeChild(probe);if(!ok)img="lofi";
  var applied=false,mo=null;
  function apply(){
    if(applied||document.body.classList.contains("guest"))return;applied=true;
    if(typeof setNowPlaying==="function"){
      setNowPlaying(t,s2,img);
      if(isPlaying()&&typeof tp==="function")tp();   /* mở ra ở trạng thái tạm dừng */
      toast("Đã mở bài hát được chia sẻ: "+t+(s2?" – "+s2:""));
    }
    if(mo)mo.disconnect();
  }
  if(document.body.classList.contains("guest")){mo=new MutationObserver(apply);mo.observe(document.body,{attributes:true,attributeFilter:["class"]})}
  else setTimeout(apply,0);
})();

/* ===== MÀN HÌNH ĐANG PHÁT (mobile) ===== */
var sheet=$("nps");if(!sheet)return;
var MINI=window.matchMedia("(max-width:699px),(max-height:500px)");
var E={bg:$("npsBg"),art:$("npsArt"),title:$("npsTitle"),sub:$("npsSub"),heart:$("npsHeart"),fill:$("npsFill"),seek:$("npsSeek"),
  now:$("npsNow"),dur:$("npsDur"),play:$("npsPlay"),playIc:$("npsPlayIc"),shuffle:$("npsShuffle"),repeat:$("npsRepeat"),close:$("npsClose")};
var isOpen=false,timer=0,drag=false,dragPct=0,lastKey="",lastFocus=null;

function secs(t){var m=/^(\d+):(\d{2})$/.exec((t||"").trim());return m?(+m[1])*60+(+m[2]):0}
function fmt(x){x=Math.max(0,Math.floor(x));return Math.floor(x/60)+":"+("0"+(x%60)).slice(-2)}

function paint(){
  var s=curSong(),key=s.title+"|"+s.sub+"|"+s.img;
  if(key!==lastKey){lastKey=key;E.title.textContent=s.title;E.sub.textContent=s.sub;E.art.className="nps-art im-"+s.img;E.bg.className="nps-bg im-"+s.img;E.title.setAttribute("aria-label","Mở album chứa bài: "+s.title);E.sub.setAttribute("aria-label","Xem hồ sơ nghệ sĩ: "+s.sub);E.sub.hidden=!s.sub}
  var playing=isPlaying();
  sheet.classList.toggle("paused",!playing);
  E.playIc.innerHTML=playing?PAUSE_ICON:PLAY_ICON;
  E.play.setAttribute("aria-label",playing?"Tạm dừng":"Phát");
  var fav=$("npHeart")&&$("npHeart").classList.contains("on");
  E.heart.classList.toggle("on",!!fav);E.heart.setAttribute("aria-pressed",fav?"true":"false");
  var sh=document.querySelector(".ctl span:first-child"),shOn=!!(sh&&sh.classList.contains("on"));
  E.shuffle.classList.toggle("on",shOn);E.shuffle.setAttribute("aria-pressed",shOn?"true":"false");
  var rb=$("btnRepeat"),rOn=rb&&rb.classList.contains("on"),rOne=rb&&rb.classList.contains("one");
  E.repeat.classList.toggle("on",!!rOn);E.repeat.classList.toggle("one",!!rOne);
  E.repeat.setAttribute("aria-label",rb?rb.title:"Lặp lại");
  var d=secs($("ptdur").textContent);E.dur.textContent=$("ptdur").textContent;
  if(!drag){
    var w=($("pgfill").style.width||"0%");E.fill.style.width=w;
    E.now.textContent=$("ptnow").textContent;
    E.seek.setAttribute("aria-valuenow",Math.round(parseFloat(w)||0));
    E.seek.setAttribute("aria-valuetext",$("ptnow").textContent+" / "+$("ptdur").textContent);
  }
}

function openSheet(){
  if(isOpen||document.body.classList.contains("guest"))return;
  isOpen=true;lastFocus=document.activeElement;lastKey="";paint();
  sheet.classList.add("open");document.documentElement.classList.add("nps-lock");
  clearInterval(timer);timer=setInterval(paint,150);
  setTimeout(function(){try{E.close.focus({preventScroll:true})}catch(e){}},60);
}
function closeSheet(){
  if(!isOpen)return;isOpen=false;clearInterval(timer);
  sheet.classList.remove("open");document.documentElement.classList.remove("nps-lock");
  sheet.style.transition="";sheet.style.transform="";
  try{if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}catch(e){}
}
window.openNowPlaying=openSheet;window.closeNowPlaying=closeSheet;

/* ===== Chạm tên bài -> trang album chứa bài; chạm tên ca sĩ -> hồ sơ ca sĩ ===== */
function nrm(x){return String(x||"").replace(/'/g,"").trim().toLowerCase()}
/* dò các album/playlist đã có sẵn trong trang (theo onclick="playlist('Tên','Mô tả','ảnh',[[bài],...])") */
function knownAlbums(){
  var out=[],seen={};
  document.querySelectorAll('[onclick*="playlist("]').forEach(function(el){
    var m=/playlist\('((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)','([\w-]+)',(\[\[[\s\S]*\]\])\)/.exec(el.getAttribute("onclick")||"");
    if(!m)return;var tr;try{tr=JSON.parse(m[4].replace(/'/g,'"'))}catch(e){return}
    var k=m[1]+"|"+m[2];if(seen[k])return;seen[k]=1;out.push({title:m[1],sub:m[2],img:m[3],tracks:tr});
  });
  return out;
}
function albumFor(s){
  var c=knownAlbums().filter(function(a){return a.tracks.some(function(t){return nrm(t[0])===nrm(s.title)&&nrm(t[1])===nrm(s.sub)})});
  /* ưu tiên: album do chính ca sĩ đó đứng tên > cùng ảnh bìa > trùng tên > bất kỳ album nào có bài này */
  var pick=c.filter(function(a){return nrm(a.sub)===nrm(s.sub)})[0]||c.filter(function(a){return a.img===s.img})[0]||c.filter(function(a){return nrm(a.title)===nrm(s.title)})[0]||c[0];
  return pick||{title:s.title,sub:(s.sub?s.sub+" · ":"")+"Đĩa đơn",img:s.img,tracks:[[s.title,s.sub,s.img]]};
}
function artistKey(name,fallback){
  var map={};
  document.querySelectorAll('[onclick*="artist("],[onclick*="friend("]').forEach(function(el){
    var m=/(?:artist|friend)\('((?:[^'\\]|\\.)*)','([\w-]+)'\)/.exec(el.getAttribute("onclick")||"");if(m)map[nrm(m[1])]=m[2];
  });
  return map[nrm(name)]||fallback;
}
E.title.addEventListener("click",function(){
  var s=curSong(),a=albumFor(s);closeSheet();playlist(a.title,a.sub,a.img,a.tracks);
});
E.sub.addEventListener("click",function(){
  var s=curSong();if(!s.sub)return;closeSheet();artist(s.sub,artistKey(s.sub,s.img));
});
/* chạm vào ảnh bìa -> mở album chứa bài (danh sách các bài trong album) */
function openAlbumFromArt(){var s=curSong(),a=albumFor(s);closeSheet();playlist(a.title,a.sub,a.img,a.tracks)}
E.art.style.cursor="pointer";E.art.setAttribute("role","button");E.art.tabIndex=0;
E.art.setAttribute("aria-label","Mở album chứa bài");
E.art.addEventListener("click",openAlbumFromArt);
E.art.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openAlbumFromArt()}});

/* chạm vào thanh phát nhạc nhỏ để mở (bỏ qua các nút điều khiển / thanh tiến trình) */
var player=document.querySelector(".player"),pn=$("pn");
var dragAt=0;
if(player)player.addEventListener("click",function(e){      /* capture: kiểm tra trước khi nút bị đổi icon (target bị gỡ khỏi DOM) */
  if(Date.now()-dragAt<450)return;                           /* vừa kéo xong: không coi là chạm */
  if(e.target.closest(".ctl,.pg,.vol,button,input"))return;openSheet();
},true);

/* ===== Kéo thanh nhỏ (hoặc bất kỳ chỗ trống nào) trên mini-player lên để mở toàn màn hình, màn hình đi theo ngón tay ===== */
(function(){
  if(!player)return;
  var sx2=0,sy2=0,st=0,up=0,dx=0,mode="",on=false,H=0;
  function reset(){sheet.style.transition="";sheet.style.transform="";sheet.style.visibility=""}
  function pnReset(anim){if(!pn)return;pn.style.transition=anim?"text-indent .22s cubic-bezier(.22,1,.36,1),opacity .22s":"";pn.style.textIndent="";pn.style.opacity=""}
  player.addEventListener("touchstart",function(e){
    if(!MINI.matches||isOpen||e.touches.length!==1||e.target.closest(".ctl span,.pg,.vol,input,button"))return;
    sx2=e.touches[0].clientX;sy2=e.touches[0].clientY;st=Date.now();up=0;dx=0;mode="";on=true;H=window.innerHeight;
  },{passive:true});
  player.addEventListener("touchmove",function(e){
    if(!on)return;
    var t=e.touches[0];dx=t.clientX-sx2;var dyUp=sy2-t.clientY;
    if(!mode){                                          /* khoá hướng vuốt ngay khi vượt 8px */
      if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dyUp))mode="h";
      else if(dyUp>8)mode="v";
      else if(Math.abs(dyUp)>8)mode="x";                /* vuốt xuống: bỏ qua */
      if(mode==="v"){lastKey="";paint();sheet.style.transition="none";sheet.style.visibility="visible"}
      if(mode==="h"&&pn)pn.style.transition="none";
    }
    if(mode==="v"){up=Math.max(0,dyUp);sheet.style.transform="translateY("+Math.max(0,H-up)+"px)"}
    else if(mode==="h"&&pn){pn.style.textIndent=(dx*0.6)+"px";pn.style.opacity=String(Math.max(.25,1-Math.abs(dx)/260))}
  },{passive:true});
  function end(){
    if(!on)return;on=false;
    if(mode==="h"){
      dragAt=Date.now();
      var dt=Math.max(1,Date.now()-st),go=Math.abs(dx)>56||(Math.abs(dx)>28&&Math.abs(dx)/dt>0.5);
      if(go&&window.MJ){
        var dir=dx<0?1:-1;                              /* vuốt trái = bài kế tiếp, vuốt phải = bài trước */
        if(dir>0)MJ.next();else MJ.prevTrack();
        if(pn){                                         /* tên bài mới trượt vào từ phía ngược lại */
          pn.style.transition="none";pn.style.textIndent=(dir*36)+"px";pn.style.opacity="0";
          void pn.offsetWidth;pnReset(true);setTimeout(function(){pnReset(false)},260);
        }
      }else pnReset(true),setTimeout(function(){pnReset(false)},260);
      return;
    }
    if(mode!=="v")return;
    dragAt=Date.now();
    var dt2=Math.max(1,Date.now()-st),fast=up/dt2>0.5,open=up>H*0.18||(up>30&&fast);
    if(open){reset();openSheet()}
    else{
      sheet.style.transition="transform .28s cubic-bezier(.22,1,.36,1)";sheet.style.transform="translateY(100%)";
      setTimeout(function(){if(!isOpen)reset()},300);
    }
  }
  player.addEventListener("touchend",end);player.addEventListener("touchcancel",end);
})();
/* PC: bấm vào ảnh bìa / tên bài ở khung "đang phát" bên phải cũng mở toàn màn hình */
/* ảnh bìa -> trình phát toàn màn hình; tên bài -> album chứa bài; tên nghệ sĩ -> hồ sơ; tim -> thêm/bỏ yêu thích */
(function(){
  var artEl=$("art");
  if(artEl){
    artEl.removeAttribute("onclick");artEl.style.cursor="pointer";artEl.setAttribute("role","button");artEl.tabIndex=0;
    artEl.addEventListener("click",function(){openSheet()});
    artEl.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openSheet()}});
  }
  var npn=$("npn");
  if(npn)npn.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest(".np-t"),a=e.target.closest&&e.target.closest(".np-a");
    if(t){var s=curSong(),al=albumFor(s);playlist(al.title,al.sub,al.img,al.tracks)}
    else if(a){var s2=curSong();if(s2.sub)artist(s2.sub,artistKey(s2.sub,s2.img))}
  });
  var hh=$("npHeart");
  if(hh){
    var syncHeart=function(){var on=hh.classList.contains("on");hh.setAttribute("aria-pressed",on?"true":"false");hh.title=on?"Bỏ khỏi yêu thích":"Thêm vào yêu thích";hh.setAttribute("aria-label",hh.title)};
    syncHeart();new MutationObserver(syncHeart).observe(hh,{attributes:true,attributeFilter:["class"]});
  }
})();
if(pn){
  pn.tabIndex=0;pn.setAttribute("role","button");pn.setAttribute("aria-label","Mở trình phát toàn màn hình");
  pn.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")){e.preventDefault();openSheet()}});
}
E.close.addEventListener("click",closeSheet);
document.addEventListener("keydown",function(e){if(e.key!=="Escape"||!isOpen)return;var pm=document.getElementById("payModal"),sm=document.getElementById("successModal");if((pm&&!pm.hidden)||(sm&&!sm.hidden))return;closeSheet()});
var onMQ=function(){};
if(MINI.addEventListener)MINI.addEventListener("change",onMQ);else if(MINI.addListener)MINI.addListener(onMQ);

/* các nút điều khiển: gọi lại đúng hàm của trình phát cũ nên 2 nơi luôn đồng bộ */
E.play.addEventListener("click",function(){tp();paint()});
$("npsPrev").addEventListener("click",function(){MJ.prev();paint()});
$("npsNext").addEventListener("click",function(){MJ.next();paint()});
E.shuffle.addEventListener("click",function(){var sh=document.querySelector(".ctl span:first-child");if(sh)sh.click();paint()});
E.repeat.addEventListener("click",function(){cycleRepeat();paint()});
$("npsShare").addEventListener("click",function(){window.shareSong()});
E.heart.addEventListener("click",function(){if(window.mjFav)mjFav.toggleCurrent();paint()});

/* thanh tiến trình: kéo / chạm để tua, phím mũi tên ±5 giây */
function pctFrom(x){var r=E.seek.getBoundingClientRect();return Math.min(1,Math.max(0,(x-r.left)/r.width))}
function showDrag(p){E.fill.style.width=(p*100)+"%";E.now.textContent=fmt(p*secs($("ptdur").textContent))}
E.seek.addEventListener("pointerdown",function(e){
  e.preventDefault();drag=true;E.seek.classList.add("drag");try{E.seek.setPointerCapture(e.pointerId)}catch(_){}
  dragPct=pctFrom(e.clientX);showDrag(dragPct);MJ.seek(dragPct,false);
});
E.seek.addEventListener("pointermove",function(e){if(!drag)return;dragPct=pctFrom(e.clientX);showDrag(dragPct);MJ.seek(dragPct,false)});
function endDrag(){if(!drag)return;drag=false;E.seek.classList.remove("drag");MJ.seek(dragPct,true);paint()}
E.seek.addEventListener("pointerup",endDrag);E.seek.addEventListener("pointercancel",endDrag);E.seek.addEventListener("lostpointercapture",endDrag);
E.seek.addEventListener("keydown",function(e){
  var d=secs($("ptdur").textContent)||1,cur=secs($("ptnow").textContent),n=null;
  if(e.key==="ArrowRight"||e.key==="ArrowUp")n=cur+5;else if(e.key==="ArrowLeft"||e.key==="ArrowDown")n=cur-5;
  else if(e.key==="Home")n=0;else if(e.key==="End")n=d-1;
  if(n===null)return;e.preventDefault();MJ.seek(Math.min(1,Math.max(0,n/d)),true);paint();
});

/* ===== Kéo ảnh bìa sang trái / phải để đổi bài (vuốt trái = bài kế, vuốt phải = bài trước) ===== */
var hSwipe=false;
(function(){
  var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)");
  var sx=0,sy0=0,dx=0,t0=0,on=false,lock="",moved=false,busy=false;
  var EXIT="transform .22s cubic-bezier(.4,0,1,1),opacity .22s ease-in",
      ENTER="transform .45s cubic-bezier(.22,1,.36,1),opacity .3s ease",
      BACK="transform .4s cubic-bezier(.34,1.56,.64,1),opacity .2s ease";
  function base(){return sheet.classList.contains("paused")?.86:1}
  function put(x,r,o,tr){E.art.style.transition=tr||"none";E.art.style.transform="translateX("+x+"px) rotate("+r+"deg) scale("+base()+")";E.art.style.opacity=o}
  function clear(){E.art.style.transition="";E.art.style.transform="";E.art.style.opacity=""}
  function slideText(dir){[E.title,E.sub].forEach(function(el){if(el.animate&&!(RM&&RM.matches))el.animate([{opacity:0,transform:"translateX("+(dir*26)+"px)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.22,1,.36,1)"})})}
  function change(dir){                                 /* dir=1: bài kế (ảnh trượt ra trái), dir=-1: bài trước */
    if(busy)return;busy=true;
    var W=Math.max(window.innerWidth,320),rm=RM&&RM.matches;
    if(rm){var k0=lastKey;if(dir>0)MJ.next();else MJ.prevTrack();paint();busy=false;return}
    put(-dir*W,-dir*14,0,EXIT);
    setTimeout(function(){
      var before=lastKey;if(dir>0)MJ.next();else MJ.prevTrack();paint();
      var changed=lastKey!==before,from=changed?dir:-dir;      /* không đổi được bài (vd. đang chờ quảng cáo): ảnh quay lại từ phía vừa trượt ra */
      put(from*W*.55,from*10,0,"none");void E.art.offsetWidth;
      put(0,0,1,ENTER);if(changed)slideText(dir);
      setTimeout(function(){clear();busy=false},470);
    },230);
  }
  E.art.addEventListener("pointerdown",function(e){
    if(busy||(e.pointerType==="mouse"&&e.button!==0))return;
    on=true;lock="";moved=false;dx=0;sx=e.clientX;sy0=e.clientY;t0=Date.now();
  });
  E.art.addEventListener("pointermove",function(e){
    if(!on)return;
    dx=e.clientX-sx;var dyv=e.clientY-sy0;
    if(!lock){
      if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dyv)){lock="h";hSwipe=true;moved=true;sw=false;sheet.style.transition="";sheet.style.transform="";try{E.art.setPointerCapture(e.pointerId)}catch(_){}}
      else if(Math.abs(dyv)>8){lock="v";on=false;return}
    }
    if(lock==="h"){put(dx,dx/16,Math.max(.35,1-Math.abs(dx)/(window.innerWidth*.9)))}
  });
  function up(){
    if(!on)return;on=false;
    if(lock!=="h"){hSwipe=false;return}
    hSwipe=false;
    var dt=Math.max(1,Date.now()-t0),W=E.art.offsetWidth||300;
    var go=Math.abs(dx)>W*.28||(Math.abs(dx)>30&&Math.abs(dx)/dt>.5);
    if(go)change(dx<0?1:-1);
    else{put(0,0,1,BACK);setTimeout(clear,420)}
  }
  E.art.addEventListener("pointerup",up);E.art.addEventListener("pointercancel",up);
  E.art.addEventListener("click",function(e){if(moved){e.stopImmediatePropagation();e.preventDefault();moved=false}},true);   /* vừa kéo xong: không mở album */
  E.art.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){e.preventDefault();change(-1)}else if(e.key==="ArrowLeft"){e.preventDefault();change(1)}});
  E.art.style.touchAction="none";
})();

/* vuốt xuống để thu nhỏ */
var sy=0,dy=0,sw=false;
function ts(e){if(e.touches.length!==1)return;sy=e.touches[0].clientY;dy=0;sw=true;sheet.style.transition="none"}
function tm(e){if(!sw||hSwipe)return;dy=Math.max(0,e.touches[0].clientY-sy);sheet.style.transform="translateY("+dy+"px)"}
function te(){if(!sw)return;sw=false;sheet.style.transition="";sheet.style.transform="";var far=dy>110;dy=0;if(far)closeSheet()}
[".nps-top",".nps-stage",".nps-info"].forEach(function(q){
  var el=sheet.querySelector(q);if(!el)return;
  el.addEventListener("touchstart",ts,{passive:true});el.addEventListener("touchmove",tm,{passive:true});
  el.addEventListener("touchend",te);el.addEventListener("touchcancel",te);
});

/* ===== MENU CHUỘT PHẢI trên dòng bài hát / thanh phát nhạc (chỉ PC) ===== */
var FINE=window.matchMedia("(hover:hover) and (pointer:fine)"),menu=null,menuRow=null,menuFocus=null;
function copyText(text,msg){
  var ok=function(){toast(msg)};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(ok,function(){legacyCopy(text);ok()});
  else{legacyCopy(text);ok()}
}
function songFromRow(row){
  var b=row.querySelector(".n b"),sp=row.querySelector(".n span"),cv=row.querySelector(".cv"),m=cv&&/im-([\w-]+)/.exec(cv.className);
  return {title:b.textContent.trim(),sub:sp?sp.textContent.trim():"",img:m?m[1]:"lofi"};
}
function isSongRowEl(r){return !!(r&&r.classList&&r.classList.contains("row")&&r.querySelector(".n b")&&r.querySelector(".cv")&&/setNowPlaying|play\(|playlist\(/.test(r.getAttribute("onclick")||""))}
function closeMenu(restore){
  if(!menu)return;
  menu.remove();menu=null;
  if(menuRow){menuRow.classList.remove("ctx-on");menuRow=null}
  if(restore&&menuFocus&&menuFocus.focus)try{menuFocus.focus({preventScroll:true})}catch(e){}
  menuFocus=null;
}
var IC={
  play:'<polygon points="6 4 20 12 6 20 6 4"/>',pause:'<path d="M7 5v14M17 5v14"/>',
  heart:'<path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.6 4.5 6.8 4.5c1.9 0 3.4 1 5.2 3 1.8-2 3.3-3 5.2-3 3.2 0 5 3.1 3.8 6.3C19 15.6 12 20 12 20z"/>',
  album:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  share:'<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'
};
/* đáy vùng nhìn thấy thật sự: trừ phần cửa sổ bị thanh taskbar/màn hình che */
function visBottom(){
  var vh=window.innerHeight;
  try{
    var vv=window.visualViewport;if(vv)vh=Math.min(vh,vv.height+vv.offsetTop);
    var top=(window.screenY||window.screenTop||0)+(window.outerHeight-window.innerHeight);
    var avail=(screen.availTop||0)+screen.availHeight-top;
    if(avail>240&&avail<vh)vh=avail;
  }catch(e){}
  return vh;
}
function openMenu(x,y,song,o){
  closeMenu();menuFocus=document.activeElement;
  var items=[];
  var isPL=!o.player&&/^(Playlist|Danh sách nhạc)$/.test(song.sub||"");
  if(isPL){
    items.push({ic:"play",label:"Phát playlist",run:function(){o.row.click();if(typeof playlistPlay==="function")playlistPlay()}});
    items.push({ic:"album",label:"Mở playlist",run:function(){o.row.click()}});
    items.push("hr");
    items.push({ic:"copy",label:"Sao chép tên playlist",run:function(){copyText(song.title.replace(/\s*[^\p{L}\p{N}\s]+\s*$/u,"").trim()||song.title,"Đã sao chép tên playlist")}});
  }else{
  items.push({ic:o.player?(isPlaying()?"pause":"play"):"play",label:o.player?(isPlaying()?"Tạm dừng":"Phát"):"Phát bài này",run:function(){if(o.player)tp();else o.row.click()}});
  if(o.heart)items.push({ic:"heart",on:o.heart.classList.contains("on"),label:o.heart.classList.contains("on")?"Bỏ khỏi yêu thích":"Thêm vào yêu thích",run:function(){o.heart.click()}});
  items.push({ic:"album",label:"Mở album chứa bài",run:function(){var a=albumFor(song);if(isOpen)closeSheet();playlist(a.title,a.sub,a.img,a.tracks)}});
  if(song.sub)items.push({ic:"user",label:"Xem nghệ sĩ: "+song.sub,run:function(){if(isOpen)closeSheet();artist(song.sub,artistKey(song.sub,song.img))}});
  items.push("hr");
  items.push({ic:"share",label:"Chia sẻ liên kết",run:function(){window.shareSong(song)}});
  items.push({ic:"copy",label:"Sao chép tên bài",run:function(){copyText(song.title+(song.sub?" – "+song.sub:""),"Đã sao chép tên bài")}});
  }

  var m=document.createElement("div");m.className="ctxm";m.setAttribute("role","menu");m.setAttribute("aria-label","Tuỳ chọn bài hát");
  var h=document.createElement("div");h.className="ch";var hb=document.createElement("b");hb.textContent=song.title;var hs=document.createElement("span");hs.textContent=song.sub;
  h.appendChild(hb);if(song.sub)h.appendChild(hs);m.appendChild(h);m.appendChild(document.createElement("hr"));
  items.forEach(function(it){
    if(it==="hr"){m.appendChild(document.createElement("hr"));return}
    var b=document.createElement("button");b.type="button";b.setAttribute("role","menuitem");if(it.on)b.className="on";
    b.innerHTML='<svg viewBox="0 0 24 24">'+IC[it.ic]+'</svg><span></span>';b.querySelector("span").textContent=it.label;
    b.addEventListener("click",function(){closeMenu(false);it.run()});
    m.appendChild(b);
  });
  m.style.left="0px";m.style.top="0px";m.style.visibility="hidden";document.body.appendChild(m);menu=m;
  /* html{zoom} (màn hình lớn) làm toạ độ position:fixed bị nhân lên → quy đổi toạ độ chuột về cùng hệ */
  var z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  x=x/z;y=y/z;
  var vw=window.innerWidth/z,vh=visBottom()/z;
  m.style.maxHeight=Math.max(120,vh-16)+"px";m.style.overflowY="auto";
  var w=m.offsetWidth,hh=m.offsetHeight;
  var px=x+w+8>vw?Math.max(8,x-w):x, py=y;
  if(y+hh+8>vh){py=(y-hh>=8)?y-hh:Math.max(8,vh-hh-8)}   /* lật lên trên, nếu không đủ chỗ thì dán sát đáy vùng nhìn thấy */
  m.style.left=px+"px";m.style.top=py+"px";m.style.visibility="";
  if(o.row){menuRow=o.row;o.row.classList.add("ctx-on")}
  var first=m.querySelector("button");if(first&&FINE.matches)first.focus({preventScroll:true});
}
document.addEventListener("contextmenu",function(e){
  if(!FINE.matches||document.body.classList.contains("guest")||!e.target.closest)return;
  if(e.target.closest(".ctxm")){e.preventDefault();return}
  if(e.target.closest("input,textarea,select,[contenteditable='true']")){closeMenu();return}
  var row=e.target.closest(".row"),pl=e.target.closest(".player"),song=null,o=null;
  if(isSongRowEl(row)){song=songFromRow(row);o={row:row,heart:row.querySelector(".heart")}}
  else if(pl){song=curSong();o={player:true,heart:$("npHeart")}}
  if(!song){closeMenu();return}
  e.preventDefault();openMenu(e.clientX,e.clientY,song,o);
});
document.addEventListener("mousedown",function(e){if(menu&&!e.target.closest(".ctxm"))closeMenu(false)},true);
document.addEventListener("keydown",function(e){
  if(!menu)return;
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closeMenu(true);return}
  var bs=[].slice.call(menu.querySelectorAll("button")),i=bs.indexOf(document.activeElement);
  if(e.key==="ArrowDown"){e.preventDefault();bs[(i+1)%bs.length].focus()}
  else if(e.key==="ArrowUp"){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}
  else if(e.key==="Home"){e.preventDefault();bs[0].focus()}
  else if(e.key==="End"){e.preventDefault();bs[bs.length-1].focus()}
  else if(e.key==="Tab"){closeMenu(false)}
},true);
/* ===== Điện thoại: GIỮ lâu vào dòng bài hát = mở cùng menu như bấm chuột phải trên PC ===== */
(function(){
  var t=0,sx=0,sy=0,row=null,fired=false,swallow=0;
  function clear(){clearTimeout(t);t=0}
  document.addEventListener("touchstart",function(e){
    if(menu&&!e.target.closest(".ctxm")){closeMenu(false);swallow=Date.now()+500}   /* chạm ra ngoài chỉ đóng menu, không kích hoạt thứ nằm dưới */
    fired=false;clear();
    if(e.touches.length!==1||document.body.classList.contains("guest"))return;
    var r=e.target.closest&&e.target.closest(".row");
    if(!r||e.target.closest(".heart")||!isSongRowEl(r))return;
    row=r;sx=e.touches[0].clientX;sy=e.touches[0].clientY;
    t=setTimeout(function(){
      t=0;fired=true;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}
      openMenu(sx,sy,songFromRow(row),{row:row,heart:row.querySelector(".heart")});
    },480);
  },{passive:true});
  document.addEventListener("touchmove",function(e){
    if(!t)return;var p=e.touches[0];
    if(Math.abs(p.clientX-sx)>10||Math.abs(p.clientY-sy)>10)clear();              /* đang cuộn/vuốt: không phải giữ lâu */
  },{passive:true});
  document.addEventListener("touchend",function(e){
    clear();
    if(fired){e.preventDefault();setTimeout(function(){fired=false},60)}           /* nhả tay sau khi giữ: chặn click/mousedown giả làm đóng menu hoặc phát bài */
  },{passive:false});
  document.addEventListener("touchcancel",clear);
  document.addEventListener("click",function(e){
    if(Date.now()<swallow){e.preventDefault();e.stopPropagation()}
  },true);
  document.addEventListener("contextmenu",function(e){                              /* chặn menu mặc định của trình duyệt khi giữ lâu */
    var r=e.target.closest&&e.target.closest(".row");
    if(!FINE.matches&&r&&isSongRowEl(r))e.preventDefault();
  },true);
})();
window.addEventListener("resize",function(){closeMenu(false)});
window.addEventListener("blur",function(){closeMenu(false)});
document.addEventListener("scroll",function(){closeMenu(false)},true);

})();

(function(){
  var GAP=44, SPEED=42, PAUSE=1600;               /* khoảng cách giữa 2 lần lặp (px), tốc độ (px/giây), nghỉ đầu mỗi vòng (ms) */
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)");
  var MINI=window.matchMedia("(max-width:699px),(max-height:500px)");
  function marquee(el,active){
    if(!el)return;
    var track=null,anim=null,txt=null;
    function stop(){
      if(anim){try{anim.cancel()}catch(e){}anim=null}
      if(track)track.classList.remove("on");
      el.classList.remove("marq");
    }
    function intact(){return track&&el.firstElementChild===track&&el.childNodes.length===1&&track.textContent===txt}
    function build(){
      if(intact())return;
      stop();
      txt=el.textContent;
      el.textContent="";
      track=document.createElement("span");track.className="mqx";
      track.setAttribute("data-t",txt);track.textContent=txt;
      el.appendChild(track);
    }
    function update(){
      build();stop();
      if(!active()||(reduce&&reduce.matches))return;
      if(el.scrollWidth<=el.clientWidth+1)return;           /* vừa khít thì giữ nguyên, không chạy */
      var w=track.getBoundingClientRect().width,dist=w+GAP;
      track.classList.add("on");el.classList.add("marq");
      var dur=PAUSE+dist/SPEED*1000,p=PAUSE/dur;
      anim=track.animate([{transform:"translateX(0)",offset:0},{transform:"translateX(0)",offset:p},{transform:"translateX("+(-dist)+"px)",offset:1}],
                         {duration:dur,iterations:Infinity,easing:"linear"});
    }
    new MutationObserver(function(){if(!intact())update()}).observe(el,{childList:true,characterData:true,subtree:true});
    if(window.ResizeObserver)new ResizeObserver(function(){update()}).observe(el);
    if(MINI.addEventListener)MINI.addEventListener("change",update);else if(MINI.addListener)MINI.addListener(update);
    if(reduce&&reduce.addEventListener)reduce.addEventListener("change",update);
    update();
  }
  function init(){
    marquee(document.getElementById("pn"),function(){return MINI.matches});   /* thanh phát nhạc nhỏ (mobile) */
    marquee(document.getElementById("npsTitle"),function(){return true});     /* tên bài + ca sĩ trong màn hình Đang phát */
    marquee(document.getElementById("npsSub"),function(){return true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
