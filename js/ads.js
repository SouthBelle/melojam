(function(){
"use strict";
/* ========= CẤU HÌNH QUẢNG CÁO (chỉnh ở đây hoặc đặt window.MJ_ADS_CFG trước khi chạy) =========
   enabled        bật / tắt toàn bộ quảng cáo
   everyEnded     cứ nghe HẾT bấy nhiêu bài thì chèn 1 quảng cáo (đặt 1 = sau mỗi bài)
   skipLimit      cứ skip (bài tiếp / bài trước) bấy nhiêu lần thì chèn 1 quảng cáo (mặc định 5)
   skipWindowSec  chỉ đếm các lần skip trong bấy nhiêu giây gần nhất (0 = không giới hạn thời gian)
   afterAdGapMs   nghỉ bấy nhiêu mili-giây sau khi quảng cáo kết thúc rồi mới phát bài kế tiếp
   adSeconds      độ dài quảng cáo (giây)
   skippableAfter được bấm "Bỏ qua" sau bấy nhiêu giây
   minGapSec      khoảng cách tối thiểu giữa 2 quảng cáo (giây) để không làm phiền liên tục
   adSounds       danh sách sound quảng cáo, mỗi lần hiện quảng cáo dùng lần lượt từng sound (xoay phiên A, B, A, B...).
                  Mỗi sound: {src:"đường dẫn mp3", sec:thời lượng giây dự kiến để hiện ngay; khi file tải xong web tự lấy thời lượng thật}.
                  Quảng cáo có sound kéo dài đúng bằng thời lượng sound, quảng cáo snd:false dùng adSeconds.
   Gói Premium, trang quản trị và khách chưa đăng nhập: không có quảng cáo. */
var DEF={enabled:true,everyEnded:2,skipLimit:5,skipWindowSec:0,adSeconds:10,skippableAfter:5,minGapSec:0,afterAdGapMs:500,adSounds:[{src:"audio/ad-premium.mp3",sec:28.99},{src:"audio/ad-premium-vi.mp3",sec:28.92}]};
window.MJ_ADS_CFG=Object.assign({},DEF,window.MJ_ADS_CFG||{});
function cfg(){return window.MJ_ADS_CFG||DEF}

var CREATIVES=[
 /* pre:true = quảng cáo Premium (nút mở màn thanh toán); song = bài hát trong app (nút "Nghe ngay" phát bài đó);
    sound:"audio/x.mp3" = sound riêng cho mẫu đó, nếu không có thì dùng cfg.adSound; snd:false = mẫu không có sound (chạy adSeconds giây) */
 {g1:"#1b1f3a",g2:"#2f92f7",art:"🎧",brand:"MeloJam Premium",title:"Nghe nhạc không quảng cáo.",body:"Bỏ qua bài hát không giới hạn, nghe mọi lúc mọi nơi. Dùng thử Premium ngay.",cta:"Dùng thử Premium",pre:true},
 {g1:"#7a2e0e",g2:"#f59e0b",art:"🍜",brand:"Phở Bà Tám",title:"Nóng hổi từng muỗng nước dùng.",body:"Phở bò tái nạm hầm 12 tiếng. Giao tận nơi trong 25 phút, freeship đơn đầu.",cta:"Đặt phở ngay"},
 {g1:"#111827",g2:"#ec4899",art:"👕",brand:"Cotton Lab",title:"Mặc đẹp, giá mềm.",body:"Bộ sưu tập thu đông mới, đồng giá từ 199k. Đổi trả trong 30 ngày.",cta:"Mua sắm · giảm 30%"},
 {g1:"#0f766e",g2:"#34d399",art:"👟",brand:"Bước Nhanh Sneaker",title:"Chạy nhẹ, đi êm cả ngày.",body:"Giày thể thao đế siêu nhẹ, tặng kèm tất khi mua 2 đôi.",cta:"Xem mẫu mới"},
 {g1:"#4a3426",g2:"#d08a4a",art:"☕",brand:"Nhà Sao Coffee",title:"Ngon từ hạt, tỉnh từng phút.",body:"Cà phê rang xay mỗi sáng. Đặt trước, nhận ngay ở quầy.",cta:"Đặt ngay · giảm 20%"},
 {g1:"#2f92f7",g2:"#7a5cf6",art:"📶",brand:"Gió Mới 5G",title:"Data thả ga, nhạc không ngắt quãng.",body:"Gói cước mới cho người mê nghe nhạc. Tặng 3 tháng đầu.",cta:"Tìm hiểu gói cước"},
 {g1:"#ef5d3a",g2:"#ffb347",art:"🍱",brand:"Bếp Nhà Mình",title:"Giao nhanh, ăn ngon ngay.",body:"Món nhà làm giao tận nơi trong 30 phút. Freeship đơn đầu tiên.",cta:"Xem thực đơn"},
 {g1:"#0c4a6e",g2:"#38bdf8",art:"✈️",brand:"Vivu Travel",title:"Đi đâu cũng được, miễn là đi.",body:"Vé máy bay và khách sạn trọn gói, giảm đến 25% cho chuyến đầu tiên.",cta:"Săn vé ngay"},
 {g1:"#312e81",g2:"#ec4899",art:"🔥",brand:"Đang thịnh hành trên MeloJam",title:"Like You Do — Joji",body:"Bài hát được nghe nhiều tuần này. Nghe ngay khi quảng cáo kết thúc.",cta:"Nghe ngay",song:{t:"Like You Do",s:"Joji",i:"joji"}},
 {g1:"#0f172a",g2:"#7c3aed",art:"💿",brand:"Mới thêm vào MeloJam",title:"Crescendolls — Daft Punk",body:"Điệu electro kinh điển, vừa được thêm vào thư viện của bạn.",cta:"Nghe ngay",song:{t:"Crescendolls",s:"Daft Punk",i:"daft"}},
 {g1:"#7c2d12",g2:"#fb7185",art:"🎶",brand:"Gợi ý cho bạn",title:"Saturn (Gali Remix) — SZA",body:"Bản remix đang được nhiều người lưu. Thử nghe xem có hợp gu không.",cta:"Nghe ngay",song:{t:"Saturn (Gali Remix)",s:"SZA",i:"sos"}}
];
/* chọn ngẫu nhiên một mẫu, không lặp lại mẫu vừa hiện */
function pickIdx(){var n=CREATIVES.length,k=Math.floor(Math.random()*n);if(n>1&&k===rot)k=(k+1+Math.floor(Math.random()*(n-1)))%n;return k}
var $=function(i){return document.getElementById(i)};
var endedN=0,skips=[],lastAd=0,isOpen=false,rot=-1,timer=0,proceed=null,startT=0,prevFocus=null;
var snd=null,sndDur=0,sndBad=false,sndSusp=false,curCr=null,pendingGo=0,sndRot=-1;
function fmt(x){x=Math.max(0,x);return Math.floor(x/60)+":"+("0"+Math.floor(x%60)).slice(-2)}

function eligible(){
  var c=cfg(),b=document.body.classList;
  if(!c.enabled||isOpen)return false;
  if(window.isPremium)return false;                       /* gói Premium: không quảng cáo */
  if(b.contains("guest")||b.contains("admin"))return false;
  return Date.now()-lastAd>=c.minGapSec*1000;
}
/* Được engine phát nhạc gọi trước khi chuyển bài. Trả true nếu đã hiện quảng cáo
   (khi đó quảng cáo sẽ tự gọi `go` sau khi xong để chuyển bài tiếp). */
function gate(kind,go,next,hold){
  var c=cfg(),show=false;
  if(pendingGo){clearTimeout(pendingGo);pendingGo=0}       /* người dùng tự bấm trong lúc đang nghỉ sau quảng cáo: bỏ lần chuyển bài chờ sẵn */
  if(kind==="ended"){endedN++;if(endedN>=c.everyEnded)show=true}
  else{var now=Date.now();skips.push(now);if(c.skipWindowSec>0)skips=skips.filter(function(t){return now-t<=c.skipWindowSec*1000});if(skips.length>=c.skipLimit)show=true}
  if(show&&eligible()){showAd(kind,go,next,hold);return true}
  return false;
}
function toast(msg){
  var t=$("mjToast");if(!t)return;
  t.hidden=false;t.innerHTML="<i>ℹ</i><span></span>";t.querySelector("span").textContent=msg;
  t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},3100);
}
function showAd(kind,go,next,hold){
  var c=cfg(),cr=CREATIVES[rot=pickIdx()],o=$("advOverlay");
  curCr=cr;endedN=0;skips=[];proceed=go;isOpen=true;startT=performance.now();lastTick=0;
  snd=null;sndDur=0;sndBad=false;sndSusp=false;
  var src=cr.sound,sec=0;
  if(cr.snd!==false&&!src){                               /* xoay phiên giữa các sound trong cfg.adSounds */
    var L=c.adSounds&&c.adSounds.length?c.adSounds:(c.adSound?[{src:c.adSound,sec:c.adSoundSec||0}]:[]);
    if(L.length){var sd=L[sndRot=(sndRot+1)%L.length];src=sd.src;sec=sd.sec||0}
  }
  if(cr.snd!==false&&src){                                /* quảng cáo có sound: phát file âm thanh, độ dài quảng cáo = độ dài sound */
    try{var a=new Audio(src);snd=a;a.preload="auto";sndDur=sec;
      a.addEventListener("loadedmetadata",function(){if(snd===a&&isFinite(a.duration)&&a.duration>0)sndDur=a.duration});
      a.addEventListener("error",function(){if(snd===a){snd=null;sndDur=0}});
      var pr=a.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){snd=null;sndDur=0}
  }prevFocus=document.activeElement;
  try{if(hold)hold()}catch(e){}                           /* tạm dừng nhạc trong lúc quảng cáo */
  var cv=$("advCreative");cv.style.setProperty("--g1",cr.g1);cv.style.setProperty("--g2",cr.g2);
  $("advArt").textContent=cr.art;$("advBrand").textContent=cr.brand;$("advTitle").textContent=cr.title;$("advBody").textContent=cr.body;$("advCta").textContent=cr.cta;
  $("advWhy").textContent=kind==="skip"
    ?"Bạn đã bỏ qua nhiều bài liên tiếp. Xem quảng cáo ngắn để tiếp tục, hoặc nâng cấp Premium để bỏ qua không giới hạn."
    :"Quảng cáo ngắn trước bài tiếp theo.";
  var nx=$("advNext");nx.textContent="";
  if(next&&next.t){var b=document.createElement("b");b.textContent=next.t+(next.s?" – "+next.s:"");nx.appendChild(document.createTextNode("Tiếp theo: "));nx.appendChild(b)}
  $("advBar").style.width="0%";
  o.classList.remove("closing");o.hidden=false;
  tickAd();clearInterval(timer);timer=setInterval(tickAd,100);
  setTimeout(function(){var s=$("advCard");if(s)try{s.focus({preventScroll:true})}catch(e){}},60);   /* focus vào khung, không vào nút nào: tránh lỡ bấm Space/Enter là nâng cấp */
}
var lastTick=0;
function tickAd(){
  var nowT=performance.now();
  if(window.isPremium){closeAd();return}                   /* đã nâng cấp xong: hết quảng cáo */
  var c=cfg(),sk=$("advSkip"),total=c.adSeconds,el=(nowT-startT)/1000,useSnd=false;
  if(snd&&sndDur>0&&!sndBad){                              /* mở màn thanh toán thì sound và đồng hồ quảng cáo vẫn chạy tiếp */
    if(snd.currentTime===0&&snd.paused&&el>2)sndBad=true;  /* trình duyệt chặn phát tiếng: dùng đồng hồ thường */
    else{total=sndDur;el=snd.currentTime;useSnd=true}
  }
  $("advBar").style.width=Math.min(100,el/total*100)+"%";
  $("advTime").textContent=(useSnd?"🔊 ":"")+fmt(Math.min(el,total))+" / "+fmt(Math.round(total));
  var remain=Math.ceil(c.skippableAfter-el);
  if(remain>0){sk.disabled=true;sk.textContent="Bỏ qua sau "+remain+"s"}
  else if(sk.disabled){sk.disabled=false;sk.textContent="Bỏ qua ›"}
  if(el>=total-0.05||(useSnd&&snd.ended))closeAd();
}
function closeAd(then){
  if(!isOpen)return;
  isOpen=false;clearInterval(timer);timer=0;lastAd=Date.now();
  if(snd){try{snd.pause()}catch(e){}snd=null}               /* dừng sound quảng cáo */
  var o=$("advOverlay");o.classList.add("closing");
  setTimeout(function(){o.hidden=true;o.classList.remove("closing")},180);
  var pm=$("payModal"),sm=$("successModal"),payOpen=(pm&&!pm.hidden)||(sm&&!sm.hidden);
  if(!payOpen)try{if(prevFocus&&prevFocus.focus)prevFocus.focus({preventScroll:true})}catch(e){}   /* đang thanh toán: không giật focus khỏi ô nhập */
  var go=proceed;proceed=null;
  if(go){                                                 /* nghỉ một chút sau quảng cáo rồi mới phát bài kế tiếp */
    var gap=+cfg().afterAdGapMs||0;
    if(gap>0)pendingGo=setTimeout(function(){pendingGo=0;try{go()}catch(e){}},gap);
    else try{go()}catch(e){}
  }
  if(then)then();
}
$("advSkip").addEventListener("click",function(){if(!this.disabled)closeAd()});
$("advPre").addEventListener("click",function(){if(window.openPay)openPay();else closeAd(function(){if(window.closeNowPlaying)closeNowPlaying();if(window.nav)nav("premium")})});   /* giữ nguyên màn quảng cáo, modal thanh toán hiện đè lên trên */
$("advCta").addEventListener("click",function(){
  if(!curCr)return;
  if(curCr.pre&&window.openPay){openPay();return}                       /* quảng cáo Premium: mở màn thanh toán */
  if(curCr.song&&window.MJ){                                           /* quảng cáo bài hát: sau quảng cáo phát đúng bài đó */
    var sg=curCr.song;
    if($("advSkip").disabled){toast("Bạn có thể bấm sau khi hết thời gian chờ bỏ qua.");return}
    proceed=function(){try{MJ.playList([{t:sg.t,s:sg.s,i:sg.i}],0)}catch(e){}};
    closeAd();return;
  }
  toast("Đây là quảng cáo minh hoạ, chưa có liên kết thật.")
});

