/* Л6: Spring MVC (06 Spring MVC.pdf) */
(function(){
const ex = (t) => `<p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:72ch">${t}</p>`;
const ST = ["200","201","204","302","400","404","405","415","500"];

LECTURES.push({id:"l6", short:"Л6", title:"Spring MVC", deck:"06 Spring MVC",
  blurb:"MVC и слоеви, DispatcherServlet, мапирање, аргументи, форми и flash, JSON, ResponseEntity, грешки, REST.",
  sections:[
{
  id:"l6-mvc", num:"Час 1", title:"MVC шаблон и слоевита архитектура", deep:true,
  sub:"Што не е во ред со сервлетот и како слоевите го решаваат тоа.",
  diagram:["mvcCycle"],
  script:`
<h2>Каде застанавме: сервлет</h2>
${C(`
@WebServlet("/notifications")
public class NotificationServlet extends HttpServlet {
    private NotificationService service = ...;          // кој го креира?
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        String to = req.getParameter("to");             // рачно читање
        int limit = (req.getParameter("limit") == null) ? 10
                  : Integer.parseInt(req.getParameter("limit"));   // рачна конверзија
        out.println("<ul>");                            // HTML во Java
        ...
    }
}`)}
<p>Проблеми: рачно читање параметри (сè е String), рачна конверзија, HTML измешан со Java, нема DI, ист код во секој сервлет.</p>
${C(`
@Controller
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service = service; }   // DI
    @GetMapping("/notifications")                                                           // URL → метод
    public String list(@RequestParam String to,
                       @RequestParam(defaultValue = "10") int limit, Model model) {         // Spring чита и конвертира
        model.addAttribute("notifications", service.findByTo(to, limit));
        return "notification-list";                                                         // име на HTML шаблон
    }
}`)}
<h2>MVC: Модел, Преглед, Контролер</h2>
<ul>
<li><b>Модел</b>: податоците што се прикажуваат.</li>
<li><b>Преглед (View)</b>: визуелните елементи (табели, полиња, копчиња). Зависи од моделот.</li>
<li><b>Контролер</b>: се справува со акциите на корисникот, го менува моделот, може да го смени прегледот.</li>
</ul>
<p>Циклус: акција → промена на моделот → повторно исцртување на прегледот. <b>Во веб:</b> корисникот комуницира директно со контролерот преку HTTP. Секоја акција (клик, форма) = ново HTTP барање. Прегледот најчесто е шаблон што генерира HTML, пополнет со податоците од моделот.</p>
<h2>Контролер што прави сè</h2>
<p>Чита параметри, проверува правило (160 знаци), праќа преку SMTP, пишува во база со JDBC, полни модел. Прекршува <b>S</b> (пет одговорности), <b>O</b> (SMS или база наместо листа = секогаш менуваш контролер), не може да се тестира без SMTP и база.</p>
<h2>Слоевита архитектура</h2>
<div class="tbl-wrap"><table>
<tr><th>Слој</th><th>Пример</th><th>Одговорност</th></tr>
<tr><td>Преглед (UI)</td><td>notification-list.html (Thymeleaf)</td><td>како изгледа страницата</td></tr>
<tr><td>Веб (презентациски) слој</td><td>NotificationController (@Controller)</td><td>HTTP ↔ Java, без бизнис логика</td></tr>
<tr><td>Сервисен слој</td><td>NotificationService (@Service)</td><td>бизнис правила (макс. 160 знаци)</td></tr>
<tr><td>Податочен пристап</td><td>NotificationRepository (@Repository)</td><td>зачувај, прочитај, избриши</td></tr>
<tr><td>Модел</td><td>Notification</td><td>минува низ сите слоеви, зависи само од стандардни Java класи</td></tr>
</table></div>
<p>Зависностите одат <b>само надолу</b>. Придобивки: апстракција, поделба на одговорности, лесна замена (листа → база), полесно тестирање (лажен слој). „Контролерот“ од MVC = веб слој + сервисен + податочен пристап.</p>
<div class="key"><b>Каде припаѓа?</b> Читање <code>?to=</code> → веб слој (единствен знае за HTTP). „Пораката не смее да е подолга од 160“ → сервис. Зачувување → репозиториум. Табела со колони → преглед. <code>record Notification</code> → модел. Враќање 404 → веб слој (статус кодот е дел од HTTP).</div>
`,
  questions:[
    {type:"sort", q:"Каде припаѓа?", cats:["Преглед","Веб слој","Сервис","Репозиториум","Модел"], items:[["Го чита параметарот ?to= од URL-то","Веб слој"],["„Пораката не смее да биде подолга од 160 знаци“","Сервис"],["Ја зачувува пораката во листа / база","Репозиториум"],["Табела со колони „До“ и „Порака“","Преглед"],["record Notification(id, to, message, channel)","Модел"],["Враќа статус 404 кога известувањето не постои","Веб слој"]], exp:"Статусот 404 е дел од HTTP, па е одговорност на веб слојот, не на сервисот."},
    {type:"mc", q:"Во веб MVC, како корисникот комуницира со контролерот?", opts:["Преку HTTP барање: секоја акција е ново барање","Директно преку моделот","Преку WebSocket постојано","Прегледот го повикува контролерот на серверот"], ans:[0], exp:"Улогата на моделот е иста како во класичниот MVC, а контролерот и прегледот се прилагодени на HTTP."},
    {type:"mc", q:"Контролер чита параметри, праќа преку SMTP и пишува во база со JDBC. Што е главниот проблем?", opts:["Повеќе одговорности во една класа (S), секоја промена го менува контролерот, тешко се тестира","Не користи @RestController","Премногу е брз","Не користи Thymeleaf"], ans:[0], exp:"Решение: слоеви, секој со една одговорност."},
    {type:"mc", q:"Од што зависи моделот (Notification)?", opts:["Само од стандардните Java класи","Од сервисот","Од контролерот","Од Thymeleaf"], ans:[0], exp:"Моделот минува низ сите слоеви, но самиот не зависи од ниту еден."}
  ]
},
{
  id:"l6-dispatcher", num:"Час 1", title:"DispatcherServlet и патот на барањето", deep:true,
  sub:"Една влезна точка, специјални бинови, прв контролер и Thymeleaf.",
  diagram:["dispatchFlow","viewResolve"],
  script:`
<h2>Spring MVC модул</h2>
<ul>
<li><b>spring-boot-starter-web</b>: Spring MVC (DispatcherServlet), вграден Tomcat (сервлет контејнер), Jackson (Java ↔ JSON).</li>
<li><b>spring-boot-starter-thymeleaf</b>: HTML шаблони (прегледи), готов ViewResolver.</li>
</ul>
<p>Spring MVC е изграден врз <b>Servlet API</b>: сервлети, барање, одговор, сесија, филтри и понатаму важат.</p>
<h2>DispatcherServlet: една влезна точка</h2>
<p>Мапиран на <code>/</code>, ги прима <b>сите</b> барања и ги делегира до вистинскиот метод. Наместо еден сервлет по URL, еден сервлет кој делегира (front controller).</p>
<h2>Патот на едно барање</h2>
<ol>
<li><b>DispatcherServlet</b> прима GET /welcome</li>
<li><b>HandlerMapping</b>: кој метод? → showPage()</li>
<li><b>HandlerAdapter</b>: ги подготвува аргументите (празен Model) и го повикува методот</li>
<li><b>WelcomeController</b>: полни модел, враќа "index" (ова го пишуваме ние)</li>
<li><b>ViewResolver</b>: "index" → templates/index.html</li>
<li><b>View (Thymeleaf)</b>: модел + шаблон → HTML</li>
</ol>
<div class="tbl-wrap"><table>
<tr><th>Специјален бин</th><th>Прашање</th><th>Пример</th></tr>
<tr><td>HandlerMapping</td><td>Кој метод го обработува барањето?</td><td>GET /welcome → showPage()</td></tr>
<tr><td>HandlerAdapter</td><td>Како да го повикам методот?</td><td>ги разрешува аргументите</td></tr>
<tr><td>ViewResolver</td><td>Кој шаблон одговара на името?</td><td>"index" → templates/index.html</td></tr>
<tr><td>HandlerExceptionResolver</td><td>Што ако се фрли исклучок?</td><td>исклучок → 404 / страница</td></tr>
<tr><td>LocaleResolver</td><td>На кој јазик е клиентот?</td><td>Accept-Language: mk</td></tr>
<tr><td>MultipartResolver</td><td>Има ли прикачена датотека?</td><td>форма за upload</td></tr>
</table></div>
<p>Spring Boot ги регистрира автоматски. Ние пишуваме контролери.</p>
<h2>WebApplicationContext</h2>
<p>Проширување на ApplicationContext за веб, има референца до <b>ServletContext</b>, го креира DispatcherServlet. Веб бинoвите (контролери, HandlerMapping, ViewResolver) ги гледаат бинoвите од <b>root</b> контекстот (сервиси, репозиториуми). Повеќе DispatcherServlet-и (/web/*, /api/*) имаат свој веб контекст и заеднички root. Во Boot најчесто еден контекст.</p>
<p>Без Boot (класично): <b>ContextLoaderListener</b> го вчитува root контекстот од <code>contextConfigLocation</code> context-param, а DispatcherServlet својот од <code>contextConfigLocation</code> init-param на сервлетот.</p>
<h2>Прв контролер</h2>
${C(`
@Controller
public class WelcomeController {
    @GetMapping("/welcome")
    public String showPage(Model model) {
        model.addAttribute("message", "Здраво, ФИНКИ!");
        return "index";                         // логичко име на преглед
    }
}
<!-- resources/templates/index.html -->
<html xmlns:th="http://www.thymeleaf.org">
<body><h1 th:text="\${message}">текст</h1></body>
</html>`)}
<div class="tbl-wrap"><table>
<tr><th>Име</th><th>Каде</th><th>Кој го користи</th><th>Мора да се совпаѓа со</th></tr>
<tr><td>/welcome</td><td>@GetMapping("/welcome")</td><td>HandlerMapping</td><td>URL-то во барањето</td></tr>
<tr><td>showPage</td><td>име на методот</td><td><b>никој</b></td><td>слободно избираме</td></tr>
<tr><td>"index"</td><td>return "index";</td><td>ViewResolver</td><td>templates/index.html</td></tr>
<tr><td>"message"</td><td>model.addAttribute</td><td>Thymeleaf</td><td>\${message} во шаблонот</td></tr>
</table></div>
<h2>Thymeleaf</h2>
<p>Систем за шаблони на серверот: шаблон + модел → HTML. Шаблонот е валиден HTML, th: атрибутите ги обработува серверот, прелистувачот добива чист HTML.</p>
<div class="tbl-wrap"><table>
<tr><td><code>xmlns:th</code></td><td>овозможува th: атрибути</td></tr>
<tr><td><code>\${…}</code></td><td>атрибут од моделот: \${message}, \${n.to}</td></tr>
<tr><td><code>th:text</code></td><td>го заменува текстот</td></tr>
<tr><td><code>th:each</code></td><td>повторува: <code>&lt;tr th:each="n : \${notifications}"&gt;</code></td></tr>
<tr><td><code>th:if</code></td><td>прикажи само ако е точно</td></tr>
<tr><td><code>@{…}</code></td><td>гради линк: @{/notifications/{id}(id=\${n.id})}</td></tr>
</table></div>
<p>ViewResolver: <code>classpath:/templates/</code> + "index" + <code>.html</code>. Класичен JSP: <code>InternalResourceViewResolver</code> со prefix <code>/WEB-INF/views/</code> и suffix <code>.jsp</code> → "question" = /WEB-INF/views/question.jsp.</p>
`,
  questions:[
    {type:"mc", q:"InternalResourceViewResolver има prefix /WEB-INF/views/ и suffix .jsp. @Controller метод (POST /exam/question) враќа \"question\". Која датотека се избира?", opts:["/WEB-INF/views/question.jsp","/views/question.jsp","/WEB-INF/jsp/question.jsp","Ниту една, ќе се генерира JSON","Ниту една, ќе се изврши редирекција"], ans:[0], exp:"prefix + вратено име + suffix. Мапирањето /exam/question нема врска со името на прегледот."},
    {type:"mc", multi:true, q:"Кои искази се точни за Spring MVC?", opts:["Ги процесира барањата преку DispatcherServlet","Ги процесира барањата преку DispatcherFilter","ContextLoaderListener ги вчитува бинoвите од contextConfigLocation (context) параметарот","DispatcherServlet ги вчитува бинoвите од contextConfigLocation иницијализациски параметар на сервлетот"], ans:[0,2,3], exp:"DispatcherFilter не постои. Во класична конфигурација root контекстот го вчитува ContextLoaderListener, а веб контекстот DispatcherServlet од својот init-param."},
    {type:"sort", q:"Кој специјален бин одговара на прашањето?", cats:["HandlerMapping","HandlerAdapter","ViewResolver","HandlerExceptionResolver"], items:[["Кој метод го обработува барањето?","HandlerMapping"],["Како да го повикам методот (аргументи)?","HandlerAdapter"],["\"index\" → templates/index.html","ViewResolver"],["Исклучок → статус 404 / страница","HandlerExceptionResolver"]], exp:"Ниту еден од нив не го пишуваме ние. Boot ги регистрира."},
    {type:"mc", q:"Од трите имиња /welcome, showPage и \"index\", кое Spring воопшто не го гледа?", opts:["showPage (името на методот)","/welcome","\"index\"","Сите се користат"], ans:[0], exp:"URL-то го користи HandlerMapping, вратениот String го користи ViewResolver."},
    {type:"mc", q:"Што прави th:each=\"n : ${notifications}\"?", opts:["Го повторува елементот за секое известување во листата","Го заменува текстот","Гради линк","Прикажува само ако е точно"], ans:[0], exp:"th:text заменува текст, th:if е услов, @{…} гради URL."},
    {type:"mc", q:"Што добива прелистувачот од Thymeleaf шаблон?", opts:["Чист HTML без th: атрибути","HTML со th: атрибути што ги извршува JavaScript","JSON","Java код"], ans:[0], exp:"Thymeleaf работи на серверот."}
  ]
},
{
  id:"l6-mapping", num:"Час 1", title:"@Controller, @RestController и мапирање", deep:true,
  sub:"Кога се повикува методот и кој статус се враќа кога не се повикува.",
  diagram:["mappingTester"],
  script:`
<h2>@Controller или @RestController?</h2>
<div class="tbl-wrap"><table>
<tr><th>@Controller</th><th>@RestController</th></tr>
<tr><td>String = <b>име на преглед</b> → ViewResolver → HTML</td><td>Објектот се претвора во <b>JSON</b> (Jackson) во телото</td></tr>
</table></div>
<div class="key"><code>@RestController = @Controller + @ResponseBody</code> на секој метод.</div>
<h2>@RequestMapping својства</h2>
<div class="tbl-wrap"><table>
<tr><th>Својство</th><th>Пример</th><th>Се совпаѓа кога</th></tr>
<tr><td>path / value</td><td>@RequestMapping("/notifications")</td><td>патеката е /notifications</td></tr>
<tr><td>method</td><td>method = RequestMethod.POST</td><td>HTTP методот е POST</td></tr>
<tr><td>params</td><td>params = "channel=sms"</td><td>има параметар channel=sms</td></tr>
<tr><td>headers</td><td>headers = "X-Api-Version=2"</td><td>заглавјето ја има вредноста</td></tr>
<tr><td>consumes</td><td>consumes = "application/json"</td><td>Content-Type на барањето е JSON</td></tr>
<tr><td>produces</td><td>produces = "application/json"</td><td>клиентот прифаќа JSON (Accept)</td></tr>
</table></div>
<p>Сите услови мора да важат истовремено. <b>Без method → важи за сите HTTP методи.</b></p>
<h2>Класа + метод</h2>
${C(`
@Controller
@RequestMapping("/notifications")            // префикс за сите методи
public class NotificationController {
    @GetMapping                              // GET /notifications
    public String list(Model model) { ... }
    @GetMapping("/{id}")                     // GET /notifications/7
    public String details(@PathVariable Long id, Model model) { ... }
    @GetMapping("/new")                      // GET /notifications/new
    public String form() { ... }
    @PostMapping                             // POST /notifications
    public String create(...) { ... }
}`)}
<p>Финална патека = класа + метод. <code>/notifications/new</code> или <code>/{id}</code>? Победува <b>поконкретната</b> патека → form().</p>
<p>Кратенки: <code>@GetMapping, @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping</code> = @RequestMapping(method = ...). @RequestMapping се користи на класата (префикс) или кога методот прифаќа повеќе методи.</p>
<h2>Чести грешки</h2>
<div class="tbl-wrap"><table>
<tr><th>Статус</th><th>Најчеста причина</th></tr>
<tr><td>404 Whitelabel</td><td>нема мапирање за URL-то, или контролерот е надвор од пакетот на @SpringBootApplication</td></tr>
<tr><td>405</td><td>URL-то постои, но за друг HTTP метод</td></tr>
<tr><td>400</td><td>недостасува задолжителен параметар или погрешен тип (abc → Long)</td></tr>
<tr><td>401 / 403</td><td>не си најавен / најавен без право (Spring Security)</td></tr>
<tr><td>415</td><td>@RequestBody без Content-Type: application/json</td></tr>
<tr><td>500 TemplateInputException</td><td>вратено име на преглед за кое нема шаблон</td></tr>
<tr><td>500 кај метод што враќа објект</td><td>@Controller наместо @RestController (нема @ResponseBody)</td></tr>
</table></div>
<h2>Како да го најдеш URL-то за метод (се повторува на колоквиум)</h2>
<ol><li>Префикс од класата (@RequestMapping на класата).</li><li>Плус патеката од методот, со {id} заменет со вредност.</li><li>@RequestParam аргументите одат во <b>query string</b> (?name=...), @PathVariable во <b>патеката</b>.</li><li>Model, HttpSession и слично <b>не се дел</b> од URL-то.</li></ol>
`,
  questions:[
    {type:"mc", q:"На кое URL треба да се направи барање за методот? @RequestMapping(value = {\"/search\"}, method = RequestMethod.GET) public String search(@RequestParam String query, Model model). Апликацијата е на localhost:8080/.", opts:["GET http://localhost:8080/search?query=text","GET http://localhost:8080/search?query=text&model=","GET http://localhost:8080/search/model?query=text","GET http://localhost:8080/search/query"], ans:[0], exp:"query е @RequestParam → query string. Model не е параметар од барањето."},
    {type:"mc", q:"Апликацијата е на localhost:8080/app. Контролерот има @RequestMapping(\"/exam\"), а методот @GetMapping(\"/question/{id}\") со @PathVariable Long id и @RequestParam String answer. Кое URL е точно?", opts:["/app/exam/question/7?answer=xyz","/app/exam/question?id=7&answer=xyz","/app/exam/exam/question/7?answer=xyz","/app/question/7/xyz"], ans:[0], exp:"Префикс од класата + патека од методот, id во патеката, answer во query string."},
    {type:"fill", q:"Предвиди го статусот.", code:`@Controller
@RequestMapping("/notifications")
class NotificationController {
  @GetMapping("/{id}")
  public String details(@PathVariable Long id, Model m) {...}
  @PostMapping
  public String create(@RequestParam String to,
                       @RequestParam(required = false) String channel) {...}
}`, rows:[
      ["GET /notifications/1",ST,0],
      ["GET /notifications/-123",ST,0],
      ["GET /notifications/abc",ST,4],
      ["GET /notifications/5/details",ST,5],
      ["GET /notifications",ST,6],
      ["POST /notifications?to=ana@finki.ukim.mk",ST,0],
      ["POST /notifications",ST,4]], exp:"-123 е валиден Long. abc не е Long → 400. Два сегменти нема мапирање → 404. /notifications постои само за POST → 405. channel е опционален. Без to → 400."},
    {type:"mc", q:"Што значи 405 Method Not Allowed?", opts:["URL-то постои, но не за тој HTTP метод","URL-то не постои","Недостасува параметар","Серверот паднал"], ans:[0], exp:"404 е кога воопшто нема мапирање."},
    {type:"mc", q:"Метод во @Controller (без @ResponseBody) враќа List<Notification>. Што се случува?", opts:["500: Spring се обидува да го третира како преглед","Се враќа JSON","Се враќа празна страница со 200","400"], ans:[0], exp:"Треба @RestController или @ResponseBody за објектот да стане JSON."},
    {type:"mc", q:"Класата е мапирана на /notifications. Има методи @GetMapping(\"/new\") и @GetMapping(\"/{id}\"). Кој се повикува за GET /notifications/new?", opts:["form() на /new, поконкретната патека победува","details() со id = \"new\"","Двата","Грешка 400"], ans:[0], exp:"Литерална патека е поконкретна од шаблон со променлива."},
    {type:"mc", q:"@RequestMapping(\"/x\") на метод без method атрибут. За кои HTTP методи важи?", opts:["За сите","Само GET","Само POST","За ниту еден"], ans:[0], exp:"За ограничување користи method = ... или кратенките @GetMapping, @PostMapping..."}
  ]
},
{
  id:"l6-args", num:"Час 2", title:"Податоци од барањето → аргументи", deep:true,
  sub:"@PathVariable, @RequestParam, заглавја, колачиња, форми, датотеки и конверзија.",
  diagram:["argMapper"],
  script:`
<h2>Од каде доаѓаат аргументите</h2>
<div class="tbl-wrap"><table>
<tr><th>Дел од барањето</th><th>Пример</th><th>Аргумент</th></tr>
<tr><td>Патека</td><td>/7/</td><td>@PathVariable Long id</td></tr>
<tr><td>Query параметар</td><td>?channel=sms</td><td>@RequestParam String channel</td></tr>
<tr><td>Заглавје</td><td>Accept-Language: mk</td><td>@RequestHeader("Accept-Language") String lang</td></tr>
<tr><td>Колаче</td><td>theme=dark</td><td>@CookieValue String theme</td></tr>
<tr><td>Тело (JSON)</td><td>{"to": ..., "message": ...}</td><td>@RequestBody NotificationRequest req</td></tr>
</table></div>
<h2>Шаблони за патеки (PathPattern)</h2>
<div class="tbl-wrap"><table>
<tr><th>Шаблон</th><th>Се совпаѓа</th><th>Не се совпаѓа</th></tr>
<tr><td>/notifications/?</td><td>/notifications/1</td><td>/notifications/12</td></tr>
<tr><td>/files/*.txt</td><td>/files/a.txt</td><td>/files/a/b.txt</td></tr>
<tr><td>/files/**</td><td>/files, /files/a/b/c</td><td>/docs/a</td></tr>
<tr><td>/notifications/{id}</td><td>/notifications/7</td><td>/notifications/7/edit</td></tr>
<tr><td>/notifications/{id:\\d+}</td><td>/notifications/7</td><td>/notifications/abc → 404</td></tr>
<tr><td>/channels/{ch:email|sms}</td><td>/channels/sms</td><td>/channels/fax → 404</td></tr>
<tr><td>/files/{*path}</td><td>/files/a/b (path = "/a/b")</td><td>/docs/a</td></tr>
</table></div>
<p><code>**</code> и <code>{*path}</code> само на крајот на патеката.</p>
<h2>@PathVariable</h2>
<p>Име на аргументот = име во { }. Различно име → <code>@PathVariable("userEmail") String email</code>. String → Long автоматски. /notifications/abc → <b>400</b>. Нема {id} во патеката → <b>500</b> (наша грешка).</p>
<h2>@RequestParam</h2>
${C(`
@GetMapping("/notifications/search")
public String search(@RequestParam String to,
                     @RequestParam(defaultValue = "10") int limit,
                     @RequestParam(required = false) String channel, Model model) { ... }`)}
<div class="tbl-wrap"><table>
<tr><th>Барање</th><th>Резултат</th></tr>
<tr><td>?to=ana</td><td>to="ana", limit=10, channel=null</td></tr>
<tr><td>?to=ana&amp;limit=3&amp;channel=sms</td><td>limit=3, channel="sms"</td></tr>
<tr><td>(без параметри)</td><td>400, нема to</td></tr>
<tr><td>?to=ana&amp;limit=пет</td><td>400, „пет“ не е int</td></tr>
</table></div>
<p>Стандардно <b>задолжителен</b>. required = false или Optional → незадолжителен. defaultValue → незадолжителен со вредност. Работи и за <b>полиња од форма (POST)</b>. Врската е името: <code>name="to"</code> во формата = параметарот to.</p>
<h2>@RequestHeader, @CookieValue и аргументи по тип</h2>
<p>Исти правила (задолжителни, required, defaultValue, конверзија). По тип, Spring вметнува: <code>Model/ModelMap/Map</code> (празен модел), <code>HttpServletRequest/Response</code>, <code>HttpSession</code> (се креира ако не постои, <b>никогаш null</b>), <code>HttpMethod</code>, <code>Locale</code>, <code>InputStream/Reader</code>. Името не е важно, важен е типот.</p>
<h2>Форма → објект: @ModelAttribute</h2>
${C(`
public record NotificationRequest(String to, String message, String channel) { }
@PostMapping("/notifications")
public String create(@ModelAttribute NotificationRequest request) {
    service.notifyUser(request.to(), request.message(), request.channel());
    return "redirect:/notifications";
}`)}
<p>Spring го креира објектот, полињата се поврзуваат <b>по име</b>, објектот е и атрибут во моделот.</p>
<h2>MultipartFile</h2>
<p>Формата мора да има <code>enctype="multipart/form-data"</code>. <code>@RequestParam MultipartFile file</code> (име = name="file"). Методи: getOriginalFilename(), getSize(), getContentType(), isEmpty(), getInputStream(). Повеќе: <code>List&lt;MultipartFile&gt; files</code>. Стандардно до <b>1 MB</b> (spring.servlet.multipart.max-file-size).</p>
<h2>Конверзија</h2>
<div class="tbl-wrap"><table>
<tr><th>Во барањето</th><th>Аргумент</th><th>Резултат</th></tr>
<tr><td>"7"</td><td>Long id</td><td>7</td></tr>
<tr><td>"true"</td><td>boolean urgent</td><td>true</td></tr>
<tr><td>"SMS"</td><td>Channel (enum)</td><td>Channel.SMS (?channel=sms → 400, разликува букви)</td></tr>
<tr><td>"2026-11-03"</td><td>@DateTimeFormat(iso = DATE) LocalDate</td><td>2026-11-03 (без анотација → 400)</td></tr>
<tr><td>?channels=email,sms</td><td>List&lt;String&gt;</td><td>[email, sms] (или повторен параметар)</td></tr>
<tr><td>нема параметар</td><td>Optional&lt;Integer&gt;</td><td>Optional.empty()</td></tr>
</table></div>
<p>Сопствени типови: <b>Converter</b> (тип → тип), <b>Formatter</b> (String ↔ тип, со Locale). За JSON (@RequestBody) датумите ги форматира Jackson со <code>@JsonFormat</code>.</p>
`,
  questions:[
    {type:"sort", q:"Кој дел од барањето → која анотација?", cats:["@PathVariable","@RequestParam","@RequestHeader","@CookieValue","@RequestBody","@ModelAttribute"], items:[["/notifications/7 (7)","@PathVariable"],["?channel=sms","@RequestParam"],["Accept-Language: mk","@RequestHeader"],["Cookie: theme=dark","@CookieValue"],["JSON во телото","@RequestBody"],["Повеќе полиња од форма во еден објект","@ModelAttribute"]], exp:"@ModelAttribute = полиња од форма, @RequestBody = JSON тело."},
    {type:"mc", q:"Кое URL се совпаѓа со /files/**?", opts:["/files/a/b/c","/docs/a","/file/a","Ниту едно, ** не е дозволено"], ans:[0], exp:"** фаќа нула или повеќе сегменти, вклучително и /files."},
    {type:"mc", q:"@GetMapping(\"/notifications/{id}\") со @PathVariable Long id. Барање GET /notifications/abc. Статус?", opts:["400","404","500","200 со id = null"], ans:[0], exp:"Мапирањето се совпаѓа, но конверзијата abc → Long паѓа."},
    {type:"mc", q:"@RequestParam(defaultValue = \"10\") int limit. Барањето нема limit. Колку е limit?", opts:["10","0","null","400"], ans:[0], exp:"defaultValue го прави незадолжителен."},
    {type:"mc", q:"enum Channel { EMAIL, SMS } и @RequestParam Channel channel. Барање ?channel=sms. Статус?", opts:["400, enum разликува големи и мали букви","200 со Channel.SMS","404","500"], ans:[0], exp:"Мора точно \"SMS\"."},
    {type:"mc", q:"Методот прима HttpSession session, а корисникот нема сесија. Што добива?", opts:["Нова сесија, никогаш null","null","400","Исклучок"], ans:[0], exp:"Spring вика request.getSession() кој креира. @SessionAttribute за непостоечки атрибут е друга приказна (400)."},
    {type:"mc", q:"Треба PATCH /slots/{slotId} со опционален параметар date. Кој потпис е точен?", opts:["@PatchMapping(\"/slots/{slotId}\") update(@PathVariable Long slotId, @RequestParam(required = false) LocalDate date)","@PatchMapping(\"/slots/{pathId}\") update(@PathVariable Long slotId, @RequestParam LocalDate date)","@PatchMapping(\"/slots\") update(@RequestParam Long slotId, @RequestParam LocalDate date)","@PatchMapping(\"/slots/{slotId}\") update(@PathVariable Long slotId, @RequestParam LocalDate date)"], ans:[0], exp:"slotId е во патеката → @PathVariable со исто име. Датумот е опционален → required = false (стандардно е задолжителен)."}
  ]
},
{
  id:"l6-forms", num:"Час 2", title:"Форми, redirect, сесија и flash", deep:true,
  sub:"Зошто по POST правиш redirect и како пораката го преживува.",
  diagram:["flashSim"],
  script:`
<h2>По POST: пренасочи</h2>
<p>POST /notifications → <b>302 Found, Location: /notifications</b> → прелистувачот сам прави GET → 200 OK со листата. Во Spring: <code>return "redirect:/notifications";</code>. F5 не го повторува POST-от. <b>Без redirect: F5 = повторно POST = дупликат.</b> (Истиот POST-Redirect-GET од sendRedirect кај сервлетите.)</p>
<h2>Сесија во Spring MVC</h2>
<p>Истата HttpSession од сервлетите (колаче JSESSIONID, мапа на серверот по корисник), само поудобен пристап.</p>
${C(`
@PostMapping
public String create(@ModelAttribute NotificationRequest req, HttpSession session) {
    service.notifyUser(...);
    session.setAttribute("lastRecipient", req.to());       // запиши
    return "redirect:/notifications";
}
@GetMapping("/new")
public String form(@SessionAttribute(required = false) String lastRecipient, Model model) {
    model.addAttribute("to", lastRecipient);               // прочитај
    return "notification-form";
}`)}
<ul>
<li><b>HttpSession</b>: се креира ако не постои, никогаш null. setAttribute, getAttribute, invalidate.</li>
<li><b>@SessionAttribute</b>: само чита постоечки атрибут, име на аргументот = име на атрибутот. Го нема → <b>400</b>, освен required = false.</li>
</ul>
<h2>Колку долго живеат податоците</h2>
<div class="tbl-wrap"><table>
<tr><th>Каде</th><th>Колку трае</th><th>Пример</th></tr>
<tr><td>Model атрибут</td><td>едно барање</td><td>model.addAttribute(…)</td></tr>
<tr><td>Flash атрибут</td><td>до следното барање (по redirect)</td><td>redirect.addFlashAttribute("info", …)</td></tr>
<tr><td>HttpSession</td><td>додека трае сесијата (истек, одјава)</td><td>lastRecipient</td></tr>
<tr><td>Singleton бин</td><td>додека работи апликацијата, за <b>сите</b> корисници</td><td>NotificationRepository</td></tr>
</table></div>
<div class="trap">Податоци на еден корисник → сесија. <b>Никогаш во singleton бин</b>, тој е заеднички за сите.</div>
<h2>Порака по redirect</h2>
<p>Model се губи: redirect = ново GET барање. <code>RedirectAttributes.addFlashAttribute("info", "Известувањето е испратено")</code>: Spring ја чува во сесијата и ја става во Model на следниот GET, па ја брише.</p>
<div class="tbl-wrap"><table>
<tr><th>#</th><th>Барање</th><th>Сесија</th><th>Model</th><th>Корисникот гледа</th></tr>
<tr><td>1</td><td>POST /notifications</td><td>info се зачувува</td><td>-</td><td>-</td></tr>
<tr><td>2</td><td>302 → redirect</td><td>info чека</td><td>-</td><td>-</td></tr>
<tr><td>3</td><td>GET /notifications</td><td>info се вади и брише</td><td>info е тука</td><td>Известувањето е испратено</td></tr>
<tr><td>4</td><td>F5 → GET</td><td>празно</td><td>нема info</td><td>листа без порака</td></tr>
</table></div>
<p>Зошто не рачно во HttpSession? Мора сам да ја избришеш. Зошто не во URL (?info=…)? Останува при F5 и секој може да ја измисли.</p>
`,
  questions:[
    {type:"mc", q:"Што враќа return \"redirect:/notifications\";?", opts:["302 со Location: /notifications","Прегледот notifications.html","200 со JSON","forward кон /notifications"], ans:[0], exp:"Префиксот redirect: не е име на преглед."},
    {type:"mc", q:"Во POST: model.addAttribute(\"info\", \"Испратено\"); return \"redirect:/notifications\";. Дали GET страницата ја гледа пораката?", opts:["Не, Model живее само едно барање","Да","Да, но само еднаш","Само ако има сесија"], ans:[0], exp:"За порака што го преживува redirect: RedirectAttributes.addFlashAttribute."},
    {type:"mc", q:"Flash пораката е прикажана по redirect. Корисникот притиска F5. Што гледа?", opts:["Листа без порака, flash се прикажува еднаш","Пораката пак","Грешка 400","Нов POST"], ans:[0], exp:"Spring ја брише од сесијата откако ќе ја стави во моделот."},
    {type:"mc", q:"@SessionAttribute String lastRecipient (без required = false), а атрибутот не е во сесијата. Статус?", opts:["400","200 со null","404","500"], ans:[0], exp:"Исто однесување како задолжителен @RequestParam."},
    {type:"sort", q:"Колку долго живее?", cats:["Едно барање","До следното барање","Додека трае сесијата","Додека работи апликацијата"], items:[["Model атрибут","Едно барање"],["Flash атрибут","До следното барање"],["HttpSession атрибут","Додека трае сесијата"],["Поле во singleton бин","Додека работи апликацијата"]], exp:"Singleton е заеднички за сите корисници, па не е место за податоци на еден корисник."},
    {type:"mc", q:"Зошто по успешен POST правиш redirect?", opts:["F5 да не го повтори POST-от (дупликат)","За да се забрза одговорот","Затоа што POST не може да врати HTML","За да се избрише сесијата"], ans:[0], exp:"POST → Redirect → GET."}
  ]
},
{
  id:"l6-responses", num:"Час 2", title:"JSON, повратни вредности и грешки", deep:true,
  sub:"@RequestBody, ResponseEntity и како исклучок станува статус.",
  diagram:["errorFlow"],
  script:`
<h2>JSON во телото: @RequestBody</h2>
${C(`
@RestController
@RequestMapping("/api/notifications")
public class NotificationRestController {
    @PostMapping
    public Notification create(@RequestBody NotificationRequest request) { ... }
}`)}
<p>JSON → Java преку <b>HttpMessageConverter</b> (Jackson). Без JSON Content-Type → <b>415</b>. Невалиден JSON → <b>400</b>. <code>@ModelAttribute</code> = полиња од форма · <code>@RequestBody</code> = JSON во телото.</p>
<h2>Што може да врати методот</h2>
<div class="tbl-wrap"><table>
<tr><th>Повратна вредност</th><th>Што прави Spring</th></tr>
<tr><td>String</td><td>име на преглед → ViewResolver</td></tr>
<tr><td>"redirect:…"</td><td>302 пренасочување</td></tr>
<tr><td>ModelAndView</td><td>преглед + модел во еден објект</td></tr>
<tr><td>објект (@ResponseBody)</td><td>објект → JSON во телото</td></tr>
<tr><td>ResponseEntity&lt;T&gt;</td><td>тело + статус + заглавја</td></tr>
<tr><td>void</td><td>нема тело (пр. со @ResponseStatus)</td></tr>
</table></div>
<h2>ResponseEntity</h2>
${C(`
@GetMapping("/{id}")
public ResponseEntity<Notification> findById(@PathVariable Long id) {
    return service.findById(id).map(ResponseEntity::ok)                  // 200
                  .orElseGet(() -> ResponseEntity.notFound().build());   // 404
}
@PostMapping
public ResponseEntity<Notification> create(@RequestBody NotificationRequest req) {
    Notification n = service.notifyUser(...);
    return ResponseEntity.created(URI.create("/api/notifications/" + n.id())).body(n);  // 201 + Location
}`)}
<p><code>ok()</code> → 200 · <code>created(uri)</code> → 201 + Location · <code>notFound()</code> → 404 · <code>badRequest()</code> → 400.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>@ResponseBody</th><th>ResponseEntity</th></tr>
<tr><td>Тело</td><td>вратениот објект</td><td>.body(n)</td></tr>
<tr><td>Статус</td><td>секогаш 200</td><td>ние избираме (201, 404)</td></tr>
<tr><td>Заглавја</td><td>не</td><td>да (Location)</td></tr>
<tr><td>Кога</td><td>одговорот е секогаш ист вид</td><td>статусот зависи од ситуацијата</td></tr>
</table></div>
<p>String без @ResponseBody = име на преглед · со @ResponseBody = самиот текст во одговорот.</p>
<h2>Грешки: од исклучок до статус</h2>
${C(`
@ResponseStatus(HttpStatus.NOT_FOUND)                     // 1. статусот е на исклучокот
public class NotificationNotFoundException extends RuntimeException { ... }

@ExceptionHandler(IllegalArgumentException.class)         // 2. метод во контролерот го фаќа
public ResponseEntity<String> badInput(IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(e.getMessage());   // 400 + „Предолга порака“
}

@ControllerAdvice                                         // 3. за сите контролери одеднаш
public class GlobalErrors { @ExceptionHandler(...) ... }`)}
<div class="tbl-wrap"><table>
<tr><th>Ако…</th><th>Статус</th></tr>
<tr><td>ништо не правиме</td><td>500</td></tr>
<tr><td>@ResponseStatus на исклучокот</td><td>тој статус</td></tr>
<tr><td>@ExceptionHandler метод</td><td>ние одлучуваме</td></tr>
<tr><td>@ControllerAdvice класа</td><td>за сите контролери</td></tr>
</table></div>
<p>Сите три ги извршува <b>HandlerExceptionResolver</b>.</p>
`,
  questions:[
    {type:"mc", q:"POST со @RequestBody, но клиентот не прати Content-Type: application/json. Статус?", opts:["415 Unsupported Media Type","400","404","200"], ans:[0], exp:"Невалиден JSON (со точен Content-Type) би бил 400."},
    {type:"mc", q:"Што враќа ResponseEntity.created(uri).body(n)?", opts:["201 Created + Location: uri + JSON тело","200 + JSON","302 + Location","204 без тело"], ans:[0], exp:"created(uri) прави две работи: статус 201 и заглавје Location."},
    {type:"mc", q:"Во @Controller метод враќа \"3\" (String) и има @ResponseBody. Што добива клиентот?", opts:["Текстот 3 во телото","Преглед 3.html","JSON {\"value\":3}","Грешка"], ans:[0], exp:"Без @ResponseBody истиот String би бил име на преглед."},
    {type:"mc", q:"Сервисот фрла IllegalArgumentException, а нема @ExceptionHandler, @ControllerAdvice ни @ResponseStatus. Статус?", opts:["500","400","404","200"], ans:[0], exp:"Неразрешен исклучок → 500."},
    {type:"sort", q:"Кој механизам?", cats:["@ResponseStatus","@ExceptionHandler","@ControllerAdvice"], items:[["Статусот е запишан на класата на исклучокот","@ResponseStatus"],["Метод во контролерот го фаќа исклучокот и гради одговор","@ExceptionHandler"],["Една класа со handler-и за сите контролери","@ControllerAdvice"]], exp:"@ResponseStatus: исклучокот го носи статусот. @ExceptionHandler: ние го градиме одговорот."},
    {type:"mc", q:"@DeleteMapping(\"/{id}\") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(...). Статус?", opts:["204","200","202","404"], ans:[0], exp:"void + NO_CONTENT = успех без тело."}
  ]
},
{
  id:"l6-rest", num:"Час 2", title:"REST API и RestTemplate", deep:true,
  sub:"Ресурси наместо страници, curl, и како апликацијата станува клиент.",
  diagram:["curlSim"],
  script:`
<h2>REST: ресурси наместо страници</h2>
<div class="tbl-wrap"><table>
<tr><th>Добро</th><th>Лошо</th><th>Правило</th></tr>
<tr><td>/api/notifications</td><td>/api/getNotifications</td><td>именка, акцијата е HTTP методот</td></tr>
<tr><td>/api/notifications/7</td><td>/api/notification?id=7</td><td>множина + хиерархија</td></tr>
<tr><td>/api/shopping-carts</td><td>/api/Shopping_Carts</td><td>мали букви, цртичка</td></tr>
<tr><td>/api/notifications</td><td>/api/notifications/</td><td>без коса црта на крајот</td></tr>
<tr><td>/api/notifications/7 + Accept</td><td>/api/notifications/7.json</td><td>без екстензии</td></tr>
</table></div>
${C(`
@RestController
@RequestMapping("/api/notifications")
public class NotificationRestController {
    @GetMapping                    public List<Notification> findAll() { ... }
    @GetMapping("/{id}")           public Notification findById(@PathVariable Long id) { ... orElseThrow(NotFound) }
    @PostMapping                   public ResponseEntity<Notification> create(@RequestBody NotificationRequest req) { ... 201 }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { ... }
}`)}
<h2>curl</h2>
<p><code>-i</code> прикажи статус и заглавја · <code>-X</code> HTTP метод (без него GET) · <code>-H</code> заглавје · <code>-d</code> тело (само по себе → POST) · <code>\\</code> продолжува во следен ред. Прелистувачот прави само GET. Алатки: curl, IntelliJ HTTP Client (.http), Postman.</p>
<h2>Туѓ REST API: RestTemplate</h2>
${C(`
@Bean public RestTemplate restTemplate() { return new RestTemplate(); }

public Notification get(Long id) { return rest.getForObject(API + "/{id}", Notification.class, id); }
public URI send(NotificationRequest req) { return rest.postForLocation(API, req); }   // Location од 201`)}
<div class="tbl-wrap"><table>
<tr><th>Метод</th><th>HTTP</th></tr>
<tr><td>getForObject</td><td>GET → објект</td></tr>
<tr><td>getForEntity</td><td>GET → ResponseEntity (статус + тело)</td></tr>
<tr><td>postForObject</td><td>POST → објект</td></tr>
<tr><td>postForLocation</td><td>POST → URI</td></tr>
<tr><td>put / delete</td><td>PUT / DELETE</td></tr>
<tr><td>exchange</td><td>било кој метод</td></tr>
</table></div>
<p>При повик: {id} се заменува → барањето се праќа и методот <b>чека</b> (синхроно) → 200 + JSON → Jackson JSON → објект (како @RequestBody, обратно). Ако серверот врати 404 → <code>HttpClientErrorException.NotFound</code>. Тука нашата апликација е <b>клиент</b>.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>RestTemplate</th><th>RestClient</th><th>WebClient</th></tr>
<tr><td>Од</td><td>Spring 3 (2009)</td><td>Spring 6.1 (2023)</td><td>Spring 5 (2017)</td></tr>
<tr><td>Стил</td><td>посебни методи</td><td>fluent ланец</td><td>fluent, реактивен</td></tr>
<tr><td>Чека одговор?</td><td>да</td><td>да</td><td>не (Mono / Flux)</td></tr>
<tr><td>Зависност</td><td>spring-web</td><td>spring-web</td><td>spring-webflux</td></tr>
<tr><td>Денес</td><td>стар код</td><td>препорачан за MVC</td><td>реактивни апликации</td></tr>
</table></div>
<p>Mono&lt;T&gt; = 0 или 1 вредност „во иднина“, Flux&lt;T&gt; = 0 до N (поток).</p>
`,
  questions:[
    {type:"sort", q:"Добро или лошо REST URI?", cats:["Добро","Лошо"], items:[["/api/notifications","Добро"],["/api/getNotifications","Лошо"],["/api/notifications/7","Добро"],["/api/notification?id=7","Лошо"],["/api/shopping-carts","Добро"],["/api/Shopping_Carts","Лошо"],["/api/notifications/7.json","Лошо"]], exp:"Именка во множина, мали букви и цртичка, без глаголи, без екстензии."},
    {type:"mc", q:"curl -d '{...}' -H \"Content-Type: application/json\" http://localhost:8080/api/notifications (без -X). Кој метод?", opts:["POST, -d само по себе значи POST","GET","PUT","Грешка"], ans:[0], exp:"Без -X и без -d е GET."},
    {type:"mc", q:"Што враќа rest.postForLocation(API, req)?", opts:["URI од заглавјето Location (одговор 201)","Креираниот објект","Статусниот код","void"], ans:[0], exp:"За објектот: postForObject."},
    {type:"mc", q:"rest.getForObject(...) а серверот враќа 404. Што се случува?", opts:["Се фрла HttpClientErrorException.NotFound","Враќа null","Враќа празен објект","Повторува барање"], ans:[0], exp:"Се фаќа со try/catch ако сакаш да вратиш null."},
    {type:"sort", q:"Кој HTTP клиент?", cats:["RestTemplate","RestClient","WebClient"], items:[["Посебни методи, стар код","RestTemplate"],["Fluent, синхрон, препорачан за Spring MVC","RestClient"],["Неблокирачки, Mono / Flux","WebClient"],["Бара spring-webflux","WebClient"],["getForObject, postForLocation","RestTemplate"]], exp:"RestClient и RestTemplate се синхрони и во spring-web."},
    {type:"mc", q:"Кој статус враќа успешен DELETE во REST контролерот од предавањето?", opts:["204 No Content","200 OK со тело","201 Created","404"], ans:[0], exp:"@ResponseStatus(HttpStatus.NO_CONTENT) на void метод."}
  ]
}
]});

/* ================= diagrams ================= */
Object.assign(DIAGRAMS, {
mvcCycle(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"слоевит MVC за веб",
    nodes:[["Прелистувач",""],["Контролер","веб слој"],["Сервис","бизнис"],["Репозиториум","податоци"],["Преглед","Thymeleaf"]],
    steps:[
      [0,"Корисникот кликнува / праќа форма. Секоја акција е <b>ново HTTP барање</b>.", "GET /notifications?to=ana HTTP/1.1"],
      [1,"<b>Контролерот</b> го прима барањето, ги чита параметрите. Нема бизнис логика."],
      [2,"<b>Сервисот</b> ги применува правилата (пр. макс. 160 знаци). Не знае за HTTP."],
      [3,"<b>Репозиториумот</b> ги чита податоците. Не знае за правилата."],
      [[2,1],"Податоците (модел: Notification) се враќаат нагоре. Контролерот ги става во Model и враќа име на преглед.", "model.addAttribute(\"notifications\", list);\nreturn \"notification-list\";"],
      [4,"<b>Прегледот</b> (шаблон) се пополнува со моделот и станува HTML."],
      [0,"Прелистувачот го црта HTML-от.", "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<table>...</table>"]
    ]});
},
dispatchFlow(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"GET /welcome низ Spring MVC",
    nodes:[["DispatcherServlet","мапиран на /"],["HandlerMapping","кој метод?"],["HandlerAdapter","аргументи"],["WelcomeController","наш код"],["ViewResolver","име → датотека"],["Thymeleaf","модел + шаблон"]],
    steps:[
      [0,"DispatcherServlet го прима <b>GET /welcome</b>. Тој ги прима сите барања.", "GET /welcome HTTP/1.1\nHost: localhost:8080"],
      [1,"HandlerMapping: GET /welcome → <code>WelcomeController.showPage(Model)</code>."],
      [2,"HandlerAdapter креира празен <code>Model</code> и го повикува <code>showPage(model)</code>."],
      [3,"Контролерот: <code>message = \"Здраво, ФИНКИ!\"</code>, враќа <b>\"index\"</b>. Само ова (и шаблонот) го пишуваме ние."],
      [4,"ViewResolver: \"index\" → <code>classpath:/templates/index.html</code>."],
      [5,"Thymeleaf: <code>\${message}</code> → текст. Прелистувачот добива чист HTML без th: атрибути.", "<!DOCTYPE html>\n<html>\n<body>\n<h1>Здраво, ФИНКИ!</h1>\n</body>\n</html>"]
    ]});
},
viewResolve(el){
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">ViewResolver: што ќе се избере?</span></div>${ex("Смени prefix, suffix, анотации и што враќа методот.")}
    <div class="ctlrow">
      <div class="ctl"><label for="vrP">prefix</label><input type="text" id="vrP" value="/WEB-INF/views/"></div>
      <div class="ctl"><label for="vrS">suffix</label><input type="text" id="vrS" value=".jsp"></div>
      <div class="ctl"><label for="vrR">return</label><input type="text" id="vrR" value="question"></div>
    </div>
    <div class="diag-controls"><span class="seg" id="vrA"><button data-a="c">@Controller</button><button data-a="cb">@Controller + @ResponseBody</button><button data-a="rc">@RestController</button></span>
      <button class="btn small" data-p="jsp">JSP пример</button><button class="btn small" data-p="th">Thymeleaf (Boot)</button></div>
    <div id="vrOut"></div>`;
  let a = "c";
  const draw = () => {
    el.querySelectorAll("#vrA button").forEach(b=>b.classList.toggle("on",b.dataset.a===a));
    const p = $("#vrP",el).value, s = $("#vrS",el).value, r = $("#vrR",el).value;
    let html;
    if (a!=="c") html = `<div class="result mid">Нема преглед. Телото на одговорот е самиот текст: <code>${esc(r)}</code><small>@ResponseBody (или @RestController) → вратената вредност оди директно во одговорот.</small></div>`;
    else if (r.startsWith("redirect:")) html = `<div class="result mid">302 Found, Location: <code>${esc(r.slice(9))}</code><small>redirect: не е име на преглед, ViewResolver не бара датотека.</small></div>`;
    else html = `<div class="result ok">Датотека: <code>${esc(p+r+s)}</code><small>prefix + вратено име + suffix. URL-то и името на методот немаат улога.</small></div>`;
    $("#vrOut",el).innerHTML = html;
  };
  el.querySelectorAll("#vrA button").forEach(b=>b.onclick=()=>{a=b.dataset.a;draw();});
  el.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{ if (b.dataset.p==="jsp"){ $("#vrP",el).value="/WEB-INF/views/"; $("#vrS",el).value=".jsp"; } else { $("#vrP",el).value="classpath:/templates/"; $("#vrS",el).value=".html"; } a="c"; draw(); });
  el.querySelectorAll("input").forEach(i=>i.oninput=draw);
  draw();
},
mappingTester(el){
  const routes = [
    {m:"GET", p:"/notifications", h:"list(Model)", args:()=>({})},
    {m:"GET", p:"/notifications/new", h:"form()", args:()=>({})},
    {m:"GET", p:"/notifications/{id}", h:"details(@PathVariable Long id, Model)", args:(seg,q)=>{ if (!/^-?\d+$/.test(seg.id)) return {err:400, why:`„${seg.id}“ не може да се конвертира во Long`}; return {id:seg.id}; }},
    {m:"POST", p:"/notifications", h:"create(@RequestParam String to, @RequestParam(required=false) String channel)", args:(seg,q)=>{ if (!q.has("to")) return {err:400, why:"недостасува задолжителниот параметар to"}; return {to:q.get("to"), channel:q.get("channel")??"null"}; }},
    {m:"DELETE", p:"/notifications/{id}", h:"delete(@PathVariable Long id) · @ResponseStatus(NO_CONTENT)", args:(seg)=>{ if (!/^-?\d+$/.test(seg.id)) return {err:400, why:`„${seg.id}“ не е Long`}; return {id:seg.id, status:204}; }}
  ];
  const presets = [["GET","/notifications/1"],["GET","/notifications/new"],["GET","/notifications/abc"],["GET","/notifications/5/details"],["PUT","/notifications/5"],["POST","/notifications?to=ana@finki.ukim.mk"],["POST","/notifications"],["DELETE","/notifications/3"],["GET","/welcome"]];
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">тестер за мапирање</span></div>${ex("Контролерот подолу е мапиран на /notifications. Прати барање и види кој метод се повикува, со кои аргументи, или кој статус се враќа.")}
    <pre class="raw">${esc(`@Controller
@RequestMapping("/notifications")
class NotificationController {
  @GetMapping                 list(Model)
  @GetMapping("/new")         form()
  @GetMapping("/{id}")        details(@PathVariable Long id, Model)
  @PostMapping                create(@RequestParam String to, @RequestParam(required=false) String channel)
  @DeleteMapping("/{id}")     delete(@PathVariable Long id)   // @ResponseStatus(NO_CONTENT)
}`)}</pre>
    <div class="ctlrow" style="margin-top:10px"><div class="ctl"><label for="mtM">Метод</label><select id="mtM"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></div>
      <div class="ctl" style="flex:1;min-width:200px"><label for="mtU">URL</label><input type="text" id="mtU" value="/notifications/1"></div><button class="btn primary" id="mtGo">Прати</button></div>
    <div class="diag-controls">${presets.map((p,k)=>`<button class="btn small" data-k="${k}">${p[0]} ${esc(p[1])}</button>`).join("")}</div>
    <div id="mtR"></div>`;
  const match = (pat, path) => { const a = pat.split("/").filter(Boolean), b = path.split("/").filter(Boolean); if (a.length!==b.length) return null; const seg = {}; for (let i=0;i<a.length;i++){ if (a[i].startsWith("{")) seg[a[i].slice(1,-1)] = b[i]; else if (a[i]!==b[i]) return null; } return seg; };
  const run = () => {
    const m = $("#mtM",el).value; let raw = $("#mtU",el).value.trim(); if (!raw.startsWith("/")) raw = "/"+raw;
    const [path, qs] = raw.split("?"); const q = new URLSearchParams(qs||"");
    const lit = routes.filter(r => !r.p.includes("{")), tpl = routes.filter(r => r.p.includes("{"));
    const cands = [];
    [...lit, ...tpl].forEach(r => { const seg = match(r.p, path); if (seg) cands.push([r, seg]); });
    let html;
    if (!cands.length) html = `<div class="result bad">404 Not Found<small>Ниту едно мапирање не ја покрива патеката ${esc(path)}.</small></div>`;
    else {
      const sameMethod = cands.filter(([r]) => r.m===m);
      if (!sameMethod.length) html = `<div class="result bad">405 Method Not Allowed<small>Патеката постои, но само за: ${[...new Set(cands.map(([r])=>r.m))].join(", ")}.</small></div>`;
      else {
        const [r, seg] = sameMethod[0];
        const res = r.args(seg, q);
        const note = cands.length>1 && r.p.indexOf("{")<0 && cands.some(([x])=>x.p.includes("{")&&x.m===m) ? " Литералната патека е поконкретна од {id}." : "";
        if (res.err) html = `<div class="result bad">${res.err} Bad Request<small>Мапирањето се совпаѓа (${esc(r.h)}), но ${esc(res.why)}.</small></div>`;
        else { const args = Object.entries(res).filter(([k])=>k!=="status").map(([k,v])=>`${k} = ${v}`).join(", ");
          html = `<div class="result ok">${res.status||200} · се повикува <code>${esc(r.h)}</code><small>${args?"Аргументи: "+esc(args)+".":"Без аргументи од барањето."}${note}</small></div>`; }
      }
    }
    $("#mtR",el).innerHTML = html;
  };
  $("#mtGo",el).onclick = run;
  el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ const p = presets[+b.dataset.k]; $("#mtM",el).value=p[0]; $("#mtU",el).value=p[1]; run(); });
  run();
},
argMapper(el){
  const parts = [
    ["line","POST /api/notifications/","",""],
    ["path","7","@PathVariable Long id","id = 7 (String \"7\" → Long)"],
    ["line","/resend?","",""],
    ["query","channel=sms","@RequestParam String channel","channel = \"sms\""],
    ["line"," HTTP/1.1\nHost: localhost:8080\n","",""],
    ["header","Accept-Language: mk","@RequestHeader(\"Accept-Language\") String lang","lang = \"mk\""],
    ["line","\n","",""],
    ["cookie","Cookie: theme=dark","@CookieValue String theme","theme = \"dark\""],
    ["line","\nContent-Type: application/json\n\n","",""],
    ["body",'{"to": "ana@finki.ukim.mk", "message": "Потсетник"}',"@RequestBody NotificationRequest req","req.to() = \"ana@finki.ukim.mk\", req.message() = \"Потсетник\" (Jackson)"]
  ];
  const col = {path:"#ffcf6b", query:"#8fe3b0", header:"#9db8ff", cookie:"#ff9aa6", body:"#d9a6ff"};
  el.innerHTML = `<div class="section-title">Интерактивно <span class="tag">барање → аргументи на методот</span></div>${ex("Кликни обоен дел од барањето за да видиш која анотација го чита.")}
    <pre class="raw" id="amRaw" style="line-height:1.9"></pre><div id="amR"></div>`;
  $("#amRaw",el).innerHTML = parts.map((p,k)=> p[0]==="line" ? esc(p[1]) : `<span data-k="${k}" style="color:${col[p[0]]};border-bottom:2px solid ${col[p[0]]};cursor:pointer">${esc(p[1])}</span>`).join("");
  const show = k => { const p = parts[k]; el.querySelectorAll("[data-k]").forEach(s=>s.style.background = +s.dataset.k===k?"rgba(255,255,255,.12)":""); $("#amR",el).innerHTML = `<div class="result ok"><code>${esc(p[2])}</code><small>${esc(p[3])}</small></div>`; };
  el.querySelectorAll("[data-k]").forEach(s => s.onclick = () => show(+s.dataset.k));
  show(1);
},
flashSim(el){
  let mode = "flash", i = 0;
  const steps = {
    model:[["POST /notifications","model.addAttribute(\"info\", …)","-","-"],["302 → Location: /notifications","Model се брише со барањето","-","-"],["GET /notifications","-","нема info","листа без порака"],["F5 → GET","-","нема info","листа без порака"]],
    flash:[["POST /notifications","info се зачувува во сесија","-","-"],["302 → Location: /notifications","info чека во сесија","-","-"],["GET /notifications","info се вади и брише","info е тука","„Известувањето е испратено“"],["F5 → GET","празно","нема info","листа без порака"]]
  };
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">Model vs Flash по redirect</span></div>
    <div class="diag-controls"><span class="seg" id="fsM"><button data-m="model">model.addAttribute</button><button data-m="flash">redirect.addFlashAttribute</button></span><button class="btn small primary" data-a="n">Следен чекор →</button><button class="btn small" data-a="r">Одново</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Барање</th><th>Сесија / Model</th><th>Model на GET</th><th>Корисникот гледа</th></tr></thead><tbody id="fsB"></tbody></table></div><div id="fsR"></div>`;
  const draw = () => {
    el.querySelectorAll("#fsM button").forEach(b=>b.classList.toggle("on",b.dataset.m===mode));
    $("#fsB",el).innerHTML = steps[mode].map((r,k)=>`<tr style="${k<i?"":"opacity:.2"}"><td>${k+1}</td>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("");
    $("#fsR",el).innerHTML = i>=4 ? (mode==="flash" ? `<div class="result ok">Flash го преживува redirect-от, се прикажува еднаш, па исчезнува.</div>` : `<div class="result bad">Пораката се изгуби. Redirect е ново GET барање, а Model живее само едно барање.</div>`) : "";
  };
  el.querySelectorAll("#fsM button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;i=0;draw();});
  el.querySelector('[data-a="n"]').onclick = () => { i=Math.min(4,i+1); draw(); };
  el.querySelector('[data-a="r"]').onclick = () => { i=0; draw(); };
  draw();
},
errorFlow(el){
  const sc = {
    a:{t:"GET /api/notifications/99 (не постои)", steps:["findById(99) → service.findById враќа Optional.empty()","orElseThrow → new NotificationNotFoundException(99)","Исклучокот излегува од методот","HandlerExceptionResolver ја чита @ResponseStatus(NOT_FOUND) на класата"], res:["bad","404 Not Found"]},
    b:{t:"POST со порака од 200 знаци (има @ExceptionHandler)", steps:["create() → service.notifyUser(...)","Сервисот фрла IllegalArgumentException(\"Предолга порака\")","create() не ја фаќа, исклучокот излегува","Spring наоѓа @ExceptionHandler(IllegalArgumentException.class) во истиот контролер → badInput(e)"], res:["mid","400 Bad Request · тело: Предолга порака"]},
    c:{t:"POST со порака од 200 знаци (БЕЗ handler)", steps:["create() → service.notifyUser(...)","Сервисот фрла IllegalArgumentException","Нема @ExceptionHandler, @ControllerAdvice ни @ResponseStatus"], res:["bad","500 Internal Server Error"]},
    d:{t:"POST валидно известување", steps:["create() → service.notifyUser(...) враќа Notification(id=8)","ResponseEntity.created(URI.create(\"/api/notifications/8\")).body(n)"], res:["ok","201 Created · Location: /api/notifications/8 · JSON тело"]}
  };
  let k = "a";
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">од исклучок до статус</span></div>
    <div class="diag-controls"><select id="efS">${Object.entries(sc).map(([id,s])=>`<option value="${id}">${esc(s.t)}</option>`).join("")}</select></div>
    <div class="pathflow" id="efF"></div>`;
  const draw = () => { const s = sc[k]; $("#efF",el).innerHTML = s.steps.map(t=>`<div class="pf hit" style="background:transparent">${esc(t)}</div>`).join("") + `<div class="result ${s.res[0]}">${esc(s.res[1])}</div>`; };
  $("#efS",el).onchange = e => { k = e.target.value; draw(); };
  draw();
},
curlSim(el){
  const C2 = [
    ["curl http://localhost:8080/api/notifications/1", `{"id":1,"to":"ana@finki.ukim.mk","message":"Добредојде!","channel":"email"}`, "Без -X и без -d: GET. Без -i: само телото."],
    [`curl -i -X POST http://localhost:8080/api/notifications \\\n  -H "Content-Type: application/json" \\\n  -d '{"to":"marko@finki.ukim.mk","message":"Испит во петок"}'`, `HTTP/1.1 201\nLocation: /api/notifications/2\nContent-Type: application/json\n\n{"id":2,"to":"marko@finki.ukim.mk","message":"Испит во петок","channel":"email"}`, "ResponseEntity.created(uri).body(n): 201 + Location. -i ги покажува статусот и заглавјата."],
    [`curl -i -X POST http://localhost:8080/api/notifications \\\n  -d '{"to":"marko@finki.ukim.mk"}'`, `HTTP/1.1 415\nContent-Type: application/json\n\n{"error":"Unsupported Media Type"}`, "Без -H Content-Type curl праќа application/x-www-form-urlencoded, а @RequestBody очекува JSON → 415."],
    ["curl -i -X DELETE http://localhost:8080/api/notifications/2", "HTTP/1.1 204", "@ResponseStatus(NO_CONTENT) на void метод: нема тело."],
    ["curl -i http://localhost:8080/api/notifications/99", `HTTP/1.1 404\nContent-Type: application/json\n\n{"status":404,"error":"Not Found"}`, "NotificationNotFoundException со @ResponseStatus(NOT_FOUND)."],
    ["curl -i http://localhost:8080/api/notifications/abc", `HTTP/1.1 400\n\n{"status":400,"error":"Bad Request"}`, "\"abc\" не е Long."]
  ];
  el.innerHTML = `<div class="section-title">Терминал <span class="tag">пробај го API-то</span></div>${ex("Избери команда и види што враќа REST контролерот од предавањето.")}
    <div class="diag-controls">${C2.map((c,k)=>`<button class="btn small" data-k="${k}">${k+1}. ${esc(c[0].split("\n")[0].replace("curl ","").slice(0,38))}…</button>`).join("")}</div>
    <pre class="raw" id="csO"></pre><div id="csN" style="font-size:14px;color:var(--muted);margin-top:6px"></div>`;
  const show = k => { const c = C2[k]; el.querySelectorAll("[data-k]").forEach(b=>b.classList.toggle("primary",+b.dataset.k===k)); $("#csO",el).innerHTML = `<span class="g">$ ${esc(c[0])}</span>\n${esc(c[1])}`; $("#csN",el).textContent = c[2]; };
  el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>show(+b.dataset.k));
  show(0);
}
});
})();
