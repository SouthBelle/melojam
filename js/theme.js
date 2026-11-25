(function(){
var K="mj-theme",R=document.documentElement;
function tt(s){return window.mjT?window.mjT(s):s}
if(window.D&&D.en){D.en["Chuyển sang chế độ tối"]="Switch to dark mode";D.en["Chuyển sang chế độ sáng"]="Switch to light mode";D.en["Chế độ tối"]="Dark mode";D.en["Chế độ sáng"]="Light mode"}
function cur(){return R.getAttribute("data-theme")==="dark"?"dark":"light"}
function paint(){
  var d=cur()==="dark",act=d?"Chuyển sang chế độ sáng":"Chuyển sang chế độ tối",lbl=d?"Chế độ sáng":"Chế độ tối";
  document.querySelectorAll("[data-mj-theme]").forEach(function(b){b.setAttribute("aria-label",tt(act));if(b.classList.contains("mj-theme"))b.title=tt(lbl)});
  document.querySelectorAll("[data-mj-tbtn]").forEach(function(b){b.setAttribute("aria-label",act)});
  document.querySelectorAll("[data-mj-tlabel]").forEach(function(e){e.textContent=lbl});
  document.querySelectorAll("[data-mj-tsub]").forEach(function(e){e.textContent=d?"Đang dùng chế độ tối":"Đang dùng chế độ sáng"});
  var m=document.querySelector("meta[name=theme-color]");if(m)m.setAttribute("content",d?"#14161b":"#ffffff");
}
function set(m){
  if(m==="dark")R.setAttribute("data-theme","dark");else R.removeAttribute("data-theme");
  try{localStorage.setItem(K,m)}catch(e){}
  paint();
}
function toggle(){
  var next=cur()==="dark"?"light":"dark";
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches){set(next);return}
  /* lớp phủ cùng màu nền cũ rồi mờ dần: chỉ đổi opacity (GPU) nên không giật */
  var bg=getComputedStyle(document.body).backgroundColor,o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:1;transition:opacity .35s ease;will-change:opacity;background:"+bg;
  document.body.appendChild(o);
  set(next);
  requestAnimationFrame(function(){requestAnimationFrame(function(){o.style.opacity="0"})});
  var done=function(){if(o.parentNode)o.parentNode.removeChild(o)};
  o.addEventListener("transitionend",done);setTimeout(done,600);
}
window.mjTheme={get:cur,set:set,toggle:toggle};
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-mj-theme]");if(!b)return;e.preventDefault();window.mjTheme.toggle(e)});
document.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".opt[data-mj-theme]")){e.preventDefault();window.mjTheme.toggle()}});
window.addEventListener("storage",function(e){if(e.key===K){if(e.newValue==="dark")R.setAttribute("data-theme","dark");else R.removeAttribute("data-theme");paint()}});
var prev=window.mjLangRefresh;window.mjLangRefresh=function(){if(prev)prev.apply(this,arguments);paint()};
paint();
})();
