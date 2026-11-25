/* ===== Nút Back của trình duyệt / điện thoại trong app =====
   - Mỗi lần chuyển trang trong app ghi 1 mục lịch sử -> Back lùi từng màn một (giống nút ‹ trên thanh trên).
   - Đang mở popup / thanh đang phát / bảng thông báo -> Back chỉ đóng lớp đó.
   - Đang ở trang đầu tiên của app mà Back tiếp -> hiện hộp "Thoát tài khoản?" thay vì văng thẳng về landing. */
(function(){
  var body=document.body,$=function(i){return document.getElementById(i)};
  var M=window.MJH={active:false,pop:false,skip:0,atBase:false};
  function appOn(){return !body.classList.contains("guest")}

  M.push=function(i){if(!M.active)return;try{history.pushState({mj:1,i:i},"")}catch(e){}};

  function enter(){
    if(M.active)return;
    M.active=true;M.atBase=false;M.skip=0;
    try{history.pushState({mj:1,i:NAVH.idx()},"")}catch(e){}
  }
  function leave(){
    if(!M.active)return;
    M.active=false;M.atBase=false;
    var s=history.state;
    NAVH.reset();
    if(s&&s.mj){M.skip++;try{history.go(-(s.i+1))}catch(e){M.skip--}}   /* về mục gốc (landing) */
  }
  new MutationObserver(function(){appOn()?enter():leave()}).observe(body,{attributes:true,attributeFilter:["class"]});

  /* tải lại trang khi lịch sử còn mục của app -> lùi về mục gốc, tránh phải bấm Back nhiều lần mà không thấy gì */
  if(history.state&&history.state.mj){try{history.go(-(history.state.i+1))}catch(e){}}

  function closeLayers(){
    var done=false;
    var pay=$("payModal"),suc=$("successModal");
    if((pay&&!pay.hidden)||(suc&&!suc.hidden)){            /* đang thanh toán: Back chỉ đóng modal, giữ nguyên player fullscreen */
      if(pay&&!pay.hidden)pay.hidden=true;if(suc&&!suc.hidden)suc.hidden=true;
      return true;
    }
    var nps=$("nps");if(nps&&nps.classList.contains("open")&&window.closeNowPlaying){closeNowPlaying();done=true}
    ["successModal","payModal","authModal"].forEach(function(id){var m=$(id);if(m&&!m.hidden){m.hidden=true;done=true}});
    var lo=$("logoutModal");if(lo&&!lo.hidden){lo.hidden=true;done=true}
    var np=$("notifpanel");if(np&&!np.hidden){np.hidden=true;done=true}
    if(body.classList.contains("rpanel-open")){body.classList.remove("rpanel-open");done=true}
    return done;
  }

  window.addEventListener("popstate",function(e){
    if(M.skip>0){M.skip--;return}
    if(!M.active||!appOn())return;
    var s=e.state,t=(s&&s.mj)?s.i:-1,cur=NAVH.idx();
    if(closeLayers()){                         /* chỉ đóng lớp đang mở, rồi quay lại đúng mục đang đứng */
      if(cur-t!==0){M.skip++;history.go(cur-t)}
      return;
    }
    if(t===-1){                                 /* đã lùi hết app -> hỏi trước khi thoát */
      M.atBase=true;
      if(typeof window.logout==="function")window.logout();
      return;
    }
    if(t!==cur){M.pop=true;try{NAVH.goto(t-cur)}finally{M.pop=false}}
  });

  /* bấm "Ở lại" -> trở về đúng mục của app đang xem */
  var _cl=window.closeLogout;
  window.closeLogout=function(){
    if(typeof _cl==="function")_cl();
    if(M.atBase&&M.active){
      M.atBase=false;
      try{history.go(NAVH.idx()+1)}catch(e){}
      setTimeout(function(){
        if(M.active&&!(history.state&&history.state.mj))try{history.pushState({mj:1,i:NAVH.idx()},"")}catch(e){}
      },200);
    }
  };
})();
