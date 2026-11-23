/* ===================== LANDING + ĐĂNG NHẬP / ĐĂNG KÝ ===================== */
(function(){
var $=function(id){return document.getElementById(id)};
var T=window.mjT;
var LD={
 "Học tập":"Nhịp chậm, ít lời để bạn tập trung lâu hơn.",
 "Làm việc":"Giai điệu đều và nhẹ, không làm bạn phân tâm.",
 "Tập luyện":"Nhịp nhanh, bass mạnh để giữ nhịp chạy.",
 "Lái xe":"Những bản nhạc dễ chìm vào trên đường dài.",
 "Nghỉ ngơi":"Giọng hát êm và tiết tấu chậm để thả lỏng.",
 "Chiều mưa":"Âm sắc ấm, trầm lắng hợp một chiều mưa."
};
var lpCtx="Học tập";
function lpDraw(){
  var box=$("lpChips");
  box.innerHTML=Object.keys(LD).map(function(c){return '<button type="button" class="chip'+(c===lpCtx?' on':'')+'" data-c="'+c+'" aria-pressed="'+(c===lpCtx)+'">'+T(c)+'</button>'}).join("");
  var tr=(typeof S!=="undefined"&&S[lpCtx])?S[lpCtx].slice(0,3):[];
  var first=tr[0]||["Like You Do","Joji","joji"];
  var res=$("lpRes");
  res.innerHTML='<div class="lp-res-hd"><div class="cv im-'+first[2]+'"></div><div><h3>'+T("Gợi ý cho: {c}",{c:T(lpCtx)})+'</h3><p>'+T(LD[lpCtx])+'</p></div></div>'+
    tr.map(function(s,i){return '<div class="row"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+s[1]+'</span></div><em>'+mjDur(s[0],s[1])+'</em></div>'}).join("");
  res.classList.remove("swap");void res.offsetWidth;res.classList.add("swap");
}
$("lpChips").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;lpCtx=b.dataset.c;lpDraw()});
lpDraw();

window.lpPick=function(c,inPlace){lpCtx=c;lpDraw();
  if(inPlace){
    var cr=$("lpCtxRes");cr.innerHTML=$("lpRes").innerHTML;cr.hidden=false;
    cr.classList.remove("swap");void cr.offsetWidth;cr.classList.add("swap");
    document.querySelectorAll(".lp-ctx").forEach(function(b){b.classList.toggle("on",b.getAttribute("onclick").indexOf("'"+c+"'")>-1)});
    var sc=$("landing"),nv=sc.querySelector(".lp-nav"),r=cr.getBoundingClientRect(),h=sc.clientHeight;
    if(r.bottom>h||r.top<(nv?nv.offsetHeight:64))sc.scrollTo({top:sc.scrollTop+r.bottom-h+24,behavior:"smooth"});
    return}
  $("landing").scrollTo({top:0,behavior:"smooth"})};

(function(){
  var AT={};
  var curArt=null;
  function tt(s){var m=/^Bản hit #(\d+)$/.exec(s);return m?T("Bản hit #{n}",{n:m[1]}):s}
  function tracks(n,i){var L=mjByArtist(n);return L.length?L.map(function(x){return [x.t,x.c]}):[["Bản hit #1",i],["Bản hit #2","let"],["Bản hit #3","little"]]}
  function show(el,noScroll){
    curArt=el;var n=el.dataset.a,i=el.dataset.i,box=document.getElementById("lpArtRes");
    box.innerHTML='<div class="lp-res-hd"><div class="cv im-'+i+'" style="border-radius:50%"></div><div><h3>'+n+'</h3><p>'+T("2.4 triệu người nghe hàng tháng")+'</p></div></div>'+
      tracks(n,i).map(function(t,k){return '<div class="row"><div class="cv im-'+t[1]+'"></div><div class="n"><b>'+tt(t[0])+'</b><span>'+n+'</span></div><em>'+mjDur(t[0],n,'3:3'+k)+'</em></div>'}).join("")+
      '<div class="lp-demo-ft"><span>'+T("Đăng nhập để nghe toàn bộ bài hát của {a}.",{a:n})+'</span><button type="button" class="lp-btn" onclick="openAuth(\'login\')">'+T("Đăng nhập")+'</button></div>';
    box.hidden=false;box.classList.remove("swap");void box.offsetWidth;box.classList.add("swap");
    document.querySelectorAll(".lp-a").forEach(function(a){a.classList.toggle("on",a===el)});
    var sc=document.getElementById("landing"),nv=sc.querySelector(".lp-nav"),r=box.getBoundingClientRect(),h=sc.clientHeight;
    if(!noScroll&&(r.bottom>h||r.top<(nv?nv.offsetHeight:64)))sc.scrollTo({top:sc.scrollTop+r.bottom-h+24,behavior:"smooth"});
  }
  window.mjArtRefresh=function(){var b=document.getElementById("lpArtRes");if(curArt&&b&&!b.hidden)show(curArt,true)};
  var grid=document.querySelector(".lp-art");
  grid.addEventListener("click",function(e){var a=e.target.closest(".lp-a");if(a)show(a)});
  grid.addEventListener("keydown",function(e){if(e.key!=="Enter"&&e.key!==" ")return;var a=e.target.closest(".lp-a");if(a){e.preventDefault();show(a)}});
})();

/* ===== Landing: hiện dần khi cuộn tới ===== */
(function(){
  var L=document.getElementById("landing");
  if(!L||!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion:reduce)").matches||/[?&]figma/.test(location.search))return;
  var groups=[
    [".lp-hero .lp-wrap > div:first-child","rv-l"],[".lp-hero .lp-stage","rv-r"],
    [".lp-marq",""],
    [".lp-sec .lp-wrap > h2",""],[".lp-sec .lp-wrap > .sub",""],[".lp-sec .lp-feat > div:first-child",""],
    [".lp-f",""],[".lp-ctx","rv-z"],[".lp-step",""],[".lp-covers",""],[".lp-a","rv-z"],[".lp-plan","rv-z"],
    [".lp-final .lp-wrap",""],[".lp-fbrand",""],[".lp-fcol",""]
  ];
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      var el=e.target;io.unobserve(el);el.classList.add("in");
      el.addEventListener("animationend",function f(ev){if(ev.target!==el)return;el.removeEventListener("animationend",f);el.classList.remove("rv","rv-l","rv-r","rv-z","in");el.style.removeProperty("--d")});
    });
  },{root:L,threshold:.12,rootMargin:"0px 0px -5% 0px"});
  groups.forEach(function(g){
    var prevTop=null,k=0;
    document.querySelectorAll("#landing "+g[0]).forEach(function(el){
      el.classList.add("rv");if(g[1])el.classList.add(g[1]);
      /* so le: phần tử cùng hàng hiện lần lượt */
      var t=el.offsetTop;if(prevTop===null||Math.abs(t-prevTop)>20){k=0;prevTop=t}else k++;
      el.style.setProperty("--d",Math.min(k,5)*.09+"s");
      io.observe(el);
    });
  });
  L.classList.add("rv-on");
})();

