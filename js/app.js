function mjNorm(x){return String(x==null?"":x).replace(/['’]/g,"").trim().toLowerCase()}
function mjTrack(t,a){t=mjNorm(t);a=mjNorm(a);for(var i=0;i<MJ_TRACKS.length;i++){var x=MJ_TRACKS[i];if(mjNorm(x.t)===t&&mjNorm(x.a)===a)return x}return null}
function mjFmt(sec){sec=Math.round(sec);return Math.floor(sec/60)+":"+("0"+(sec%60)).slice(-2)}
function mjDur(t,a,fb){var x=mjTrack(t,a);return x?mjFmt(x.d):(fb||"3:30")}
function mjByArtist(a){a=mjNorm(a);return MJ_TRACKS.filter(function(x){return mjNorm(x.a)===a})}
var C=["Học tập","Làm việc","Tập luyện","Lái xe","Nghỉ ngơi","Chiều mưa"];
var S={
"Học tập":[["Birds Eye View","Alina Baraz","alina"],["Don’t Need To Know","Galimatias","let"],["Lonely","Mac Ayres","mac"]],
"Làm việc":[["Lonely","Mac Ayres","mac"],["Don’t Need To Know","Galimatias","let"],["Birds Eye View","Alina Baraz","alina"],["Like You Do","Joji","joji"]],
"Tập luyện":[["Crescendolls","Daft Punk","daft"],["red leather","53 Thieves","t53"],["Saturn (Gali Remix)","SZA","sos"]],
"Lái xe":[["Crescendolls","Daft Punk","daft"],["red leather","53 Thieves","t53"],["Don’t Need To Know","Galimatias","let"],["Saturn (Gali Remix)","SZA","sos"]],
"Nghỉ ngơi":[["Like You Do","Joji","joji"],["Lonely","Mac Ayres","mac"],["Birds Eye View","Alina Baraz","alina"]],
"Chiều mưa":[["Lonely","Mac Ayres","mac"],["Like You Do","Joji","joji"],["Saturn (Gali Remix)","SZA","sos"]]
};
var WHY={"Học tập":"Nhịp chậm, ít lời để bạn tập trung lâu hơn.","Làm việc":"Giai điệu đều và nhẹ, không làm bạn phân tâm.","Tập luyện":"Nhịp nhanh, bass mạnh để giữ nhịp chạy.","Lái xe":"Những bản nhạc dễ chìm vào trên đường dài.","Nghỉ ngơi":"Giọng hát êm và tiết tấu chậm để thả lỏng.","Chiều mưa":"Âm sắc ấm, trầm lắng hợp một chiều mưa."};
var ctx="Học tập",cur=["Like You Do","Joji","joji"],playing=false;
var PLAY_ICON='<path d="M8 5v14l11-7z"/>',PAUSE_ICON='<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

function chips(id,arr,get,set){var e=document.getElementById(id);
/* Giữ nguyên các nút (không dựng lại) để transition có sẵn của .chip chạy; chỉ bật/tắt .on */
if(e.children.length!==arr.length){e.innerHTML="";arr.forEach(function(k){var b=document.createElement("button");b.className="chip";b.textContent=k;b.onclick=function(){set(k);draw()};e.appendChild(b)})}
Array.prototype.forEach.call(e.children,function(b,i){b.classList.toggle("on",get()===arr[i])})}
function draw(){chips("ctxs",C,function(){return ctx},function(k){ctx=k})}
function guess(t){t=t.toLowerCase();var c=[["học","Học tập"],["làm việc","Làm việc"],["tập","Tập luyện"],["gym","Tập luyện"],["lái xe","Lái xe"],["ngủ","Nghỉ ngơi"],["nghỉ","Nghỉ ngơi"],["mưa","Chiều mưa"]];c.some(function(x){if(t.indexOf(x[0])>-1){ctx=x[1];return true}});draw()}

function go(){var q=document.getElementById("q").value.trim();if(q)guess(q);var r=document.getElementById("res");r.hidden=false;
r.classList.remove("sg-in");r.innerHTML='<div class="load"><div class="wave"><s></s><s></s><s></s><s></s><s></s></div>Đang tìm gợi ý phù hợp với ngữ cảnh...</div>';
r.scrollIntoView({behavior:"smooth",block:"nearest"});
setTimeout(function(){var L=S[ctx],h='<h3>Gợi ý cho hoàn cảnh: '+ctx+'</h3><div class="why">'+(WHY[ctx]||"")+'</div>';
L.forEach(function(s,i){h+='<div class="row sg-row" style="--i:'+i+'" onclick="play('+i+')" id="r'+i+'"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+s[1]+'</span></div><em>'+mjDur(s[0],s[1])+'</em></div>'});
h+='<div class="acts"><button class="btn" onclick="play(0)">▶ Nghe ngay</button><button class="btn o" onclick="this.textContent=\'✓ Đã lưu vào thư viện\'">Lưu vào thư viện</button><button class="btn o" onclick="go()">Gợi ý lại</button></div>';r.classList.remove("sg-in");r.style.setProperty("--n",L.length);r.innerHTML=h;void r.offsetWidth;r.classList.add("sg-in")},1100)}

function play(i){var s=S[ctx][i];setNowPlaying(s[0],s[1],s[2]);document.querySelectorAll("#res .row").forEach(function(e){e.classList.remove("on")});var e=document.getElementById("r"+i);if(e)e.classList.add("on")}
function setNowPlaying(title,sub,img){cur=[title,sub,img];playing=true;document.getElementById("pn").textContent=title+" – "+sub;(function(){var n=document.getElementById("npn");n.innerHTML='<button type="button" class="np-t" title="Mở album chứa bài hát"></button><br><small style="color:var(--mu);font-weight:400"><button type="button" class="np-a" title="Xem hồ sơ nghệ sĩ"></button></small>';n.querySelector(".np-t").textContent=title;var a=n.querySelector(".np-a");a.textContent=sub;a.hidden=!sub})();document.getElementById("art").className="art im-"+img;document.getElementById("plIcon").innerHTML=PAUSE_ICON;if(window.MJ)MJ.load(title,sub,img)}
function tp(){playing=!playing;document.getElementById("plIcon").innerHTML=playing?PAUSE_ICON:PLAY_ICON;if(window.MJ)MJ.sync()}
document.getElementById("q").addEventListener("keydown",function(e){if(e.key==="Enter")go()});

var SEARCH_ARTISTS=[["Joji","joji"],["Galimatias","let"],["53 Thieves","t53"],["Alina Baraz","alina"],["Daft Punk","daft"],["Mac Ayres","mac"],["SZA","sos"]];
var SEARCH_PLAYLISTS=[
["Study Lofi","Danh sách nhạc","lofi",[["Birds Eye View","Alina Baraz","alina"],["Don’t Need To Know","Galimatias","let"],["Lonely","Mac Ayres","mac"]]],
["Chạy bộ sáng","Danh sách nhạc","little",[["Crescendolls","Daft Punk","daft"],["red leather","53 Thieves","t53"],["Saturn (Gali Remix)","SZA","sos"]]],
["Đêm mưa thư giãn","Danh sách nhạc","texas",[["Lonely","Mac Ayres","mac"],["Like You Do","Joji","joji"],["Birds Eye View","Alina Baraz","alina"]]],
["Cyberpunk Nights","Danh sách nhạc","cyber",[["red leather","53 Thieves","t53"],["Crescendolls","Daft Punk","daft"]]],
["Miền ký ức","Danh sách nhạc","red",[["Like You Do","Joji","joji"],["Saturn (Gali Remix)","SZA","sos"],["Lonely","Mac Ayres","mac"],["Don’t Need To Know","Galimatias","let"]]],
["MeloJam Mix","Tuyển chọn của MeloJam","daft",[["Crescendolls","Daft Punk","daft"],["Saturn (Gali Remix)","SZA","sos"],["Don’t Need To Know","Galimatias","let"],["red leather","53 Thieves","t53"],["Lonely","Mac Ayres","mac"],["Birds Eye View","Alina Baraz","alina"],["Like You Do","Joji","joji"]]]
];
var SEARCH_SONGS=[["Crescendolls","Daft Punk","daft"],["Saturn (Gali Remix)","SZA","sos"],["Don’t Need To Know","Galimatias","let"],["red leather","53 Thieves","t53"],["Lonely","Mac Ayres","mac"],["Birds Eye View","Alina Baraz","alina"],["Like You Do","Joji","joji"]];

function openSearch(){if(!document.getElementById("view-search").classList.contains("on")){nav("search");doSearch(document.getElementById("gsearch").value)}}
function esc(s){return String(s).replace(/'/g,"")}
function escHtml(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}
function doSearch(q){nav("search");q=q.trim().toLowerCase();var r=document.getElementById("search-results");
if(!q){r.innerHTML='<p style="color:var(--mu);font-size:13px">Nhập tên bài hát, nghệ sĩ hoặc playlist để tìm kiếm.</p>';return}
var songs=SEARCH_SONGS.filter(function(s){return s[0].toLowerCase().indexOf(q)>-1||s[1].toLowerCase().indexOf(q)>-1});
var pls=SEARCH_PLAYLISTS.map(function(p,i){return[p,i]}).filter(function(x){return x[0][0].toLowerCase().indexOf(q)>-1||x[0][1].toLowerCase().indexOf(q)>-1});
var artists=SEARCH_ARTISTS.filter(function(a){return a[0].toLowerCase().indexOf(q)>-1});
if(!songs.length&&!pls.length&&!artists.length){r.innerHTML='<p style="color:var(--mu);font-size:13px">Không tìm thấy kết quả cho "'+escHtml(q)+'".</p>';return}
var h="";
if(songs.length){h+='<section class="box"><h3>Bài hát</h3>'+songs.map(function(s){return '<div class="row" onclick="setNowPlaying(\''+esc(s[0])+'\',\''+esc(s[1])+'\',\''+s[2]+'\')"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+s[1]+'</span></div></div>'}).join("")+"</section>"}
if(pls.length){h+='<section class="box"><h3>Album / Playlist</h3><div class="pgrid">'+pls.map(function(x){var p=x[0],i=x[1];return '<div onclick="playlist(SEARCH_PLAYLISTS['+i+'][0],SEARCH_PLAYLISTS['+i+'][1],SEARCH_PLAYLISTS['+i+'][2],SEARCH_PLAYLISTS['+i+'][3])"><i class="im-'+p[2]+'"></i><b>'+p[0]+'</b><span>'+p[1]+'</span></div>'}).join("")+"</div></section>"}
if(artists.length){h+='<section class="box"><h3>Nghệ sĩ</h3><div class="ar">'+artists.map(function(a){return '<div onclick="artist(\''+esc(a[0])+'\',\''+a[1]+'\')"><i class="im-'+a[1]+'"></i>'+a[0]+'</div>'}).join("")+"</div></section>"}
r.innerHTML=h}

var views=["home","search","suggest","genre","artists","artist","playlist","library","account","acc-info","acc-context","acc-pass","recent","favorites","friends","premium"];
var billingPeriod="month";
function setBilling(period,btn){billingPeriod=period;document.querySelectorAll("#premiumBilling .chip").forEach(function(c){c.classList.remove("on")});btn.classList.add("on");
document.getElementById("premiumPrice").innerHTML=period==="year"?'39.200đ<span>/tháng, thanh toán 470.400đ/năm</span>':'49.000đ<span>/tháng</span>'}

function openPay(){document.getElementById("payPlanName").textContent=billingPeriod==="year"?"Premium · Hàng năm":"Premium · Hàng tháng";
document.getElementById("payPlanPrice").textContent=billingPeriod==="year"?"470.400đ":"49.000đ";
document.querySelectorAll(".ferr").forEach(function(e){e.classList.remove("show")});
document.querySelectorAll(".finput").forEach(function(i){i.classList.remove("bad")});
document.getElementById("payForm").reset();
document.getElementById("payModal").removeAttribute("hidden")}
function closePay(){document.getElementById("payModal").setAttribute("hidden","")}
function selectPay(m,btn){document.querySelectorAll("#paymethods .pm").forEach(function(b){b.classList.remove("on")});btn.classList.add("on");
document.querySelectorAll(".payfields").forEach(function(f){f.hidden=true});
document.getElementById("pay-"+m).hidden=false}
var isPremium=false;
function fieldErr(id,msg){var i=document.getElementById(id),e=document.getElementById(id+"-err");
i.classList.remove("bad");void i.offsetWidth;i.classList.add("bad");i.setAttribute("aria-invalid","true");e.textContent=msg;e.classList.add("show")}
function fieldOk(id){var i=document.getElementById(id),e=document.getElementById(id+"-err");i.classList.remove("bad");i.removeAttribute("aria-invalid");e.classList.remove("show")}
function normPhone(v){v=v.replace(/[\s.\-]/g,"");if(/^\+84\d{9}$/.test(v))return "0"+v.slice(3);if(/^84\d{9}$/.test(v))return "0"+v.slice(2);return v}
/* mỗi hàm check trả về true nếu hợp lệ, ngược lại hiện chữ đỏ và trả về false */
function checkMomo(){var raw=document.getElementById("momoPhone").value.trim();
if(!raw){fieldErr("momoPhone","Vui lòng nhập số điện thoại MoMo.");return false}
if(!/^(03|05|07|08|09)\d{8}$/.test(normPhone(raw))){fieldErr("momoPhone","Số điện thoại không hợp lệ. Cần đủ 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09 (VD: 0901234567).");return false}
fieldOk("momoPhone");return true}
function checkCardName(){var v=document.getElementById("cardName").value.trim();
if(!/^[A-Za-zÀ-ỹ ]{3,}$/.test(v)){fieldErr("cardName","Tên chủ thẻ không hợp lệ. Chỉ nhập chữ cái, tối thiểu 3 ký tự.");return false}fieldOk("cardName");return true}
function luhn(n){var s=0,d=false;for(var i=n.length-1;i>=0;i--){var x=+n[i];if(d){x*=2;if(x>9)x-=9}s+=x;d=!d}return s%10===0}
function checkCardNumber(){var v=document.getElementById("cardNumber").value.replace(/\s/g,"");
if(!/^\d{13,19}$/.test(v)){fieldErr("cardNumber","Số thẻ không hợp lệ. Cần từ 13 đến 19 chữ số.");return false}if(!luhn(v)){fieldErr("cardNumber","Số thẻ không hợp lệ. Vui lòng kiểm tra lại các chữ số.");return false}fieldOk("cardNumber");return true}
function checkCardExpiry(){var v=document.getElementById("cardExpiry").value.trim(),m=/^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
if(!m){fieldErr("cardExpiry","Ngày hết hạn không hợp lệ. Nhập theo dạng MM/YY.");return false}
var n=new Date(),y=2000+(+m[2]);if(y<n.getFullYear()||(y===n.getFullYear()&&(+m[1])<n.getMonth()+1)){fieldErr("cardExpiry","Thẻ đã hết hạn, vui lòng dùng thẻ khác.");return false}
fieldOk("cardExpiry");return true}
function checkCardCVV(){var v=document.getElementById("cardCVV").value.trim();
if(!/^\d{3,4}$/.test(v)){fieldErr("cardCVV","CVV không hợp lệ. Cần 3 hoặc 4 chữ số.");return false}fieldOk("cardCVV");return true}
function submitPay(e){e.preventDefault();
var m=document.querySelector("#paymethods .pm.on").dataset.m,checks=[];
if(m==="momo")checks=[["momoPhone",checkMomo]];
else if(m==="card")checks=[["cardName",checkCardName],["cardNumber",checkCardNumber],["cardExpiry",checkCardExpiry],["cardCVV",checkCardCVV]];
var firstBad=null;checks.forEach(function(c){if(!c[1]()&&!firstBad)firstBad=c[0]});
var ok=!firstBad;
if(firstBad){var el=document.getElementById(firstBad);el.focus();if(el.scrollIntoView)el.scrollIntoView({block:"center",behavior:"smooth"})}
if(!ok)return;
var planTxt=document.getElementById("payPlanName").textContent+" — "+document.getElementById("payPlanPrice").textContent;
var meth="MoMo";
if(m==="momo")meth="MoMo •••• "+normPhone(document.getElementById("momoPhone").value).slice(-4);
else if(m==="card")meth="Thẻ •••• "+document.getElementById("cardNumber").value.replace(/\s/g,"").slice(-4);
else if(m==="apple")meth="Apple Pay";else if(m==="google")meth="Google Pay";
subInfo={period:billingPeriod,start:Date.now(),method:meth,auto:true};saveSub();
closePay();setPremium(true);openSuccess(planTxt)}

function openSuccess(planTxt){document.getElementById("successPlan").textContent=planTxt;document.getElementById("successModal").removeAttribute("hidden")}
function closeSuccess(){document.getElementById("successModal").setAttribute("hidden","")}

function setPremium(v){isPremium=v;try{localStorage.setItem("mj-premium",v?"1":"0")}catch(e){}var btn=document.getElementById("premiumCta");
if(v){btn.innerHTML="👑 Premium";btn.classList.add("ispro");btn.onclick=function(){nav("premium")}}
else{btn.innerHTML='★ <span class="ctat">Nâng cấp </span>Premium';btn.classList.remove("ispro");btn.onclick=function(){nav("premium")}}
refreshPremiumPlanUI()}
var subInfo=null;
function saveSub(){try{localStorage.setItem("mj-sub",JSON.stringify(subInfo))}catch(e){}}
function loadSub(){try{subInfo=JSON.parse(localStorage.getItem("mj-sub")||"null")}catch(e){subInfo=null}
if(!subInfo||!subInfo.start){subInfo={period:"month",start:Date.now(),method:"MoMo",auto:true};saveSub()}}
function pFmt(d){return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+d.getFullYear()}
function pAdd(d,period){var x=new Date(d.getTime());if(period==="year")x.setFullYear(x.getFullYear()+1);else x.setMonth(x.getMonth()+1);return x}
function pToast(t){var e=document.createElement("div");e.className="ptoast";e.textContent=t;document.body.appendChild(e);setTimeout(function(){e.remove()},2200)}
function renderActivePlan(){if(!subInfo)loadSub();var yr=subInfo.period==="year",st=new Date(subInfo.start),en=pAdd(st,subInfo.period),now=Date.now();
var total=en-st,left=Math.max(0,Math.ceil((en-now)/86400000)),pct=Math.min(100,Math.max(0,(now-st)/total*100));
var price=yr?"470.400đ":"49.000đ";
function $(i){return document.getElementById(i)}
$("paName").textContent="Premium · "+(yr?"Hàng năm":"Hàng tháng");
$("paPrice").textContent=yr?"470.400đ/năm":"49.000đ/tháng";
$("paStart").textContent=pFmt(st);$("paEnd").textContent=pFmt(en);$("paLeft").textContent=left+" ngày";
$("paBar").style.width=pct.toFixed(1)+"%";
$("paNext").textContent=subInfo.auto?pFmt(en)+" / "+price:"Không gia hạn";
$("paMethod").textContent=subInfo.method;
var sw=$("paAuto");sw.classList.toggle("on",!!subInfo.auto);sw.setAttribute("aria-checked",subInfo.auto?"true":"false");
$("paSwitch").hidden=yr}
function toggleAuto(){subInfo.auto=!subInfo.auto;saveSub();renderActivePlan();pToast(subInfo.auto?"Đã bật tự gia hạn":"Đã tắt tự gia hạn")}
var pendingPlan=null;
function openPlanConfirm(kind){if(!subInfo)loadSub();pendingPlan=kind;var $=function(i){return document.getElementById(i)};
var cur=new Date(subInfo.start),curEnd=pAdd(cur,subInfo.period),yr=kind==="year",per=yr?"year":subInfo.period;
var until=yr?pAdd(new Date(),"year"):pAdd(curEnd,subInfo.period);
var amount=per==="year"?"470.400đ":"49.000đ";
$("pcTitle").textContent=yr?"Đổi sang gói năm?":"Gia hạn Premium?";
$("pcLead").textContent=yr?"Bạn đang dùng gói tháng (49.000đ/tháng). Gói năm chỉ 39.200đ/tháng, thanh toán một lần.":"Thêm 1 "+(per==="year"?"năm":"tháng")+" sử dụng Premium, tính nối tiếp từ ngày hết hạn hiện tại.";
$("pcSave").hidden=!yr;if(yr)$("pcSave").textContent="🎉 Tiết kiệm 117.600đ so với trả theo tháng (20%)";
$("pcPlan").textContent="Premium · "+(per==="year"?"Hàng năm":"Hàng tháng");
$("pcAmount").textContent=amount;$("pcUntil").textContent=pFmt(until);$("pcMethod").textContent=subInfo.method;
$("pcNote").textContent=yr?"Gói năm bắt đầu tính từ hôm nay và thay thế thời gian còn lại của gói tháng hiện tại. Bạn có thể tắt tự gia hạn bất cứ lúc nào.":"Khoản thanh toán sẽ được trừ vào phương thức đã lưu ở trên.";
$("pcOk").textContent=yr?"Xác nhận đổi":"Thanh toán "+amount;
$("planConfirmModal").hidden=false}
function closePlanConfirm(){document.getElementById("planConfirmModal").hidden=true;pendingPlan=null}
function confirmPlanAction(){var k=pendingPlan;closePlanConfirm();
if(k==="year"){subInfo.period="year";subInfo.start=Date.now();saveSub();renderActivePlan();pToast("Đã đổi sang gói năm")}
else if(k==="renew"){subInfo.start=pAdd(new Date(subInfo.start),subInfo.period).getTime();saveSub();renderActivePlan();pToast("Đã gia hạn thêm "+(subInfo.period==="year"?"1 năm":"1 tháng"))}}
function openCancelPlan(){document.getElementById("cancelPlanModal").hidden=false}
function closeCancelPlan(){document.getElementById("cancelPlanModal").hidden=true}
function confirmCancelPlan(){closeCancelPlan();try{localStorage.removeItem("mj-sub")}catch(e){}subInfo=null;setPremium(false);pToast("Đã chuyển về gói Miễn phí")}
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeCancelPlan();closePlanConfirm()}});
function refreshPremiumPlanUI(){var freeBtn=document.getElementById("freePlanBtn"),proBtn=document.getElementById("proPlanBtn"),ch=document.getElementById("premiumChoose"),ac=document.getElementById("premiumActive");
if(!ch||!ac)return;
ch.hidden=isPremium;ac.hidden=!isPremium;
if(isPremium){renderActivePlan();return}
if(!freeBtn||!proBtn)return;
proBtn.textContent="Nâng cấp ngay";proBtn.removeAttribute("disabled");proBtn.onclick=openPay;
freeBtn.textContent="Gói hiện tại";freeBtn.setAttribute("disabled","");freeBtn.onclick=null}
var navSideKey={artist:"artists",playlist:"home","acc-info":"account","acc-context":"account","acc-pass":"account"};
function nav(v,arg){views.forEach(function(x){document.getElementById("view-"+x).classList.toggle("on",x===v)});
var base=navSideKey[v]||v;
var key=arg?(base+":"+arg):base;
document.querySelectorAll(".side a[data-view]").forEach(function(a){a.classList.toggle("on",a.dataset.view===key)});
document.querySelector(".main").scrollTo(0,0);
if(v==="library")libSetTab("list");
document.getElementById("tab-nhac").classList.add("on");
syncTabbar(v);
}
var TAB_OF={home:"home",search:"home",genre:"home",artists:"home",artist:"home",playlist:"home",suggest:"suggest",library:"library",recent:"library",favorites:"favorites",friends:"friends",account:"account","acc-info":"account","acc-context":"account","acc-pass":"account",premium:"account"};
function syncTabbar(v){var t=TAB_OF[v]||"home";
  if(v==="artist"){var ac=document.getElementById("art-crumb");if(ac&&ac.dataset.back==="friends")t="friends"}   /* đang xem hồ sơ một người bạn (mở từ trang Bạn bè): tab Bạn bè vẫn sáng */
 document.querySelectorAll("#tabbar button").forEach(function(b){var on=b.dataset.tab===t;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")})}
var GENRES={"Lofi / Study":["lofi",[["Birds Eye View","Alina Baraz","alina"],["Don’t Need To Know","Galimatias","let"],["Lonely","Mac Ayres","mac"]]],
"R&B / Soul":["sos",[["Lonely","Mac Ayres","mac"],["Saturn (Gali Remix)","SZA","sos"],["Birds Eye View","Alina Baraz","alina"],["Like You Do","Joji","joji"]]],
"EDM / Dance":["daft",[["Crescendolls","Daft Punk","daft"],["Saturn (Gali Remix)","SZA","sos"],["Don’t Need To Know","Galimatias","let"]]],
"Synthwave":["cyber",[["red leather","53 Thieves","t53"],["Crescendolls","Daft Punk","daft"]]],
"Pop":["happier",[["Like You Do","Joji","joji"],["Lonely","Mac Ayres","mac"]]],
"Alternative":["adhd",[["Like You Do","Joji","joji"],["red leather","53 Thieves","t53"]]]};
function genre(name){var g=GENRES[name];if(!g)return;playlist(name,"Thể loại · danh sách minh họa",g[0],g[1])}
/* Thanh "‹ Nghệ sĩ" phía trên trang nghệ sĩ: mở từ danh sách Bạn bè thì hiện "‹ Bạn bè" và quay về trang đang xem trước đó */
function setArtCrumb(from,name){
  var c=document.getElementById("art-crumb"),t=document.getElementById("art-box-title"),sb=document.getElementById("art-sub"),vw=document.getElementById("view-artist");if(!c)return;
  c.dataset.back=from||"";
  if(vw)vw.classList.toggle("is-friend",!!from);                                  /* bạn bè: không có "người nghe hàng tháng", không có cột lượt nghe */
  if(sb)sb.textContent=from?"Bạn bè trên MeloJam":"2.4 triệu người nghe hàng tháng";
  if(from){c.innerHTML="‹ <b>Bạn bè</b>";c.onclick=function(){nav(from)};if(t)t.textContent="Nhạc nghe gần đây của "+name}
  else{c.innerHTML="‹ <b>Nghệ sĩ</b>";c.onclick=function(){nav("artists")};if(t)t.textContent="Bài hát nổi bật"}
}
function artist(name,img){setArtCrumb();document.getElementById("art-name").textContent=name;document.getElementById("art-img").className="rnd im-"+img;
var L=mjByArtist(name),tr=L.length?L.map(function(x){return [x.t,x.a,x.c]}):[["Bản hit #1",name,img],["Bản hit #2",name,"let"],["Bản hit #3",name,"little"]];
document.getElementById("art-tracks").innerHTML=tr.map(function(s,i){return '<div class="row" onclick="setNowPlaying(\''+s[0]+'\',\''+name.replace(/'/g,"")+'\',\''+s[2]+'\')"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+name+'</span></div><em>'+mjDur(s[0],name,'3:3'+i)+'</em></div>'}).join("");
nav("artist")}
function playlist(title,sub,img,tracks){document.getElementById("pl-name").textContent=title;document.getElementById("pl-sub").textContent=sub;document.getElementById("pl-img").className="im-"+img;window._curPL=tracks;
document.getElementById("pl-tracks").innerHTML=tracks.map(function(s,i){return '<div class="row" onclick="setNowPlaying(\''+s[0].replace(/'/g,"")+'\',\''+s[1].replace(/'/g,"")+'\',\''+s[2]+'\')"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+s[1]+'</span></div><em>'+mjDur(s[0],s[1],'3:2'+i)+'</em></div>'}).join("");
var sv=document.getElementById("pl-save");sv.textContent="Lưu vào thư viện";sv.dataset.s="0";
nav("playlist")}
function playlistPlay(){if(window._curPL&&window._curPL[0]){var l=window._curPL;if(window.MJ)MJ.playList(l.map(function(x){return{t:x[0],s:x[1],i:x[2]}}),0);else setNowPlaying(l[0][0],l[0][1],l[0][2])}}
function libSetTab(which){which=which||"list";document.getElementById("tabA").classList.toggle("on",which==="list");document.getElementById("tabB").classList.toggle("on",which==="artist");document.getElementById("lib-list").classList.toggle("hide",which!=="list");document.getElementById("lib-artist").classList.toggle("hide",which==="list");libMoveInd(true)}
/* Đặt gạch chân dưới tab đang chọn (instant=true: không animation) */
function libMoveInd(instant){var ind=document.getElementById("tabInd"),on=document.querySelector(".tabs2 span.on");if(!ind||!on)return;
if(!on.offsetWidth){return}
if(instant){ind.classList.add("noanim")}
ind.style.width=on.offsetWidth+"px";ind.style.transform="translateX("+on.offsetLeft+"px)";
if(instant){void ind.offsetWidth;ind.classList.remove("noanim")}}
window.addEventListener("resize",function(){libMoveInd(true)});window.addEventListener("load",function(){libMoveInd(true)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){libMoveInd(true)});
var libBusy=null;
function libTab(which){which=which||"list";
var A=document.getElementById("tabA"),B=document.getElementById("tabB"),L=document.getElementById("lib-list"),R=document.getElementById("lib-artist");
var cur=A.classList.contains("on")?"list":"artist";
if(cur===which&&!libBusy)return;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
clearTimeout(libBusy);libBusy=null;
[L,R].forEach(function(e){e.classList.remove("lib-out-l","lib-out-r","lib-in-l","lib-in-r")});
if(reduce){libSetTab(which);return}
var toArtist=which==="artist",from=toArtist?L:R,to=toArtist?R:L;
A.classList.toggle("on",!toArtist);B.classList.toggle("on",toArtist);libMoveInd(false);
/* nội dung cũ trượt ra, nội dung mới trượt vào theo cùng hướng với gạch chân */
if(!from.classList.contains("hide"))from.classList.add(toArtist?"lib-out-l":"lib-out-r");
libBusy=setTimeout(function(){
from.classList.remove("lib-out-l","lib-out-r");from.classList.add("hide");
to.classList.remove("hide");to.classList.add(toArtist?"lib-in-r":"lib-in-l");
libBusy=setTimeout(function(){to.classList.remove("lib-in-l","lib-in-r");libBusy=null},320)},from.classList.contains("hide")?0:160)}
/* Nhạc bạn bè nghe gần đây: bài + nghệ sĩ thật (không phải tên người bạn) */
var FRIEND_RECENT={
  "Toàn Phạm":[["Lonely","Mac Ayres","mac"],["Don’t Need To Know","Galimatias","let"],["Birds Eye View","Alina Baraz","alina"],["Like You Do","Joji","joji"]],
  "Gia To":[["Like You Do","Joji","joji"],["Saturn (Gali Remix)","SZA","sos"],["Birds Eye View","Alina Baraz","alina"],["Crescendolls","Daft Punk","daft"]],
  "Minh Khuê":[["Birds Eye View","Alina Baraz","alina"],["Lonely","Mac Ayres","mac"],["Don’t Need To Know","Galimatias","let"],["Like You Do","Joji","joji"]],
  "Đức Anh":[["Crescendolls","Daft Punk","daft"],["red leather","53 Thieves","t53"],["Saturn (Gali Remix)","SZA","sos"],["Don’t Need To Know","Galimatias","let"]],
  "Hải Đăng":[["Crescendolls","Daft Punk","daft"],["red leather","53 Thieves","t53"],["Lonely","Mac Ayres","mac"],["Saturn (Gali Remix)","SZA","sos"]]
};
/* Bio minh hoạ của bạn bè (hiện ở dòng dưới tên) */
var FRIEND_BIO={
  "Toàn Phạm":"Mê nhạc chill, cà phê sáng và những buổi chiều không deadline ☕",
  "Gia To":"Nghe nhạc để sống chậm lại. Playlist là nhật ký của mình 🎧",
  "Minh Khuê":"Học bài cùng lofi, ngủ gật cùng lofi 📚 Đừng gọi mình lúc đang nghe nhạc!",
  "Đức Anh":"Gym, game và bass nặng. Không có nhạc là không có động lực 💪",
  "Hải Đăng":"Lái xe một mình, mở nhạc thật to, đi đâu cũng được 🚗"
};
function friend(name,img){
  var v=document.querySelector(".view.on"),back=(v&&v.id&&v.id!=="view-artist")?v.id.replace(/^view-/,""):"home";
  artist(name,img);setArtCrumb(back,name);syncTabbar("artist");
  var sb=document.getElementById("art-sub");if(sb)sb.textContent=FRIEND_BIO[name]||"Bạn bè trên MeloJam";
  var L=FRIEND_RECENT[name]||FRIEND_RECENT["Toàn Phạm"],q=function(x){return String(x).replace(/'/g,"")};
  document.getElementById("art-tracks").innerHTML=L.map(function(s,i){
    return '<div class="row" onclick="setNowPlaying(\''+q(s[0])+'\',\''+q(s[1])+'\',\''+s[2]+'\')"><div class="cv im-'+s[2]+'"></div><div class="n"><b>'+s[0]+'</b><span>'+s[1]+'</span></div><em>'+mjDur(s[0],s[1])+'</em></div>'}).join("");
}
function logout(){if(confirm("Bạn có chắc muốn thoát tài khoản?")){alert("Đã đăng xuất (minh họa).")}}

function toggleNotif(e){e.stopPropagation();var p=document.getElementById("notifpanel");if(p.hasAttribute("hidden")){p.removeAttribute("hidden");document.getElementById("notifdot").style.display="none"}else{p.setAttribute("hidden","")}}
function toggleRight(e){e.stopPropagation();document.body.classList.toggle("rpanel-open")}
document.addEventListener("click",function(e){if(document.body.classList.contains("rpanel-open")&&!e.target.closest(".right"))document.body.classList.remove("rpanel-open")});
window.addEventListener("resize",function(){if(innerWidth<700||(innerWidth>839&&innerHeight>500)||innerWidth>1099)document.body.classList.remove("rpanel-open")});
function closeNotif(){document.getElementById("notifpanel").setAttribute("hidden","")}
/* animation đóng thông báo: chặn hidden, chạy hiệu ứng rồi mới ẩn thật */
(function(){var p=document.getElementById("notifpanel");if(!p||!window.MutationObserver)return;var busy=false,tm=0;
if(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)return;
new MutationObserver(function(){
  if(busy){return}
  if(p.hasAttribute("hidden")&&!p.classList.contains("closing")&&p.dataset.was==="1"){
    busy=true;p.removeAttribute("hidden");p.classList.add("closing");
    clearTimeout(tm);tm=setTimeout(function(){p.setAttribute("hidden","");p.classList.remove("closing");p.dataset.was="0";setTimeout(function(){busy=false},0)},190);
  }else if(!p.hasAttribute("hidden")){p.dataset.was="1"}
}).observe(p,{attributes:true,attributeFilter:["hidden"]});
p.dataset.was=p.hasAttribute("hidden")?"0":"1";})();

var repeatState=0;
function cycleRepeat(){repeatState=(repeatState+1)%3;var el=document.getElementById("btnRepeat");
el.classList.remove("on","one");
if(repeatState===1){el.classList.add("on");el.title="Lặp lại: Tất cả danh sách"}
else if(repeatState===2){el.classList.add("on","one");el.title="Lặp lại: Chỉ bài này"}
else{el.title="Lặp lại: Tắt"}}
document.addEventListener("click",function(e){var p=document.getElementById("notifpanel");if(p&&!p.hasAttribute("hidden")&&!e.target.closest(".bellwrap"))p.setAttribute("hidden","")});

(function(){
/* ===== Trình phát demo: đồng hồ + hàng đợi (bài trước / bài tiếp / phát tất cả / shuffle / repeat) ===== */
var pg=document.getElementById("pg"),fill=document.getElementById("pgfill"),now=document.getElementById("ptnow"),durEl=document.getElementById("ptdur");
var dur=240.4,pos=0,last=0,timer=null,seeking=false,shownSec=-1;
var au=new Audio(),useAudio=false,curTrack=null;au.preload="metadata";   /* âm thanh thật (mp3); bài nào chưa có file thì vẫn chạy giả lập */
var queue=[],qi=-1,pendingIdx=null,fromRow=false;
function fmt(x){x=Math.floor(x);return Math.floor(x/60)+":"+("0"+(x%60)).slice(-2)}
function fmtTot(x){x=Math.round(x);return Math.floor(x/60)+":"+("0"+(x%60)).slice(-2)}   /* tổng thời lượng làm tròn như các trình phát khác */
function norm(x){return String(x||"").replace(/'/g,"").trim()}
function render(){
  var pct=dur?Math.min(1,pos/dur):0;fill.style.width=(pct*100)+"%";
  var sec=Math.floor(pos);
  if(sec!==shownSec){shownSec=sec;var t=fmt(pos);now.textContent=t;fill.dataset.t=t;pg.setAttribute("aria-valuenow",Math.round(pct*100));pg.setAttribute("aria-valuetext",t+" / "+fmtTot(dur))}
}
function setIcon(){document.getElementById("plIcon").innerHTML=playing?PAUSE_ICON:PLAY_ICON}
function shuffleOn(){var b=document.querySelector(".ctl span:first-child");return !!(b&&b.classList.contains("on"))}
function restart(){pos=0;shownSec=-1;last=performance.now();if(useAudio){try{au.currentTime=0}catch(e){}}render()}
function replay(){playing=true;setIcon();restart();sync()}                /* phát lại từ đầu (lặp 1 bài / lặp danh sách 1 bài) */
function applySeek(){if(useAudio){try{au.currentTime=Math.max(0,Math.min(pos,Math.max(0,dur-0.05)))}catch(e){}}}
function audioSync(){                                                      /* đồng bộ trạng thái phát / tạm dừng với file mp3 */
  if(!useAudio)return;
  if(playing){
    var pr;try{pr=au.play()}catch(e){pr=null}
    if(pr&&pr.catch)pr.catch(function(err){
      if(err&&err.name==="AbortError")return;                              /* bị ngắt vì vừa đổi bài */
      if(err&&err.name==="NotAllowedError"){playing=false;setIcon();stopTimer();render();return}   /* trình duyệt chặn tự phát */
      useAudio=false;sync()                                                /* không phát được file: quay về chế độ đếm giờ */
    });
  }else{try{au.pause()}catch(e){}}
}
au.addEventListener("loadedmetadata",function(){if(!useAudio)return;var d=au.duration;if(isFinite(d)&&d>1&&Math.abs(d-dur)>0.4){dur=d;durEl.textContent=fmtTot(dur);shownSec=-1;render()}});
au.addEventListener("ended",function(){if(useAudio&&playing)ended()});
au.addEventListener("error",function(){if(!useAudio)return;useAudio=false;try{console.warn("MeloJam: không tải được "+au.currentSrc+" - chuyển sang chế độ mô phỏng")}catch(e){}if(playing)sync()});
if("mediaSession" in navigator){var ms=navigator.mediaSession;[["play",function(){if(!playing)tp()}],["pause",function(){if(playing)tp()}],["nexttrack",function(){MJ.next()}],["previoustrack",function(){MJ.prev()}]].forEach(function(h){try{ms.setActionHandler(h[0],h[1])}catch(e){}})}
function randomOther(){if(queue.length<2)return qi;var n;do{n=Math.floor(Math.random()*queue.length)}while(n===qi);return n}

/* --- hàng đợi --- */
function songOf(row){var b=row.querySelector(".n b"),sp=row.querySelector(".n span"),cv=row.querySelector(".cv"),m=cv&&/im-([\w-]+)/.exec(cv.className);
  return {t:b.textContent.trim(),s:sp?sp.textContent.trim():"",i:m?m[1]:"lofi"}}
function isSongRow(r){return r.classList&&r.classList.contains("row")&&r.querySelector(".n b")&&/setNowPlaying|play\(/.test(r.getAttribute("onclick")||"")}
/* bắt click (giai đoạn capture, trước onclick của dòng): hàng đợi = tất cả bài trong cùng danh sách */
document.addEventListener("click",function(e){
  var row=e.target.closest&&e.target.closest(".row");if(!row||e.target.closest(".heart")||!isSongRow(row))return;
  var rows=[].filter.call(row.parentElement.children,isSongRow);
  queue=rows.map(songOf);qi=rows.indexOf(row);fromRow=true;setTimeout(function(){fromRow=false},0);
},true);
function markPlaying(){var c=queue[qi];if(!c)return;
  document.querySelectorAll(".view .row").forEach(function(r){var b=r.querySelector(".n b");if(!b||!isSongRow(r))return;
    var sp=r.querySelector(".n span"),same=norm(b.textContent)===norm(c.t)&&norm(sp?sp.textContent:"")===norm(c.s);r.classList.toggle("on",same)})}
function goto(i){if(i<0||i>=queue.length)return;pendingIdx=i;var c=queue[i];setNowPlaying(c.t,c.s,c.i)}
function playList(list,start){queue=list;qi=start||0;goto(qi)}

/* --- vòng lặp thời gian --- */
/* --- quảng cáo: tạm dừng nhạc, đoán bài kế tiếp (để hiện "Tiếp theo"), và cổng chặn trước khi chuyển bài --- */
function holdForAd(){playing=false;setIcon();stopTimer();audioSync();render()}
function peekAfterEnd(){            /* bài sẽ phát sau khi hết bài; false = không còn bài (dừng, không cần quảng cáo) */
  if(repeatState===2)return queue[qi]||null;
  if(queue.length>1){
    if(shuffleOn())return null;
    if(qi<queue.length-1)return queue[qi+1];
    if(repeatState===1)return queue[0];
    return false;
  }
  return repeatState===1?(queue[qi]||null):false;
}
function adGate(kind,go,nextItem){
  if(nextItem===false)return false;
  var A=window.MJAds;if(!A||!A.gate)return false;
  return A.gate(kind,go,nextItem,holdForAd);
}
function ended(){            /* hết bài tự nhiên: có thể chèn quảng cáo rồi mới chuyển bài */
  if(adGate("ended",advance,peekAfterEnd()))return;
  advance();
}
function advance(){
  if(repeatState===2){replay();return}                          /* lặp 1 bài */
  if(queue.length>1){
    if(shuffleOn()){goto(randomOther());return}
    if(qi<queue.length-1){goto(qi+1);return}                    /* bài kế tiếp trong danh sách */
    if(repeatState===1){goto(0);return}                         /* lặp cả danh sách */
  }else if(repeatState===1){replay();return}
  pos=0;shownSec=-1;playing=false;setIcon();stopTimer();audioSync();if(useAudio){try{au.currentTime=0}catch(e){}}render();markPlaying()   /* hết danh sách: dừng */
}
function tick(){
  var t=performance.now(),dt=(t-last)/1000;last=t;
  if(!playing||seeking)return;
  if(useAudio){pos=au.currentTime||0;render();return}              /* âm thanh thật: vị trí lấy từ file mp3, hết bài do sự kiện "ended" */
  pos+=dt;if(pos>=dur){ended();return}
  render();
}
function startTimer(){if(!timer){last=performance.now();timer=setInterval(tick,100)}}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function sync(){if(playing){last=performance.now();startTimer()}else stopTimer();audioSync()}
function load(title,sub,img){
  if(pendingIdx!==null){qi=pendingIdx;pendingIdx=null}
  else if(fromRow){}                                            /* qi đã đặt khi click dòng */
  else{var f=-1;for(var k=0;k<queue.length;k++)if(norm(queue[k].t)===norm(title)&&norm(queue[k].s)===norm(sub)){f=k;break}
       if(f>=0)qi=f;else{queue=[{t:title,s:sub||"",i:img||"lofi"}];qi=0}}
  var tr=mjTrack(title,sub);
  if(tr){                                                       /* bài có file mp3 thật: thời lượng = thời lượng file */
    useAudio=true;curTrack=tr;dur=tr.d;
    if(au.getAttribute("data-k")===tr.k){try{au.currentTime=0}catch(e){}}
    else{au.src=tr.src;au.setAttribute("data-k",tr.k)}
  }else{                                                        /* chưa có file: giả lập như trước */
    useAudio=false;try{au.pause()}catch(e){}au.removeAttribute("src");au.removeAttribute("data-k");
    var h=0;for(var i=0;i<title.length;i++)h=(h*31+title.charCodeAt(i))%151;dur=150+h;
  }
  pos=0;shownSec=-1;durEl.textContent=fmtTot(dur);render();sync();markPlaying();
  if("mediaSession" in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:title,artist:sub||"",album:"MeloJam"})}catch(e){}}
}
window.MJ={sync:sync,load:load,playList:playList,refresh:markPlaying,audio:au,setVolume:function(v){au.volume=Math.min(1,Math.max(0,v));au.muted=v<=0},
  seek:function(p,fin){setPctVal(p);if(fin){seeking=false;last=performance.now();if(pos>=dur&&playing)ended();else applySeek()}else seeking=true},
  prev:function(){                                              /* >3s: về đầu bài; ngược lại: bài trước */
    if(pos>3||queue.length<2||qi<=0){restart();return}
    var ni=qi-1;if(adGate("skip",function(){goto(ni)},queue[ni]))return;
    goto(ni)},
  next:function(){
    if(queue.length<2){restart();return}
    var ni=shuffleOn()?randomOther():(qi+1)%queue.length;
    if(adGate("skip",function(){goto(ni)},queue[ni]))return;
    goto(ni)},
  prevTrack:function(){                                         /* vuốt phải: luôn về bài trước (vòng về cuối nếu đang ở bài đầu) */
    if(queue.length<2){restart();return}
    var ni=shuffleOn()?randomOther():(qi-1+queue.length)%queue.length;
    if(adGate("skip",function(){goto(ni)},queue[ni]))return;
    goto(ni)}};

/* ===== Kéo / bấm để tua ===== */
function setPctVal(pct){pct=Math.min(1,Math.max(0,pct));pos=pct*dur;shownSec=-1;render()}
function setPct(clientX){var r=pg.getBoundingClientRect();setPctVal((clientX-r.left)/r.width)}
function endSeek(){if(!seeking)return;seeking=false;pg.classList.remove("seeking");last=performance.now();if(pos>=dur&&playing)ended();else applySeek()}
pg.addEventListener("pointerdown",function(e){e.preventDefault();seeking=true;pg.classList.add("seeking");setPct(e.clientX);pg.setPointerCapture(e.pointerId)});
pg.addEventListener("pointermove",function(e){if(seeking)setPct(e.clientX)});
pg.addEventListener("pointerup",endSeek);pg.addEventListener("pointercancel",endSeek);pg.addEventListener("lostpointercapture",endSeek);
pg.addEventListener("keydown",function(e){
  var d={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5}[e.key];
  if(d!==undefined){e.preventDefault();pos=Math.min(dur,Math.max(0,pos+d));shownSec=-1;render();if(pos>=dur&&playing)ended();else applySeek()}
  else if(e.key==="Home"){e.preventDefault();pos=0;shownSec=-1;render();applySeek()}
  else if(e.key==="End"){e.preventDefault();pos=Math.max(0,dur-1);shownSec=-1;render();applySeek()}
});
document.addEventListener("visibilitychange",function(){last=performance.now()});
/* trạng thái mặc định: bài đầu tiên (đang hiện ở panel phải) đã nạp sẵn, bấm Phát là nghe được ngay */
(function(){var t=mjTrack(cur[0],cur[1]);if(t){useAudio=true;curTrack=t;dur=t.d;au.src=t.src;au.setAttribute("data-k",t.k);queue=[{t:cur[0],s:cur[1],i:cur[2]}];qi=0}})();
durEl.textContent=fmtTot(dur);render();
})();


(function(){
function $(i){return document.getElementById(i)}
function live(id,check,filter){var el=$(id);if(!el)return;
 el.addEventListener("input",function(){if(filter)filter(el);if(el.classList.contains("bad"))check()});
 el.addEventListener("blur",function(){if(el.value.trim())check()})}
live("momoPhone",checkMomo,function(el){el.value=el.value.replace(/[^\d+\s.\-]/g,"")});
live("cardName",checkCardName,function(el){el.value=el.value.replace(/[^A-Za-zÀ-ỹ ]/g,"")});
live("cardNumber",checkCardNumber,function(el){var d=el.value.replace(/\D/g,"").slice(0,19);el.value=d.replace(/(.{4})/g,"$1 ").trim()});
live("cardExpiry",checkCardExpiry,function(el){var d=el.value.replace(/\D/g,"").slice(0,4);el.value=d.length>2?d.slice(0,2)+"/"+d.slice(2):d});
live("cardCVV",checkCardCVV,function(el){el.value=el.value.replace(/\D/g,"").slice(0,4)});
var c=$("cardCVV");if(c)c.setAttribute("maxlength","4");
var mp=$("momoPhone");if(mp){mp.setAttribute("maxlength","16");mp.setAttribute("autocomplete","tel");mp.setAttribute("inputmode","tel")}
})();

(function(){
/* lượt nghe giả lập, cố định theo từng bài (cùng bài ở đâu cũng ra cùng số) */
function hash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function plays(key){var r=hash(key)/4294967296;return Math.round(2e6+Math.pow(r,2.2)*3.9e9)}
function fmtPlays(n){return n.toLocaleString("vi-VN")}
function decorate(){
  document.querySelectorAll(".main .row").forEach(function(r){
    if(r.querySelector(".pc"))return;
    var b=r.querySelector(".n b"),em=r.querySelector(":scope > em");
    if(!b||!em||!r.querySelector(".cv")||!/^\d+:\d{2}$/.test(em.textContent.trim()))return;   /* chỉ dòng bài hát có thời lượng */
    var sp=r.querySelector(".n span"),key=(b.textContent+"|"+(sp?sp.textContent:"")).replace(/'/g,"").trim().toLowerCase();
    var c=document.createElement("span");c.className="pc";c.title="Lượt nghe";c.textContent=fmtPlays(plays(key));
    r.insertBefore(c,em);
  });
}
var main=document.querySelector(".main"),pend=false;
if(main){new MutationObserver(function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;decorate()})}).observe(main,{childList:true,subtree:true})}
decorate();
})();

(function(){
/* ===== Lịch sử điều hướng: quay lại / tiến tới ===== */
var _nav=window.nav,H={st:[{v:"home",arg:""}],i:0,busy:false},DYN={playlist:1,artist:1,search:1};
var $=function(i){return document.getElementById(i)},mainEl=function(){return document.querySelector(".main")};
function grab(e){if(!DYN[e.v])return;e.html=$("view-"+e.v).innerHTML;if(e.v==="playlist")e.pl=window._curPL;if(e.v==="search")e.q=$("gsearch").value}
function leave(){var c=H.st[H.i];if(!c)return;c.scroll=mainEl().scrollTop;if(c.v==="search")grab(c)}
function update(){var b=$("navBack"),f=$("navFwd");if(b)b.disabled=H.i<=0;if(f)f.disabled=H.i>=H.st.length-1}
window.nav=function(v,arg){
  if(H.busy){_nav(v,arg);return}
  var c=H.st[H.i],a=arg||"";
  if(c&&c.v===v&&c.arg===a&&!(v==="playlist"||v==="artist")){_nav(v,arg);update();return}   /* gõ tìm kiếm / bấm lại trang hiện tại: không thêm mục mới */
  leave();H.st.length=H.i+1;H.st.push({v:v,arg:a});H.i++;_nav(v,arg);grab(H.st[H.i]);update();if(window.MJH&&MJH.push)MJH.push(H.i);
};
function go(d){
  var j=H.i+d;if(j<0||j>=H.st.length)return;if(window.MJH&&MJH.active&&!MJH.pop){history.go(d);return}
  leave();H.i=j;var e=H.st[j];H.busy=true;
  try{
    if(e.html!=null)$("view-"+e.v).innerHTML=e.html;
    if(e.pl)window._curPL=e.pl;
    if(e.v==="search")$("gsearch").value=e.q||"";
    _nav(e.v,e.arg||undefined);mainEl().scrollTop=e.scroll||0;
  }finally{H.busy=false}
  if(window.MJ&&MJ.refresh)MJ.refresh();
  update();
}
window.NAVH={back:function(){go(-1)},fwd:function(){go(1)},
  idx:function(){return H.i},goto:function(d){go(d)},
  reset:function(){H.st=[{v:"home",arg:""}];H.i=0;update()}};
document.addEventListener("keydown",function(e){
  if(!e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==="ArrowLeft"){e.preventDefault();go(-1)}else if(e.key==="ArrowRight"){e.preventDefault();go(1)}
});
window.addEventListener("mouseup",function(e){if(e.button===3){e.preventDefault();go(-1)}else if(e.button===4){e.preventDefault();go(1)}});
update();
})();

(function(){
/* ===== Âm lượng (điều khiển âm lượng phát nhạc thật, lưu mức đã chọn) ===== */
var $=function(i){return document.getElementById(i)};
var slider=$("vslider"),fill=$("vfill"),btn=$("vbtn"),icon=$("vicon");
if(!slider)return;
var level=70,prev=70,SPK='<path d="M11 5L6 9H3v6h3l5 4z"/>';
icon.innerHTML=SPK+'<path class="w w1" pathLength="1" d="M14.5 9a4 4 0 010 6"/><path class="w w2" pathLength="1" d="M18 6.5a7.5 7.5 0 010 11"/><path class="w w3" pathLength="1" d="M21.5 3.5a11 11 0 010 17"/><path class="w x1" pathLength="1" d="M16 9l5 6"/><path class="w x2" pathLength="1" d="M21 9l-5 6"/>';
icon.classList.add("noanim");
try{var sv=parseInt(localStorage.getItem("mj-volume"),10);if(sv>=0&&sv<=100){level=sv;if(sv>0)prev=sv}}catch(e){}
function paint(){
  fill.style.width=level+"%";slider.setAttribute("aria-valuenow",level);slider.setAttribute("aria-valuetext",level+"%");slider.title=level+"%";
  icon.setAttribute("data-s",level===0?"0":level<34?"1":level<67?"2":"3");   /* các nét sóng/dấu X luôn có sẵn, CSS vẽ ra / thu lại mượt thay vì thay cả icon */
  var m=level===0;btn.setAttribute("aria-label",m?"Bật tiếng":"Tắt tiếng");btn.title=m?"Bật tiếng (M)":"Tắt tiếng (M)";
  if(window.MJ&&MJ.setVolume)MJ.setVolume(level/100);
}
function set(v){level=Math.max(0,Math.min(100,Math.round(v)));if(level>0)prev=level;paint();try{localStorage.setItem("mj-volume",level)}catch(e){}}
function toggleMute(){set(level>0?0:(prev||70));if(level===0)paintMuted()}
function paintMuted(){}   /* giữ prev để bật lại đúng mức cũ */
function fromX(x){var r=slider.getBoundingClientRect();set((x-r.left)/r.width*100)}
var drag=false;
slider.addEventListener("pointerdown",function(e){e.preventDefault();drag=true;slider.classList.add("seeking");fromX(e.clientX);slider.setPointerCapture(e.pointerId)});
slider.addEventListener("pointermove",function(e){if(drag)fromX(e.clientX)});
function end(){drag=false;slider.classList.remove("seeking")}
slider.addEventListener("pointerup",end);slider.addEventListener("pointercancel",end);slider.addEventListener("lostpointercapture",end);
slider.addEventListener("keydown",function(e){
  var d={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5}[e.key];
  if(d!==undefined){e.preventDefault();set(level+d)}else if(e.key==="Home"){e.preventDefault();set(0)}else if(e.key==="End"){e.preventDefault();set(100)}
});
$("vol").addEventListener("wheel",function(e){e.preventDefault();set(level+(e.deltaY<0?5:-5))},{passive:false});
btn.addEventListener("click",toggleMute);
document.addEventListener("keydown",function(e){
  if((e.key==="m"||e.key==="M")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||""))&&!(e.target.isContentEditable)){toggleMute()}
});
window.MJVOL={get:function(){return level},set:set};
paint();requestAnimationFrame(function(){requestAnimationFrame(function(){icon.classList.remove("noanim")})});

/* placeholder ô tìm kiếm ngắn hơn khi màn hình hẹp */
var gs=$("gsearch");function ph(){if(gs)gs.placeholder=window.innerWidth<900?"Bạn muốn nghe gì?":"Bạn muốn phát nhạc gì?"}
ph();window.addEventListener("resize",ph);
})();
draw();
(function(){var r=document.documentElement;
function s(){r.style.setProperty("--appH",window.innerHeight+"px")}
if(!(window.CSS&&CSS.supports&&CSS.supports("height","100dvh"))){s();window.addEventListener("resize",s);window.addEventListener("orientationchange",s)}})();
