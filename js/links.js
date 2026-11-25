(function(){
"use strict";
/* ===== Giống Spotify: trong mọi danh sách bài hát,
   - bấm TÊN BÀI  -> mở album chứa bài đó
   - bấm TÊN NGHỆ SĨ -> mở hồ sơ nghệ sĩ
   - bấm phần còn lại của dòng -> vẫn phát nhạc như cũ ===== */
var nrm=function(x){return String(x||"").replace(/['’]/g,"").trim().toLowerCase()};
function inView(id){var v=document.getElementById(id);return !!(v&&v.classList.contains("on"))}

/* dòng bài hát thật (có ảnh bìa + tên + nghệ sĩ + hành động phát); bỏ qua dòng bạn bè, playlist tự tạo... */
function songRow(row){
  if(!row||!row.classList.contains("row")||row.classList.contains("frow"))return null;
  if(!row.closest(".main"))return null;
  var b=row.querySelector(".n b"),sp=row.querySelector(".n span");
  if(!b||!sp||!row.querySelector(".cv"))return null;
  if(!/setNowPlaying|play\(/.test(row.getAttribute("onclick")||""))return null;
  return {row:row,b:b,sp:sp};
}
function imgOf(row){var cv=row.querySelector(".cv"),m=cv&&/im-([\w-]+)/.exec(cv.className);return m?m[1]:"lofi"}

/* đánh dấu chữ có thể bấm (để CSS gạch chân + con trỏ tay, và để chỉ vùng chữ mới bắt click) */
function decorate(root){
  (root||document).querySelectorAll(".main .row").forEach(function(r){
    var s=songRow(r);if(!s||s.b.classList.contains("mj-lk"))return;
    s.b.classList.add("mj-lk","mj-lk-t");s.b.setAttribute("title","Mở album chứa bài hát");s.b.tabIndex=0;s.b.setAttribute("role","link");
    s.sp.classList.add("mj-lk","mj-lk-a");s.sp.setAttribute("title","Xem hồ sơ nghệ sĩ");s.sp.tabIndex=0;s.sp.setAttribute("role","link");
  });
}

function openAlbum(title,artistName,img){
  var al=window.mjAlbumFor?window.mjAlbumFor({title:title,sub:artistName,img:img}):null;
  if(!al)return;
  /* đang ở đúng trang album này rồi thì không cần mở lại */
  if(inView("view-playlist")){var n=document.getElementById("pl-name");if(n&&nrm(n.textContent)===nrm(al.title))return}
  playlist(al.title,al.sub,al.img,al.tracks);
}
function openArtist(name,img){
  if(inView("view-artist")){var n=document.getElementById("art-name"),c=document.getElementById("art-crumb");
    if(n&&nrm(n.textContent)===nrm(name)&&!(c&&c.dataset.back))return}
  var tr=(window.mjByArtist?mjByArtist(name):[])[0];
  var key=window.mjArtistKey?mjArtistKey(name,tr?tr.c:img):img;
  artist(name,key||img);
}

/* bắt ở giai đoạn capture để chạy trước onclick="setNowPlaying(...)" của dòng */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest(".mj-lk");if(!el)return;
  var s=songRow(el.closest(".row"));if(!s)return;
  var title=s.b.textContent.trim(),art=s.sp.textContent.trim(),img=imgOf(s.row);
  if(el.classList.contains("mj-lk-t")){
    /* đang ở trang album chứa bài này: bấm tên bài = phát bài như bình thường */
    var al=window.mjAlbumFor?mjAlbumFor({title:title,sub:art,img:img}):null;
    var pn=document.getElementById("pl-name");
    if(inView("view-playlist")&&al&&pn&&nrm(pn.textContent)===nrm(al.title))return;
    e.stopPropagation();e.preventDefault();openAlbum(title,art,img);
  }else{
    var an=document.getElementById("art-name"),c=document.getElementById("art-crumb");
    if(inView("view-artist")&&an&&nrm(an.textContent)===nrm(art)&&!(c&&c.dataset.back))return;   /* đang ở hồ sơ chính nghệ sĩ này: phát bài */
    e.stopPropagation();e.preventDefault();openArtist(art,img);
  }
},true);

/* bàn phím: Tab tới chữ rồi Enter */
document.addEventListener("keydown",function(e){
  if(e.key!=="Enter")return;var el=e.target;if(!el||!el.classList||!el.classList.contains("mj-lk"))return;
  e.preventDefault();el.click();
});

var main=document.querySelector(".main"),pend=false;
if(main&&window.MutationObserver){
  new MutationObserver(function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;decorate()})}).observe(main,{childList:true,subtree:true});
}
decorate();
})();