/* ===== Thanh hoàn cảnh: tốc độ/hướng chạy theo vị trí con trỏ, kéo bằng chuột/ngón tay ===== */
(function(){
  var M=document.querySelector(".lp-marq"),T=M&&M.querySelector(".lp-track");
  if(!T||matchMedia("(prefers-reduced-motion:reduce)").matches||/[?&]figma/.test(location.search))return;
  var BASE=45,x=0,v=BASE,target=BASE,half=0,last=0,drag=false,sx=0,sxx=0,vis=false;
  function measure(){half=T.scrollWidth/2}
  function wrap(){if(half>0){x=((x%half)+half)%half}}
  function frame(t){
    var dt=Math.min(.05,(t-last)/1000||0);last=t;
    if(!drag){v+=(target-v)*Math.min(1,dt*5);x+=v*dt;wrap();T.style.transform="translate3d("+(-x)+"px,0,0)"}
    requestAnimationFrame(frame)
  }
  M.classList.add("js");measure();window.mjMarqMeasure=measure;addEventListener("resize",measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  new IntersectionObserver(function(e){vis=e[0].isIntersecting;measure()},{root:document.getElementById("landing")}).observe(M);
  /* chuột: rê sang phải = chạy nhanh, sang trái = đảo chiều */
  M.addEventListener("pointermove",function(e){
    if(e.pointerType!=="mouse"||drag)return;
    var r=M.getBoundingClientRect(),p=(e.clientX-r.left)/r.width;
    target=BASE+(p-.5)*2*170;
  });
  M.addEventListener("pointerleave",function(e){if(!drag)target=BASE});
  /* kéo */
  M.addEventListener("pointerdown",function(e){drag=true;sx=e.clientX;sxx=x;M.classList.add("drag");try{M.setPointerCapture(e.pointerId)}catch(_){}});
  M.addEventListener("pointermove",function(e){if(!drag)return;x=sxx-(e.clientX-sx);wrap();T.style.transform="translate3d("+(-x)+"px,0,0)"});
  function end(e){if(!drag)return;drag=false;M.classList.remove("drag");target=BASE;v=0}
  M.addEventListener("pointerup",end);M.addEventListener("pointercancel",end);
  requestAnimationFrame(frame);
})();
window.lpGo=function(id){var el=$(id),sc=$("landing");if(el){var nv=sc.querySelector(".lp-nav");sc.scrollTo({top:el.offsetTop-(nv?nv.offsetHeight:64),behavior:"smooth"})}};

/* ---------- Modal ---------- */
var mode="login",lastFocus=null,okTimer=null,pending=null;
var FIELDS=[["aName","eName"],["aEmail","eEmail"],["aPass","ePass"],["aPass2","ePass2"]];
function setFieldErr(inp,err,msg){
  var i=$(inp),e=$(err);
  e.textContent=msg||"";e.classList.toggle("show",!!msg);
  i.classList.remove("bad");
  if(msg){void i.offsetWidth;i.classList.add("bad");i.setAttribute("aria-invalid","true")}else i.removeAttribute("aria-invalid");
}
function clearErrs(){FIELDS.forEach(function(p){setFieldErr(p[0],p[1],"")})}
FIELDS.forEach(function(p){$(p[0]).addEventListener("input",function(){if($(p[1]).classList.contains("show"))setFieldErr(p[0],p[1],"")})});

FIELDS.forEach(function(p){$(p[0]).addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();submitAuth(e)}})});

