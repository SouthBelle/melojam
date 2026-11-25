/* Truy cập bằng bàn phím: phần tử bấm được (div/span/a không href) nhận role + tabindex, Enter/Space kích hoạt */
(function(){
var SEL='[onclick]:not(button):not(a[href]):not(input):not(select):not(textarea):not(label):not(.modalbg):not(.search):not(.notifpanel):not([role]):not([tabindex]),[role="button"]:not([tabindex])';
function fix(){document.querySelectorAll(SEL).forEach(function(el){if(!el.getAttribute("role"))el.setAttribute("role","button");el.setAttribute("tabindex","0")})}
var pend=false;new MutationObserver(function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;fix()})}).observe(document.body,{childList:true,subtree:true});
document.addEventListener("keydown",function(e){var t=e.target;
  if((e.key==="Enter"||e.key===" ")&&t&&t.getAttribute&&t.getAttribute("role")==="button"&&t.tagName!=="BUTTON"&&t.tagName!=="A"||(e.key==="Enter"&&t&&t.tagName==="A"&&!t.hasAttribute("href")&&t.hasAttribute("onclick"))){e.preventDefault();t.click()}});
fix();
})();