/* khi quảng cáo mở: chặn phím tắt của app phía sau, giữ phím Tab trong hộp thoại */
window.addEventListener("keydown",function(e){
  if(!isOpen)return;
  var pm=$("payModal"),sm=$("successModal");
  if((pm&&!pm.hidden)||(sm&&!sm.hidden)){                   /* modal thanh toán nằm trên quảng cáo: để nó tự xử lý phím */
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();if(sm&&!sm.hidden)sm.hidden=true;else pm.hidden=true}
    return;
  }
  var btns=[].filter.call($("advOverlay").querySelectorAll("button"),function(b){return !b.disabled});
  if(e.key==="Tab"){
    e.preventDefault();e.stopPropagation();
    var i=btns.indexOf(document.activeElement);i=e.shiftKey?(i<=0?btns.length-1:i-1):(i+1)%btns.length;btns[i].focus();return;
  }
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();if(!$("advSkip").disabled)closeAd();return}
  if((e.key==="Enter"||e.key===" ")&&btns.indexOf(document.activeElement)>=0)return;   /* để nút tự xử lý */
  e.stopPropagation();e.preventDefault();
},true);

window.MJAds={gate:gate,close:closeAd,isOpen:function(){return isOpen},cfg:cfg,
  reset:function(){endedN=0;skips=[];lastAd=0;if(pendingGo){clearTimeout(pendingGo);pendingGo=0}}};
})();