function swapFields(reg){
  ["fName","fPass2"].forEach(function(id){
    var el=$(id);clearTimeout(el._t);el.classList.remove("fout");
    if(reg){el.hidden=false}
    else if(!el.hidden){el.classList.add("fout");el._t=setTimeout(function(){el.hidden=true;el.classList.remove("fout")},260)}
  });
}
function txfx(el){el.classList.remove("txfx");void el.offsetWidth;el.classList.add("txfx")}
window.authMode=function(m){
  mode=m;var reg=m==="register";
  $("authTabs").setAttribute("data-mode",m);
  $("atLogin").classList.toggle("on",!reg);$("atReg").classList.toggle("on",reg);
  $("atLogin").setAttribute("aria-selected",!reg);$("atReg").setAttribute("aria-selected",reg);
  $("authTitle").textContent=reg?T("Tạo tài khoản"):T("Đăng nhập");
  $("authSubmit").textContent=reg?T("Đăng ký"):T("Đăng nhập");
  swapFields(reg);
  $("aPass").autocomplete=reg?"new-password":"current-password";
  $("authSw").innerHTML=reg?T("Đã có tài khoản?")+' <a onclick="authMode(\'login\')">'+T("Đăng nhập")+'</a>':T("Chưa có tài khoản?")+' <a onclick="authMode(\'register\')">'+T("Đăng ký miễn phí")+'</a>';
  if(!window.__mjNoFx){txfx($("authTitle"));txfx($("authSubmit"));txfx($("authSw"))}
  clearErrs();
};
function showMain(){clearTimeout(okTimer);pending=null;$("authOk").hidden=true;$("authOk").classList.remove("run");$("authMain").hidden=false;$("authModal").querySelector(".modal").classList.remove("okmode")}
window.openAuth=function(m){lastFocus=document.activeElement;showMain();$("authForm").reset();authMode(m||"login");$("authModal").hidden=false;setTimeout(function(){$(m==="register"?"aName":"aEmail").focus()},30)};
window.closeAuth=function(){if(pending){finishAuth();return}$("authModal").hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()};
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("authModal").hidden)closeAuth()});

