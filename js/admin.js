(function(){
"use strict";
/* ========= CẤU HÌNH TÀI KHOẢN QUẢN TRỊ (bản minh hoạ: kiểm tra ngay trên trình duyệt) =========
   Đổi email / mật khẩu ở đây. Lưu ý: mọi kiểm tra phía trình duyệt đều xem được trong mã nguồn,
   khi đưa lên thật cần xác thực ở máy chủ. */
var CFG=window.MJ_ADMIN_CFG={email:"admin@melojam.vn",pass:"MeloAdmin@2026",name:"Quản trị viên"};

var $=function(i){return document.getElementById(i)};
var KEY="mj-admin-db-v2",SKEY="mj-admin";
var PLAN={free:"Miễn phí",month:"Premium · Tháng",year:"Premium · Năm"};
var PRICE={month:49000,year:470400};
var METHOD={momo:"MoMo",apple:"Apple Pay",google:"Google Pay",card:"Thẻ tín dụng"};
var MCOL={momo:"#d82d8b",apple:"#64748b",google:"#2f92f7",card:"#f59e0b"};
var GENRES=["Lofi / Study","R&B / Soul","EDM / Dance","Synthwave","Pop","Alternative"];
var COVERS={daft:"Daft Punk",sos:"SZA",let:"Galimatias",t53:"53 Thieves",mac:"Mac Ayres",alina:"Alina Baraz",joji:"Joji",lofi:"Study Lofi",little:"Chạy bộ sáng",texas:"Đêm mưa thư giãn",cyber:"Cyberpunk Nights",red:"Miền ký ức"};
var PER=10;
var DB=null,UI={page:"dash",
  users:{q:"",plan:"all",st:"all",sort:"joined",dir:-1,pg:1},
  songs:{q:"",genre:"all",st:"all",pg:1},
  tx:{q:"",st:"all",m:"all",pg:1}};

/* ---------- tiện ích ---------- */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function money(n){return Math.round(n).toLocaleString("vi-VN")+"đ"}
function num(n){return Math.round(n).toLocaleString("vi-VN")}
function d2(n){return n<10?"0"+n:""+n}
function fdate(t){var d=new Date(t);return d2(d.getDate())+"/"+d2(d.getMonth()+1)+"/"+d.getFullYear()}
function ftime(t){var d=new Date(t);return fdate(t)+" "+d2(d.getHours())+":"+d2(d.getMinutes())}
function ago(t){var s=(Date.now()-new Date(t).getTime())/1000;
  if(s<60)return"vừa xong";if(s<3600)return Math.floor(s/60)+" phút trước";if(s<86400)return Math.floor(s/3600)+" giờ trước";
  if(s<86400*30)return Math.floor(s/86400)+" ngày trước";return fdate(t)}
function mkey(t){var d=new Date(t);return d.getFullYear()*12+d.getMonth()}
function initial(n){var p=String(n).trim().split(/\s+/);return(p[p.length-1]||"?").charAt(0).toUpperCase()}
function hue(n){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;return"hsl("+h+" 55% 48%)"}
function ic(p){return'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
var I={
  dash:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.4c2.2.6 3.5 2.4 3.5 5.6"/>',
  songs:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  tx:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
  out:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  reset:'<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  burger:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  money:'<path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.6 0-4.5 1.3-4.5 3.2 0 4.6 9 2.2 9 6.6 0 2-2 3.2-4.5 3.2-2.2 0-3.9-.9-4.8-2.3"/>',
  play:'<path d="M8 5v14l11-7z"/>',
  crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'
};

/* ---------- dữ liệu mẫu (cố định theo hạt giống nên luôn giống nhau) ---------- */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function slug(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.|\.$/g,"")}
function seed(){
  var r=rng(2026),now=Date.now(),D=864e5,pick=function(a){return a[Math.floor(r()*a.length)]};
  var HO=["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Vũ","Võ","Đặng","Bùi","Đỗ","Hồ","Ngô","Dương","Lý"];
  var DEM=["Văn","Thị","Minh","Quốc","Thu","Hoài","Gia","Ngọc","Khánh","Anh","Đức","Thanh"];
  var TEN=["An","Bảo","Chi","Dũng","Giang","Hà","Hiếu","Hương","Khoa","Lan","Linh","Long","Mai","Nam","Ngân","Phúc","Quân","Sơn","Thảo","Trang","Trung","Tú","Uyên","Việt","Vy","Yến"];
  var MAIL=["gmail.com","gmail.com","gmail.com","outlook.com","yahoo.com"];
  var users=[],used={};
  for(var i=0;i<120;i++){
    var name,tries=0;do{name=pick(HO)+" "+pick(DEM)+" "+pick(TEN);tries++}while(used[name]&&tries<20);used[name]=1;
    var joined=now-Math.floor(r()*330*D)-D*0.2,pr=r(),plan=pr<.07?"year":pr<.2?"month":"free";
    var last=joined+Math.floor(r()*(now-joined));
    users.push({id:"u"+(i+1),name:name,email:slug(name).split(".").slice(-1)[0]+"."+slug(name).split(".")[0]+(10+Math.floor(r()*89))+"@"+pick(MAIL),
      plan:plan,st:r()<.05?"locked":"active",joined:new Date(joined).toISOString(),last:new Date(last).toISOString(),plays:Math.floor(r()*r()*4200)});
  }
  var tx=[],mw=[["momo",.46],["card",.68],["apple",.86],["google",1]],pm=function(){var x=r();for(var i=0;i<mw.length;i++)if(x<=mw[i][1])return mw[i][0];return"momo"};
  users.forEach(function(u){
    if(u.plan==="free")return;
    var step=30*D*0.98,start=u.plan==="year"?now-(5+r()*250)*D:now-(8+r()*165)*D,times=[];
    if(u.plan==="year")times.push(start);else for(var t=start;t<=now&&times.length<6;t+=step)times.push(t);
    if(new Date(u.joined).getTime()>start-D)u.joined=new Date(start-D*(1+r()*4)).toISOString();   /* đăng ký trước giao dịch đầu tiên */
    var lt=times[times.length-1];if(new Date(u.last).getTime()<lt)u.last=new Date(lt).toISOString();
    times.forEach(function(t){
      var s2=r(),st=s2<.93?"ok":s2<.97?"fail":"refund";
      tx.push({id:"",uid:u.id,uname:u.name,plan:u.plan,method:pm(),amount:PRICE[u.plan],time:new Date(t).toISOString(),st:st});
    });
  });
  users.filter(function(u){return u.plan==="free"}).slice(0,9).forEach(function(u,i){
    tx.push({id:"",uid:u.id,uname:u.name,plan:"month",method:pm(),amount:PRICE.month,time:new Date(now-(i*5+2)*D*r()-3600e3).toISOString(),st:"fail"});
  });
  tx=tx.filter(function(x){return new Date(x.time).getTime()<=now}).sort(function(a,b){return new Date(a.time)-new Date(b.time)});
  tx.forEach(function(x,i){x.id="MJ-"+new Date(x.time).getFullYear()+"-"+("0000"+(i+1)).slice(-4)});
  tx.reverse();
  var S=[["Crescendolls","Daft Punk","daft","EDM / Dance","3:32"],["Saturn (Gali Remix)","SZA","sos","R&B / Soul","3:19"],["Don’t Need To Know","Galimatias","let","Lofi / Study","2:20"],["red leather","53 Thieves","t53","Synthwave","3:47"],["Lonely","Mac Ayres","mac","R&B / Soul","4:20"],["Birds Eye View","Alina Baraz","alina","Lofi / Study","2:51"],["Like You Do","Joji","joji","Alternative","4:00"]];
  var songs=S.map(function(s,i){return{id:"s"+(i+1),title:s[0],artist:s[1],cover:s[2],genre:s[3],dur:s[4],plays:Math.floor(8000+r()*r()*140000),st:"show"}});
  return{users:users,songs:songs,tx:tx};
}
function load(){try{var d=JSON.parse(localStorage.getItem(KEY)||"null");if(d&&d.users&&d.songs&&d.tx)return d}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
function ensure(){if(!DB){DB=load()||seed();save()}}

/* ---------- toast + hộp thoại ---------- */
var tT;function toast(m){var t=$("adToast");t.textContent=m;t.hidden=false;clearTimeout(tT);tT=setTimeout(function(){t.hidden=true},2600)}
var lastFocus=null;
function openModal(html,mount){lastFocus=document.activeElement;var m=$("adModal");m.innerHTML='<div class="ad-modal" role="dialog" aria-modal="true">'+html+'</div>';$("adMbg").hidden=false;if(mount)mount(m);
  var f=m.querySelector("[data-focus]")||m.querySelector("input,select,button");if(f)setTimeout(function(){try{f.focus()}catch(e){}},30)}
function closeModal(){$("adMbg").hidden=true;$("adModal").innerHTML="";if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
function confirmBox(title,msg,ok,danger,cb){
  openModal('<h3>'+esc(title)+'</h3><p class="sub" style="margin:6px 0 0">'+esc(msg)+'</p><div class="ad-mact"><button class="ad-btn" data-act="mclose">Huỷ</button><button class="ad-btn '+(danger?"dng":"pri")+'" data-act="mok" data-focus>'+esc(ok)+'</button></div>');
  $("adModal").__ok=cb;
}

/* ---------- biểu đồ SVG ---------- */
function bars(items,fmt){
  var W=460,H=210,p={l:10,r:10,t:26,b:28},max=Math.max.apply(null,items.map(function(x){return x.v}))||1,n=items.length,bw=(W-p.l-p.r)/n,ch=H-p.t-p.b,o="";
  for(var g=0;g<=3;g++){var y=p.t+ch*g/3;o+='<line x1="'+p.l+'" x2="'+(W-p.r)+'" y1="'+y+'" y2="'+y+'" style="stroke:var(--line)" stroke-width="1"/>'}
  items.forEach(function(x,i){
    var h=Math.max(2,ch*x.v/max),bx=p.l+i*bw+bw*.2,by=p.t+ch-h,last=i===n-1;
    o+='<rect x="'+bx+'" y="'+by+'" width="'+bw*.6+'" height="'+h+'" rx="6" style="fill:'+(last?"var(--pr)":"var(--bar)")+'"/>';
    o+='<text x="'+(bx+bw*.3)+'" y="'+(by-7)+'" text-anchor="middle" font-size="12" font-weight="700" style="fill:var(--tx)">'+esc(fmt(x.v))+'</text>';
    o+='<text x="'+(bx+bw*.3)+'" y="'+(H-8)+'" text-anchor="middle" font-size="12" style="fill:var(--tx3)">'+esc(x.l)+'</text>';
  });
  return'<svg class="ad-chart" viewBox="0 0 '+W+' '+H+'" role="img">'+o+'</svg>';
}
function donut(parts){
  var tot=parts.reduce(function(a,x){return a+x.v},0)||1,R=62,C=2*Math.PI*R,off=0,o='<circle cx="85" cy="85" r="'+R+'" fill="none" style="stroke:var(--soft)" stroke-width="24"/>';
  parts.forEach(function(x){var len=C*x.v/tot;o+='<circle cx="85" cy="85" r="'+R+'" fill="none" stroke="'+x.c+'" stroke-width="24" stroke-dasharray="'+len+' '+(C-len)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 85 85)"/>';off+=len});
  o+='<text x="85" y="82" text-anchor="middle" font-size="24" font-weight="700" style="fill:var(--tx)">'+tot+'</text><text x="85" y="102" text-anchor="middle" font-size="11" style="fill:var(--tx3)">giao dịch</text>';
  return'<svg viewBox="0 0 170 170" role="img" aria-label="Tỉ lệ phương thức thanh toán">'+o+'</svg>';
}

/* ---------- trang: Tổng quan ---------- */
function months(n){var out=[],d=new Date();d.setDate(1);for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push({k:x.getFullYear()*12+x.getMonth(),l:"T"+(x.getMonth()+1)})}return out}
function pageDash(){
  var U=DB.users,T=DB.tx,now=Date.now(),D=864e5,mm=months(6),cur=mm[5].k,prev=mm[4].k;
  var prem=U.filter(function(u){return u.plan!=="free"}).length,new7=U.filter(function(u){return now-new Date(u.joined)<7*D}).length;
  var okTx=T.filter(function(x){return x.st==="ok"}),rev=function(k){return okTx.filter(function(x){return mkey(x.time)===k}).reduce(function(a,x){return a+x.amount},0)};
  var win=function(f,t){return okTx.filter(function(x){var a=now-new Date(x.time);return a>=f*D&&a<t*D}).reduce(function(s2,x){return s2+x.amount},0)};
  var rc=win(0,30),rp=win(30,60),ch=rp?Math.round((rc-rp)/rp*100):0,plays=DB.songs.reduce(function(a,s){return a+s.plays},0);
  var kp=function(ic_,l,v,d){return'<div class="ad-card kpi"><div class="l"><span class="ic">'+ic(I[ic_])+'</span>'+l+'</div><div class="v">'+v+'</div><div class="d">'+d+'</div></div>'};
  var usersM=mm.map(function(m){return{l:m.l,v:U.filter(function(u){return mkey(u.joined)===m.k}).length}});
  var revM=mm.map(function(m){return{l:m.l,v:Math.round(rev(m.k)/1e5)/10}});
  var byM={};okTx.forEach(function(x){byM[x.method]=(byM[x.method]||0)+1});
  var parts=Object.keys(METHOD).map(function(k){return{k:k,v:byM[k]||0,c:MCOL[k]}});
  var tot=parts.reduce(function(a,x){return a+x.v},0)||1;
  var legend=parts.map(function(x){return'<div><i style="background:'+x.c+'"></i>'+METHOD[x.k]+'<b>'+Math.round(x.v/tot*100)+'%</b></div>'}).join("");
  var ev=[];
  U.forEach(function(u){ev.push({t:u.joined,i:"👤",h:"<b>"+esc(u.name)+"</b> đăng ký tài khoản"})});
  T.forEach(function(x){ev.push({t:x.time,i:x.st==="ok"?"💎":x.st==="fail"?"⚠️":"↩️",h:x.st==="ok"?"<b>"+esc(x.uname)+"</b> nâng cấp "+PLAN[x.plan]+" ("+money(x.amount)+", "+METHOD[x.method]+")":x.st==="fail"?"Thanh toán của <b>"+esc(x.uname)+"</b> thất bại ("+x.id+")":"Giao dịch <b>"+x.id+"</b> đã hoàn tiền"})});
  ev.sort(function(a,b){return new Date(b.t)-new Date(a.t)});
  var feed=ev.slice(0,7).map(function(e){return'<div><span class="dot">'+e.i+'</span><div><p>'+e.h+'</p><small>'+ago(e.t)+'</small></div></div>'}).join("");
  var top=DB.songs.filter(function(s){return s.st==="show"}).sort(function(a,b){return b.plays-a.plays}).slice(0,5),mx=top.length?top[0].plays:1;
  var t5=top.map(function(s){return'<div class="r"><div class="cv im-'+s.cover+'"></div><div class="n"><b>'+esc(s.title)+'</b><span>'+esc(s.artist)+'</span><div class="bar"><i style="width:'+Math.round(s.plays/mx*100)+'%"></i></div></div><em>'+num(s.plays)+' lượt</em></div>'}).join("");
  var today=new Date();
  return'<div class="ad-hello"><h2>Xin chào, '+esc(CFG.name)+' 👋</h2><p>Hôm nay là '+fdate(today)+'. Đây là tình hình MeloJam.</p></div>'+
  '<div class="ad-grid ad-kpis">'+
    kp("users","Tổng người dùng",num(U.length),'<b class="up">+'+new7+'</b> đăng ký trong 7 ngày qua')+
    kp("crown","Thuê bao Premium",num(prem),'<b>'+Math.round(prem/(U.length||1)*100)+'%</b> tổng số người dùng')+
    kp("money","Doanh thu 30 ngày qua",money(rc),'<b class="'+(ch>=0?"up":"dn")+'">'+(ch>=0?"+":"")+ch+'%</b> so với 30 ngày trước đó')+
    kp("play","Tổng lượt nghe",num(plays),DB.songs.filter(function(s){return s.st==="show"}).length+" bài đang hiển thị")+
  '</div>'+
  '<div class="ad-grid ad-two"><div class="ad-card"><h3>Người dùng mới</h3><div class="sub">6 tháng gần nhất (tháng hiện tại tính đến hôm nay)</div>'+bars(usersM,function(v){return v})+'</div>'+
  '<div class="ad-card"><h3>Doanh thu</h3><div class="sub">Triệu đồng, chỉ tính giao dịch thành công (tháng hiện tại tính đến hôm nay)</div>'+bars(revM,function(v){return v})+'</div></div>'+
  '<div class="ad-grid ad-two"><div class="ad-card"><h3>Phương thức thanh toán</h3><div class="sub">Theo số giao dịch thành công</div><div class="ad-donut">'+donut(parts)+'<div class="ad-leg">'+legend+'</div></div></div>'+
  '<div class="ad-card"><h3>Hoạt động gần đây</h3><div class="sub">Đăng ký và giao dịch mới nhất</div><div class="ad-feed">'+feed+'</div></div></div>'+
  '<div class="ad-card"><h3>Bài hát nghe nhiều nhất</h3><div class="sub">Chỉ tính bài đang hiển thị</div><div class="ad-top5">'+t5+'</div></div>';
}

/* ---------- bảng dùng chung ---------- */
function pager(key,total,pg){
  var pages=Math.max(1,Math.ceil(total/PER));pg=Math.min(pg,pages);
  var from=total?(pg-1)*PER+1:0,to=Math.min(total,pg*PER),b="";
  var win=[];for(var i=1;i<=pages;i++)if(i===1||i===pages||Math.abs(i-pg)<=1)win.push(i);
  b+='<button data-act="pg" data-k="'+key+'" data-v="'+(pg-1)+'" '+(pg<=1?"disabled":"")+' aria-label="Trang trước">‹</button>';
  var prevI=0;win.forEach(function(i){if(i-prevI>1)b+='<span style="margin:0 2px">…</span>';b+='<button data-act="pg" data-k="'+key+'" data-v="'+i+'" class="'+(i===pg?"on":"")+'">'+i+'</button>';prevI=i});
  b+='<button data-act="pg" data-k="'+key+'" data-v="'+(pg+1)+'" '+(pg>=pages?"disabled":"")+' aria-label="Trang sau">›</button>';
  return'<div class="ad-pager"><span>Hiển thị '+from+'–'+to+' / '+total+'</span>'+b+'</div>';
}
function slice(arr,st){var pages=Math.max(1,Math.ceil(arr.length/PER));if(st.pg>pages)st.pg=pages;if(st.pg<1)st.pg=1;return arr.slice((st.pg-1)*PER,st.pg*PER)}
function sel(f,val,opts){return'<select class="ad-in ad-sel" data-f="'+f+'" aria-label="Bộ lọc">'+opts.map(function(o){return'<option value="'+o[0]+'"'+(String(o[0])===String(val)?" selected":"")+'>'+esc(o[1])+'</option>'}).join("")+'</select>'}
function search(f,val,ph){return'<div class="ad-search">'+ic(I.search)+'<input class="ad-in" data-f="'+f+'" value="'+esc(val)+'" placeholder="'+esc(ph)+'" aria-label="'+esc(ph)+'" autocomplete="off"></div>'}

/* ---------- trang: Người dùng ---------- */
var PO={free:0,month:1,year:2};
function userList(){
  var s=UI.users,q=s.q.trim().toLowerCase();
  var a=DB.users.filter(function(u){
    if(q&&u.name.toLowerCase().indexOf(q)<0&&u.email.toLowerCase().indexOf(q)<0)return false;
    if(s.plan==="free"&&u.plan!=="free")return false;if(s.plan==="prem"&&u.plan==="free")return false;
    if(s.st!=="all"&&u.st!==s.st)return false;return true});
  var k=s.sort,d=s.dir;
  a.sort(function(x,y){var r=k==="name"?x.name.localeCompare(y.name,"vi"):k==="plan"?PO[x.plan]-PO[y.plan]:k==="plays"?x.plays-y.plays:(new Date(x[k])-new Date(y[k]));return r*d});
  return a;
}
function th(k,l,cls){var s=UI.users,on=s.sort===k;return'<th class="'+(cls||"")+'" scope="col" aria-sort="'+(on?(s.dir>0?"ascending":"descending"):"none")+'"><button data-act="sort" data-k="'+k+'">'+l+(on?(s.dir>0?" ▲":" ▼"):"")+'</button></th>'}
function usersTable(){
  var a=userList(),rows=slice(a,UI.users);
  if(!a.length)return'<div class="ad-card ad-empty">Không tìm thấy người dùng phù hợp.</div>';
  var body=rows.map(function(u){return'<tr><td class="t-main"><div class="ad-u"><span class="a" style="background:'+hue(u.name)+'">'+esc(initial(u.name))+'</span><div><b>'+esc(u.name)+'</b><span>'+esc(u.email)+'</span></div></div></td>'+
    '<td class="t-a"><span class="bd '+(u.plan==="free"?"free":"prem")+'">'+PLAN[u.plan]+'</span></td><td class="t-b"><span class="bd '+(u.st==="locked"?"lock":"ok")+'">'+(u.st==="locked"?"Bị khoá":"Hoạt động")+'</span></td>'+
    '<td class="hm">'+fdate(u.joined)+'</td><td class="hm">'+ago(u.last)+'</td><td class="hm num">'+num(u.plays)+'</td>'+
    '<td class="t-x"><div class="ad-acts"><button class="ad-btn sm" data-act="user" data-id="'+u.id+'">Chi tiết</button><button class="ad-btn sm '+(u.st==="locked"?"":"dng")+'" data-act="ulock" data-id="'+u.id+'">'+(u.st==="locked"?"Mở khoá":"Khoá")+'</button></div></td></tr>'}).join("");
  return'<div class="ad-card" style="padding:0"><div class="ad-tw"><table class="ad-table"><thead><tr>'+th("name","Người dùng")+th("plan","Gói")+'<th scope="col">Trạng thái</th>'+th("joined","Tham gia","hm")+th("last","Hoạt động cuối","hm")+th("plays","Lượt nghe","hm num")+'<th scope="col"></th></tr></thead><tbody>'+body+'</tbody></table></div></div>'+pager("users",a.length,UI.users.pg);
}
function pageUsers(){var s=UI.users;
  return'<div class="ad-tools">'+search("users.q",s.q,"Tìm theo tên hoặc email")+sel("users.plan",s.plan,[["all","Tất cả gói"],["free","Miễn phí"],["prem","Premium"]])+sel("users.st",s.st,[["all","Mọi trạng thái"],["active","Hoạt động"],["locked","Bị khoá"]])+'<span class="only-m">'+sel("users.sortv",s.sort+":"+s.dir,[["joined:-1","Mới tham gia"],["joined:1","Tham gia lâu nhất"],["name:1","Tên A → Z"],["name:-1","Tên Z → A"],["plays:-1","Nghe nhiều nhất"],["last:-1","Hoạt động gần đây"]])+'</span><span class="ad-count" id="adCnt">'+userList().length+' người dùng</span></div><div id="adTbl">'+usersTable()+'</div>'}
function userModal(id){
  var u=DB.users.find(function(x){return x.id===id});if(!u)return;
  var trs=DB.tx.filter(function(x){return x.uid===u.id}).length;
  openModal('<div class="ad-det"><span class="a" style="background:'+hue(u.name)+'">'+esc(initial(u.name))+'</span><div><b>'+esc(u.name)+'</b><span>'+esc(u.email)+'</span></div></div>'+
   '<div class="ad-kv"><div><small>Tham gia</small><b>'+fdate(u.joined)+'</b></div><div><small>Hoạt động cuối</small><b>'+ago(u.last)+'</b></div><div><small>Lượt nghe</small><b>'+num(u.plays)+'</b></div><div><small>Giao dịch</small><b>'+trs+'</b></div></div>'+
   '<div class="ad-f"><div><label for="adPlan">Gói dịch vụ</label><select id="adPlan" class="ad-in">'+Object.keys(PLAN).map(function(k){return'<option value="'+k+'"'+(u.plan===k?" selected":"")+'>'+PLAN[k]+'</option>'}).join("")+'</select></div></div>'+
   '<div class="ad-mact"><button class="ad-btn dng" data-act="udel" data-id="'+u.id+'">Xoá tài khoản</button><button class="ad-btn '+(u.st==="locked"?"":"dng")+'" data-act="ulock" data-id="'+u.id+'">'+(u.st==="locked"?"Mở khoá":"Khoá")+'</button><button class="ad-btn" data-act="mclose">Đóng</button><button class="ad-btn pri" data-act="usave" data-id="'+u.id+'" data-focus>Lưu thay đổi</button></div>');
}

/* ---------- trang: Nội dung ---------- */
function songList(){
  var s=UI.songs,q=s.q.trim().toLowerCase();
  return DB.songs.filter(function(x){
    if(q&&x.title.toLowerCase().indexOf(q)<0&&x.artist.toLowerCase().indexOf(q)<0)return false;
    if(s.genre!=="all"&&x.genre!==s.genre)return false;if(s.st!=="all"&&x.st!==s.st)return false;return true});
}
function songsTable(){
  var a=songList(),rows=slice(a,UI.songs);
  if(!a.length)return'<div class="ad-card ad-empty">Không có bài hát phù hợp.</div>';
  var body=rows.map(function(x){return'<tr><td class="t-main"><div class="ad-u"><div class="cv im-'+x.cover+'"></div><div><b>'+esc(x.title)+'</b><span>'+esc(x.artist)+'</span></div></div></td><td class="hm">'+esc(x.genre)+'</td><td class="hm">'+esc(x.dur)+'</td><td class="num t-a">'+num(x.plays)+' lượt</td>'+
   '<td class="t-b"><span class="bd '+(x.st==="show"?"ok":"free")+'">'+(x.st==="show"?"Hiển thị":"Đang ẩn")+'</span></td>'+
   '<td class="t-x"><div class="ad-acts"><button class="ad-btn sm" data-act="sedit" data-id="'+x.id+'">Sửa</button><button class="ad-btn sm" data-act="stog" data-id="'+x.id+'">'+(x.st==="show"?"Ẩn":"Hiện")+'</button><button class="ad-btn sm dng" data-act="sdel" data-id="'+x.id+'">Xoá</button></div></td></tr>'}).join("");
  return'<div class="ad-card" style="padding:0"><div class="ad-tw"><table class="ad-table"><thead><tr><th scope="col">Bài hát</th><th class="hm" scope="col">Thể loại</th><th class="hm" scope="col">Thời lượng</th><th class="num" scope="col">Lượt nghe</th><th scope="col">Trạng thái</th><th scope="col"></th></tr></thead><tbody>'+body+'</tbody></table></div></div>'+pager("songs",a.length,UI.songs.pg);
}
function pageSongs(){var s=UI.songs;
  return'<div class="ad-tools">'+search("songs.q",s.q,"Tìm bài hát hoặc nghệ sĩ")+sel("songs.genre",s.genre,[["all","Mọi thể loại"]].concat(GENRES.map(function(g){return[g,g]})))+sel("songs.st",s.st,[["all","Mọi trạng thái"],["show","Hiển thị"],["hidden","Đang ẩn"]])+
   '<span class="ad-count" id="adCnt">'+songList().length+' bài hát</span><button class="ad-btn pri" data-act="sadd">'+ic(I.plus)+'Thêm bài hát</button></div><div id="adTbl">'+songsTable()+'</div>'}
function songModal(id){
  var x=id?DB.songs.find(function(s){return s.id===id}):null;x=x||{title:"",artist:"",genre:GENRES[0],dur:"3:30",cover:"daft"};
  openModal('<h3>'+(id?"Sửa bài hát":"Thêm bài hát")+'</h3><p class="sub">'+(id?"Cập nhật thông tin bài hát.":"Bài mới sẽ được hiển thị ngay trong danh mục.")+'</p><div class="ad-f">'+
   '<div><label for="sTitle">Tên bài hát *</label><input id="sTitle" class="ad-in" maxlength="60" value="'+esc(x.title)+'" data-focus><div class="ad-err" id="eTitle"></div></div>'+
   '<div><label for="sArtist">Nghệ sĩ *</label><input id="sArtist" class="ad-in" maxlength="60" value="'+esc(x.artist)+'"><div class="ad-err" id="eArtist"></div></div>'+
   '<div class="ad-grid" style="grid-template-columns:1fr 1fr"><div><label for="sGenre">Thể loại</label><select id="sGenre" class="ad-in">'+GENRES.map(function(g){return'<option'+(g===x.genre?" selected":"")+'>'+g+'</option>'}).join("")+'</select></div>'+
   '<div><label for="sDur">Thời lượng (m:ss)</label><input id="sDur" class="ad-in" value="'+esc(x.dur)+'" maxlength="5"><div class="ad-err" id="eDur"></div></div></div>'+
   '<div><label for="sCover">Ảnh bìa</label><div class="ad-cov"><div class="cv im-'+x.cover+'" id="sCovPrev"></div><select id="sCover" class="ad-in">'+Object.keys(COVERS).map(function(k){return'<option value="'+k+'"'+(k===x.cover?" selected":"")+'>'+COVERS[k]+'</option>'}).join("")+'</select></div></div></div>'+
   '<div class="ad-mact"><button class="ad-btn" data-act="mclose">Huỷ</button><button class="ad-btn pri" data-act="ssave" data-id="'+(id||"")+'">'+(id?"Lưu thay đổi":"Thêm bài hát")+'</button></div>');
}
function saveSong(id){
  var t=$("sTitle").value.trim().replace(/\s+/g," "),a=$("sArtist").value.trim().replace(/\s+/g," "),du=$("sDur").value.trim(),ok=true;
  var bad=function(i,e,m){$(e).textContent=m||"";$(i).classList.toggle("bad",!!m);if(m)ok=false};
  bad("sTitle","eTitle",!t?"Vui lòng nhập tên bài hát.":"");bad("sArtist","eArtist",!a?"Vui lòng nhập tên nghệ sĩ.":"");
  bad("sDur","eDur",!/^\d{1,2}:[0-5]\d$/.test(du)?"Định dạng m:ss, ví dụ 3:45.":"");
  if(!ok){var f=$("sTitle").classList.contains("bad")?$("sTitle"):$("sArtist").classList.contains("bad")?$("sArtist"):$("sDur");f.focus();return}
  var rec={title:t,artist:a,genre:$("sGenre").value,dur:du,cover:$("sCover").value};
  if(id){var s=DB.songs.find(function(x){return x.id===id});Object.assign(s,rec);toast("Đã cập nhật “"+t+"”")}
  else{DB.songs.unshift(Object.assign({id:"s"+Date.now(),plays:0,st:"show"},rec));UI.songs.pg=1;toast("Đã thêm “"+t+"”")}
  save();closeModal();render();
}

/* ---------- trang: Giao dịch ---------- */
function txList(){
  var s=UI.tx,q=s.q.trim().toLowerCase();
  return DB.tx.filter(function(x){
    if(q&&x.id.toLowerCase().indexOf(q)<0&&x.uname.toLowerCase().indexOf(q)<0)return false;
    if(s.st!=="all"&&x.st!==s.st)return false;if(s.m!=="all"&&x.method!==s.m)return false;return true});
}
var TXS={ok:["ok","Thành công"],fail:["fail","Thất bại"],refund:["warn","Đã hoàn tiền"]};
function txTable(){
  var a=txList(),rows=slice(a,UI.tx);
  if(!a.length)return'<div class="ad-card ad-empty">Không có giao dịch phù hợp.</div>';
  var body=rows.map(function(x){var s=TXS[x.st];return'<tr><td class="t-main"><b style="font-size:13px">'+x.id+'</b><span class="mo-name">'+esc(x.uname)+'</span><span class="mo-name">'+PLAN[x.plan]+' · '+METHOD[x.method]+'</span><span class="mo-name">'+ftime(x.time)+'</span></td><td class="hm">'+esc(x.uname)+'</td><td class="hm">'+PLAN[x.plan]+'</td><td class="hm">'+METHOD[x.method]+'</td><td class="num t-a">'+money(x.amount)+'</td><td class="hm">'+ftime(x.time)+'</td><td class="t-b"><span class="bd '+s[0]+'">'+s[1]+'</span></td>'+
   (x.st==="ok"?'<td class="t-x"><div class="ad-acts"><button class="ad-btn sm dng" data-act="refund" data-id="'+x.id+'">Hoàn tiền</button></div></td>':'<td class="t-x"></td>')+'</tr>'}).join("");
  return'<div class="ad-card" style="padding:0"><div class="ad-tw"><table class="ad-table"><thead><tr><th scope="col">Mã GD</th><th scope="col">Người dùng</th><th class="hm" scope="col">Gói</th><th class="hm" scope="col">Phương thức</th><th class="num" scope="col">Số tiền</th><th class="hm" scope="col">Thời gian</th><th scope="col">Trạng thái</th><th scope="col"></th></tr></thead><tbody>'+body+'</tbody></table></div></div>'+pager("tx",a.length,UI.tx.pg);
}
function pageTx(){var s=UI.tx,all=DB.tx,ok=all.filter(function(x){return x.st==="ok"}),fail=all.filter(function(x){return x.st==="fail"}).length;
  return'<div class="ad-sum"><div>Tổng doanh thu<b>'+money(ok.reduce(function(a,x){return a+x.amount},0))+'</b></div><div>Giao dịch thành công<b>'+ok.length+'</b></div><div>Tỉ lệ thất bại<b>'+Math.round(fail/(all.length||1)*100)+'%</b></div></div>'+
   '<div class="ad-tools">'+search("tx.q",s.q,"Tìm mã giao dịch hoặc tên")+sel("tx.st",s.st,[["all","Mọi trạng thái"],["ok","Thành công"],["fail","Thất bại"],["refund","Đã hoàn tiền"]])+sel("tx.m",s.m,[["all","Mọi phương thức"]].concat(Object.keys(METHOD).map(function(k){return[k,METHOD[k]]})))+
   '<span class="ad-count" id="adCnt">'+txList().length+' giao dịch</span><button class="ad-btn" data-act="csv">'+ic(I.dl)+'Xuất CSV</button></div><div id="adTbl">'+txTable()+'</div>'}
function exportCsv(){
  var rows=[["Mã GD","Người dùng","Gói","Phương thức","Số tiền (đ)","Thời gian","Trạng thái"]].concat(txList().map(function(x){return[x.id,x.uname,PLAN[x.plan],METHOD[x.method],x.amount,ftime(x.time),TXS[x.st][1]]}));
  var csv="\uFEFF"+rows.map(function(r){return r.map(function(c){c=String(c);return/[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(",")}).join("\r\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="melojam-giao-dich.csv";document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("Đã xuất "+(rows.length-1)+" giao dịch");
}

/* ---------- điều hướng + render ---------- */
var TITLES={dash:"Tổng quan",users:"Người dùng",songs:"Nội dung",tx:"Giao dịch"};
var VIEWS={dash:pageDash,users:pageUsers,songs:pageSongs,tx:pageTx};
function render(){
  ensure();
  document.querySelectorAll(".ad-nav button").forEach(function(b){var on=b.dataset.p===UI.page;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  $("adTitle").textContent=TITLES[UI.page];
  $("adMain").innerHTML='<div class="ad-wrap">'+VIEWS[UI.page]()+'</div>';
}
function refreshTable(){
  var m={users:usersTable,songs:songsTable,tx:txTable}[UI.page];if(!m)return;
  $("adTbl").innerHTML=m();var c=$("adCnt");if(c){var n={users:userList,songs:songList,tx:txList}[UI.page]().length;c.textContent=n+" "+({users:"người dùng",songs:"bài hát",tx:"giao dịch"}[UI.page])}
}
function go(p){UI.page=p;render();$("adContent").scrollTop=0;closeDrawer()}
function openDrawer(){$("adSide").classList.add("open");$("adScrim").classList.add("open");$("adBurger").setAttribute("aria-expanded","true")}
function closeDrawer(){$("adSide").classList.remove("open");$("adScrim").classList.remove("open");$("adBurger").setAttribute("aria-expanded","false")}

/* ---------- vào / ra trang quản trị ---------- */
var prevTitle="";
function enterAdmin(u,silent){
  ensure();
  document.body.classList.remove("guest");document.body.classList.add("admin");
  $("admin").hidden=false;prevTitle=document.title;document.title="MeloJam Admin";
  try{sessionStorage.setItem(SKEY,"1")}catch(e){}
  $("adMeName").textContent=(u&&u.name)||CFG.name;$("adAv").textContent=((u&&u.name)||CFG.name).charAt(0).toUpperCase();
  go(UI.page||"dash");if(!silent)toast("Đăng nhập quản trị thành công");
}
function leaveAdmin(){
  closeModal();closeDrawer();
  try{sessionStorage.removeItem(SKEY)}catch(e){}
  $("admin").hidden=true;document.body.classList.remove("admin");document.body.classList.add("guest");
  if(prevTitle)document.title=prevTitle;
  var l=$("landing");if(l)l.scrollTop=0;
  var t=$("mjToast");if(t){t.hidden=false;t.innerHTML="<i>✓</i><span></span>";t.querySelector("span").textContent="Bạn đã đăng xuất khỏi trang quản trị.";t.classList.remove("show");void t.offsetWidth;t.classList.add("show");clearTimeout(leaveAdmin._t);leaveAdmin._t=setTimeout(function(){t.hidden=true;t.classList.remove("show")},3100)}
}
window.mjEnterAdmin=enterAdmin;

/* ---------- sự kiện ---------- */
var root=$("admin");
root.addEventListener("click",function(e){
  var el=e.target.closest("[data-act],[data-p]");
  if(e.target===$("adMbg")){closeModal();return}
  if(!el)return;
  if(el.dataset.p){go(el.dataset.p);return}
  var a=el.dataset.act,id=el.dataset.id;
  switch(a){
    case"menu":openDrawer();break;
    case"scrim":closeDrawer();break;
    case"mclose":closeModal();break;
    case"mok":var cb=$("adModal").__ok;$("adModal").__ok=null;closeModal();if(cb)cb();break;
    case"logout":confirmBox("Đăng xuất?","Bạn sẽ thoát khỏi trang quản trị và quay về trang giới thiệu.","Đăng xuất",false,leaveAdmin);break;
    case"reset":confirmBox("Khôi phục dữ liệu mẫu?","Mọi thay đổi bạn đã thực hiện (khoá, xoá, thêm, hoàn tiền…) sẽ bị xoá và trở về dữ liệu ban đầu.","Khôi phục",true,function(){DB=seed();save();render();toast("Đã khôi phục dữ liệu mẫu")});break;
    case"sort":var s=UI.users;if(s.sort===el.dataset.k)s.dir*=-1;else{s.sort=el.dataset.k;s.dir=(el.dataset.k==="name")?1:-1}s.pg=1;refreshTable();break;
    case"pg":UI[el.dataset.k].pg=parseInt(el.dataset.v,10);refreshTable();break;
    case"user":userModal(id);break;
    case"ulock":if(!$("adMbg").hidden)closeModal();toggleLock(id);break;
    case"usave":var u=DB.users.find(function(x){return x.id===id});if(u){u.plan=$("adPlan").value;save();closeModal();render();toast("Đã cập nhật gói của "+u.name)}break;
    case"udel":var du=DB.users.find(function(x){return x.id===id});if(du)confirmBox("Xoá tài khoản?","Xoá vĩnh viễn “"+du.name+"”. Lịch sử giao dịch vẫn được giữ lại để đối soát.","Xoá tài khoản",true,function(){DB.users=DB.users.filter(function(x){return x.id!==id});save();render();toast("Đã xoá tài khoản "+du.name)});break;
    case"sadd":songModal();break;
    case"sedit":songModal(id);break;
    case"ssave":saveSong(id||null);break;
    case"stog":var so=DB.songs.find(function(x){return x.id===id});if(so){so.st=so.st==="show"?"hidden":"show";save();refreshTable();toast((so.st==="show"?"Đã hiện “":"Đã ẩn “")+so.title+"”")}break;
    case"sdel":var sd=DB.songs.find(function(x){return x.id===id});if(sd)confirmBox("Xoá bài hát?","Xoá “"+sd.title+"” khỏi danh mục.","Xoá bài hát",true,function(){DB.songs=DB.songs.filter(function(x){return x.id!==id});save();refreshTable();toast("Đã xoá “"+sd.title+"”")});break;
    case"refund":var tx=DB.tx.find(function(x){return x.id===id});if(tx)confirmBox("Hoàn tiền giao dịch?","Hoàn "+money(tx.amount)+" cho “"+tx.uname+"” (mã "+tx.id+"). Thao tác này không thể hoàn tác.","Hoàn tiền",true,function(){tx.st="refund";save();render();toast("Đã hoàn tiền "+tx.id)});break;
    case"csv":exportCsv();break;
  }
});
function toggleLock(id){var u=DB.users.find(function(x){return x.id===id});if(!u)return;
  var doIt=function(){u.st=u.st==="locked"?"active":"locked";save();refreshTable();toast((u.st==="locked"?"Đã khoá ":"Đã mở khoá ")+u.name)};
  if(u.st==="locked")doIt();else confirmBox("Khoá tài khoản?","“"+u.name+"” sẽ không thể đăng nhập cho đến khi được mở khoá.","Khoá tài khoản",true,doIt);
}
function setF(el){var p=el.dataset.f.split("."),st=UI[p[0]];
  if(p[1]==="sortv"){var v=el.value.split(":");st.sort=v[0];st.dir=parseInt(v[1],10)}else st[p[1]]=el.value;
  st.pg=1;refreshTable()}
root.addEventListener("input",function(e){if(e.target.dataset&&e.target.dataset.f&&e.target.tagName==="INPUT")setF(e.target)});
root.addEventListener("change",function(e){
  if(e.target.dataset&&e.target.dataset.f&&e.target.tagName==="SELECT")setF(e.target);
  if(e.target.id==="sCover")$("sCovPrev").className="cv im-"+e.target.value;
});
document.addEventListener("keydown",function(e){
  if(!document.body.classList.contains("admin"))return;
  if(e.key==="Escape"){if(!$("adMbg").hidden)closeModal();else closeDrawer()}
  if(e.key==="Enter"&&!$("adMbg").hidden&&e.target.tagName==="INPUT"&&$("adModal").querySelector('[data-act="ssave"]')){e.preventDefault();$("adModal").querySelector('[data-act="ssave"]').click()}
});

/* khôi phục phiên trong tab hiện tại (tải lại trang không bị văng ra) */
try{if(sessionStorage.getItem(SKEY)==="1")enterAdmin(null,true)}catch(e){}
})();
