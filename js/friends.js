(function(){
"use strict";
/* Trang "Bạn bè" (tab thứ 6 trên thanh tab mobile): danh sách bạn lấy từ cột Bạn bè ở thanh bên,
   dòng phụ "Vừa nghe" lấy từ FRIEND_RECENT. Bấm dòng → hồ sơ bạn bè (hàm friend() có sẵn); bấm ▶ → nghe bài họ vừa nghe. */
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function friendsList(){
  return [].map.call(document.querySelectorAll(".side .fr"),function(el){
    var m=/friend\('([^']*)','([^']*)'\)/.exec(el.getAttribute("onclick")||"");return m?{n:m[1],i:m[2]}:null;
  }).filter(Boolean);
}
function render(){
  var box=$("friendList");if(!box)return;
  var fr=friendsList(),cnt=$("friendCount");
  if(cnt)cnt.textContent=fr.length+" người bạn · Xem họ đang nghe gì.";
  box.innerHTML=fr.map(function(f){
    var L=(window.FRIEND_RECENT&&FRIEND_RECENT[f.n])||[],r=L[0];
    var sub=r?"Vừa nghe: "+esc(r[0])+" · "+esc(r[1]):"Bạn bè trên MeloJam";
    var play=r?'<button type="button" class="fplay" aria-label="Nghe “'+esc(r[0])+'” – '+esc(r[1])+'" title="Nghe bài họ vừa nghe" onclick="event.stopPropagation();setNowPlaying(\''+esc(r[0])+'\',\''+esc(r[1])+'\',\''+esc(r[2])+'\')">▶</button>':'';
    return '<div class="row frow" role="button" aria-label="Xem hồ sơ của '+esc(f.n)+'" onclick="friend(\''+esc(f.n)+'\',\''+esc(f.i)+'\')"><div class="cv im-'+esc(f.i)+'"></div><div class="n"><b>'+esc(f.n)+'</b><span>'+sub+'</span></div>'+play+'<em class="chev">›</em></div>';
  }).join("");
}
render();
window.mjFriends={render:render};
})();