window.submitAuth=function(e){
  if(e&&e.preventDefault)e.preventDefault();
  var name=$("aName").value.trim(),em=$("aEmail").value.trim(),pw=$("aPass").value,pw2=$("aPass2").value,reg=mode==="register";
  var err={};
  if(reg){
    if(!name)err.aName=T("Vui lòng nhập họ và tên.");
    else if(name.length<2)err.aName=T("Họ và tên cần ít nhất 2 ký tự.");
  }
  if(!em)err.aEmail=T("Vui lòng nhập email.");
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))err.aEmail=T("Email chưa đúng định dạng, ví dụ ban@email.com.");
  if(!pw)err.aPass=T("Vui lòng nhập mật khẩu.");
  else if(pw.length<8)err.aPass=T("Mật khẩu cần tối thiểu 8 ký tự.");
  else if(reg&&!(/[A-Za-z]/.test(pw)&&/\d/.test(pw)))err.aPass=T("Mật khẩu cần có cả chữ và số.");
  if(reg){
    if(!pw2)err.aPass2=T("Vui lòng nhập lại mật khẩu.");
    else if(pw2!==pw)err.aPass2=T("Mật khẩu nhập lại chưa khớp.");
  }
  var first=null;
  FIELDS.forEach(function(p){
    if(p[0] in err||$(p[1]).classList.contains("show")){setFieldErr(p[0],p[1],err[p[0]]||"")}
    if(err[p[0]]&&!first&&!$(p[0]).closest("[hidden]"))first=p[0];
  });
  if(first){$(first).focus();return}
  /* tài khoản quản trị: email riêng, không cho đăng ký trùng, đăng nhập đúng mật khẩu thì vào trang quản trị */
  var ADM=window.MJ_ADMIN_CFG;
  if(ADM&&em.toLowerCase()===ADM.email.toLowerCase()){
    if(reg){setFieldErr("aEmail","eEmail",T("Email này đã được sử dụng."));$("aEmail").focus();return}
    if(pw!==ADM.pass){setFieldErr("aPass","ePass",T("Email hoặc mật khẩu không đúng."));$("aPass").focus();return}
    showSuccess({name:ADM.name,email:ADM.email,role:"admin"},false);return;
  }
  var user={name:reg?name:(name||em.split("@")[0]),email:em};
  if(!reg){ /* đăng nhập lại cùng email: giữ hồ sơ đã chỉnh sửa trước đó */
    try{var sv=JSON.parse(localStorage.getItem("mj-auth")||"null");if(sv&&sv.email&&sv.email.toLowerCase()===em.toLowerCase())user=sv}catch(err){}
  }
  showSuccess(user,reg);
};

var okReg=false;
function renderOk(u,reg){
  var esc=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")};
  $("okTitle").textContent=reg?T("Đăng ký thành công!"):T("Đăng nhập thành công!");
  var l1=reg?T("Chào mừng {n} đến với MeloJam 🎉"):T("Chào mừng {n} quay lại 👋");
  var l2=reg?T("Tài khoản của bạn đã sẵn sàng."):T("Đang đưa bạn vào MeloJam…");
  if(u&&u.role==="admin"){l1="Chào mừng {n} quay lại 🛡️";l2="Đang đưa bạn vào trang quản trị…"}
  $("okMsg").innerHTML=esc(l1).replace("{n}","<b></b>")+"<br>"+esc(l2);
  $("okMsg").querySelector("b").textContent=u.name;
}
function showSuccess(u,reg){
  pending=u;okReg=reg;
  renderOk(u,reg);
  $("authMain").hidden=true;$("authOk").hidden=false;
  var m=$("authModal").querySelector(".modal");m.classList.remove("okmode");void m.offsetWidth;m.classList.add("okmode");
  var ok=$("authOk");ok.classList.remove("run");void ok.offsetWidth;ok.classList.add("run");
  okTimer=setTimeout(finishAuth,1300);
  var bar=ok.querySelector(".okbar i");bar.onanimationend=function(){finishAuth()};
}
window.finishAuth=function(){
  if(!pending)return;var u=pending;clearTimeout(okTimer);
  var wasReg=okReg;
  if(u&&u.role==="admin"&&window.mjEnterAdmin){pending=null;try{$("authModal").hidden=true;showMain();$("authForm").reset()}catch(err){}window.mjEnterAdmin(u);return}
  enterApp(u);toast(wasReg?"Chào mừng "+u.name+" đến với MeloJam!":"Chào mừng trở lại, "+u.name+"!");
};
function toast(msg){
  var t=$("mjToast");t.hidden=false;t.innerHTML='<i>✓</i><span></span>';t.querySelector("span").textContent=msg;
  t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},3100);
}

