/* Л1: HTTP · само симулации + предизвици */
(function(){
const ex = (t) => `<p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:72ch">${t}</p>`;

LECTURES.push({id:"l1", short:"Л1", title:"HTTP", deck:"01 HTTP", simOnly:true,
  blurb:"Пат на барање, URL, методи, статуси, заглавја, колачиња, HTTPS, верзии, upload. Само симулации.",
  sections:[
{
  id:"l1-basics", num:"1.1", title:"Клиент, сервер и патот на барањето", sub:"Што се случува од внесување URL до прикажана страница.",
  diagram:["httpJourney","staticDynamic"], script:null,
  questions:[
    {type:"mc", q:"Која порта стандардно ја користи HTTPS, а која HTTP?", opts:["443 за HTTPS, 80 за HTTP","80 за HTTPS, 443 за HTTP","8080 за двете","21 за HTTPS, 80 за HTTP"], ans:[0], exp:"HTTP оди на порта 80, HTTPS на 443."},
    {type:"sort", q:"Распореди ги софтверите.", cats:["Веб сервер","Апликациски сервер","Прелистувач"], items:[["Apache","Веб сервер"],["Microsoft IIS","Веб сервер"],["Tomcat","Апликациски сервер"],["Glassfish","Апликациски сервер"],["Chrome","Прелистувач"],["Safari","Прелистувач"]], exp:"Веб сервери: Apache, Nginx, IIS. Апликациски (динамички ресурси): Tomcat, Glassfish (и Apache со mod_php). Клиент: прелистувач."},
    {type:"mc", q:"Што значи дека HTTP е „pull based“?", opts:["Клиентот секогаш започнува со барање, серверот само одговара","Серверот сам ги турка податоците кон клиентот","Двете страни праќаат истовремено","Барањата се праќаат преку UDP"], ans:[0], exp:"Комуникацијата е барање → одговор, иницирана од клиентот. (Server push дојде дури со HTTP/2.)"},
    {type:"mc", q:"Внесуваш https://wp.mk во прелистувачот. Што се случува ПРВО?", opts:["DNS ја наоѓа IP адресата на wp.mk","Се праќа HTTP GET барање","Серверот праќа HTML","Се воспоставува TCP врска на порта 443"], ans:[0], exp:"Редослед: DNS → TCP врска (80/443) → HTTP барање → обработка → HTTP одговор → приказ."},
    {type:"mc", q:"HTTP е протокол на кое ниво?", opts:["Апликациско","Транспортно","Мрежно","Физичко"], ans:[0], exp:"HTTP е апликациски протокол, работи над TCP (или QUIC/UDP кај HTTP/3)."},
    {type:"mc", q:"Што значи дека HTTP е безсостојбен (stateless)?", opts:["Секое барање е независно, серверот не памети претходни барања","Серверот не може да врати статусен код","Не може да се праќа тело","Конекцијата никогаш не се затвора"], ans:[0], exp:"Затоа постојат колачиња и сесии: за да се поврзат барањата од ист корисник."}
  ]
},
{
  id:"l1-anatomy", num:"1.2", title:"URL, барање и одговор", sub:"Расклопи URL, состави барање и види го одговорот.",
  diagram:["urlDissect","reqBuilder"], script:null,
  questions:[
    {type:"fill", scenario:"Корисникот е на <code>https://wp.mk/main.html</code> и за прв пат кликнува линк до <code>/jan/ispit/1?termin=prv</code>.", q:"Пополни го HTTP барањето што го праќа прелистувачот.", rows:[
      ["Метод и патека",["GET /jan/ispit/1?termin=prv","POST /jan/ispit/1","GET /jan/ispit/1"],0],
      ["Host",["wp.mk","wp.mk/main.html","localhost"],0],
      ["Content-Type",["не постои","text/html","application/x-www-form-urlencoded"],0],
      ["Content-Length",["не постои","нумеричка вредност"],0],
      ["Referer",["wp.mk/main.html","wp.mk/jan/ispit/1","не постои"],0],
      ["Cookie",["не постои","низа од бајти"],0],
      ["Body",["не постои","низа од бајти"],0]], exp:"GET нема тело, па нема Content-Type ни Content-Length. Referer е страницата од која потекнува кликот. Прва посета значи нема колачиња."},
    {type:"fill", scenario:"Истото сценарио: серверот успешно ја враќа HTML страницата.", q:"Пополни го HTTP одговорот.", rows:[
      ["Статус",["200 OK","302 Found","404 Not Found"],0],
      ["Server",["Apache","CentOS","Chrome"],0],
      ["Content-Type",["text/html","application/pdf","не постои"],0],
      ["Content-Length",["нумеричка вредност","не постои"],0],
      ["Location",["не постои","wp.mk/main.html"],0],
      ["Body",["низа од бајти (HTML)","не постои"],0]], exp:"CentOS е оперативен систем, Chrome е прелистувач. Location се праќа само при пренасочување (3xx)."},
    {type:"mc", q:"Која порта се користи за http://wp.mk/index.html?", opts:["80, стандардна за http кога не е наведена","8080","443","Ниту една, мора да се наведе"], ans:[0], exp:"Кога портата не е запишана, се зема стандардната за протоколот: 80 за http, 443 за https."},
    {type:"mc", q:"Што е query string во https://wp.mk:8443/search?q=spring&page=2#top?", opts:["q=spring&page=2","/search","#top","8443"], ans:[0], exp:"Query string е по ?. #top е фрагмент и не се праќа до серверот."},
    {type:"mc", q:"Што содржи првата линија на HTTP барањето?", opts:["Метод, патека и верзија на протоколот","Статусен код и порака","Host и User-Agent","Само URL"], ans:[0], exp:"Пр. GET /index.html HTTP/1.1. Првата линија на одговорот е верзија + статусен код + порака: HTTP/1.1 200 OK."},
    {type:"mc", q:"Што одделува заглавја од тело во HTTP порака?", opts:["Празен ред","Знакот &","Заглавјето Body:","Точка-запирка"], ans:[0], exp:"По последното заглавје доаѓа празен ред, а потоа телото (ако го има)."}
  ]
},
{
  id:"l1-methods", num:"1.3", title:"Методи и статусни кодови", sub:"Кој метод за што служи и што значи секој статус.",
  diagram:["methodTable","statusExplorer"], script:null,
  questions:[
    {type:"sort", q:"Во која класа спаѓа статусот?", cats:["1xx Информативен","2xx Успех","3xx Пренасочување","4xx Грешка кај клиентот","5xx Грешка на серверот"], items:[["100 Continue","1xx Информативен"],["200 OK","2xx Успех"],["201 Created","2xx Успех"],["301 Moved Permanently","3xx Пренасочување"],["302 Found","3xx Пренасочување"],["403 Forbidden","4xx Грешка кај клиентот"],["404 Not Found","4xx Грешка кај клиентот"],["500 Internal Server Error","5xx Грешка на серверот"]], exp:"Прва цифра = класа. 4xx: барањето е лошо или нема право. 5xx: серверот паднал при валидно барање."},
    {type:"mc", q:"Серверот успешно враќа податоци во JSON. Кој статус и Content-Type?", opts:["200 и application/json","404 и application/json","200 и text/json како параметар","500 и text/html"], ans:[0], exp:"Успех = 200. Типот на телото се кажува во заглавјето Content-Type, не како параметар."},
    {type:"mc", q:"Кое заглавје мора да го има одговорот 301 или 302?", opts:["Location","Referer","Content-Language","Host"], ans:[0], exp:"Location ја кажува новата адреса која прелистувачот треба да ја побара."},
    {type:"mc", q:"Најавен си, но немаш право да пристапиш до ресурсот. Кој статус?", opts:["403 Forbidden","401 Unauthorized","404 Not Found","400 Bad Request"], ans:[0], exp:"401 = не си најавен. 403 = најавен си, но немаш дозвола."},
    {type:"mc", q:"Кој метод се користи за менување само ДЕЛ од ресурс?", opts:["PATCH","PUT","POST","GET"], ans:[0], exp:"PUT го заменува целиот ресурс, PATCH менува дел, POST креира нов."},
    {type:"mc", multi:true, q:"Кои методи се идемпотентни (повторувањето дава ист резултат)?", opts:["GET","PUT","DELETE","POST","PATCH"], ans:[0,1,2], exp:"POST повторен двапати креира два ресурси. PATCH генерално не е гарантирано идемпотентен."}
  ]
},
{
  id:"l1-headers", num:"1.4", title:"Заглавја, MIME и преговарање", sub:"Кое заглавје каде оди и како клиентот и серверот се договараат за формат.",
  diagram:["negotiation"], script:null,
  questions:[
    {type:"sort", q:"Каде се појавува заглавјето?", cats:["Барање","Одговор","И двете"], items:[["Host","Барање"],["Referer","Барање"],["User-Agent","Барање"],["Accept","Барање"],["Cookie","Барање"],["Set-Cookie","Одговор"],["Location","Одговор"],["Server","Одговор"],["Content-Type","И двете"],["Content-Length","И двете"]], exp:"Content-Type/Length ги има секоја порака со тело: POST барање или одговор со HTML."},
    {type:"fill", q:"Кој MIME тип одговара?", rows:[
      [".html датотека",["text/html","text/plain","application/html"],0],
      [".json податоци",["application/json","text/json","application/javascript"],0],
      [".css",["text/css","application/css","style/css"],0],
      [".png слика",["image/png","application/png","image/jpeg"],0],
      [".pdf",["application/pdf","text/pdf","multipart/form-data"],0],
      ["Обична HTML форма (POST)",["application/x-www-form-urlencoded","multipart/form-data","text/plain"],0],
      ["Форма со прикачена датотека",["multipart/form-data","application/x-www-form-urlencoded","application/octet-form"],0]], exp:"Content-Type е MIME тип (Multipurpose Internet Mail Extensions) на телото."},
    {type:"mc", q:"Accept: text/html, application/json;q=0.8. Колкав е тежинскиот фактор на text/html?", opts:["1, предефиниран кога не е напишан","0","0.8","0.5"], ans:[0], exp:";q=1 е предефиниран и не се пишува. Поголем q = поголема преференца."},
    {type:"mc", q:"Што значи Content-Encoding: gzip во одговорот?", opts:["Телото е компресирано со gzip","Телото е енкриптирано","Знаците се во UTF-8","Одговорот е подоцна"], ans:[0], exp:"Content-Encoding = алгоритам за компресија (gzip, deflate, br). Клиентот кажува што поддржува со Accept-Encoding."},
    {type:"mc", q:"Што значи Connection: keep-alive?", opts:["TCP врската останува отворена за следни барања","Серверот праќа push пораки","Колачето не истекува","Барањето се повторува ако падне"], ans:[0], exp:"close ја затвора врската по одговорот, keep-alive ја чува за повеќе барања."},
    {type:"mc", q:"Што е Referer?", opts:["Адресата на ресурсот од каде потекнува барањето","Адресата каде треба да се пренасочи","Името на серверот","Јазикот на клиентот"], ans:[0], exp:"Location е за пренасочување, Server е софтверот на серверот, Accept-Language е јазикот."}
  ]
},
{
  id:"l1-cookies", num:"1.5", title:"Колачиња и HTTPS", sub:"Како stateless HTTP памети корисник и како се штити содржината.",
  diagram:["cookieSim","httpsSteps"], script:null,
  questions:[
    {type:"mc", q:"Со кое заглавје серверот поставува колаче?", opts:["Set-Cookie (во одговорот)","Cookie (во одговорот)","Set-Cookie (во барањето)","Location"], ans:[0], exp:"Серверот праќа Set-Cookie, прелистувачот го зачувува и го враќа со Cookie во секое следно барање."},
    {type:"mc", q:"Што се колачињата?", opts:["Клуч-вредност парови што ги праќа серверот, а прелистувачот ги чува и ги враќа","Податоци зачувани само на серверот","Енкрипциски клучеви за HTTPS","Делови од URL"], ans:[0], exp:"Тие го решаваат проблемот на безсостојбеноста на HTTP."},
    {type:"fill", q:"Која заштита што ја дава HTTPS се постигнува со кој механизам?", rows:[
      ["Доверливост",["енкрипција","хеширање","дигитален сертификат"],0],
      ["Интегритет",["хеширање","енкрипција","дигитален сертификат"],0],
      ["Автентикација",["дигитален сертификат","хеширање","енкрипција"],0]], exp:"Енкрипција = никој не може да чита. Хеш = никој не може незабележано да менува. Сертификат = навистина зборуваш со вистинскиот сервер."},
    {type:"mc", q:"Што е HTTPS?", opts:["HTTP преку SSL/TLS, не посебен протокол","Нов протокол што го заменува HTTP","HTTP со компресија","HTTP/3"], ans:[0], exp:"SSL (TLS) слојот седи помеѓу HTTP и TCP."},
    {type:"mc", q:"За што прелистувачот го користи јавниот клуч од сертификатот на серверот?", opts:["За безбедно да сподели заедничка тајна, од која се прават симетрични клучеви","За да ја енкриптира секоја порака до крајот","За да го потпише сертификатот","За DNS пребарување"], ans:[0], exp:"Асиметрично само на почеток, потоа сè се енкриптира симетрично (побрзо)."},
    {type:"mc", q:"Што е проблемот со обичен HTTP?", opts:["Содржината на барањата и одговорите е видлива за било кој на патот","Не поддржува POST","Не може да праќа слики","Не поддржува колачиња"], ans:[0], exp:"Затоа лозинки и лични податоци одат само преку HTTPS."}
  ]
},
{
  id:"l1-versions", num:"1.6", title:"HTTP верзии", sub:"Зошто HTTP/2 е побрз и што е head-of-line blocking.",
  diagram:["holSim"], script:null,
  questions:[
    {type:"sort", q:"Која верзија?", cats:["HTTP/1.1","HTTP/2","HTTP/3"], items:[["Прва стандардизирана, најчесто користена","HTTP/1.1"],["Head-of-line blocking (недостаток)","HTTP/1.1"],["Повеќе барања преку иста TCP конекција, едно по едно","HTTP/1.1"],["Мултиплексирање, дел по дел одеднаш","HTTP/2"],["Серверот може да иницира (push)","HTTP/2"],["Приоритизација на барања","HTTP/2"],["QUIC над UDP","HTTP/3"]], exp:"1.1 донесе persistent конекции и целосно множество методи. 2 донесе мултиплексирање. 3 го менува транспортот."},
    {type:"mc", q:"Што е head-of-line blocking?", opts:["Бавното прво барање во редицата ги задржува сите следни","Серверот ги блокира барањата без колаче","Прелистувачот блокира pop-up","DNS не одговара"], ans:[0], exp:"Кај HTTP/1.1 одговорите доаѓаат по ред. HTTP/2 со мултиплексирање го решава."},
    {type:"mc", q:"Кој транспорт го користи HTTP/3?", opts:["QUIC над UDP","TCP","SCTP","WebSocket"], ans:[0], exp:"Според слајдовите сè уште не е широко прифатен."},
    {type:"mc", q:"Што не постоело во HTTP/1.1, а го има HTTP/2?", opts:["Мултиплексирање на повеќе барања одеднаш","Повеќе барања преку иста TCP конекција","Методот PUT","Статусни кодови"], ans:[0], exp:"1.1 веќе преиспраќа повеќе барања на иста конекција, но едно по едно."}
  ]
},
{
  id:"l1-examples", num:"1.7", title:"Примери: GET, POST и upload", sub:"Форма → сурово HTTP барање, вклучувајќи multipart.",
  diagram:["formLab"], script:null,
  questions:[
    {type:"fill", scenario:"На <code>wp.mk/index.html</code> корисникот кликнува копче за преземање PDF. Прелистувачот праќа <code>GET /download</code>.", q:"Пополни ги клучните полиња.", rows:[
      ["Барање: Content-Type",["не постои","application/pdf","application/x-www-form-urlencoded"],0],
      ["Барање: Content-Length",["не постои","нумеричка вредност"],0],
      ["Барање: Referer",["wp.mk/index.html","не постои"],0],
      ["Барање: Body",["не постои","низа од бајти"],0],
      ["Одговор: Content-Type",["application/pdf","text/html","multipart/form-data"],0],
      ["Одговор: Content-Length",["нумеричка вредност","не постои"],0],
      ["Одговор: Location",["не постои","wp.mk/download"],0],
      ["Одговор: Body",["низа од бајти","не постои"],0]], exp:"Барањето е GET без тело. Одговорот носи PDF: тип application/pdf и големина во бајти. Нема пренасочување, па нема Location."},
    {type:"fill", scenario:"Формата за најава на <code>wp.mk/login-page.html</code> праќа POST до <code>/login</code>. При успех серверот пренасочува на <code>/index.html</code>.", q:"Пополни ги полињата.", rows:[
      ["Барање: Content-Type",["application/x-www-form-urlencoded","multipart/form-data","не постои"],0],
      ["Барање: Content-Length",["нумеричка вредност","не постои"],0],
      ["Барање: Body",["низа од бајти (username=...&password=...)","не постои"],0],
      ["Одговор: статус",["302 Found","200 OK","404 Not Found"],0],
      ["Одговор: Location",["wp.mk/index.html","не постои"],0]], exp:"Обична форма без датотека = urlencoded тело. Пренасочувањето е 3xx со Location, а прелистувачот сам прави ново GET."},
    {type:"mc", q:"Формата има <input type=\"file\">, но нема enctype=\"multipart/form-data\". Што се праќа?", opts:["Само името на датотеката, не и содржината","Целата датотека како urlencoded","Ништо, формата не се праќа","Датотеката во посебно барање"], ans:[0], exp:"Без multipart прелистувачот праќа клуч-вредност парови, а за датотеката само име."},
    {type:"mc", q:"Што ги разделува деловите во multipart/form-data тело?", opts:["boundary низа од знаци","Празен ред","Знакот &","Content-Length"], ans:[0], exp:"Boundary е наведен во Content-Type заглавјето и се повторува меѓу деловите."},
    {type:"mc", q:"Што има секој дел во multipart барање?", opts:["Content-Disposition (form-data; name=...), Content-Type и податоците","Само податоците","Host и Referer","Статусен код"], ans:[0], exp:"Name доаѓа од name атрибутот на input елементот, а Content-Type му кажува на серверот што е делот (пр. application/pdf)."}
  ]
}
]});

/* ================= diagrams ================= */
Object.assign(DIAGRAMS, {
httpJourney(el){
  stepper(el, {title:"Симулација", tag:"од URL до страница", intro:"Чекор по чекор: што се случува кога ќе внесеш адреса.",
    nodes:[["Прелистувач","клиент"],["DNS","име → IP"],["TCP врска","порта 80 / 443"],["Веб сервер","Apache, Nginx, IIS"]],
    steps:[
      [0,"Корисникот внесува URL во прелистувачот.", "https://wp.mk/index.html"],
      [1,"Прелистувачот го прашува DNS кој е IP адресата на <b>wp.mk</b>.", "wp.mk  →  203.0.113.10"],
      [2,"Се воспоставува <b>TCP врска</b> со серверот. Порта <b>443</b> за HTTPS, <b>80</b> за HTTP.", "клиент:51522  ⇄  203.0.113.10:443"],
      [[0,3],"Прелистувачот праќа <b>HTTP барање</b>: тип (метод) и адреса на ресурсот.", "GET /index.html HTTP/1.1\nHost: wp.mk\nUser-Agent: Mozilla/5.0 ...\nAccept: text/html"],
      [3,"Серверот го обработува барањето и го бара ресурсот (статичка датотека или динамичка содржина од апликациски сервер)."],
      [[3,0],"Серверот праќа <b>HTTP одговор</b>: статусен код + (најчесто) бараниот ресурс.", "HTTP/1.1 200 OK\nServer: Apache\nContent-Type: text/html\nContent-Length: 1532\n\n<!DOCTYPE html> ..."],
      [0,"Прелистувачот го прикажува ресурсот. За секоја слика, CSS или JS прави ново барање."]
    ]});
},
staticDynamic(el){
  const items = [["/logo.png","статички","Датотеката постои на дискот, веб серверот само ја враќа."],["/index.html","статички","Ист HTML за сите, директно од диск."],["/cart за најавен корисник","динамички","Содржината зависи од корисникот и базата, ја генерира апликација (сервлет)."],["/search?q=spring","динамички","Резултатот се пресметува за секое барање."],["/style.css","статички","Готова датотека."],["/notifications (листа од база)","динамички","Апликацискиот сервер (Tomcat) повикува код."]];
  let i = 0, score = 0, done = false;
  el.innerHTML = `<div class="section-title">Мини-игра <span class="tag">статички или динамички ресурс?</span></div>${ex("Статички ресурс веб серверот го враќа од диск. Динамички го генерира веб апликација на апликациски сервер. Погоди за секоја адреса.")}
    <div class="stepbox"><div class="sn" id="sdN"></div><div class="tx" style="font-family:var(--font-mono);font-size:16px" id="sdU"></div></div>
    <div class="diag-controls"><button class="btn" data-v="статички">Статички</button><button class="btn" data-v="динамички">Динамички</button></div><div id="sdR"></div>`;
  const draw = () => { if (i>=items.length){ $("#sdN",el).textContent="Готово"; $("#sdU",el).textContent=`${score} / ${items.length} точни`; el.querySelectorAll("[data-v]").forEach(b=>b.disabled=true); return; }
    $("#sdN",el).textContent = `Адреса ${i+1} / ${items.length}`; $("#sdU",el).textContent = items[i][0]; };
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { if (i>=items.length) return; const it = items[i]; const ok = b.dataset.v===it[1]; if (ok) score++;
    $("#sdR",el).innerHTML = `<div class="result ${ok?"ok":"bad"}">${ok?"Точно":"Не"}: ${esc(it[0])} е ${it[1]}.<small>${it[2]}</small></div>`; i++; draw(); });
  draw();
},
urlDissect(el){
  const presets = ["https://www.finki.ukim.mk/mk/studies?year=2&lang=mk#plan","http://localhost:8080/notifications/7?channel=sms","https://wp.mk:8443/search?q=spring+boot&page=2","http://wp.mk/index.html"];
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">структура на URL</span></div>${ex("Внеси или избери URL. Секој дел е обоен според улогата.")}
    <div class="ctl"><label for="urlIn">URL</label><input type="text" id="urlIn" value="${presets[0]}"></div>
    <div class="diag-controls">${presets.map((p,k)=>`<button class="btn small" data-p="${k}">${esc(p.replace(/^https?:\/\//,"").slice(0,26))}…</button>`).join("")}</div>
    <div class="urlparts" id="urlOut"></div><div class="legend" id="urlLeg"></div>`;
  const colors = {scheme:"#7b8bb0", host:"var(--accent)", port:"var(--xp)", path:"var(--ok)", query:"#b25bd6", frag:"var(--bad)"};
  const draw = () => {
    let u; try { u = new URL($("#urlIn",el).value.trim()); } catch(e){ $("#urlOut",el).innerHTML = `<span style="border:0;color:var(--bad)">Невалиден URL. Почни со http:// или https://</span>`; $("#urlLeg",el).innerHTML=""; return; }
    const def = u.protocol==="https:"?"443":u.protocol==="http:"?"80":"";
    const parts = [["scheme",u.protocol+"//"],["host",u.hostname],["port",u.port?":"+u.port:""],["path",u.pathname],["query",u.search],["frag",u.hash]];
    $("#urlOut",el).innerHTML = parts.filter(p=>p[1]).map(p=>`<span style="border-color:${colors[p[0]]}">${esc(p[1])}</span>`).join("");
    const q = [...u.searchParams.entries()];
    $("#urlLeg",el).innerHTML = [
      ["scheme","Протокол (шема)", u.protocol.replace(":","")],
      ["host","Домаќин (host), DNS го претвора во IP", u.hostname],
      ["port","Порта", u.port || `${def} (стандардна, не е напишана)`],
      ["path","Патека до ресурсот", u.pathname],
      ["query","Query string: параметри по ?", q.length? q.map(([k,v])=>`${k} = ${v}`).join(", ") : "нема"],
      ["frag","Фрагмент: само за прелистувачот, НЕ се праќа до серверот", u.hash || "нема"]
    ].map(([k,l,v])=>`<div style="border-color:${colors[k]}"><b>${l}</b><br><code>${esc(v)}</code></div>`).join("");
  };
  $("#urlIn",el).oninput = draw;
  el.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { $("#urlIn",el).value = presets[+b.dataset.p]; draw(); });
  draw();
},
reqBuilder(el){
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">состави барање, види одговор</span></div>${ex("Смени метод, тело и тип на одговор. Гледај кои заглавја се појавуваат и исчезнуваат.")}
    <div class="ctlrow">
      <div class="ctl"><label for="rbM">Метод</label><select id="rbM"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></div>
      <div class="ctl" style="flex:1;min-width:160px"><label for="rbP">Патека</label><input type="text" id="rbP" value="/notifications"></div>
      <div class="ctl"><label for="rbR">Серверот враќа</label><select id="rbR"><option value="html">200 HTML</option><option value="json">200 JSON</option><option value="created">201 Created</option><option value="redir">302 redirect</option><option value="nf">404</option><option value="nc">204 No Content</option></select></div>
    </div>
    <div class="opt-line" style="margin:10px 0"><label><input type="checkbox" id="rbC"> имам колаче JSESSIONID</label><label><input type="checkbox" id="rbJ"> телото е JSON</label></div>
    <div class="twocol"><div><b style="font-size:13px">Барање</b><pre class="raw" id="rbReq"></pre></div><div><b style="font-size:13px">Одговор</b><pre class="raw" id="rbRes"></pre></div></div>
    <div id="rbNote" style="font-size:14px;margin-top:8px;color:var(--muted)"></div>`;
  const len = s => new TextEncoder().encode(s).length;
  const draw = () => {
    const m = $("#rbM",el).value, p = $("#rbP",el).value || "/", r = $("#rbR",el).value, ck = $("#rbC",el).checked, json = $("#rbJ",el).checked;
    const hasBody = m==="POST" || m==="PUT";
    const body = json ? `{"to":"ana@finki.ukim.mk","message":"Здраво"}` : "to=ana%40finki.ukim.mk&message=Zdravo";
    let req = `${m} ${p} HTTP/1.1\nHost: localhost:8080\nUser-Agent: Mozilla/5.0\nAccept: text/html,application/json;q=0.9`;
    if (ck) req += `\nCookie: JSESSIONID=A1B2C3`;
    if (hasBody) req += `\nContent-Type: ${json?"application/json":"application/x-www-form-urlencoded"}\nContent-Length: ${len(body)}\n\n${body}`;
    const bodies = {html:"<!DOCTYPE html><html><body><h1>Известувања</h1></body></html>", json:`[{"id":1,"to":"ana@finki.ukim.mk"}]`, created:`{"id":8,"to":"ana@finki.ukim.mk"}`};
    let res;
    if (r==="html") res = `HTTP/1.1 200 OK\nServer: Apache\nContent-Type: text/html;charset=UTF-8\nContent-Length: ${len(bodies.html)}\n\n${bodies.html}`;
    if (r==="json") res = `HTTP/1.1 200 OK\nServer: Apache\nContent-Type: application/json\nContent-Length: ${len(bodies.json)}\n\n${bodies.json}`;
    if (r==="created") res = `HTTP/1.1 201 Created\nServer: Apache\nLocation: /notifications/8\nContent-Type: application/json\nContent-Length: ${len(bodies.created)}\n\n${bodies.created}`;
    if (r==="redir") res = `HTTP/1.1 302 Found\nServer: Apache\nLocation: /notifications\nContent-Length: 0`;
    if (r==="nf") res = `HTTP/1.1 404 Not Found\nServer: Apache\nContent-Type: text/html\nContent-Length: 48\n\n<html><body>404 Not Found</body></html>`;
    if (r==="nc") res = `HTTP/1.1 204 No Content\nServer: Apache`;
    if (!ck && (r==="html")) res = res.replace("Server: Apache","Server: Apache\nSet-Cookie: JSESSIONID=A1B2C3; Path=/");
    $("#rbReq",el).innerHTML = rawHTTP(req); $("#rbRes",el).innerHTML = rawHTTP(res);
    const notes = [];
    if (!hasBody) notes.push(`${m} нема тело, затоа нема Content-Type ни Content-Length во барањето.`);
    else notes.push(`${m} има тело: Content-Type кажува формат (${json?"JSON":"обична форма"}), Content-Length е бројот на бајти (кирилица = 2 бајти по знак).`);
    if (r==="redir") notes.push("302 нема тело, но има Location: прелистувачот сам прави GET до таа адреса.");
    if (r==="created") notes.push("201 Created + Location до новиот ресурс.");
    if (!ck && r==="html") notes.push("Нема колаче во барањето, па серверот поставува Set-Cookie.");
    $("#rbNote",el).innerHTML = notes.map(n=>"• "+n).join("<br>");
  };
  el.querySelectorAll("select,input").forEach(c => c.oninput = c.onchange = draw);
  draw();
},
methodTable(el){
  const M = [
    ["GET","Чита ресурс",1,1,0,"GET /notifications/7"],
    ["HEAD","Како GET, но само заглавја, без тело",1,1,0,"HEAD /files/report.pdf"],
    ["POST","Креира нов ресурс / праќа податоци за обработка",0,0,1,"POST /notifications  (тело: to=...&message=...)"],
    ["PUT","Го заменува целиот ресурс",0,1,1,"PUT /notifications/7  (цел објект)"],
    ["PATCH","Менува дел од ресурсот",0,0,1,"PATCH /notifications/7  (само channel)"],
    ["DELETE","Брише ресурс",0,1,0,"DELETE /notifications/7"],
    ["OPTIONS","Кои методи ги поддржува ресурсот",1,1,0,"OPTIONS /notifications"],
    ["TRACE","Враќа го барањето назад (дијагностика)",1,1,0,"TRACE /"],
    ["CONNECT","Отвора тунел (пр. HTTPS преку proxy)",0,0,0,"CONNECT wp.mk:443"]];
  let f = "all", sel = 0;
  el.innerHTML = `<div class="section-title">Интерактивна табела <span class="tag">HTTP методи</span></div>${ex("Безбеден (safe) = не менува ништо на серверот. Идемпотентен = повторувањето дава иста состојба. Филтрирај и кликни ред.")}
    <div class="tabs" id="mtF"><button class="tab on" data-f="all">Сите</button><button class="tab" data-f="safe">Безбедни</button><button class="tab" data-f="idem">Идемпотентни</button><button class="tab" data-f="body">Со тело</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>Метод</th><th>Намена</th><th>Безбеден</th><th>Идемпотентен</th><th>Тело во барањето</th></tr></thead><tbody id="mtB"></tbody></table></div>
    <pre class="raw" id="mtEx"></pre>`;
  const draw = () => {
    el.querySelectorAll("#mtF .tab").forEach(t=>t.classList.toggle("on",t.dataset.f===f));
    const show = m => f==="all" || (f==="safe"&&m[2]) || (f==="idem"&&m[3]) || (f==="body"&&m[4]);
    $("#mtB",el).innerHTML = M.map((m,k)=>`<tr data-k="${k}" style="cursor:pointer;${show(m)?"":"opacity:.25;"}${k===sel?"background:var(--accent-soft)":""}"><td><code>${m[0]}</code></td><td>${m[1]}</td><td>${m[2]?"да":"не"}</td><td>${m[3]?"да":"не"}</td><td>${m[4]?"да":"не"}</td></tr>`).join("");
    $("#mtB",el).querySelectorAll("tr").forEach(tr => tr.onclick = () => { sel=+tr.dataset.k; draw(); });
    $("#mtEx",el).textContent = M[sel][5] + "   HTTP/1.1";
  };
  el.querySelectorAll("#mtF .tab").forEach(t => t.onclick = () => { f=t.dataset.f; draw(); });
  draw();
},
statusExplorer(el){
  const S = {
    100:["Continue","Серверот го примил почетокот на барањето, клиентот продолжува.",1],
    200:["OK","Успешно. Телото го содржи резултатот.",2],
    201:["Created","Креиран е нов ресурс. Обично со Location до него.",2],
    204:["No Content","Успешно, но нема тело (пр. по DELETE).",2],
    301:["Moved Permanently","Ресурсот трајно е преместен. Location = нова адреса.",3],
    302:["Found","Привремено пренасочување. Прелистувачот прави GET до Location (POST → redirect → GET).",3],
    304:["Not Modified","Кешираната верзија е уште добра, нема тело.",3],
    400:["Bad Request","Неисправно барање: недостасува параметар, погрешен тип (abc за Long), невалиден JSON.",4],
    401:["Unauthorized","Не си најавен.",4],
    403:["Forbidden","Најавен си, но немаш право.",4],
    404:["Not Found","Нема таков ресурс / мапирање за URL-то.",4],
    405:["Method Not Allowed","URL-то постои, но не за овој метод (GET наместо POST).",4],
    415:["Unsupported Media Type","Серверот не го прифаќа форматот на телото (пр. JSON без Content-Type: application/json).",4],
    500:["Internal Server Error","Исклучок на серверот при валидно барање.",5],
    503:["Service Unavailable","Серверот е преоптоварен или во одржување.",5]};
  const cls = {1:"1xx Информативни",2:"2xx Успех",3:"3xx Пренасочување",4:"4xx Грешка кај клиентот",5:"5xx Грешка на серверот"};
  let cur = 200;
  el.innerHTML = `<div class="section-title">Интерактивно <span class="tag">статусни кодови</span></div>${ex("Кликни код. Првата цифра ја кажува класата.")}
    <div style="display:flex;flex-direction:column;gap:8px">${[1,2,3,4,5].map(c=>`<div><b style="font-size:12px;color:var(--muted)">${cls[c]}</b><div class="gridbtn">${Object.keys(S).filter(k=>S[k][2]===c).map(k=>`<button class="code-btn c${c}" data-c="${k}">${k}</button>`).join("")}</div></div>`).join("")}</div>
    <div class="stepbox" style="margin-top:12px"><div class="sn" id="scH"></div><div class="tx" id="scT"></div></div>`;
  const draw = () => { el.querySelectorAll("[data-c]").forEach(b=>b.classList.toggle("on",+b.dataset.c===cur)); $("#scH",el).textContent = `${cur} ${S[cur][0]} · ${cls[S[cur][2]]}`; $("#scT",el).textContent = S[cur][1]; };
  el.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { cur=+b.dataset.c; draw(); });
  draw();
},
negotiation(el){
  const types = ["text/html","application/json","application/xml"];
  const q = {"text/html":1, "application/json":0.8, "application/xml":0};
  const can = {"text/html":true, "application/json":true, "application/xml":false};
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">преговарање на содржина (Accept)</span></div>${ex("Клиентот кажува што сака со Accept и тежински фактор q (0 до 1). Серверот го избира најпосакуваниот формат што го поддржува.")}
    <div class="twocol"><div class="box"><h4>Клиент: Accept</h4>${types.map(t=>`<div class="ctl" style="margin:6px 0"><label for="q-${t}">${t} · q = <span id="qv-${t}"></span></label><input type="range" id="q-${t}" min="0" max="1" step="0.1" value="${q[t]}"></div>`).join("")}</div>
    <div class="box"><h4>Сервер: може да произведе</h4>${types.map(t=>`<label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" id="c-${t}" ${can[t]?"checked":""}> ${t}</label>`).join("")}</div></div>
    <pre class="raw" id="ngH" style="margin-top:10px"></pre><div id="ngR"></div>`;
  const draw = () => {
    types.forEach(t => { q[t] = +$("#q-"+CSS.escape(t),el).value; can[t] = $("#c-"+CSS.escape(t),el).checked; $("#qv-"+CSS.escape(t),el).textContent = q[t]; });
    const acc = types.filter(t=>q[t]>0).sort((a,b)=>q[b]-q[a]).map(t=> q[t]===1? t : `${t};q=${q[t]}`).join(", ");
    $("#ngH",el).innerHTML = rawHTTP(`GET /notifications HTTP/1.1\nAccept: ${acc || "(ништо)"}`);
    const pick = types.filter(t=>q[t]>0 && can[t]).sort((a,b)=>q[b]-q[a])[0];
    $("#ngR",el).innerHTML = pick ? `<div class="result ok">Серверот враќа <code>Content-Type: ${pick}</code><small>Највисок q меѓу форматите што серверот ги поддржува (q=${q[pick]}${q[pick]===1?", предефиниран, не се пишува":""}).</small></div>` : `<div class="result bad">406 Not Acceptable<small>Нема заеднички формат.</small></div>`;
  };
  el.querySelectorAll("input").forEach(i => i.oninput = draw);
  draw();
},
cookieSim(el){
  let jar = {}, n = 0, theme = false;
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">колачиња</span></div>${ex("Прати неколку барања и гледај како се појавуваат Set-Cookie во одговорот и Cookie во следните барања.")}
    <div class="diag-controls"><button class="btn small primary" data-a="req">Прати GET /cart</button><button class="btn small" data-a="theme">Избери темна тема (POST /theme)</button><button class="btn small warn" data-a="clear">Избриши колачиња</button></div>
    <div class="twocol"><div><b style="font-size:13px">Барање</b><pre class="raw" id="ckReq">(уште нема)</pre></div><div><b style="font-size:13px">Одговор</b><pre class="raw" id="ckRes">(уште нема)</pre></div></div>
    <div class="box" style="margin-top:10px"><h4>Тегла со колачиња во прелистувачот</h4><div id="ckJar"></div></div>`;
  const drawJar = () => { const k = Object.keys(jar); $("#ckJar",el).innerHTML = k.length ? k.map(x=>`<div class="kv"><span>${x}</span><span class="v">${jar[x]}</span></div>`).join("") : `<div class="kv"><span>празно</span><span class="v">-</span></div>`; };
  const send = (path, method) => {
    n++;
    const cookie = Object.keys(jar).map(k=>`${k}=${jar[k]}`).join("; ");
    $("#ckReq",el).innerHTML = rawHTTP(`${method} ${path} HTTP/1.1\nHost: wp.mk${cookie?`\nCookie: ${cookie}`:""}`);
    const set = [];
    if (!jar.sid){ jar.sid = Math.random().toString(16).slice(2,8).toUpperCase(); set.push(`Set-Cookie: sid=${jar.sid}; Path=/; HttpOnly`); }
    if (method==="POST"){ jar.theme = "dark"; set.push("Set-Cookie: theme=dark; Max-Age=31536000"); }
    $("#ckRes",el).innerHTML = rawHTTP(`HTTP/1.1 ${method==="POST"?"302 Found\nLocation: /cart":"200 OK"}${set.length?"\n"+set.join("\n"):""}\nContent-Type: text/html\n\n${method==="POST"?"":(cookie?"Добредојде назад":"Добредојде, нов корисник")}`);
    drawJar();
  };
  el.querySelector('[data-a="req"]').onclick = () => send("/cart","GET");
  el.querySelector('[data-a="theme"]').onclick = () => send("/theme","POST");
  el.querySelector('[data-a="clear"]').onclick = () => { jar = {}; drawJar(); };
  drawJar();
},
httpsSteps(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"HTTPS: сертификат и енкрипција",
    nodes:[["Издавач (CA)","сертификатно тело"],["Сервер","wp.mk"],["Прелистувач","клиент"]],
    steps:[
      [1,"Серверот генерира пар клучеви: <b>приватен</b> (тајен) и <b>јавен</b>."],
      [[1,0],"Серверот го праќа јавниот клуч и податоците за доменот до сертификатното тело (CA)."],
      [0,"CA проверува дека доменот навистина му припаѓа и го <b>дигитално потпишува</b> јавниот клуч. Тоа е дигиталниот сертификат."],
      [[2,1],"Прелистувачот се поврзува и го добива сертификатот на серверот."],
      [2,"Прелистувачот го <b>валидира</b> потписот со јавниот клуч на CA (вграден во прелистувачот/OS). Ако е валиден: ова е навистина wp.mk (автентикација)."],
      [[2,1],"Со јавниот клуч на серверот прелистувачот безбедно испраќа <b>заедничка тајна</b>. Само серверот може да ја прочита со приватниот клуч."],
      [[1,2],"Двете страни од тајната генерираат исти <b>симетрични клучеви</b>."],
      [[1,2],"Целата содржина на барањата и одговорите се енкриптира. Заштита: доверливост (енкрипција), интегритет (хеширање), автентикација (сертификат)."]
    ]});
},
holSim(el){
  const reqs = [["A: голема слика",3,"var(--xp)"],["B: style.css",1,"var(--accent)"],["C: app.js",1,"var(--ok)"]];
  const sched = {
    "1.1": reqs.map((r,k)=>{ const start = reqs.slice(0,k).reduce((a,x)=>a+x[1],0); return [[start, start+r[1]]]; }),
    "2": (() => { const left = reqs.map(r=>r[1]), segs = reqs.map(()=>[]); let t = 0; while (left.some(x=>x>0)){ reqs.forEach((r,k)=>{ if (left[k]>0){ segs[k].push([t, t+1/3]); t+=1/3; left[k]-=1/3; if (left[k]<1e-9) left[k]=0; } }); } return segs; })()
  };
  let ver = "1.1", t = 0, timer = null;
  const T = 5;
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">head-of-line blocking vs мултиплексирање</span></div>${ex("Три ресурси преку една конекција. Кај HTTP/1.1 одговорите доаѓаат еден по друг, па големата слика ги блокира малите. Кај HTTP/2 се праќаат дел по дел, испреплетено.")}
    <div class="diag-controls"><span class="seg" id="hoV"><button data-v="1.1">HTTP/1.1</button><button data-v="2">HTTP/2</button></span><button class="btn small primary" data-a="play">Пушти</button></div>
    <div class="timeline" id="hoT"></div><div id="hoR"></div>`;
  const finish = k => Math.max(...sched[ver][k].map(s=>s[1]));
  const draw = () => {
    el.querySelectorAll("#hoV button").forEach(b=>b.classList.toggle("on",b.dataset.v===ver));
    $("#hoT",el).innerHTML = reqs.map((r,k)=>`<div class="tl-row"><span>${r[0]}</span><div class="tl-track">${sched[ver][k].map(s=>`<div class="tl-seg ${t>=s[1]-1e-9?"done":""}" style="left:${s[0]/T*100}%;width:${(s[1]-s[0])/T*100}%;background:${r[2]}"></div>`).join("")}<div class="tl-cursor" style="left:${t/T*100}%"></div></div><span style="font-variant-numeric:tabular-nums">${t>=finish(k)-1e-9?`готово ${finish(k).toFixed(1)}`:"…"}</span></div>`).join("");
    if (t>=T-1e-9 || t>=Math.max(...reqs.map((_,k)=>finish(k)))-1e-9) $("#hoR",el).innerHTML = `<div class="result ${ver==="2"?"ok":"mid"}">${ver==="1.1"?"B и C чекаа на A иако се мали (head-of-line blocking).":"B и C завршија многу порано: деловите се испреплетени (мултиплексирање)."}<small>Време на завршување: ${reqs.map((r,k)=>r[0].split(":")[0]+"="+finish(k).toFixed(1)).join(", ")}</small></div>`; else $("#hoR",el).innerHTML="";
  };
  el.querySelectorAll("#hoV button").forEach(b => b.onclick = () => { ver=b.dataset.v; t=0; clearInterval(timer); timer=null; draw(); });
  el.querySelector('[data-a="play"]').onclick = () => { clearInterval(timer); t=0; timer=setInterval(()=>{ if (!document.body.contains(el)) return clearInterval(timer); t=Math.min(T,t+0.1); draw(); if (t>=T) {clearInterval(timer);timer=null;} },60); };
  draw();
},
formLab(el){
  el.innerHTML = `<div class="section-title">Лабораторија <span class="tag">форма → сурово HTTP барање</span></div>${ex("Форма за прикачување извештај (како примерот од слајдовите). Смени method и enctype и гледај што точно заминува кон серверот.")}
    <div class="box" style="max-width:520px"><h4>Форма</h4>
      <div class="ctl"><label for="flT">title</label><input type="text" id="flT" value="WP exam results"></div>
      <div class="ctl" style="margin-top:6px"><label for="flA">author</label><input type="text" id="flA" value="WP professor"></div>
      <div class="ctl" style="margin-top:6px"><label for="flF">repo_upload_file (type="file")</label><select id="flF"><option value="izvestaj.pdf">izvestaj.pdf (application/pdf)</option><option value="notes.txt">notes.txt (text/plain)</option><option value="">не е избрана</option></select></div>
    </div>
    <div class="ctlrow" style="margin:10px 0">
      <div class="ctl"><label for="flM">method</label><select id="flM"><option>post</option><option>get</option></select></div>
      <div class="ctl"><label for="flE">enctype</label><select id="flE"><option value="multipart/form-data">multipart/form-data</option><option value="application/x-www-form-urlencoded">(стандардно) urlencoded</option></select></div>
    </div>
    <pre class="raw" id="flOut"></pre><div id="flNote"></div>`;
  const enc = s => encodeURIComponent(s).replace(/%20/g,"+");
  const draw = () => {
    const t = $("#flT",el).value, a = $("#flA",el).value, f = $("#flF",el).value, m = $("#flM",el).value.toUpperCase(), e = $("#flE",el).value;
    const kv = `repo_upload_file=${enc(f)}&title=${enc(t)}&author=${enc(a)}`;
    let out, note;
    if (m==="GET"){ out = `GET /upload?${kv} HTTP/1.1\nHost: wp.mk\nReferer: https://wp.mk/main.html`; note = ["bad","GET нема тело: сè оди во URL-то, а од датотеката заминува само <b>името</b>. enctype се игнорира."]; }
    else if (e!=="multipart/form-data"){ out = `POST /upload HTTP/1.1\nHost: wp.mk\nContent-Type: application/x-www-form-urlencoded\nContent-Length: ${new TextEncoder().encode(kv).length}\n\n${kv}`; note = ["mid","Без multipart прелистувачот праќа клуч-вредност парови. За датотеката заминува само името, не и содржината."]; }
    else {
      const B = "----WebKitFormBoundaryUwUmgkUBB3bPn4ku";
      const ftype = f.endsWith(".pdf")?"application/pdf":f?"text/plain":"application/octet-stream";
      const body = `--${B}\nContent-Disposition: form-data; name="repo_upload_file"; filename="${f}"\nContent-Type: ${ftype}\n\n${f.endsWith(".pdf")?"%PDF-1.7 ...бинарни бајти...":f?"текст од датотеката...":""}\n--${B}\nContent-Disposition: form-data; name="title"\n\n${t}\n--${B}\nContent-Disposition: form-data; name="author"\n\n${a}\n--${B}--`;
      out = `POST /upload HTTP/1.1\nHost: wp.mk\nContent-Type: multipart/form-data; boundary=${B}\nContent-Length: 1840\n\n${body}`;
      note = ["ok","Телото е поделено на делови со <b>boundary</b>. Секој дел: Content-Disposition (form-data + name од input-от), Content-Type, па податоците. Датотеката заминува цела."];
    }
    $("#flOut",el).innerHTML = rawHTTP(out);
    $("#flNote",el).innerHTML = `<div class="result ${note[0]}">${note[1]}</div>`;
  };
  el.querySelectorAll("select,input").forEach(c => c.oninput = c.onchange = draw);
  draw();
}
});
})();
