/* Л2 + Л3: сервлети, филтри, опсези (book chapter 2) */
(function(){
const S = [
{
  id:"java", num:"2.1 · 2.2", title:"Java и JEE", sub:"Што е Java платформа и зошто ни треба серверско издание.",
  diagram:null,
  script:`
<h2>Java како платформа</h2>
<p>Java е објектно ориентиран јазик, независен од платформата. Кодот се компајлира во <b>bytecode</b>, а <b>JVM</b> го преведува bytecode-от во инструкции за конкретната машина. Затоа „еднаш напишано, работи насекаде“, само треба да има JRE.</p>
<ul>
<li><b>JDK</b> (Java Development Kit): за програмерот. Содржи компајлер, полнач на класи, debugger и JRE.</li>
<li><b>JRE</b> (Java Runtime Environment): за извршување. JVM + библиотеки со класи.</li>
<li><b>JVM</b>: го извршува bytecode-от.</li>
</ul>
<div class="analogy"><b>Аналогија:</b> bytecode е рецепт на „универзален јазик“. JVM е готвач кој го разбира и го готви во секоја кујна (Windows, Linux, macOS).</div>
<h2>JSE и JEE</h2>
<p>Секоја Java платформа = JVM + колекција API-и.</p>
<ul>
<li><b>Java SE</b> (Standard Edition): основни класи, мрежа, безбедност, пристап до бази, GUI.</li>
<li><b>Java EE</b> (порано <b>J2EE</b>, Enterprise Edition): <b>екстензија на JSE</b> за повеќеслојни, скалабилни, безбедни и доверливи апликации што работат <b>на сервер</b>. Воведува <b>управувани компоненти</b>: сервлети, филтри и опсервери (listeners), со кои управува <b>сервлет контејнерот</b>.</li>
</ul>
<h2>Сервлет во една реченица</h2>
<p>Java класа што имплементира бизнис логика за генерирање динамички веб страници, се повикува според побараната <b>URL адреса</b>, <b>нема main()</b> и е контролирана од сервлет контејнерот. Една апликација е <b>колекција од сервлети</b>, секој за своја функционалност.</p>
`,
  questions:[
    {type:"mc", multi:true, q:"Кои искази се точни за сервлет?", opts:["Нема main() метод","Се повикува во зависност од побараната URL адреса","Се стартува сам преку public static void main","Контролиран е од сервлет контејнерот","Една веб апликација содржи точно еден сервлет"], ans:[0,1,3], exp:"Сервлетот нема main(), контејнерот го повикува според URL мапирањето. Апликацијата е колекција од повеќе сервлети."},
    {type:"mc", q:"Java EE (J2EE) е:", opts:["Екстензија на Java SE за серверски, повеќеслојни апликации","Замена за JVM","Библиотека за десктоп GUI апликации","Веб сервер како Nginx"], ans:[0], exp:"JEE го проширува JSE и воведува управувани компоненти (сервлети, филтри, опсервери) што ги извршува сервлет контејнер."},
    {type:"sort", q:"Распореди: што припаѓа каде?", cats:["JDK","JRE","JVM"], items:[["Компајлер (javac)","JDK"],["Го извршува bytecode-от","JVM"],["JVM + библиотеки со класи","JRE"],["Debugger за програмерот","JDK"],["Го преведува bytecode во инструкции за машината","JVM"]], exp:"JDK = алатки за развој + JRE. JRE = JVM + библиотеки. JVM = го извршува bytecode."},
    {type:"mc", q:"Кои компоненти ги воведува JEE како управувани од контејнерот?", opts:["Сервлети, филтри и опсервери","Контролери, сервиси и репозиториуми","Активности и фрагменти","JSP и CSS"], ans:[0], exp:"Сервлети, филтри и опсервери (listeners) се трите управувани компоненти. Controller/Service/Repository се Spring слоеви."}
  ]
},
{
  id:"container", num:"2.3", title:"Сервлет контејнер", sub:"Посредникот помеѓу веб серверот и твоите сервлети.",
  diagram:"flow",
  script:`
<h2>Што е контејнерот</h2>
<p>Java процес (работи во JVM) кој управува со сервлетите. Дел е од Java базиран веб сервер, на пр. <b>Apache Tomcat</b>. Тој е <b>посредник</b>: веб серверот ги разбира HTTP пораките, контејнерот повикува сервлет кој ја генерира динамичката содржина.</p>
<ul>
<li>Прима HTTP барање и го конвертира во <code>HttpServletRequest</code>.</li>
<li>Креира <code>HttpServletResponse</code>.</li>
<li>Ги предава објектите на соодветниот сервлет (и филтрите пред него).</li>
<li>Откако сервлетот ќе заврши, од response прави HTTP одговор.</li>
<li>Управува со <b>животниот циклус</b> на сервлети, филтри и опсервери.</li>
<li><b>Паралелизација</b>: посебна <b>нишка за секое барање</b>.</li>
<li>Нуди <b>заеднички простор</b> за споделување податоци (ServletContext).</li>
</ul>
<div class="key">За едно барање контејнерот повикува <b>најмногу еден сервлет</b>, но <b>повеќе филтри</b>. Опсерверите реагираат на настани (креирано барање, креирана сесија...).</div>
<p>Веб серверот е тој што отвора <code>ServerSocket</code> и слуша на порта. Ги чита HTTP барањата, го наоѓа контејнерот за таа апликација и му ги дава текстот на барањето, InputStream за телото и OutputStream за одговорот.</p>
<h2>Регистрација и пакување</h2>
<p>Компонентите се регистрираат преку <b>deployment descriptor</b> (<code>WEB-INF/web.xml</code>) или преку <b>анотации</b> во самите класи. Се пакуваат во архива <b>.war</b>.</p>
<h2>Животен циклус на веб апликација</h2>
<ul>
<li>Програмерот прави проект, класи, ги регистрира, компајлира во <b>.war</b>.</li>
<li>DevOps го поставува .war на серверот (кај Tomcat во <code>webapps</code>), се отпакува.</li>
<li>Веб серверот креира <b>посебна инстанца од контејнерот за секоја апликација</b> (изолација).</li>
<li>Контејнерот го чита web.xml, ги регистрира компонентите, креира <b>ServletContext</b> и структури за сесии. Сега е спремен за барања.</li>
</ul>
<h2>Spring Boot</h2>
<p>Содржи <b>вграден Tomcat</b>, апликацијата најчесто се пакува во <b>.jar</b>, а извршувањето на .jar го стартува и серверот. Нема потреба од посебен апликациски сервер.</p>
<div class="analogy"><b>Аналогија:</b> веб серверот е рецепција во хотел, контејнерот е менаџерот кој знае кој вработен (сервлет) е задолжен за која соба (URL) и му праќа налог (request) на хартија, а потоа го враќа одговорот на рецепцијата.</div>
`,
  questions:[
    {type:"mc", q:"Колку сервлети и филтри може контејнерот да повика за ЕДНО барање?", opts:["Најмногу еден сервлет, повеќе филтри","Повеќе сервлети, најмногу еден филтер","Точно еден сервлет и точно еден филтер","Неограничено и од двете"], ans:[0], exp:"Барањето се доделува на најмногу еден сервлет, но може да помине низ цела верига филтри."},
    {type:"mc", q:"Која компонента го координира процесот на генерирање динамичка содржина?", opts:["Сервлет контејнерот","Сервлетот","Веб серверот","Прелистувачот"], ans:[0], exp:"Сервлетот ја генерира содржината, веб серверот сервира статичко и ги праќа HTTP пораките, а контејнерот го координира целиот процес."},
    {type:"mc", multi:true, q:"Што прави сервлет контејнерот?", opts:["Го конвертира HTTP барањето во HttpServletRequest","Креира посебна нишка за секое барање","Отвора ServerSocket и слуша на порта","Управува со животниот циклус на сервлетите","Пишува HTML за кошничката"], ans:[0,1,3], exp:"ServerSocket е работа на веб серверот. HTML-от го пишува сервлетот."},
    {type:"mc", q:"На еден Tomcat се поставени 3 апликации. Колку инстанци од сервлет контејнерот има?", opts:["3, по една за секоја апликација","1, заедничка за сите","Онолку колку што има сервлети","Зависи од бројот на корисници"], ans:[0], exp:"Веб серверот иницијализира посебна инстанца од контејнерот за секоја апликација, за изолирано извршување."},
    {type:"mc", q:"Што е точно за Spring Boot апликација?", opts:["Има вграден Tomcat и најчесто се пакува во .jar","Мора да се постави .war на надворешен Tomcat","Не користи сервлети воопшто","Работи без JVM"], ans:[0], exp:"Spring Boot е самостоен: стартувањето на .jar го стартува и вградениот Tomcat."}
  ]
},
{
  id:"servlets", num:"2.4", title:"Сервлети", sub:"Имплементација, мапирање, животен циклус, redirect / forward / include.",
  diagram:"lifecycle+rfi",
  script:`
<h2>2.4.1 Имплементација</h2>
<p><code>GenericServlet</code> (апстрактна) го имплементира интерфејсот <code>Servlet</code> со <code>init()</code>, <code>service()</code>, <code>destroy()</code>. Не зависи од протоколот. За веб користиме <code>HttpServlet extends GenericServlet</code>, кој има <code>doGet, doPost, doPut, doDelete, doHead, doOptions, doTrace</code>. <b>Сите ги повикува <code>service()</code></b> според HTTP методот на барањето.</p>
<div class="tbl-wrap"><table>
<tr><th>HttpServletRequest (читаш)</th><th>HttpServletResponse (пишуваш)</th></tr>
<tr><td><code>getParameter</code>, <code>getParameterNames</code>, <code>getParameterValues</code></td><td><code>setContentType</code>, <code>getWriter</code>, <code>getOutputStream</code></td></tr>
<tr><td><code>getHeader</code>, <code>getHeaderNames</code>, <code>getMethod</code>, <code>getCookies</code></td><td><code>setHeader</code>, <code>addHeader</code>, <code>addCookie</code></td></tr>
<tr><td><code>getContentType</code>, <code>getContentLength</code>, <code>getRemoteAddr</code></td><td><code>setStatus</code>, <code>sendError</code>, <code>sendRedirect</code></td></tr>
</table></div>
<h2>2.4.2 Регистрација и мапирање</h2>
${C(`
<servlet>
  <servlet-name>cart</servlet-name>
  <servlet-class>mk.ukim.finki.ShoppingCart</servlet-class>
</servlet>
<servlet-mapping>
  <servlet-name>cart</servlet-name>
  <url-pattern>/show-cart</url-pattern>
</servlet-mapping>`)}
<p>Истото со анотација: <code>@WebServlet(name = "cart", value = "/show-cart")</code>. <b>name</b> е само за внатрешна употреба и може да се изостави. Повеќе мапирања: <code>@WebServlet(urlPatterns = {"/show-cart", "/cart"})</code>. URL шаблонот е <b>релативен</b> на апликацијата, а <code>/products/*</code> фаќа сè што почнува со <code>/products/</code>.</p>
<h2>2.4.3 Животен циклус</h2>
<ul>
<li>По deploy сервлетите <b>не се иницијализирани</b>.</li>
<li>При <b>прво барање</b>: контејнерот ја вчитува класата, креира <b>една инстанца</b>, повикува <code>init()</code> <b>еднаш</b>.</li>
<li>За секое барање: <code>service()</code> во <b>нова нишка</b>, кој повикува doGet/doPost...</li>
<li>При гасење на апликацијата: <code>destroy()</code> <b>еднаш</b>.</li>
</ul>
<div class="key">Во целиот живот постои <b>само една инстанца</b> од сервлетот. Паралелните барања се паралелни <b>нишки</b>, не инстанци. Првото барање е побавно (вчитување + init).</div>
<h2>2.4.4 Обработка на барање</h2>
<p>Веб сервер → контејнер креира request + response → избира сервлет по URL, креира нишка → <code>service()</code> → <code>doGet()</code> полни response → нишката завршува → контејнерот прави HTTP одговор → го дава на веб серверот → ги брише request и response.</p>
<h2>2.4.6 Интеракција помеѓу сервлети</h2>
<p><b>sendRedirect(URL)</b> (на response): го поставува полето <code>Location</code> и статус 301 (Redirect) според книгата. <b>Прелистувачот</b> прави ново GET барање. URL во прелистувачот се менува. Може и кон надворешен домен. Недостатоци: дополнително чекање, повеќе сообраќај, <b>се губи содржината на оригиналното барање</b>.</p>
<div class="key"><b>POST → Redirect → GET:</b> по додавање, бришење или уредување правиш redirect. Ако корисникот направи Refresh, се повторува <b>само GET-от</b> (doGet), па промената се случува само еднаш.</div>
<p><b>RequestDispatcher</b> се добива со <code>request.getRequestDispatcher("cart")</code> и има <code>forward()</code> и <code>include()</code>, само во рамките на апликацијата, на серверска страна.</p>
<ul>
<li><b>forward(req, res)</b>: исто барање оди кај друг сервлет, со истиот HTTP метод (POST останува POST → doPost), параметрите и атрибутите. Контролата <b>се префрла</b> на дестинацијата и таа го праќа одговорот. Изворот по forward не може да пишува во одговорот (кодот после се извршува, но нема ефект). URL во прелистувачот <b>не се менува</b>. Типично: MVC, предавање на view.</li>
<li><b>include(req, res)</b>: контролата <b>останува кај изворот</b>. Дестинацијата може да менува <b>само телото</b>, не статус и заглавја. Изворот продолжува и сам го праќа одговорот. Типично: header, footer, банер.</li>
</ul>
`,
  questions:[
    {type:"mc", q:"Кој метод на HttpServlet ги повикува doGet() и doPost()?", opts:["service()","init()","dispatch()","handle()"], ans:[0], exp:"service() го гледа HTTP методот и го повикува соодветниот doXxx()."},
    {type:"mc", q:"Се праќа 1 POST до Servlet2, па 2 GET до Servlet1, па се гаси апликацијата. Кој е редоследот на повиците?", opts:["init S2, doPost S2, init S1, doGet S1, doGet S1, destroy (за двата)","init S1, init S2, doPost S2, doGet S1, doGet S1, destroy","init S2, doPost S2, init S1, doGet S1, init S1, doGet S1, destroy","doPost S2, doGet S1, doGet S1, init S1, init S2, destroy"], ans:[0], exp:"init() се повикува при ПРВО барање до тој сервлет и само еднаш. destroy() се повикува при гасење на апликацијата."},
    {type:"mc", q:"100 корисници истовремено бараат ист сервлет. Што креира контејнерот?", opts:["1 инстанца од сервлетот и 100 нишки","100 инстанци од сервлетот","100 контејнери","1 нишка која ги обработува по ред"], ans:[0], exp:"Постои само една инстанца. За секое барање посебна нишка, со свои request и response објекти."},
    {type:"mc", q:"doPost() на крај прави response.sendRedirect(\"cart\"). Корисникот притиска Refresh. Што се случува?", opts:["Повторно се повикува doGet (се прикажуваат продуктите)","Повторно се повикува doPost (продуктите се додаваат уште еднаш)","Се повикуваат и doPost и doGet","Прелистувачот покажува грешка 301"], ans:[0], exp:"По redirect последното барање е GET. Refresh го повторува само него. Затоа redirect се користи по промена на податоци."},
    {type:"mc", multi:true, q:"Во ServletA повикуваме dispatcherToServletB.forward(req, resp). Што е точно?", opts:["Во ServletB можеме да ги пристапиме request атрибутите поставени во ServletA","Во ServletB можеме да ги пристапиме session атрибутите","Во ServletB можеме да ги пристапиме параметрите пратени до ServletA","Клиентот ќе направи ново барање до ServletB","URL во прелистувачот ќе се смени во адресата на ServletB"], ans:[0,1,2], exp:"forward е серверски: истото барање (параметри + атрибути) оди кај B. Сесијата е иста. Клиентот не знае ништо, URL не се менува."},
    {type:"sort", q:"Поврзи го својството со методот.", cats:["sendRedirect","forward","include"], items:[["URL во прелистувачот се менува","sendRedirect"],["Контролата се префрла на дестинацискиот сервлет","forward"],["Контролата останува кај изворниот сервлет","include"],["Може да пренасочи кон друг домен","sendRedirect"],["Се губат податоците од телото на барањето","sendRedirect"],["Се користи за header, footer, банер","include"],["POST останува POST, се повикува doPost во дестинацијата","forward"]], exp:"Redirect = ново барање од прелистувачот. Forward = предаваш сè и излегуваш. Include = позајмуваш содржина и продолжуваш."},
    {type:"mc", q:"Мапирање /products/* фаќа која од следните адреси?", opts:["/products/software/ide","/product/software","/shop/products","Ниту една, * не е дозволено"], ans:[0], exp:"* заменува сè по /products/, вклучително и подпатеки и query string."}
  ]
},
{
  id:"params", num:"2.5.1", title:"Параметри и атрибути", sub:"Почеток на управување со состојби. Тука си.", here:true, deep:true,
  diagram:null,
  script:`
<h2>Зошто ни треба управување со состојба</h2>
<p><b>HTTP е stateless</b>: секое барање е независно од претходните. А реалната апликација мора да памети: текст што корисникот го пребарал, кошничка низ цела сесија, вкупен број барања, големина на страница при страничење. Затоа Java EE нуди два облика на податоци, <b>параметри</b> и <b>атрибути</b>, во четири <b>опсези на важење</b> (scopes).</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Параметар</th><th>Атрибут</th></tr>
<tr><td>Пишување</td><td><b>Read only</b>, не се менува откако е поставен</td><td><b>Read / write</b>, се менува и брише</td></tr>
<tr><td>Тип</td><td>Секогаш <b>String</b> (и бројот 100 е "100")</td><td>Било кој <b>Object</b>, потребен е <b>cast</b> при читање</td></tr>
<tr><td>Кој го поставува</td><td>Клиентот (query string, тело на форма) или web.xml / анотација</td><td>Кодот во компонентите (сервлети, филтри, listeners)</td></tr>
<tr><td>Читање</td><td><code>getParameter</code> (барање), <code>getInitParameter</code> (context / config)</td><td><code>getAttribute</code>, <code>setAttribute</code>, <code>removeAttribute</code></td></tr>
</table></div>
<div class="trap"><b>Замка:</b> <code>getAttribute()</code> враќа <code>Object</code>. Без cast <code>Integer x = session.getAttribute("size");</code> не се компајлира. Точно е <code>Integer x = (Integer) session.getAttribute("size");</code>. Бидејќи е Object, атрибутот може да се препише со вредност од друг тип без грешка, па грешката ќе ја добиеш при погрешен cast.</div>
<h2>Четирите опсези</h2>
<div class="tbl-wrap"><table>
<tr><th>Опсег</th><th>Објект</th><th>Има</th><th>Кој пристапува</th></tr>
<tr><td>Сервлет</td><td><code>ServletConfig</code></td><td>само <b>параметри</b></td><td>сите клиенти, но само <b>тој сервлет</b></td></tr>
<tr><td>Контекст (апликација)</td><td><code>ServletContext</code></td><td>параметри + атрибути</td><td><b>сите</b> сервлети, <b>сите</b> клиенти</td></tr>
<tr><td>Барање</td><td><code>HttpServletRequest</code></td><td>параметри + атрибути</td><td>компонентите низ кои минува <b>тоа барање</b></td></tr>
<tr><td>Сесија</td><td><code>HttpSession</code></td><td>само <b>атрибути</b></td><td>сите сервлети, но само <b>еден клиент</b></td></tr>
</table></div>
<div class="analogy"><b>Аналогија:</b> параметар е она што е отпечатено на твојот билет за концерт: го читаш, не го менуваш. Атрибут е лепливо ливче: го лепиш, препишуваш, вадиш. Опсегот е <i>каде е залепено ливчето</i>: на влезната врата на зградата (контекст), на твојот ормарче (сесија), на пакетот што патува од шалтер до шалтер (барање).</div>
<div class="key">Трик за памтење: <b>„Сервлет без атрибути, сесија без параметри.“</b> Контекст и барање имаат и двете.</div>
`,
  questions:[
    {type:"sort", q:"Дали исказот опишува Attribute или Parameter во J2EE контејнерот?", cats:["Attribute","Parameter"], items:[["Тип String","Parameter"],["Може да се промени во сервлетите","Attribute"],["Не може да се промени во сервлетите","Parameter"],["Тип Object","Attribute"],["Овозможува структурирање на кодот според MVC шаблонот","Attribute"],["Може да се дефинира во web.xml","Parameter"],["При читање бара cast","Attribute"]], exp:"MVC: контролерот ставa податоци како атрибути во барањето и ги предава на view-то. Параметрите доаѓаат од клиентот или од конфигурација и се само String."},
    {type:"mc", q:"Кој опсег има САМО параметри (без атрибути)?", opts:["Сервлет (ServletConfig)","Сесија (HttpSession)","Барање (HttpServletRequest)","Контекст (ServletContext)"], ans:[0], exp:"ServletConfig нема setAttribute/getAttribute. Има само init параметри."},
    {type:"mc", q:"Кој опсег има САМО атрибути (без параметри)?", opts:["Сесија","Сервлет","Контекст","Барање"], ans:[0], exp:"Сесиите немаат параметри од конфигурациска датотека, само атрибути поставени во код."},
    {type:"mc", q:"Зошто воопшто ни треба управување со состојба?", opts:["HTTP е stateless протокол, секое барање е независно","HTTP ги чува податоците само 30 минути","Сервлетите немаат пристап до базата","Прелистувачот не праќа заглавја"], ans:[0], exp:"Бидејќи HTTP не памети ништо меѓу барањата, апликацијата мора сама да чува податоци во соодветен опсег."},
    {type:"mc", q:"Која линија се компајлира?", opts:["Integer c = (Integer) context.getAttribute(\"count\");","Integer c = context.getAttribute(\"count\");","int c = context.getParameter(\"count\");","context.setParameter(\"count\", 5);"], ans:[0], exp:"getAttribute враќа Object, затоа треба cast. ServletContext нема getParameter/setParameter (има getInitParameter, само за читање)."}
  ]
},
{
  id:"context", num:"2.5.2", title:"ServletContext (апликациски опсег)", sub:"Една заедничка табла за целата апликација.", deep:true,
  diagram:null,
  script:`
<h2>Што е ServletContext</h2>
<p>При иницијализација на апликацијата, <b>пред сервлетите</b>, контејнерот креира <b>една</b> инстанца од <code>ServletContext</code>. Таа чува референци кон апликациските параметри (од web.xml) и кон атрибути што се додаваат во текот на животот на апликацијата. Централен објект преку кој комуницираат сите компоненти.</p>
<p>Пристап, два начина:</p>
${C(`
ServletContext context1 = getServletContext();                 // од GenericServlet / HttpServlet
ServletContext context2 = getServletConfig().getServletContext(); // преку ServletConfig`)}
<h2>Контекстни параметри</h2>
<p>Се дефинираат <b>само во web.xml</b>, во <code>&lt;context-param&gt;</code> директно под <code>&lt;web-app&gt;</code>:</p>
${C(`
<context-param>
  <param-name>admin-user</param-name>
  <param-value>administrator</param-value>
</context-param>`)}
<p>Читање: <code>getInitParameter(String name)</code> и <code>getInitParameterNames()</code>, исто како кај ServletConfig.</p>
<h2>Контекстни атрибути</h2>
${C(`
public void setAttribute(String name, Object object) // ако постои: ажурира, ако не: додава
public Object getAttribute(String name)              // враќа Object -> cast
public void removeAttribute(String name)             // или setAttribute(name, null)`)}
<p>Додавањето атрибут се вика <b>поврзување (binding)</b>. Секој сервлет и секој корисник го гледа истиот атрибут. Контекстните атрибути <b>не се thread safe</b> (повеќе нишки ги менуваат истовремено).</p>
${C(`
@WebServlet("/cart")
public class ShoppingCartServlet extends HttpServlet {
  public void init() { getServletContext().setAttribute("cartVisits", 0); }
  public void doGet(HttpServletRequest req, HttpServletResponse resp) {
    Integer visits = (Integer) getServletContext().getAttribute("cartVisits");
    getServletContext().setAttribute("cartVisits", ++visits);
  }
  public void destroy() { getServletContext().removeAttribute("cartVisits"); }
}`)}
<h2>Настани и опсервери</h2>
<ul>
<li>Креирање/уништување на контекстот → настан <code>ServletContextEvent</code> (носи ServletContext) → опсервер <code>ServletContextListener</code> со <code>contextInitialized(e)</code> и <code>contextDestroyed(e)</code>. Регистрација со <code>@WebListener</code> или во web.xml.</li>
<li>Додавање/промена/бришење контекстен атрибут → <code>ServletContextAttributeEvent</code> (контекст, име, вредност) → <code>ServletContextAttributeListener</code> (attributeAdded, attributeReplaced, attributeRemoved).</li>
</ul>
<div class="key">Правилното место за почетни вредности на контекстни атрибути е <code>contextInitialized()</code>, бидејќи се извршува пред да постои било кој сервлет. <code>contextDestroyed()</code> е за зачувување пред гасење.</div>
<h2>Кога е соодветен</h2>
<p>Податоци исти за сите: подржани валути за плаќање, контакт информации за страната, конекција до база, глобален бројач посети.</p>
<h2>Во Spring</h2>
<p>Spring има свој <b>ApplicationContext</b> кој не само што чува податоци, туку управува и со компонентите (креирање, зависности). Конфигурациските параметри одат во <code>application.properties</code> и се читаат со анотации.</p>
`,
  questions:[
    {type:"mc", multi:true, q:"Во кои сценарија логично е атрибутите да се чуваат во ServletContext (application scope)?", opts:["Подржани валути за плаќање","Контакт информации за страната","ID на тековната сесија","Корисничкото име при најава","Јазикот на корисникот","Резултати од пребарување"], ans:[0,1], exp:"Во контекстот иде само она што е исто за сите корисници. Корисничко име и јазик се за сесија, резултати од пребарување за барање."},
    {type:"mc", multi:true, q:"Различни корисници од различни прелистувачи имаат пристап до ист податок зачуван во:", opts:["ServletContext (application context)","Session","Request","Query String","Cookie"], ans:[0], exp:"Само контекстот е глобален. Сесија и cookie се по корисник/прелистувач, request и query string по барање."},
    {type:"mc", q:"Каде се дефинира контекстен (апликациски) параметар?", opts:["Во web.xml, во <context-param> под <web-app>","Во @WebServlet(initParams=...)","Во HttpSession","Во query string на барањето"], ans:[0], exp:"initParams во @WebServlet се параметри на сервлетот (ServletConfig), не на контекстот."},
    {type:"mc", q:"Кога контејнерот го креира ServletContext?", opts:["При старт на апликацијата, пред сервлетите","При првото барање до некој сервлет","При креирање на секоја сесија","По повикот на destroy()"], ans:[0], exp:"Контекстот постои пред сервлетите и ги надживува."},
    {type:"mc", q:"Сакаш атрибутот app-counter = 0 да постои пред било кое барање. Каде е најдобро да го поставиш?", opts:["Во contextInitialized() на ServletContextListener","Во init() на еден од сервлетите","Во doGet() при првото барање","Во requestInitialized()"], ans:[0], exp:"init() на сервлет се извршува дури при прво барање до ТОЈ сервлет. contextInitialized е при старт на апликацијата."},
    {type:"mc", q:"Што се случува кога ќе повикаш context.setAttribute(\"x\", null)?", opts:["Атрибутот x се отстранува","Се фрла NullPointerException","x останува со старата вредност","Се креира параметар x"], ans:[0], exp:"Поставување null вредност е еквивалентно на removeAttribute."}
  ]
},
{
  id:"config", num:"2.5.3", title:"ServletConfig (сервлетски опсег)", sub:"Конфигурација залепена само на еден сервлет.", deep:true,
  diagram:null,
  script:`
<h2>Што е ServletConfig</h2>
<p>При креирање на <b>секој</b> сервлет контејнерот креира и негов <code>ServletConfig</code>, со параметрите дефинирани само за тој сервлет. Се предава на <code>init(ServletConfig)</code>. Параметрите се читаат <b>еднаш</b> и <b>не се менуваат во кодот</b>. Не се споделуваат со други сервлети.</p>
<p>Дефиниција со анотација или во <code>&lt;init-param&gt;</code> внатре во <code>&lt;servlet&gt;</code> во web.xml:</p>
${C(`
@WebServlet(name = "Servlet1", value = "/s1",
    initParams = {@WebInitParam(name = "pages", value = "10")})
public class ScopeServlet1 extends HttpServlet { ... }`)}
<p>Методи:</p>
${C(`
ServletConfig config = getServletConfig();
String pages = config.getInitParameter("pages");     // секогаш String
Enumeration<String> names = config.getInitParameterNames();
String name = config.getServletName();
ServletContext ctx = config.getServletContext();      // мостот кон контекстот`)}
<div class="trap"><b>Замка на тестот:</b> ServletConfig <b>нема</b> <code>setAttribute</code> ни <code>getAttribute</code>. <code>config.setAttribute("day", 100)</code> е грешка.</div>
<div class="tbl-wrap"><table>
<tr><th></th><th>ServletConfig</th><th>ServletContext</th></tr>
<tr><td>Колку има</td><td>по еден за <b>секој сервлет</b></td><td><b>еден</b> за цела апликација</td></tr>
<tr><td>Содржи</td><td>само параметри</td><td>параметри + атрибути</td></tr>
<tr><td>Дефиниција</td><td><code>@WebInitParam</code> или <code>&lt;init-param&gt;</code> во <code>&lt;servlet&gt;</code></td><td><code>&lt;context-param&gt;</code></td></tr>
<tr><td>Креиран</td><td>при иницијализација на сервлетот</td><td>при старт на апликацијата</td></tr>
</table></div>
<p>Во пракса параметрите на сервлет ретко се користат (во слајдовите стои „застарено“), но ServletConfig е важен затоа што има референца кон ServletContext.</p>
<div class="analogy"><b>Аналогија:</b> ServletConfig е налепница на една машина за кафе („макс. 10 чаши“). Секоја машина има своја. ServletContext е огласната табла во ходникот која ја гледаат сите.</div>
`,
  questions:[
    {type:"mc", multi:true, q:"Во doGet се дефинирани session, context и config. Кои линии се исправни Java код?", opts:["session.setAttribute(\"size\", 100);","context.setAttribute(\"page\", new Date());","config.getInitParameter(\"day\");","Integer s = (Integer) session.getAttribute(\"size\");","config.setAttribute(\"day\", 100);","Integer s = session.getAttribute(\"size\");"], ans:[0,1,2,3], exp:"config нема setAttribute. Без cast getAttribute враќа Object и не може директно во Integer."},
    {type:"mc", q:"Servlet1 има @WebInitParam pages=10, Servlet2 има pages=20. И двата во doGet печатат config.getInitParameter(\"pages\"). Што печати барањето /s2?", opts:["20","10","30","null, бидејќи името се повторува"], ans:[0], exp:"Секој сервлет има свој ServletConfig, па исто име на параметар не е проблем."},
    {type:"mc", q:"Колку ServletConfig објекти има апликација со 5 сервлети?", opts:["5","1","Зависи од бројот на барања","0, ако се користат анотации"], ans:[0], exp:"По еден за секој сервлет, креиран при неговата иницијализација."},
    {type:"mc", q:"Како од ServletConfig стигнуваш до апликацискиот контекст?", opts:["config.getServletContext()","config.getContext()","config.getAttribute(\"context\")","Не може, мора преку сесија"], ans:[0], exp:"ServletConfig содржи референца кон ServletContext, затоа getServletConfig().getServletContext() работи."},
    {type:"mc", q:"Што враќа config.getInitParameter(\"pages\") ако pages е дефиниран со вредност 10?", opts:["String \"10\"","int 10","Integer 10","Object кој треба cast во int"], ans:[0], exp:"Параметрите се секогаш String. Затоа во примерот се користи Integer.parseInt(...)."}
  ]
},
{
  id:"request", num:"2.5.4", title:"Опсег на барање", sub:"Податоци што живеат колку што трае едно барање.", deep:true,
  diagram:null,
  script:`
<h2>Параметри на барање</h2>
<p>За секое барање контејнерот креира нов <code>HttpServletRequest</code>. Параметрите доаѓаат од клиентот: од <b>query string</b> во URL или од <b>телото на форма</b> (POST). Само се читаат:</p>
${C(`
public String getParameter(String name)        // null ако не постои
public Enumeration getParameterNames()
public String[] getParameterValues(String name) // за повеќе вредности (checkbox)`)}
<p>Пример: за <code>/products/software?page=2</code>, <code>request.getParameter("page")</code> враќа <code>"2"</code> како String. За <code>&lt;input name="user"&gt;</code> во форма: <code>request.getParameter("user")</code>.</p>
<h2>Атрибути на барање</h2>
<p>Истите три методи <code>setAttribute / getAttribute / removeAttribute</code>. Атрибутот живее <b>додека постои барањето</b>, само на серверот, не оди назад кон клиентот. Има смисла <b>само ако барањето го проследуваш</b> (forward / include) кон друг сервлет или view (JSP, Thymeleaf). Инаку, по <code>service()</code> контејнерот го брише барањето.</p>
${C(`
// LoginServlet (doPost)
request.setAttribute("luckyUser", random.nextBoolean());
request.getRequestDispatcher("home").forward(request, response);

// HomeServlet МОРА да има doPost, бидејќи forward го задржува методот POST
Boolean luckyUser = (Boolean) request.getAttribute("luckyUser");
out.println("Welcome " + request.getParameter("username"));`)}
<div class="trap"><b>Замка:</b> request атрибут + <code>sendRedirect</code> = атрибутот го нема. Redirect значи прелистувачот прави <b>ново барање</b>, со нов request објект. Со forward барањето е исто.</div>
<div class="key">Request атрибутите се <b>thread safe</b>: едно барање го обработува една нишка. Session и context атрибутите не се.</div>
<h2>Настани</h2>
<ul>
<li>Креирање/бришење барање → <code>ServletRequestEvent</code> (референца кон барањето, а преку него и до контекстот) → <code>ServletRequestListener</code>: <code>requestInitialized(e)</code>, <code>requestDestroyed(e)</code>.</li>
<li>Промена на атрибут на барање → <code>ServletRequestAttributeEvent</code> → <code>ServletRequestAttributeListener</code>.</li>
</ul>
<p>requestInitialized се извршува <b>пред</b> барањето да стигне до сервлетот, requestDestroyed откако ќе се обработи, пред одговорот да оди кон веб серверот.</p>
<h2>Во Spring MVC</h2>
<p>Spring позадински ги чита и конвертира. Во контролер: <code>@RequestParam</code>, <code>@RequestAttribute</code>, или директно <code>HttpServletRequest request</code> како аргумент. Правилата остануваат исти.</p>
`,
  questions:[
    {type:"mc", q:"ServletA поставува request.setAttribute(\"msg\", \"Hi\") и потоа повикува response.sendRedirect(\"b\"). Што враќа request.getAttribute(\"msg\") во ServletB?", opts:["null","\"Hi\"","Се фрла ClassCastException","\"Hi\", но само ако е GET"], ans:[0], exp:"Redirect генерира сосема ново барање од прелистувачот, со нов празен request."},
    {type:"mc", q:"LoginServlet во doPost прави forward кон HomeServlet. Кој метод мора да го има HomeServlet?", opts:["doPost","doGet","service мора да се препокрие","Било кој, forward секогаш вика doGet"], ans:[0], exp:"RequestDispatcher.forward го задржува HTTP методот на оригиналното барање."},
    {type:"mc", q:"Што враќа request.getParameter(\"page\") за URL /list (без query string)?", opts:["null","\"\" (празен стринг)","0","Се фрла исклучок"], ans:[0], exp:"Ако параметарот не постои, getParameter враќа null. (Integer.parseInt(null) потоа фрла исклучок.)"},
    {type:"mc", q:"Кои атрибути се thread safe?", opts:["Атрибутите на барање","Атрибутите на сесија","Атрибутите на контекст","Сите три"], ans:[0], exp:"Барањето го обработува една нишка. Сесијата може да ја користат два таба истовремено, а контекстот сите."},
    {type:"mc", multi:true, q:"Како во Spring MVC контролер стигнуваш до податоци од барањето?", opts:["@RequestParam","@RequestAttribute","HttpServletRequest request како аргумент на методот","@RequestSession"], ans:[0,1,2], exp:"@RequestSession не постои."},
    {type:"mc", q:"Кога се повикува requestInitialized() на ServletRequestListener?", opts:["Кога контејнерот ќе го креира request објектот, пред сервлетот","Кога сервлетот ќе повика getParameter","По испраќањето на одговорот","Само при првото барање во апликацијата"], ans:[0], exp:"Се повикува за СЕКОЕ барање, веднаш по креирањето на HttpServletRequest, пред сервлетот."}
  ]
},
{
  id:"session", num:"2.5.5", title:"Сесиски опсег", sub:"Како stateless HTTP ќе те памти тебе.", deep:true,
  diagram:null,
  script:`
<h2>Проблемот</h2>
<p>HTTP не знае дали две барања се од ист клиент. Решението се <b>колачиња</b>: серверот праќа уникатен ID, прелистувачот го враќа во секое следно барање. Рачно тоа би значело: креирај мемориски простор, уникатен ID, колаче, животен век, провери колаче на секое барање. Во Java EE сето ова го прави <b>контејнерот</b>, преку објекти <code>HttpSession</code>.</p>
<div class="analogy"><b>Аналогија:</b> гардероба. Ти даваат број (колаче <code>JSESSIONID</code>), јакната (твоите податоци) останува кај нив. Со бројот секогаш ја добиваш својата јакна. Изгубиш број (друг прелистувач, incognito, избришани колачиња) и тие немаат поим која е твоја.</div>
<h2>getSession()</h2>
${C(`
HttpSession s1 = request.getSession();       // = getSession(true)
HttpSession s2 = request.getSession(false);  // null ако нема сесија`)}
<ul>
<li><code>getSession()</code>: проверува дали барањето има колаче <b>JSESSIONID</b>. Ако нема (или е невалидно), креира нова сесија со уникатен ID, става колаче JSESSIONID во одговорот и ја враќа. Ако има, ја враќа постоечката.</li>
<li><code>getSession(false)</code>: <b>никогаш не креира</b>. Ако нема сесија враќа <b>null</b>. За „само ако веќе е најавен“.</li>
</ul>
<h2>Атрибути (нема параметри)</h2>
${C(`
session.setAttribute("user", username);
String user = (String) session.getAttribute("user");
session.removeAttribute("user");
session.isNew();        // true ако штотуку е креирана
session.invalidate();   // ја уништува (одјава)`)}
<p>Животен век: стандардно <b>30 минути</b> неактивност, се менува во web.xml (<code>&lt;session-timeout&gt;</code>, во минути).</p>
${C(`
// login: успешна најава -> сесија + redirect
HttpSession session = request.getSession();
session.setAttribute("user", username);
response.sendRedirect("home");

// home: дали поминал низ login?
HttpSession session = request.getSession();
if (session.isNew()) response.sendRedirect("/login.html");
else out.println("Welcome " + (String) session.getAttribute("user"));`)}
<div class="key">Сесијата преживува redirect (колачето се праќа и во новото барање). Затоа по најава се користи session + redirect.</div>
<h2>Посебни случаи</h2>
<ul>
<li>Колачињата се <b>исклучени</b> во прелистувачот → секое <code>getSession()</code> креира нова сесија.</li>
<li><b>Incognito</b>: свои колачиња, работи додека е отворен прозорот, а по затворање колачето се брише.</li>
<li><b>Друг прелистувач</b> = друг корисник = друга сесија.</li>
<li>Сесиските атрибути <b>не се thread safe</b> (два таба истовремено).</li>
</ul>
<h2>Настани</h2>
<ul>
<li>Креирање/бришење сесија → <code>HttpSessionEvent</code> → <code>HttpSessionListener</code>: <code>sessionCreated(e)</code>, <code>sessionDestroyed(e)</code>.</li>
<li>Промена на сесиски атрибути → <code>HttpSessionBindingEvent</code> (сесија, име, вредност) → <code>HttpSessionAttributeListener</code>.</li>
</ul>
<h2>Во Spring MVC</h2>
<p>Аргумент <code>HttpSession session</code>, или <code>HttpServletRequest</code> па <code>request.getSession()</code>, или <code>@SessionAttribute(name="user")</code>.</p>
`,
  questions:[
    {type:"mc", q:"Како се вика колачето со кое контејнерот ја идентификува сесијата?", opts:["JSESSIONID","SESSION_ID","JSESSION_TOKEN","SID"], ans:[0], exp:"JSESSIONID, а вредноста е уникатниот идентификатор на сесијата."},
    {type:"mc", q:"Корисникот нема сесија. Што враќа request.getSession(false)?", opts:["null","Нова сесија","Фрла IllegalStateException","Празна сесија со isNew() = false"], ans:[0], exp:"getSession(false) никогаш не креира нова сесија."},
    {type:"mc", multi:true, q:"Треба да пристапиме до сесиски атрибут \"user\" во мапиран метод во Spring MVC. Во кои потписи е тоа можно?", opts:["question(HttpServletRequest request)","question(ServletContext context)","question(HttpSession session, ServletContext context)","question(@Session HttpSession session)","question(@SessionAttribute(name=\"user\") Object user)"], ans:[0,2,4], exp:"Преку request.getSession(), директно HttpSession, или @SessionAttribute. ServletContext не е сесијата, а @Session не постои."},
    {type:"mc", q:"Колку е стандардното траење на сесија (неактивност)?", opts:["30 минути","1 час","Додека не се затвори серверот","5 минути"], ans:[0], exp:"30 минути. Се менува со session-timeout во web.xml, во минути."},
    {type:"sort", q:"Поврзи го настанот со опсерверот што го обработува.", cats:["ServletContextListener","ServletRequestListener","HttpSessionListener","HttpSessionAttributeListener"], items:[["ServletContextEvent","ServletContextListener"],["ServletRequestEvent","ServletRequestListener"],["HttpSessionEvent","HttpSessionListener"],["HttpSessionBindingEvent","HttpSessionAttributeListener"],["contextInitialized(e)","ServletContextListener"],["sessionCreated(e)","HttpSessionListener"],["requestDestroyed(e)","ServletRequestListener"]], exp:"Шаблон: XxxEvent → XxxListener. Исклучок што се памти: настанот за сесиски атрибути е HttpSessionBindingEvent."},
    {type:"mc", q:"Корисник е најавен во Chrome. Ја отвора истата апликација во Firefox. Што враќа session.isNew() во Firefox при првото барање?", opts:["true, нова сесија (Firefox нема JSESSIONID)","false, сесијата е иста","null","Зависи од корисничкото име"], ans:[0], exp:"Сесијата е врзана за колачето во прелистувачот, не за корисникот."}
  ]
},
{
  id:"scopes", num:"2.5.6 · 2.5.7", title:"Преглед на опсези + вежба", sub:"Симулатор на вежбата од книгата: s1, s2, s3 и incognito.", deep:true,
  diagram:"scopesim",
  script:`
<h2>2.5.6 Сè на едно место</h2>
<div class="tbl-wrap"><table>
<tr><th>Опсег</th><th>Што има</th><th>Кој ги гледа истите вредности</th><th>Колку живее</th></tr>
<tr><td><b>Контекст</b></td><td>параметри (web.xml) + атрибути (код)</td><td>сите барања, сите клиенти, сите сервлети</td><td>цел живот на апликацијата</td></tr>
<tr><td><b>Сервлет</b></td><td>само параметри (web.xml или @WebServlet)</td><td>сите барања до <b>тој</b> сервлет</td><td>животот на сервлетот</td></tr>
<tr><td><b>Сесија</b></td><td>само атрибути (код)</td><td>сите барања од <b>еден клиент</b>, кон било кој сервлет</td><td>до invalidate() или истек (30 мин)</td></tr>
<tr><td><b>Барање</b></td><td>параметри (клиент) + атрибути (код)</td><td>само компонентите низ кои минува <b>тоа барање</b> (forward)</td><td>најкратко, само додека се обработува</td></tr>
</table></div>
<h2>2.5.7 Вежбата од книгата (се повторува на колоквиум!)</h2>
<ul>
<li><code>MyContextListener.contextInitialized</code>: <code>app-counter = 0</code> (еднаш, при старт).</li>
<li><code>MySessionListener.sessionCreated</code>: <code>user-counter = 0</code> (за секоја нова сесија).</li>
<li><code>MyRequestListener.requestInitialized</code>: <code>req-counter = 0</code> (за секое ново барање).</li>
<li>web.xml: context-param <code>size = 100</code>.</li>
<li><b>Servlet1</b> <code>/s1</code>, initParam <code>pages = 10</code>. <b>Servlet2</b> <code>/s2</code>, <code>pages = 20</code>. Двата во doGet ги зголемуваат app, user и req бројачите за 1 и ги печатат.</li>
<li><b>Servlet3</b> <code>/s3</code>: само <code>req-counter++</code>, па <code>forward("/s1?page=3")</code>.</li>
</ul>
<div class="key"><b>Постапка за решавање:</b> (1) контекстен бројач = вкупен број повици од <i>сите</i> корисници. (2) сесиски = повици само од <i>тој прелистувач</i>. (3) бројач на барање = колку сервлети го допреле <i>истото</i> барање (1, или 2 кога има forward). (4) параметар од config = на кој сервлет е <i>завршило</i> барањето. (5) параметар од барањето = што е во URL (кај forward, URL-от од forward).</div>
<p>Пробај долу: кликни линкови, смени прелистувач, и предвиди ги бројките <b>пред</b> да кликнеш.</p>
`,
  questions:[
    {type:"mc", q:"Ист прелистувач, свежо стартувана апликација: /s1?page=1, /s2?page=2, /s3. Што печати последното барање?", opts:["Servlet1: configPages=10 requestPage=3 | appCounter=3 userCounter=3 requestCounter=2","Servlet3: configPages=10 requestPage=3 | appCounter=3 userCounter=3 requestCounter=1","Servlet1: configPages=20 requestPage=3 | appCounter=3 userCounter=3 requestCounter=2","Servlet1: configPages=10 requestPage=1 | appCounter=2 userCounter=2 requestCounter=2"], ans:[0], exp:"Servlet3 го зголемува req на 1 и прави forward кон Servlet1 (pages=10, page=3 од URL-от на forward), кој го зголемува req на 2. app и user се 3 бидејќи Servlet3 не ги допира."},
    {type:"mc", q:"По 4 барања од нормалниот прелистувач, корисник отвора incognito и кликнува /s1?page=1. Бројачите се:", opts:["appCounter=5 userCounter=1 requestCounter=1","appCounter=5 userCounter=5 requestCounter=1","appCounter=1 userCounter=1 requestCounter=1","appCounter=4 userCounter=1 requestCounter=1"], ans:[0], exp:"Контекстот е заеднички (5). Incognito нема JSESSIONID, па се креира нова сесија и sessionCreated го поставува user на 0, па 1."},
    {type:"mc", q:"Зошто requestCounter е 1 за секое директно барање до /s1 или /s2?", opts:["requestInitialized го поставува на 0 за секое ново барање","Сервлетот го ресетира во init()","Сесијата го брише по секое барање","Затоа што е параметар, не атрибут"], ans:[0], exp:"Секое ново барање е нов request објект, а listener-от го поставува атрибутот на 0. Само со forward истото барање минува низ два сервлети."},
    {type:"mc", q:"Колоквиумска варијанта: page е контекстен атрибут, почетно 20. Сервлет /d2 го зголемува за 10. Клиент 1 повикува /d2 еднаш, клиент 2 повикува /d2 двапати. Колку е page?", opts:["50","30","40","20"], ans:[0], exp:"20 + 10 + 10 + 10 = 50. Контекстот се споделува помеѓу сите клиенти."},
    {type:"mc", q:"Истата задача: size е сесиски атрибут, почетно 10, /d2 го зголемува за 5. Колку е size за клиент 1 (кој повикал /d2 еднаш)?", opts:["15","25","10","20"], ans:[0], exp:"Сесијата е по клиент, повиците на клиент 2 не влијаат. 10 + 5 = 15."},
    {type:"sort", q:"Поврзи: кој има пристап до податокот?", cats:["Контекст","Сервлет (Config)","Сесија","Барање"], items:[["Сите клиенти, сите сервлети","Контекст"],["Сите клиенти, но само еден сервлет","Сервлет (Config)"],["Еден клиент, сите сервлети","Сесија"],["Само компонентите низ кои минува едно барање","Барање"],["Корисничко име по најава","Сесија"],["Резултати од пребарување за приказ во view","Барање"]], exp:"Корисничкото име важи низ сите страници за еден корисник (сесија). Резултатите се потребни само за еден приказ (барање, па forward кон view)."}
  ]
},
{
  id:"filters", num:"2.6 · 2.6.1", title:"Филтри и нивна конфигурација", sub:"Код што се извршува пред и после сервлетот, без да го допираш сервлетот.", deep:true,
  diagram:"filtermap",
  script:`
<h2>Што е филтер</h2>
<p>Модуларна компонента управувана од контејнерот. Се вклучува со конфигурација, слично како сервлетите, но е <b>независна од нив</b>: се додава и вади без промена на кодот на апликацијата. Го пресретнува барањето <b>пред</b> сервлетот (pre-processing) и одговорот <b>после</b> сервлетот (post-processing). Технички и двата објекта патуваат во двете насоки.</p>
<p>Зошто? Без филтри, проверка на привилегии, логирање на параметри, компресија на одговорот, страна за забранет пристап... би морале да се пишуваат <b>во секој сервлет посебно</b>. Со филтри: еден филтер за секоја намена.</p>
<p>Типична употреба: <b>автентикација, логирање, валидација на влез, конверзија, компресија/декомпресија</b>.</p>
<h2>Верига (chain)</h2>
<p>Повеќе филтри се повикуваат еден по друг. Барањето оди F1 → F2 → сервлет, а одговорот се враќа <b>во обратен редослед</b>: сервлет → F2 → F1. Последниот што го видел барањето е прв што го гледа одговорот.</p>
<div class="analogy"><b>Аналогија:</b> аеродром. Влегуваш: проверка на билет, безбедност, пасош, па авион (сервлет). Кога се враќаш, минуваш низ истите точки во обратен редослед.</div>
<p>Стандардно филтрите се применуваат <b>само на барања директно од клиентот</b>. За forward/include мора да се конфигурира.</p>
<h2>Конфигурација во web.xml</h2>
${C(`
<filter>
  <filter-name>timer</filter-name>
  <filter-class>mk.ukim.finki.TimerFilter</filter-class>
  <init-param>
    <param-name>timeout</param-name>
    <param-value>2000</param-value>
  </init-param>
</filter>
<filter-mapping>
  <filter-name>timer</filter-name>
  <url-pattern>/*</url-pattern>
  <dispatcher>REQUEST</dispatcher>
  <dispatcher>FORWARD</dispatcher>
</filter-mapping>
<filter-mapping>
  <filter-name>cartLogger</filter-name>
  <servlet-name>cart</servlet-name>
</filter-mapping>`)}
<ul>
<li><code>&lt;filter-name&gt;</code>: име на претходно дефиниран филтер.</li>
<li><code>&lt;url-pattern&gt;</code>: URL што го активира, <b>или</b></li>
<li><code>&lt;servlet-name&gt;</code>: името на сервлетот за кој е барањето (може листа одвоена со запирка). Ова сервлетите го немаат: тие се мапираат само по URL.</li>
<li><code>&lt;dispatcher&gt;</code>: <b>REQUEST</b> (директно од клиент, стандардно), <b>FORWARD</b> (од forward()), <b>INCLUDE</b> (од include()), <b>ERROR</b> (кон конфигурирана страница за грешки; ако таква нема во web.xml, филтерот не се активира).</li>
</ul>
<h2>Редослед на веригата</h2>
<div class="key">Кај <b>сервлетите</b> барањето оди кај <b>еден</b> сервлет, оној со најдобро совпаѓање. Кај <b>филтрите</b> барањето оди кај <b>сите</b> што се совпаѓаат, по редоследот на мапирањата во web.xml: <b>прво</b> се минуваат сите мапирања со <code>&lt;url-pattern&gt;</code> по ред, <b>потоа</b> одново сите со <code>&lt;servlet-name&gt;</code>.</div>
<h2>Со анотација</h2>
${C(`
@WebFilter(
    filterName = "timer",
    urlPatterns = "/*",
    dispatcherTypes = {DispatcherType.REQUEST, DispatcherType.FORWARD},
    initParams = { @WebInitParam(name = "timeout", value = "2000") })
public class TimerFilter implements Filter { ... }`)}
<p>Параметри на @WebFilter: <code>filterName</code>, <code>urlPatterns</code>, <code>servletNames</code>, <code>dispatcherTypes</code>, <code>initParams</code>.</p>
`,
  questions:[
    {type:"mc", q:"Со мапирањата од примерот 2.22 (F1→S1, F2→S2, F3 /cart/actions/*, F4 /cart/actions/delete, F5 /cart/*), кој е редоследот на веригата за /cart/actions/delete?", opts:["F3, F4, F5","F4, F3, F5","F5, F3, F4","F3, F5, F4"], ans:[0], exp:"Сите три се url-pattern мапирања што се совпаѓаат, па се додаваат по редоследот во web.xml. Ниту S1 ниту S2 не е мапиран на delete, па F1/F2 отпаѓаат."},
    {type:"mc", q:"Ако во <filter-mapping> нема ниту еден <dispatcher>, филтерот се активира за:", opts:["Барања директно од клиентот (REQUEST)","Сите типови барања","Само FORWARD","Ниту едно барање"], ans:[0], exp:"REQUEST е предефинираното однесување."},
    {type:"mc", q:"Филтерот timer е мапиран на /* со REQUEST и FORWARD. Клиентот бара ServletA, кој прави forward кон ServletB. Колку пати се извршува timer?", opts:["2 пати","1 пат","0 пати","3 пати"], ans:[0], exp:"Еднаш за директното барање (REQUEST) и уште еднаш за forward-от (FORWARD)."},
    {type:"mc", q:"Кој е редоследот на слоевите низ кои минува едно барање во веб апликација?", opts:["Filter → Web (контролер) → Service → Persistence","Web → Filter → Service → Persistence","Service → Filter → Web → Persistence","Persistence → Service → Web → Filter"], ans:[0], exp:"Прво филтрите, па веб слојот со контролерите, па бизнис логиката, па репозиториумот/базата."},
    {type:"mc", multi:true, q:"За што се типично користат филтри?", opts:["Автентикација","Логирање на барања и одговори","Компресија на одговорот","Генерирање на HTML листата на продукти","Валидација на влезни податоци"], ans:[0,1,2,4], exp:"Генерирањето содржина е работа на сервлетот (или контролерот + view)."},
    {type:"mc", q:"Веригата е A, B, C (по тој ред за барањето). Кој е редоследот за одговорот?", opts:["C, B, A","A, B, C","B, A, C","Само C"], ans:[0], exp:"Одговорот се враќа во обратен редослед."}
  ]
},
{
  id:"filterimpl", num:"2.6.2", title:"Имплементација на филтри", sub:"init, doFilter, destroy и магичниот chain.doFilter().", deep:true,
  diagram:"chain",
  script:`
<h2>Интерфејсот Filter</h2>
${C(`
public void init(FilterConfig config)
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
public void destroy()`)}
<ul>
<li><code>init()</code> и <code>destroy()</code>: <b>еднаш</b>, како кај сервлетите. <code>FilterConfig</code> има параметри на филтерот и референца кон ServletContext (аналогно на ServletConfig).</li>
<li><code>doFilter()</code>: при <b>секое</b> активирање. Тука е целата логика.</li>
<li>Аргументите се <b>генерички</b> <code>ServletRequest</code>/<code>ServletResponse</code>, не Http*, бидејќи филтрите не се врзани само за HTTP. За <code>getRequestURI()</code> и слично правиш <b>cast</b> во <code>HttpServletRequest</code>.</li>
</ul>
<h2>FilterChain</h2>
<p>Веригата ја креира контејнерот за секое барање, само со филтрите што се совпаѓаат. <code>FilterChain</code> има еден метод:</p>
${C(`public void doFilter(ServletRequest request, ServletResponse response)`)}
<p>Тој ги предава објектите на <b>следниот филтер</b>, или ако е последен, на <b>сервлетот</b>. Ако не го повикаш, барањето <b>не стигнува понатаму</b>: ниту до следните филтри ниту до сервлетот.</p>
<div class="trap"><b>Не мешај:</b> <code>Filter.doFilter(req, res, chain)</code> (3 аргументи) го повикува контејнерот при активирање. <code>FilterChain.doFilter(req, res)</code> (2 аргументи) го повикуваш ти <b>внатре</b> во првиот, за да продолжиш.</div>
${C(`
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
    // PRE-processing: пред следниот филтер / сервлетот
    chain.doFilter(req, res);
    // POST-processing: откако сервлетот завршил и одговорот се враќа назад
}`)}
<h2>Пример: timer и authenticator</h2>
${C(`
public class TimerFilter implements Filter {
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    long startTime = System.currentTimeMillis();
    chain.doFilter(request, response);
    long total = System.currentTimeMillis() - startTime;
    String name = ((HttpServletRequest) request).getRequestURI();
    context.log(name + " took " + total + " ms" + (total > timeout ? " (too long!)" : ""));
  }
}
public class AuthenticationFilter implements Filter {
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    HttpServletRequest req = (HttpServletRequest) request;
    if (req.getRequestURI().startsWith(ignorePath) || req.getUserPrincipal() != null)
      chain.doFilter(req, response);
    else
      req.getRequestDispatcher("login.html").forward(req, response);
  }
}`)}
<p>Timer е прв во web.xml (мапиран на <code>/*</code>), па е прв за барањето и последен за одговорот, и затоа го мери целото време. Authenticator, ако корисникот не е најавен, <b>не</b> вика <code>chain.doFilter</code> туку прави forward кон login.html.</p>
<p>По одговорот контејнерот ја брише <b>веригата</b> (низата референци), но не и самите филтри.</p>
`,
  questions:[
    {type:"mc", q:"Што се случува ако филтерот не повика chain.doFilter(req, res) и ништо друго?", opts:["Барањето не стигнува до следните филтри ниту до сервлетот","Контејнерот автоматски го повикува следниот филтер","Сервлетот се повикува, но без филтри","Се фрла исклучок при компајлирање"], ans:[0], exp:"chain.doFilter е единствениот начин барањето да продолжи. Така authenticator го блокира пристапот."},
    {type:"mc", q:"Filter A печати \"A1\" пред chain.doFilter и \"A2\" после. Filter B исто со \"B1\"/\"B2\". Сервлетот печати \"S\". Веригата е A, B. Што е излезот?", opts:["A1 B1 S B2 A2","A1 A2 B1 B2 S","A1 B1 S A2 B2","S A1 B1 B2 A2"], ans:[0], exp:"Pre-кодот оди напред по веригата, post-кодот назад во обратен редослед."},
    {type:"mc", q:"Кој е типот на request аргументот во Filter.doFilter()?", opts:["ServletRequest (треба cast за HTTP методи)","HttpServletRequest","HttpRequest","FilterRequest"], ans:[0], exp:"Генерички тип, бидејќи филтрите се дизајнирани и за не-HTTP апликации."},
    {type:"mc", q:"Колку пати се повикува init(FilterConfig) за еден филтер?", opts:["Еднаш, во животот на апликацијата","При секое барање","При секоја нова сесија","Двапати: при старт и при прво барање"], ans:[0], exp:"init и destroy по еднаш. doFilter при секое активирање."},
    {type:"sort", q:"Кој метод за што?", cats:["Filter.doFilter(req, res, chain)","FilterChain.doFilter(req, res)","init(FilterConfig)"], items:[["Го повикува контејнерот при секое активирање на филтерот","Filter.doFilter(req, res, chain)"],["Ги предава објектите на следниот филтер или сервлетот","FilterChain.doFilter(req, res)"],["Чита параметри како timeout","init(FilterConfig)"],["Ја содржи логиката за pre и post processing","Filter.doFilter(req, res, chain)"],["Се повикува внатре во логиката на филтерот","FilterChain.doFilter(req, res)"]], exp:"Еден е влезот во филтерот (3 аргументи), другиот е „продолжи понатаму“ (2 аргументи)."},
    {type:"mc", q:"Во TimerFilter, зошто endTime се зема ПОСЛЕ chain.doFilter()?", opts:["Тогаш сервлетот и сите следни филтри веќе завршиле","Затоа што пред тоа request е null","За да не се брои времето на филтерот","Затоа што init() се извршува пред тоа"], ans:[0], exp:"Кодот после chain.doFilter е post-processing: се извршува кога одговорот се враќа назад."}
  ]
}
];
const by = id => S.find(s => s.id === id);
LECTURES.push({id:"l2", short:"Л2", title:"Сервлети и филтри", deck:"02 Java EE Servlets and Filters",
  blurb:"Java EE, сервлет контејнер, животен циклус, redirect / forward / include, филтри.",
  sections:["java","container","servlets","filters","filterimpl"].map(by)});
LECTURES.push({id:"l3", short:"Л3", title:"Опсези и состојба", deck:"03 Java EE Scopes",
  blurb:"Параметри и атрибути, ServletContext, ServletConfig, барање, сесија, вежбата s1/s2/s3.",
  sections:["params","context","config","request","session","scopes"].map(by)});
Object.assign(DIAGRAMS, {
flow(el){
  const nodes = [["Прелистувач","клиент"],["Веб сервер","ServerSocket, порта"],["Сервлет контејнер","Tomcat"],["Филтри","0 или повеќе"],["Сервлет","service() → doGet()"]];
  const steps = [
    [0,"Прелистувачот праќа HTTP барање: GET /cart"],
    [1,"Веб серверот го прима преку ServerSocket, го чита барањето и според патеката го наоѓа контејнерот на таа апликација. Му дава текст + InputStream + OutputStream."],
    [2,"Контејнерот креира HttpServletRequest и HttpServletResponse, го избира сервлетот по URL и креира нова нишка."],
    [3,"Барањето минува низ сите филтри чие мапирање се совпаѓа (pre-processing)."],
    [4,"service() го гледа методот GET и вика doGet(). Сервлетот пишува HTML во response."],
    [3,"Одговорот се враќа низ филтрите во обратен редослед (post-processing)."],
    [2,"Контејнерот од response објектот прави HTTP одговор, ги брише request и response, нишката завршува."],
    [1,"Веб серверот го праќа HTTP одговорот кон клиентот."],
    [0,"Прелистувачот ја прикажува динамички генерираната страница."]
  ];
  let i = 0, timer=null;
  el.innerHTML = `<div class="section-title">Интерактивен дијаграм <span class="tag">пат на едно барање</span></div>
    <div class="flow">${nodes.map((n,k)=>`${k?'<div class="arrow">⇄</div>':""}<div class="node" data-n="${k}">${n[0]}<small>${n[1]}</small></div>`).join("")}</div>
    <div class="stepbox"><div class="sn"></div><div class="tx"></div></div>
    <div class="diag-controls"><button class="btn small" data-a="prev">← Назад</button><button class="btn small primary" data-a="next">Следно →</button><button class="btn small" data-a="play">Пушти</button></div>`;
  const draw = () => {
    el.querySelectorAll(".node").forEach(n => n.classList.toggle("on", +n.dataset.n===steps[i][0]));
    $(".sn",el).textContent = `Чекор ${i+1} / ${steps.length}`; $(".tx",el).textContent = steps[i][1];
  };
  el.querySelector('[data-a="prev"]').onclick = () => { i = Math.max(0,i-1); draw(); };
  el.querySelector('[data-a="next"]').onclick = () => { i = Math.min(steps.length-1,i+1); draw(); };
  el.querySelector('[data-a="play"]').onclick = e => {
    if (timer){ clearInterval(timer); timer=null; e.target.textContent="Пушти"; return; }
    e.target.textContent="Стоп"; i=0; draw();
    timer = setInterval(()=>{ if (!document.body.contains(el)) return clearInterval(timer); if (i>=steps.length-1){clearInterval(timer);timer=null;e.target.textContent="Пушти";return;} i++; draw(); }, 1800);
  };
  draw();
},
lifecycle(el){
  let inst = {}, deployed = true, threads = 0;
  el.innerHTML = `<div class="section-title">Симулатор <span class="tag">животен циклус на сервлет</span></div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:70ch">Прати барања и гледај кога се повикуваат init(), doGet()/doPost() и destroy(). Обрни внимание: init() само при прво барање до тој сервлет.</p>
    <div class="diag-controls">
      <button class="btn small" data-r="S1:GET">GET /s1</button>
      <button class="btn small" data-r="S1:POST">POST /s1</button>
      <button class="btn small" data-r="S2:GET">GET /s2</button>
      <button class="btn small" data-r="S1:PAR">5 паралелни GET /s1</button>
      <button class="btn small warn" data-a="stop">Стопирај апликација</button>
      <button class="btn small" data-a="deploy">Deploy пак</button>
    </div>
    <div class="sim"><div class="box"><h4>Инстанци</h4><div id="lcInst"></div></div><div class="box"><h4>Нишки сега</h4><div class="kv"><span>активни</span><span class="v" id="lcThr">0</span></div></div></div>
    <div class="console" id="lcLog" style="margin-top:10px"><span class="c-dim">// апликацијата е поставена, ниту еден сервлет не е иницијализиран</span><br></div>`;
  const log = (h) => { const L=$("#lcLog",el); L.insertAdjacentHTML("beforeend", h+"<br>"); L.scrollTop = L.scrollHeight; };
  const drawInst = () => { $("#lcInst",el).innerHTML = ["S1","S2"].map(s=>`<div class="kv"><span>Servlet${s[1]}</span><span class="v">${inst[s]?"1 инстанца":"нема"}</span></div>`).join(""); $("#lcThr",el).textContent=threads; };
  const req = (s, m) => {
    if (!deployed){ log(`<span class="c-des">✗ апликацијата не работи, барањето е одбиено</span>`); return; }
    if (!inst[s]){ log(`<span class="c-init">Servlet${s[1]}: класата се вчитува, 1 инстанца, init()</span>`); inst[s]=true; }
    threads++; drawInst();
    log(`<span class="c-svc">  [нишка] service() → do${m==="GET"?"Get":"Post"}() Servlet${s[1]}</span>`);
    setTimeout(()=>{ threads--; drawInst(); }, 600);
  };
  el.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
    const [s,m] = b.dataset.r.split(":");
    if (m==="PAR"){ for(let k=0;k<5;k++) req(s,"GET"); log(`<span class="c-dim">  // 5 нишки, но и понатаму само 1 инстанца</span>`); }
    else req(s,m);
  });
  el.querySelector('[data-a="stop"]').onclick = () => {
    if (!deployed) return;
    const live = Object.keys(inst); if (!live.length) log(`<span class="c-dim">нема иницијализирани сервлети, destroy() нема кај кого</span>`);
    live.forEach(s => log(`<span class="c-des">Servlet${s[1]}: destroy()</span>`));
    inst = {}; deployed=false; drawInst();
  };
  el.querySelector('[data-a="deploy"]').onclick = () => { inst={}; deployed=true; drawInst(); log(`<span class="c-dim">// нов deploy, сервлетите пак не се иницијализирани</span>`); };
  drawInst();
},
rfi(el){
  const data = {
    redirect:{url:["/login","/home"], rows:[
      [0,1,"POST /login (username, password)"],[1,0,"301 + Location: /home"],[0,2,"GET /home (НОВО барање, атрибутите од /login ги нема)",1],[2,0,"200 OK, HTML од /home"]],
      facts:[["Кој прави ново барање","Прелистувачот"],["URL на крај","/home (се менува)"],["Request атрибути","изгубени"],["Друг домен?","Да"],["Refresh","повторува само GET /home"]]},
    forward:{url:["/login","/login"], rows:[
      [0,1,"POST /login"],[1,2,"forward(req, res): исто барање, POST, параметри + атрибути"],[2,0,"200 OK, одговорот го праќа /home"]],
      facts:[["Кој прави ново барање","Никој, серверско"],["URL на крај","/login (не се менува)"],["Request атрибути","зачувани"],["Контрола","кај дестинацијата"],["Изворот после forward","не може да пишува"]]},
    include:{url:["/login","/login"], rows:[
      [0,1,"POST /login"],[1,2,"include(req, res): позајми содржина"],[2,1,"враќа: само тело (без статус и заглавја)",1],[1,0,"200 OK, одговорот го праќа /login"]],
      facts:[["Кој прави ново барање","Никој, серверско"],["URL на крај","/login (не се менува)"],["Request атрибути","зачувани"],["Контрола","останува кај изворот"],["Типично","header, footer, банер"]]}
  };
  let mode = "redirect", shown = 0;
  el.innerHTML = `<div class="section-title">Интерактивен дијаграм <span class="tag">redirect · forward · include</span></div>
    <div class="tabs">${Object.keys(data).map(k=>`<button class="tab" data-m="${k}">${k==="redirect"?"sendRedirect":k}</button>`).join("")}</div>
    <div class="urlbar"><span class="dot"></span><span id="rfUrl"></span></div>
    <div class="seq-wrap"><div class="seq" id="rfSeq"></div></div>
    <div class="diag-controls"><button class="btn small primary" data-a="next">Следна порака →</button><button class="btn small" data-a="all">Покажи сè</button></div>
    <div class="facts" id="rfFacts"></div>`;
  const draw = () => {
    const d = data[mode];
    el.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.m===mode));
    $("#rfUrl",el).textContent = "localhost:8080" + (shown>=d.rows.length ? d.url[1] : d.url[0]);
    const lanes = ["Прелистувач","/login (ServletA)","/home (ServletB)"];
    let h = lanes.map(l=>`<div class="lane-h">${l}</div>`).join("");
    d.rows.forEach((r,k) => {
      const a=Math.min(r[0],r[1]), b=Math.max(r[0],r[1]);
      h += `<div class="msg ${r[1]>r[0]?"r":"l"} ${r[3]?"warn":""} ${k<shown?"show":""}" style="grid-column:${a+1} / ${b+2}">${esc(r[2])}</div>`;
    });
    $("#rfSeq",el).innerHTML = h;
    $("#rfFacts",el).innerHTML = d.facts.map(f=>`<div class="fact"><b>${f[0]}</b>${f[1]}</div>`).join("");
  };
  el.querySelectorAll(".tab").forEach(t => t.onclick = () => { mode=t.dataset.m; shown=0; draw(); });
  el.querySelector('[data-a="next"]').onclick = () => { shown = Math.min(data[mode].rows.length, shown+1); draw(); };
  el.querySelector('[data-a="all"]').onclick = () => { shown = data[mode].rows.length; draw(); };
  draw();
},
scopesim(el){
  let S;
  const reset = () => { S = {app:0, inited:[], sessions:{normal:null, incog:null}, browser:"normal", lastReq:null, seq:{normal:"A1F3",incog:"9C07"}}; };
  reset();
  el.innerHTML = `<div class="section-title">Симулатор <span class="tag">вежба 2.5.7</span></div>
    <div class="diag-controls">
      <span class="seg" id="ssBr"><button data-b="normal">Нормален прелистувач</button><button data-b="incog">Incognito</button></span>
      <button class="btn small" data-a="closeInc">Затвори incognito</button>
      <button class="btn small warn" data-a="restart">Рестарт апликација</button>
    </div>
    <div class="diag-controls">
      <button class="btn small primary" data-u="s1">/s1?page=1</button>
      <button class="btn small primary" data-u="s2">/s2?page=2</button>
      <button class="btn small primary" data-u="s3">/s3</button>
    </div>
    <div class="browser"><div class="top"><span id="ssTab"></span><span id="ssUrl">localhost:8080/</span></div><div class="body" id="ssOut">Кликни линк. Пред тоа, предвиди ги бројките.</div></div>
    <div class="sim">
      <div class="box"><h4>ServletContext (сите)</h4><div class="kv"><span>param size</span><span class="v">100</span></div><div class="kv" id="ssApp"><span>attr app-counter</span><span class="v"></span></div></div>
      <div class="box"><h4>HttpSession (по прелистувач)</h4><div id="ssSess"></div></div>
      <div class="box"><h4>Последно барање</h4><div id="ssReq"></div></div>
      <div class="box"><h4>Сервлети (ServletConfig)</h4><div id="ssSrv"></div></div>
    </div>
    <div class="console" id="ssLog" style="margin-top:10px"></div>`;
  const log = h => { const L=$("#ssLog",el); L.insertAdjacentHTML("beforeend", h+"<br>"); L.scrollTop=L.scrollHeight; };
  const flash = id => { const n=$(id,el); if(!n) return; n.classList.remove("flash"); void n.offsetWidth; n.classList.add("flash"); };
  const draw = () => {
    el.querySelectorAll("#ssBr button").forEach(b=>b.classList.toggle("on", b.dataset.b===S.browser));
    $("#ssTab",el).textContent = S.browser==="normal" ? "[нормален]" : "[incognito]";
    $("#ssApp .v",el).textContent = S.app;
    $("#ssSess",el).innerHTML = ["normal","incog"].map(b => { const s=S.sessions[b]; return `<div class="kv" id="ss-${b}"><span>${b==="normal"?"нормален":"incognito"}</span><span class="v">${s?`JSESSIONID=${s.id} · user-counter=${s.uc}`:"нема сесија"}</span></div>`; }).join("");
    $("#ssReq",el).innerHTML = S.lastReq ? `<div class="kv"><span>param page</span><span class="v">${S.lastReq.page}</span></div><div class="kv"><span>attr req-counter</span><span class="v">${S.lastReq.rc}</span></div><div class="kv"><span>патека</span><span class="v">${S.lastReq.path}</span></div>` : `<div class="kv"><span>нема уште</span><span class="v">-</span></div>`;
    $("#ssSrv",el).innerHTML = [["Servlet1","pages=10"],["Servlet2","pages=20"],["Servlet3","без param"]].map(([n,p])=>`<div class="kv"><span>${n}</span><span class="v">${S.inited.includes(n)?p+" · init ✓":"неиниц."}</span></div>`).join("");
  };
  const initServlet = n => { if (!S.inited.includes(n)){ S.inited.push(n); log(`<span class="c-init">${n}.init()  (прво барање до него)</span>`); } };
  const getSession = () => {
    const b = S.browser;
    if (!S.sessions[b]){
      const id = (b==="normal"?"A":"C") + Math.random().toString(16).slice(2,6).toUpperCase();
      S.sessions[b] = {id, uc:0};
      log(`<span class="c-ev">getSession(): нема JSESSIONID → нова сесија ${id}, Set-Cookie</span>`);
      log(`<span class="c-ev">MySessionListener.sessionCreated → user-counter = 0</span>`);
    } else log(`<span class="c-dim">getSession(): JSESSIONID=${S.sessions[b].id} → постоечка сесија</span>`);
    return S.sessions[b];
  };
  const runScope = (name, pages, page, req) => {
    initServlet(name);
    const sess = getSession();
    S.app++; sess.uc++; req.rc++;
    log(`<span class="c-svc">${name}.doGet(): app-counter=${S.app}, user-counter=${sess.uc}, req-counter=${req.rc}</span>`);
    $("#ssOut",el).textContent = `${name}\nParameters: appSize = 100 configPages = ${pages} requestPage = ${page}\nAttributes: appCounter = ${S.app} userCounter = ${sess.uc} requestCounter = ${req.rc}`;
  };
  const go = u => {
    log(`<span class="c-dim">──── GET /${u}${u==="s3"?"":"?page="+u[1]} (${S.browser==="normal"?"нормален":"incognito"})</span>`);
    const req = {rc:0, page:u==="s3"?"(нема)":u[1], path:"/"+u};
    log(`<span class="c-ev">MyRequestListener.requestInitialized → req-counter = 0</span>`);
    $("#ssUrl",el).textContent = `localhost:8080/${u}${u==="s3"?"":"?page="+u[1]}`;
    if (u==="s1") runScope("Servlet1",10,1,req);
    else if (u==="s2") runScope("Servlet2",20,2,req);
    else {
      initServlet("Servlet3");
      req.rc++; log(`<span class="c-svc">Servlet3.doGet(): req-counter=${req.rc}, forward("/s1?page=3")</span>`);
      req.page = "3 (од forward)"; req.path = "/s3 → /s1";
      runScope("Servlet1",10,3,req);
    }
    S.lastReq = req;
    log(`<span class="c-ev">requestDestroyed (барањето и неговите атрибути се бришат)</span>`);
    draw(); flash("#ssApp"); flash("#ss-"+S.browser);
  };
  el.querySelectorAll("[data-u]").forEach(b => b.onclick = () => go(b.dataset.u));
  el.querySelectorAll("#ssBr button").forEach(b => b.onclick = () => { S.browser=b.dataset.b; draw(); });
  el.querySelector('[data-a="closeInc"]').onclick = () => { if (S.sessions.incog){ log(`<span class="c-des">incognito затворен: колачето JSESSIONID=${S.sessions.incog.id} е избришано во прелистувачот</span>`); } S.sessions.incog=null; S.browser="normal"; draw(); };
  el.querySelector('[data-a="restart"]').onclick = () => { reset(); $("#ssLog",el).innerHTML=""; $("#ssOut",el).textContent="Апликацијата е рестартирана."; start(); draw(); };
  const start = () => log(`<span class="c-ev">MyContextListener.contextInitialized → app-counter = 0</span>`);
  start(); draw();
},
filtermap(el){
  const maps = [
    {f:"F1", kind:"servlet", v:"S1"},
    {f:"F2", kind:"servlet", v:"S2"},
    {f:"F3", kind:"url", v:"/cart/actions/*"},
    {f:"F4", kind:"url", v:"/cart/actions/delete"},
    {f:"F5", kind:"url", v:"/cart/*"}
  ];
  const servletFor = {"/cart/actions/add":"S1","/cart/actions/edit":"S2"};
  const match = (p,u) => p.endsWith("/*") ? (u===p.slice(0,-2) || u.startsWith(p.slice(0,-1))) : p===u;
  el.innerHTML = `<div class="section-title">Интерактивно <span class="tag">кои филтри и по кој ред?</span></div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:70ch">Мапирањата од примерот 2.22. S1 е мапиран на /cart/actions/add, S2 на /cart/actions/edit. Избери URL и гледај ги двете поминувања.</p>
    <div class="diag-controls"><label for="fmUrl" style="font-weight:600;font-size:14px">URL на барањето</label>
      <select id="fmUrl"><option>/cart/actions/add</option><option>/cart/actions/edit</option><option>/cart/actions/delete</option><option>/cart/view</option></select></div>
    <div class="tbl-wrap"><table class="maptbl"><thead><tr><th>Ред во web.xml</th><th>Филтер</th><th>Мапирање</th><th>1. поминување (url-pattern)</th><th>2. поминување (servlet-name)</th></tr></thead><tbody id="fmBody"></tbody></table></div>
    <div><b style="font-size:14px">Верига:</b><div class="chain" id="fmChain"></div></div>`;
  const draw = () => {
    const u = $("#fmUrl",el).value, sv = servletFor[u];
    const chain = [];
    maps.forEach(m => { if (m.kind==="url" && match(m.v,u)) chain.push(m.f); });
    maps.forEach(m => { if (m.kind==="servlet" && m.v===sv) chain.push(m.f); });
    $("#fmBody",el).innerHTML = maps.map((m,k)=>{
      const p1 = m.kind==="url" ? (match(m.v,u)?"✓ се совпаѓа":"✗") : "прескокнато";
      const p2 = m.kind==="servlet" ? (m.v===sv?`✓ барањето оди кај ${sv}`:"✗") : "прескокнато";
      return `<tr><td>${k+1}</td><td><code>${m.f}</code></td><td><code>${m.kind==="url"?"url-pattern ":"servlet-name "}${m.v}</code></td>
        <td class="${m.kind!=="url"?"dim":match(m.v,u)?"hit":""}">${p1}</td><td class="${m.kind!=="servlet"?"dim":m.v===sv?"hit":""}">${p2}</td></tr>`;
    }).join("");
    $("#fmChain",el).innerHTML = (chain.length? chain.map(f=>`<span class="chip-f hit">${f}</span>`).join("→") : `<span class="chip-f miss">нема филтри</span>`) + `→<span class="chip-f">${sv?sv:"сервлет за "+u}</span>`;
  };
  $("#fmUrl",el).onchange = draw; draw();
},
chain(el){
  const timer = ["public void doFilter(req, res, chain) {","  long start = System.currentTimeMillis();","  chain.doFilter(req, res);","  long total = System.currentTimeMillis() - start;","  context.log(uri + \" took \" + total + \" ms\");","}"];
  const auth = ["public void doFilter(req, res, chain) {","  HttpServletRequest r = (HttpServletRequest) req;","  if (r.getUserPrincipal() != null)","    chain.doFilter(req, res);","  else","    r.getRequestDispatcher(\"login.html\").forward(req, res);","}"];
  const yes = [
    ["c",null,"POST /order од најавен корисник. Контејнерот креира верига [timer, authenticator] по редоследот во web.xml. cartLogger не се совпаѓа и не е во веригата."],
    ["timer",["t",1],"timer.doFilter(): PRE, се памети почетното време."],
    ["timer",["t",2],"timer вика chain.doFilter() → објектите одат кај следниот филтер."],
    ["auth",["a",1],"authenticator.doFilter(): cast во HttpServletRequest."],
    ["auth",["a",2],"Проверка: корисникот е најавен ✓"],
    ["auth",["a",3],"chain.doFilter() → authenticator е последен, па објектите одат кај сервлетот."],
    ["servlet",null,"OrderServlet.doPost() го пополнува одговорот."],
    ["auth",["a",6],"Назад во authenticator, после chain.doFilter(). Нема POST код, одговорот продолжува кон клиентот."],
    ["timer",["t",3],"Назад во timer: POST, се пресметува вкупното време."],
    ["timer",["t",4],"Логирање во дневникот на контејнерот."],
    ["c",null,"Контејнерот го праќа одговорот и ги брише request, response, нишката и веригата. Филтрите остануваат."]
  ];
  const no = [
    ["c",null,"POST /order од НЕнајавен корисник. Веригата е пак [timer, authenticator]."],
    ["timer",["t",1],"timer: PRE, почетно време."],
    ["timer",["t",2],"timer: chain.doFilter() → кон authenticator."],
    ["auth",["a",1],"authenticator: cast."],
    ["auth",["a",2],"Проверка: getUserPrincipal() е null ✗"],
    ["login",["a",5],"НЕ се вика chain.doFilter(). Наместо тоа forward кон login.html. OrderServlet никогаш не се извршува."],
    ["timer",["t",3],"Одговорот (страната за најава) се враќа во timer: POST кодот сепак се извршува."],
    ["timer",["t",4],"Логирање на времето."],
    ["c",null,"Корисникот ја гледа страната за најава."]
  ];
  let ok = true, i = 0;
  el.innerHTML = `<div class="section-title">Интерактивен дијаграм <span class="tag">верига на филтри чекор по чекор</span></div>
    <div class="diag-controls"><span class="seg" id="chSeg"><button data-v="1">Најавен корисник</button><button data-v="0">Ненајавен</button></span></div>
    <div class="chain" id="chNodes"></div>
    <div class="stepbox"><div class="sn"></div><div class="tx"></div></div>
    <div class="diag-controls"><button class="btn small" data-a="prev">← Назад</button><button class="btn small primary" data-a="next">Следно →</button></div>
    <div class="codepair"><div class="code" id="chT"></div><div class="code" id="chA"></div></div>`;
  const draw = () => {
    const steps = ok?yes:no, s = steps[i];
    el.querySelectorAll("#chSeg button").forEach(b=>b.classList.toggle("on", (b.dataset.v==="1")===ok));
    const nodes = [["c","Контејнер"],["timer","timer"],["auth","authenticator"],[ok?"servlet":"login", ok?"OrderServlet":"login.html"]];
    $("#chNodes",el).innerHTML = nodes.map(n=>`<span class="chip-f ${s[0]===n[0]?"on":""}">${n[1]}</span>`).join("⇄");
    $(".sn",el).textContent = `Чекор ${i+1} / ${steps.length}`; $(".tx",el).textContent = s[2];
    const code = (lines, tag, title) => `<div class="h">${title}</div>` + lines.map((l,k)=>`<div class="ln ${s[1]&&s[1][0]===tag&&s[1][1]===k?"hl":""}">${esc(l)}</div>`).join("");
    $("#chT",el).innerHTML = code(timer,"t","TimerFilter");
    $("#chA",el).innerHTML = code(auth,"a","AuthenticationFilter");
  };
  el.querySelectorAll("#chSeg button").forEach(b => b.onclick = () => { ok = b.dataset.v==="1"; i=0; draw(); });
  el.querySelector('[data-a="prev"]').onclick = () => { i=Math.max(0,i-1); draw(); };
  el.querySelector('[data-a="next"]').onclick = () => { i=Math.min((ok?yes:no).length-1,i+1); draw(); };
  draw();
}
});
})();