var curUser=null;
function applyUser(u){
  if(!u)return;curUser=u;
  document.querySelectorAll(".mename,.acct-head b").forEach(function(n){n.textContent=u.name});
  document.querySelectorAll(".acct-head small").forEach(function(n){if(/@/.test(n.textContent))n.textContent=u.email});
  if($("pName"))$("pName").value=u.name;
  if($("pEmail"))$("pEmail").value=u.email;
  if($("pGender")&&u.gender)$("pGender").value=u.gender;
  if($("pYear")&&u.year)$("pYear").value=u.year;
}

/* ---------- Lưu thông tin cá nhân ---------- */
var PF=[["pName","ePName"],["pEmail","ePEmail"],["pYear","ePYear"]];
function pfErr(inp,err,msg){var i=$(inp),e=$(err);e.textContent=msg||"";e.classList.toggle("show",!!msg);i.classList.remove("bad");if(msg){void i.offsetWidth;i.classList.add("bad");i.setAttribute("aria-invalid","true")}else i.removeAttribute("aria-invalid")}
PF.forEach(function(p){$(p[0]).addEventListener("input",function(){if($(p[1]).classList.contains("show"))pfErr(p[0],p[1],"")})});
window.saveProfile=function(){
  var name=$("pName").value.trim().replace(/\s+/g," "),em=$("pEmail").value.trim(),yr=$("pYear").value.trim(),err={};
  if(!name)err.pName="Vui lòng nhập họ và tên.";else if(name.length<2)err.pName="Họ và tên cần ít nhất 2 ký tự.";
  if(!em)err.pEmail="Vui lòng nhập email.";else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))err.pEmail="Email chưa đúng định dạng, ví dụ ban@email.com.";
  if(yr&&(!/^\d{4}$/.test(yr)||+yr<1930||+yr>new Date().getFullYear()))err.pYear="Năm sinh không hợp lệ, ví dụ 2004.";
  var first=null;
  PF.forEach(function(p){pfErr(p[0],p[1],err[p[0]]||"");if(err[p[0]]&&!first)first=p[0]});
  if(first){$(first).focus();return}
  var u={name:name,email:em,gender:$("pGender").value,year:yr};
  try{localStorage.setItem("mj-auth",JSON.stringify(u))}catch(e){}
  applyUser(u);
  var btn=$("pSave");btn.textContent="✓ Đã lưu thay đổi";clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent="Lưu thay đổi"},2200);
  toast("Đã cập nhật thông tin: "+name);
};

function enterApp(u){
  document.body.classList.remove("guest");          /* vào app trước tiên */
  pending=null;clearTimeout(okTimer);
  try{localStorage.setItem("mj-auth",JSON.stringify(u));localStorage.setItem("mj-session","1")}catch(err){}
  try{applyUser(u)}catch(err){}
  try{$("authModal").hidden=true;showMain();$("authForm").reset()}catch(err){}
  /* đăng nhập xong luôn là tài khoản Miễn phí, phải nâng cấp mới có Premium */
  try{localStorage.removeItem("mj-sub");if(typeof setPremium==="function")setPremium(false)}catch(err){}
  try{if(typeof nav==="function")nav("home")}catch(err){}
  var l=$("landing");if(l)l.scrollTop=0;
}

/* khôi phục phiên nếu đã đăng nhập */
try{var saved=JSON.parse(localStorage.getItem("mj-auth")||"null");if(saved){applyUser(saved)} /* luôn mở trang landing trước, không tự vào app */}catch(err){}


/* ---------- Đổi mật khẩu (demo: chưa có server nên không đối chiếu mật khẩu cũ) ---------- */
var PW=[["pwCur","ePwCur"],["pwNew","ePwNew"],["pwNew2","ePwNew2"]];
PW.forEach(function(p){$(p[0]).addEventListener("input",function(){if($(p[1]).classList.contains("show"))setFieldErr(p[0],p[1],"")})});
window.changePass=function(){
  var cur=$("pwCur").value,nw=$("pwNew").value,n2=$("pwNew2").value,err={};
  if(!cur)err.pwCur="Vui lòng nhập mật khẩu hiện tại.";
  if(!nw)err.pwNew="Vui lòng nhập mật khẩu mới.";
  else if(nw.length<8)err.pwNew="Mật khẩu cần tối thiểu 8 ký tự.";
  else if(!(/[A-Za-z]/.test(nw)&&/\d/.test(nw)))err.pwNew="Mật khẩu cần có cả chữ và số.";
  else if(nw===cur)err.pwNew="Mật khẩu mới phải khác mật khẩu hiện tại.";
  if(!n2)err.pwNew2="Vui lòng nhập lại mật khẩu mới.";else if(n2!==nw)err.pwNew2="Mật khẩu nhập lại chưa khớp.";
  var first=null;PW.forEach(function(p){setFieldErr(p[0],p[1],err[p[0]]||"");if(err[p[0]]&&!first)first=p[0]});
  if(first){$(first).focus();return}
  PW.forEach(function(p){$(p[0]).value=""});
  toast("Đã cập nhật mật khẩu");
};

