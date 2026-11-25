(function(){
"use strict";
/* ========= LỊCH SỬ NGHE (mục "Gần đây") =========
   - Không còn dữ liệu mẫu: lần đầu chạy danh sách trống, chỉ khi nghe thật mới có bài.
   - Bấm nghe một bài (bài bắt đầu phát) là ghi ngay vào lịch sử. Tạm dừng rồi phát tiếp không ghi trùng;
     lặp lại bài hoặc chọn lại bài đó thì tính lượt mới. Nghe lại bài đã có -> bài nhảy lên đầu.
   - Lưu trong localStorage (khoá mj-history-v1), tối đa MAX bài, đồng bộ giữa các tab. */
var KEY="mj-history-v1",MAX=50;
var $=function(i){return document.getElementById(i)};
var items=[];                                   /* [{t,a,c,ts}] mới nhất ở đầu */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function key(t,a){return mjNorm(t)+"|"+mjNorm(a)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}}
function load(){
  var raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}
  items=[];if(!raw)return;
  try{
    var d=JSON.parse(raw);
    items=(Array.isArray(d)?d:[]).map(function(x){
      var tr=x&&mjTrack(x.t,x.a);return tr&&isFinite(x.ts)?{t:tr.t,a:tr.a,c:tr.c,ts:+x.ts}:null;
    }).filter(Boolean).slice(0,MAX);
  }catch(e){items=[]}
}

/* ----- nhóm theo ngày: Hôm nay / Hôm qua / dd/mm/yyyy ----- */
function dayStart(ts){var d=new Date(ts);d.setHours(0,0,0,0);return d.getTime()}
function groupLabel(ts){
  var diff=Math.round((dayStart(Date.now())-dayStart(ts))/864e5);
  if(diff<=0)return"Hôm nay";if(diff===1)return"Hôm qua";
  var d=new Date(ts),p=function(n){return("0"+n).slice(-2)};
  return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear();
}
function pad(n){return("0"+n).slice(-2)}
function rowHtml(x){
  var t=esc(x.t),a=esc(x.a),d=new Date(x.ts),when=pad(d.getHours())+":"+pad(d.getMinutes());
  return '<div class="row" data-k="'+esc(key(x.t,x.a))+'" title="Nghe lúc '+when+'" onclick="setNowPlaying(\''+t+'\',\''+a+'\',\''+esc(x.c)+'\')"><div class="cv im-'+esc(x.c)+'"></div><div class="n"><b>'+t+'</b><span>'+a+'</span></div><em>'+mjDur(x.t,x.a)+'</em></div>';
}
function render(){
  var v=$("view-recent");if(!v)return;
  var n=items.length,sub=n?"Lịch sử nghe gần nhất của bạn, mới nhất lên đầu.":"Những bài bạn đã nghe sẽ hiện ở đây.";
  var h='<h2>Gần đây</h2><p style="color:var(--mu);margin:-8px 0 16px;font-size:13px">'+esc(sub)+'</p>';
  if(!n){
    h+='<div class="fav-empty"><div class="fav-ic">♪</div><b>Chưa có lịch sử nghe</b><p>Bấm nghe một bài hát, bài đó sẽ được lưu vào đây.</p><button type="button" class="btn" onclick="nav(\'genre\')">Khám phá thể loại</button></div>';
  }else{
    var last=null,open=false;
    items.forEach(function(x){
      var g=groupLabel(x.ts);
      if(g!==last){if(open)h+='</div>';h+='<div class="lbl">'+esc(g)+'</div><div class="box">';open=true;last=g}
      h+=rowHtml(x);
    });
    if(open)h+='</div>';
    h+='<div class="hist-actions"><button type="button" class="btn o" id="histClear">Xoá lịch sử nghe</button></div>';
  }
  v.innerHTML=h;
  var c=$("histClear");if(c)c.addEventListener("click",clearAll);
  if(window.MJ&&MJ.refresh)MJ.refresh();        /* tô sáng bài đang phát */
}
var chFocus=null;
function closeClear(){
  var m=$("clearHistModal");if(m)m.hidden=true;
  if(chFocus&&chFocus.focus)try{chFocus.focus()}catch(e){}
}
function clearAll(){
  if(!items.length)return;
  var m=$("clearHistModal");
  if(!m){items=[];save();render();return}
  chFocus=document.activeElement;
  m.hidden=false;
  setTimeout(function(){var c=$("chCancel");if(c)c.focus()},30);
}
(function(){
  var m=$("clearHistModal");if(!m)return;
  m.addEventListener("click",function(e){if(e.target===m)closeClear()});
  $("chCancel").addEventListener("click",closeClear);
  $("chOk").addEventListener("click",function(){
    m.hidden=true;items=[];save();render();
    if(chFocus&&chFocus.focus)try{chFocus.focus()}catch(e){}
  });
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!m.hidden)closeClear()});
})();

/* ----- ghi nhận một lượt nghe ----- */
function record(tr){
  var k=key(tr.t,tr.a);
  items=items.filter(function(x){return key(x.t,x.a)!==k});
  items.unshift({t:tr.t,a:tr.a,c:tr.c,ts:Date.now()});
  if(items.length>MAX)items.length=MAX;
  save();render();
}

/* ----- ghi ngay khi bài bắt đầu phát (theo phần tử audio của trình phát) ----- */
function trackOfAudio(au){
  var k=au.getAttribute("data-k");if(!k)return null;
  for(var i=0;i<MJ_TRACKS.length;i++)if(MJ_TRACKS[i].k===k)return MJ_TRACKS[i];
  return null;
}
function watch(au){
  var counted=false,curK=null,lastT=0;
  function reset(){counted=false;lastT=0}
  function hit(){                                                  /* đang phát thật sự -> tính 1 lượt nghe cho bài hiện tại */
    var tr=trackOfAudio(au);if(!tr)return;
    if(tr.k!==curK){curK=tr.k;counted=false}
    if(!counted){counted=true;record(tr)}
  }
  au.addEventListener("loadstart",reset);                          /* đổi bài */
  au.addEventListener("ended",reset);                              /* hết bài: lần phát sau là lượt mới */
  au.addEventListener("playing",hit);                              /* bấm nghe / bấm phát lại sau khi tạm dừng (không ghi trùng) */
  au.addEventListener("timeupdate",function(){                     /* lặp lại bài từ đầu (repeat 1 bài) = lượt nghe mới */
    var t=au.currentTime||0;
    if(lastT>2&&t<1&&!au.paused){counted=false;hit()}
    lastT=t;
  });
}

window.addEventListener("storage",function(e){if(e.key===KEY){load();render()}});        /* đồng bộ giữa các tab */
load();render();
if(window.MJ&&MJ.audio)watch(MJ.audio);
window.mjHistory={list:function(){return items.slice()},clear:function(){items=[];save();render()},render:render};
})();
