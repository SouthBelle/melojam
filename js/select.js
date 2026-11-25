/* Dropdown đẹp cho mọi <select> trong .field (giữ nguyên <select> ẩn nên code cũ đọc/ghi .value vẫn chạy) */
(function(){
  var CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var all=[];
  function closeAll(except){all.forEach(function(m){if(m!==except)m.close()})}
  function enhance(sel){
    if(sel.dataset.msel)return;sel.dataset.msel="1";
    var wrap=document.createElement("div");wrap.className="msel"+(sel.classList.contains("ad-sel")?" msel-ad":"");
    sel.parentNode.insertBefore(wrap,sel);wrap.appendChild(sel);
    sel.tabIndex=-1;sel.setAttribute("aria-hidden","true");
    var btn=document.createElement("button");btn.type="button";btn.className="msel-btn";
    btn.setAttribute("aria-haspopup","listbox");btn.setAttribute("aria-expanded","false");
    if(sel.id){var lb=document.querySelector('label[for="'+sel.id+'"]');if(lb){if(!lb.id)lb.id=sel.id+"-lbl";btn.setAttribute("aria-labelledby",lb.id);lb.addEventListener("click",function(e){e.preventDefault();btn.focus()})}}
    var txt=document.createElement("span");btn.appendChild(txt);btn.insertAdjacentHTML("beforeend",CHEV);
    var list=document.createElement("ul");list.className="msel-list";list.setAttribute("role","listbox");list.tabIndex=-1;
    wrap.appendChild(btn);wrap.appendChild(list);
    var opts=[],act=-1;
    function build(){
      list.innerHTML="";opts=[];
      Array.prototype.forEach.call(sel.options,function(o,i){
        var li=document.createElement("li");li.className="msel-opt";li.setAttribute("role","option");
        li.innerHTML="<span></span>"+CHECK;li.firstChild.textContent=o.text;
        li.addEventListener("mousedown",function(e){e.preventDefault()});
        li.addEventListener("click",function(){choose(i)});
        li.addEventListener("mousemove",function(){setAct(i)});
        list.appendChild(li);opts.push(li);
      });sync();
    }
    function sync(){
      var i=sel.selectedIndex;txt.textContent=i>=0?sel.options[i].text:"";
      opts.forEach(function(li,k){li.setAttribute("aria-selected",k===i?"true":"false")});
    }
    function setAct(i){
      if(act>=0&&opts[act])opts[act].classList.remove("act");
      act=i;if(opts[i]){opts[i].classList.add("act");opts[i].scrollIntoView({block:"nearest"})}
    }
    function choose(i){
      if(sel.selectedIndex!==i){sel.selectedIndex=i;sel.dispatchEvent(new Event("change",{bubbles:true}))}
      sync();api.close();btn.focus();
    }
    var api={
      open:function(){
        closeAll(api);
        var r=btn.getBoundingClientRect(),need=Math.min(240,opts.length*38+14);
        wrap.classList.toggle("up",window.innerHeight-r.bottom<need+16&&r.top>need+16);
        wrap.classList.add("open");btn.setAttribute("aria-expanded","true");setAct(Math.max(0,sel.selectedIndex));
      },
      close:function(){wrap.classList.remove("open");btn.setAttribute("aria-expanded","false")},
      isOpen:function(){return wrap.classList.contains("open")}
    };
    all.push(api);
    btn.addEventListener("click",function(){api.isOpen()?api.close():api.open()});
    btn.addEventListener("keydown",function(e){
      var k=e.key;
      if(!api.isOpen()){
        if(k==="ArrowDown"||k==="ArrowUp"||k==="Enter"||k===" "){e.preventDefault();api.open()}
        return;
      }
      if(k==="ArrowDown"){e.preventDefault();setAct(Math.min(opts.length-1,act+1))}
      else if(k==="ArrowUp"){e.preventDefault();setAct(Math.max(0,act-1))}
      else if(k==="Home"){e.preventDefault();setAct(0)}
      else if(k==="End"){e.preventDefault();setAct(opts.length-1)}
      else if(k==="Enter"||k===" "){e.preventDefault();choose(act)}
      else if(k==="Escape"){e.preventDefault();api.close()}
      else if(k==="Tab"){api.close()}
    });
    sel.addEventListener("change",sync);
    /* code cũ gán select.value = ... → cập nhật nhãn hiển thị */
    var d=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value");
    Object.defineProperty(sel,"value",{configurable:true,get:function(){return d.get.call(sel)},set:function(v){d.set.call(sel,v);sync()}});
    build();
  }
  document.addEventListener("mousedown",function(e){if(!e.target.closest(".msel"))closeAll()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll()});
  document.querySelectorAll(".field select").forEach(enhance);
  /* Trang admin: các ô lọc (select.ad-sel) được vẽ lại bằng innerHTML → tự gắn dropdown đẹp cho select mới xuất hiện */
  var ad=document.getElementById("admin");
  if(ad){var pend=false,scan=function(){pend=false;ad.querySelectorAll("select.ad-sel").forEach(enhance)};
    new MutationObserver(function(){if(!pend){pend=true;requestAnimationFrame(scan)}}).observe(ad,{childList:true,subtree:true});scan()}
})();