/* thoát tài khoản: dùng hộp xác nhận trong trang (confirm() bị chặn trong khung xem trước) */
var loFocus=null;
window.logout=function(){loFocus=document.activeElement;$("logoutModal").hidden=false;setTimeout(function(){$("loCancel").focus()},30)};
window.closeLogout=function(){$("logoutModal").hidden=true;if(loFocus&&loFocus.focus)try{loFocus.focus()}catch(e){}};
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("logoutModal").hidden)closeLogout()});
window.doLogout=function(){
  try{localStorage.removeItem("mj-session")}catch(err){}
  $("logoutModal").hidden=true;
  try{if(typeof playing!=="undefined"&&playing&&typeof tp==="function")tp()}catch(err){}
  document.body.classList.remove("rpanel-open");
  document.body.classList.add("guest");
  try{closeNotif()}catch(err){}
  $("landing").scrollTop=0;
  toast("Bạn đã đăng xuất. Hẹn gặp lại!");
};

/* ---------- Đổi ảnh đại diện ---------- */
var AV_KEY="mj-avatar";
function paintAvatar(url){
  document.querySelectorAll(".im-av").forEach(function(n){
    if(url){n.style.backgroundImage='url("'+url+'")';n.style.backgroundSize="cover";n.style.backgroundPosition="center";n.style.backgroundRepeat="no-repeat"}
    else{n.style.backgroundImage="";n.style.backgroundSize="";n.style.backgroundPosition="";n.style.backgroundRepeat=""}
  });
}
window.pickAvatar=function(){var f=$("avFile");if(f){f.value="";f.click()}};
(function(){
  var f=$("avFile");if(!f)return;
  f.addEventListener("change",function(){
    var file=f.files&&f.files[0];if(!file)return;
    if(!/^image\//.test(file.type)){toast("Vui lòng chọn một tệp ảnh (JPG, PNG, WEBP…)");return}
    if(file.size>10*1024*1024){toast("Ảnh quá lớn, vui lòng chọn ảnh dưới 10MB");return}
    var url=URL.createObjectURL(file),img=new Image();
    img.onload=function(){
      try{
        var S=256,c=document.createElement("canvas");c.width=c.height=S;
        var w=img.naturalWidth,h=img.naturalHeight,m=Math.min(w,h),sx=(w-m)/2,sy=(h-m)/2,g=c.getContext("2d");
        g.fillStyle="#fff";g.fillRect(0,0,S,S);g.drawImage(img,sx,sy,m,m,0,0,S,S);   /* cắt vuông, lấy giữa ảnh */
        var data=c.toDataURL("image/jpeg",0.88);
        paintAvatar(data);
        try{localStorage.setItem(AV_KEY,data)}catch(e){}
        toast("Đã cập nhật ảnh đại diện");
      }catch(e){toast("Không xử lý được ảnh này, hãy thử ảnh khác")}
      URL.revokeObjectURL(url);
    };
    img.onerror=function(){URL.revokeObjectURL(url);toast("Không đọc được ảnh này, hãy thử ảnh JPG hoặc PNG")};
    img.src=url;
  });
  try{var sv=localStorage.getItem(AV_KEY);if(sv&&/^data:image\//.test(sv))paintAvatar(sv)}catch(e){}
})();

/* ---------- Đổi ngôn ngữ: dựng lại các phần do JS sinh ra ---------- */
window.mjLangRefresh=function(){
  lpDraw();
  var cr=$("lpCtxRes");if(cr&&!cr.hidden)cr.innerHTML=$("lpRes").innerHTML;
  if(window.mjArtRefresh)window.mjArtRefresh();
  window.__mjNoFx=true;authMode(mode);window.__mjNoFx=false;
  if(pending)renderOk(pending,okReg);
};
window.mjSetLang(window.mjSavedLang(),true);
})();
