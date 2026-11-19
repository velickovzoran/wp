/* Л4: Запознавање со Spring (04 Spring.pdf) */
(function(){
const ex = (t) => `<p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:72ch">${t}</p>`;

LECTURES.push({id:"l4", short:"Л4", title:"Spring: DI и бинови", deck:"04 Spring",
  blurb:"Зависности и DI, DIP/DI/IoC, SOLID, IoC контејнер, бинови, @Component, @Bean, Spring Boot.",
  sections:[
{
  id:"l4-why", num:"Час 1", title:"Зошто Spring и што е зависност", deep:true,
  sub:"Од new во класата, преку рачно DI, до Spring што склопува сам.",
  diagram:["wiring"],
  script:`
<h2>Што е Spring</h2>
<p><b>Рамка (framework)</b> за развој на Java апликации. Ги <b>креира и поврзува</b> објектите (компонентите), нуди готова инфраструктура (веб, бази, безбедност, тестирање). Ние пишуваме бизнис логика, Spring се грижи за поврзувањето. Отворен код, индустриски стандард.</p>
<div class="key"><b>Библиотека vs рамка:</b> библиотеката ти ја повикуваш кога ти треба (<code>Math.max(a, b)</code>). Рамката <b>го повикува твојот код</b> (Spring го повикува твојот контролер кога ќе пристигне HTTP барање).</div>
<div class="tbl-wrap"><table>
<tr><th>Со сервлети (досега)</th><th>Со Spring (од сега)</th></tr>
<tr><td>Објектите ги креираме рачно со <code>new</code></td><td>Објектите ги креира Spring</td></tr>
<tr><td>Секој сервлет сам си ги прави зависностите</td><td>Зависностите се вметнуваат автоматски</td></tr>
<tr><td>Параметрите рачно ги читаме од request</td><td>Параметрите се мапираат во Java методи</td></tr>
<tr><td>web.xml / @WebServlet</td><td>Анотации и application.properties</td></tr>
<tr><td>Посебно инсталиран Tomcat</td><td>Вграден сервер, старт со main()</td></tr>
</table></div>
<p>Spring MVC внатрешно користи сервлет (<b>DispatcherServlet</b>), па знаењето за сервлети останува корисно.</p>
<p><b>Историја:</b> 2003 Spring (реакција на сложениот J2EE, POJO наместо тешки EJB и многу XML) · 2007 Spring 2.5 (анотации) · 2014 Spring Boot 1.0 · 2022 Spring 6 / Boot 3 (Java 17, Jakarta EE) · 2025 Spring 7 / Boot 4.</p>
<div class="tbl-wrap"><table>
<tr><th>Технологија</th><th>Одговорност</th></tr>
<tr><td>Spring Framework</td><td>IoC, DI, бинови: ги креира и поврзува компонентите</td></tr>
<tr><td>Spring Boot</td><td>Стартување, конфигурација</td></tr>
<tr><td>Spring MVC</td><td>HTTP барања: URL → Java метод</td></tr>
<tr><td>Spring Data JPA</td><td>Пристап до бази</td></tr>
<tr><td>Spring Security</td><td>Најава и контрола на пристап</td></tr>
</table></div>
<p><b>Spring Boot не е замена за Spring Framework.</b> Boot = Spring + разумни стандардни поставки. Без Boot конфигурираш рачно сервер, бинови, библиотеки. Со Boot додаваш „стартер“ и сè е подготвено (а може да се додефинира).</p>
<h2>Што е зависност</h2>
<p>Класата A <b>зависи</b> од B ако A ја користи B за да ја заврши својата работа. Пример низ целата тема: <code>NotificationController → NotificationService → NotificationSender</code> (EmailSender / SmsSender).</p>
${C(`
public class NotificationService {
    private EmailSender sender = new EmailSender();   // погрешно
    public void notifyUser(String to, String message) { sender.send(to, message); }
}`)}
<div class="trap"><b>Проблем: цврсто поврзување (tight coupling).</b> Сервисот сам ја креира зависноста. Не може да се замени (SMS) без промена на кодот. Тешко за тестирање (секогаш се праќа вистински e-mail). Ако EmailSender има свои зависности (SMTP, конфигурација), сервисот мора да знае и за нив.</div>
<h2>Решение: зависност однадвор</h2>
${C(`
public class NotificationService {
    private final EmailSender sender;
    public NotificationService(EmailSender sender) { this.sender = sender; }
    ...
}
// Main: некој друг ја креира зависноста
NotificationService service = new NotificationService(new EmailSender());`)}
<p>Сервисот само кажува што му треба (параметар во конструкторот). Полето е <code>final</code>, па зависноста не може да се заборави.</p>
<div class="key"><b>Dependency Injection (DI):</b> објектот ги добива зависностите однадвор, наместо сам да ги креира. DI <b>не е функционалност на Spring</b>, туку општа техника. Spring само го автоматизира. Тука: вметнување преку конструктор.</div>
<p>Придобивки: <b>флексибилност</b> (e-mail или SMS без промена), <b>тестирање</b> (лажна/fake зависност), <b>јасност</b> (од конструкторот гледаш што ѝ треба). Интерфејс (<code>NotificationSender</code>) воведуваме кога има потреба од повеќе имплементации (тест, продукција, развој). За DI <b>интерфејс не е задолжителен</b>.</p>
<h2>SOLID: S, O, D</h2>
<ul>
<li><b>S</b> Single Responsibility: една класа, една одговорност (една причина за промена). Controller / Service / Repository.</li>
<li><b>O</b> Open/Closed: ново однесување со <b>додавање</b> класа, не со менување постоечка. Нов PushSender, сервисот не се менува.</li>
<li><b>D</b> Dependency Inversion: класите зависат од <b>апстракции</b> (интерфејси), не од конкретни класи. Сервисот (високо ниво) зависи од NotificationSender, не од EmailSender (ниско ниво).</li>
<li>L (Liskov: секоја имплементација може да ја замени друга без изненадувања) и I (Interface Segregation: помали интерфејси) се додатен материјал.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Поим</th><th>Што е</th></tr>
<tr><td><b>DIP</b></td><td>Принцип: зависи од апстракции</td></tr>
<tr><td><b>DI</b></td><td>Техника: зависностите се предаваат однадвор</td></tr>
<tr><td><b>IoC</b></td><td>Контролата за креирање и поврзување ја презема рамката („Не нè барајте вие, ние ќе ве побараме“, Hollywood principle)</td></tr>
</table></div>
<h2>Кој ги склопува објектите?</h2>
<p>Во Main сите <code>new</code> се на едно место (добро), но Main расте со секоја класа, мора да внимаваме на редоследот и дали треба еден или повеќе објекти. Тоа Spring го прави автоматски. Резиме: <b>new во класата</b> (цврсто) → <b>рачно DI</b> (лабаво, рачно склопување) → <b>Spring DI</b> (автоматско склопување).</p>
`,
  questions:[
    {type:"mc", q:"Која е разликата помеѓу библиотека и рамка?", opts:["Рамката го повикува твојот код, а библиотеката ти ја повикуваш","Библиотеката го повикува твојот код","Нема разлика","Рамката е секогаш поголема"], ans:[0], exp:"Spring го повикува твојот контролер кога пристигнува барање. Тоа е инверзија на контролата."},
    {type:"mc", q:"Што е главниот проблем со private EmailSender sender = new EmailSender(); во сервисот?", opts:["Цврсто поврзување: не може да се замени ниту лесно да се тестира","Полето не е public","EmailSender нема конструктор","Spring не дозволува new"], ans:[0], exp:"Сервисот сам одлучува за зависноста. За SMS или fake во тест мора да се менува неговиот код."},
    {type:"mc", q:"Што е Dependency Injection?", opts:["Техника каде објектот ги добива зависностите однадвор","Функционалност што постои само во Spring","Креирање на зависностите со new во конструкторот","Наследување на класа"], ans:[0], exp:"DI е општа техника. Spring само го автоматизира вметнувањето."},
    {type:"sort", q:"DIP, DI или IoC?", cats:["DIP","DI","IoC"], items:[["Класите зависат од апстракции (интерфејси)","DIP"],["Зависноста се предава преку конструктор","DI"],["Рамката ја презема контролата за креирање и поврзување","IoC"],["Hollywood principle: не нè барајте, ние ќе ве побараме","IoC"],["NotificationService зависи од NotificationSender, не од EmailSender","DIP"],["Објектот ги добива зависностите однадвор","DI"]], exp:"DIP е принцип за дизајн, DI е техниката, IoC е кој има контрола врз животот на објектите."},
    {type:"sort", q:"Кој SOLID принцип?", cats:["S","O","D"], items:[["Controller / Service / Repository","S"],["Една причина за промена","S"],["Додаваме PushSender, сервисот не се менува","O"],["Ново однесување со додавање класа","O"],["Високото ниво зависи од интерфејс","D"]], exp:"S = една одговорност, O = отворено за проширување, затворено за менување, D = инверзија на зависности."},
    {type:"mc", q:"Дали за DI е задолжителен интерфејс?", opts:["Не, интерфејс воведуваме кога има повеќе имплементации","Да, секогаш","Да, но само во Spring","Само за final полиња"], ans:[0], exp:"FakeEmailSender extends EmailSender работи и без интерфејс."},
    {type:"mc", q:"Што е Spring Boot во однос на Spring Framework?", opts:["Spring + разумни стандардни поставки (стартери, автоконфигурација, вграден сервер)","Замена за Spring Framework","Посебна рамка без IoC","Само за REST"], ans:[0], exp:"Сите модули (Boot, MVC, Data, Security) се градат врз Spring Framework."}
  ]
},
{
  id:"l4-beans", num:"Час 2", title:"IoC контејнер и бинови", deep:true,
  sub:"Што е бин, како Spring ги наоѓа класите и зошто апликацијата не стартува.",
  diagram:["scanSim"],
  script:`
<h2>Три основни поими</h2>
<div class="tbl-wrap"><table>
<tr><th>Бин (bean)</th><th>IoC контејнер</th><th>Dependency Injection</th></tr>
<tr><td>Објект што го креира и со кој управува Spring. Пр. инстанцата од NotificationService.</td><td>Дел од Spring што ги креира бинoвите, ги поврзува и управува со нивниот животен циклус. Во кодот: <code>ApplicationContext</code>.</td><td>Процес на предавање на зависностите на бинот. Spring му го дава EmailSender на сервисот.</td></tr>
</table></div>
<div class="key">Класата не е бин. <b>Бин е објектот</b> што Spring го креирал од таа класа. Стандардно секој бин се креира <b>еднаш</b>.</div>
<div class="tbl-wrap"><table>
<tr><th>Бинови (ги креира Spring)</th><th>Не се бинови</th></tr>
<tr><td>EmailSender (@Component), NotificationService (@Service), NotificationRepository (@Repository), NotificationController (@RestController), објект вратен од @Bean метод</td><td>Notification (податоци), DTO, String, List, објекти креирани со new во некој метод, сè што Spring не го креирал</td></tr>
</table></div>
<h2>Како Spring ги наоѓа класите: component scan</h2>
<p><code>@Component</code> = „Spring, креирај бин од оваа класа“. Процесот: Spring стартува → ги скенира пакетите → наоѓа класи со @Component или изведена анотација → креира бин од секоја → вметнува зависности.</p>
<div class="tbl-wrap"><table>
<tr><th>Анотација</th><th>Улога</th><th>Пример</th></tr>
<tr><td>@Component</td><td>општа компонента</td><td>EmailSender</td></tr>
<tr><td>@Service</td><td>бизнис логика</td><td>NotificationService</td></tr>
<tr><td>@Repository</td><td>пристап до податоци / надворешни системи</td><td>NotificationRepository</td></tr>
<tr><td>@Controller</td><td>веб слој (HTML)</td><td>NotificationController</td></tr>
<tr><td>@RestController</td><td>веб слој (JSON / текст)</td><td>NotificationController</td></tr>
</table></div>
<p>Сите се „изведени од“ @Component. Различните имиња ја покажуваат улогата.</p>
<h2>@Bean во @Configuration</h2>
${C(`
@Configuration
public class SenderConfig {
    @Bean
    public NotificationSender emailSender() { return new EmailSender(); } // класата БЕЗ @Component
    @Bean
    public NotificationSender smsSender() { return new SmsSender(); }
}`)}
<p><b>Име на бинот = име на методот.</b> Корисно за <b>туѓи класи</b> (од библиотеки) што не можеш да ги анотираш. Наши класи → анотација. Туѓи → new во @Bean метод.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>@Component (и @Service...)</th><th>@Bean</th></tr>
<tr><td>Каде</td><td>на класата</td><td>на метод во @Configuration класа</td></tr>
<tr><td>Кој креира</td><td>Spring (го повикува конструкторот)</td><td>ние во методот</td></tr>
<tr><td>Како се наоѓа</td><td>component scan</td><td>Spring ги повикува @Bean методите</td></tr>
<tr><td>Име</td><td>класа со мала прва буква: emailSender</td><td>име на методот</td></tr>
<tr><td>Кога</td><td>наши класи</td><td>туѓи класи или посебна логика за креирање</td></tr>
</table></div>
<div class="trap"><b>Не регистрирај иста класа двапати</b> (и @Component и @Bean): добиваш дупли бинови.</div>
<h2>ApplicationContext без Spring Boot</h2>
${C(`
@Configuration
@ComponentScan("com.example.notifications")
public class AppConfig { }

ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
NotificationService service = context.getBean(NotificationService.class); // во пракса ретко`)}
<h2>Кои пакети се скенираат?</h2>
<p>Пакетот на главната класа (со @SpringBootApplication) <b>и сите негови потпакети</b>. Класа надвор (пр. <code>com.other.SmsSender</code>) не станува бин → грешка при вметнување. Честа грешка кај почетниците.</p>
<h2>Читање на грешката</h2>
${C(`
APPLICATION FAILED TO START
Parameter 0 of constructor in ...NotificationService
required a bean of type '...NotificationSender' that could not be found.`)}
<p>NotificationService = кој бин не може да се креира. NotificationSender = кој бин недостасува. Најчести причини: (1) недостасува анотација, (2) класата е надвор од скенираниот пакет, (3) се очекува @Bean метод кој не постои.</p>
`,
  questions:[
    {type:"mc", multi:true, q:"Кои од следните анотации ги вклучуваат КЛАСИТЕ во Spring контекстот?", opts:["@Service","@Configuration","@Bean","@Singleton","@Context","@Prototype"], ans:[0,1], exp:"@Service и @Configuration се изведени од @Component и се пишуваат на класа. @Bean се пишува на метод, а @Singleton, @Context, @Prototype не се Spring анотации за регистрација."},
    {type:"mc", q:"Што од следното НЕ е бин?", opts:["Notification креиран со new во сервисот","NotificationService со @Service","Објект вратен од @Bean метод","NotificationRepository со @Repository"], ans:[0], exp:"Бин е само она што Spring го креирал. Податочните објекти не се бинови."},
    {type:"mc", q:"Како се вика бинот од @Bean public NotificationSender smsSender() { ... }?", opts:["smsSender","SmsSender","notificationSender","senderConfig"], ans:[0], exp:"Кај @Bean името е името на методот. Кај @Component е името на класата со мала прва буква."},
    {type:"mc", q:"Главната класа е во com.example.notifications, а SmsSender (@Component) е во com.other. Што се случува?", opts:["SmsSender не станува бин, вметнувањето паѓа ако некој го бара","Spring го наоѓа бидејќи има @Component","Spring го креира двапати","Апликацијата работи, но побавно"], ans:[0], exp:"Component scan ги бара само пакетот на главната класа и неговите потпакети."},
    {type:"mc", q:"„Parameter 0 of constructor in NotificationService required a bean of type NotificationSender that could not be found.“ Кој бин недостасува?", opts:["NotificationSender","NotificationService","NotificationController","ApplicationContext"], ans:[0], exp:"NotificationService не може да се креира затоа што нема бин од тип NotificationSender."},
    {type:"sort", q:"@Component или @Bean?", cats:["@Component","@Bean"], items:[["Се пишува на класа","@Component"],["Се пишува на метод во @Configuration","@Bean"],["За туѓи класи од библиотеки","@Bean"],["Име: класа со мала прва буква","@Component"],["Име: името на методот","@Bean"],["Се наоѓа со component scan","@Component"],["Ние го креираме објектот со new","@Bean"]], exp:"Наши класи → анотација на класата. Туѓи класи → @Bean метод што враќа нов објект."},
    {type:"mc", q:"Како се креира ApplicationContext без Spring Boot?", opts:["new AnnotationConfigApplicationContext(AppConfig.class)","SpringApplication.run()","new ServletContext()","@EnableAutoConfiguration"], ans:[0], exp:"AppConfig има @Configuration и @ComponentScan. getBean() бара бин од контејнерот."}
  ]
},
{
  id:"l4-boot", num:"Час 2", title:"Spring Boot и прва апликација", deep:true,
  sub:"Стартери, автоконфигурација, вграден Tomcat и што се случува при run().",
  diagram:["bootStartup"],
  script:`
<h2>Што додава Spring Boot</h2>
<ul>
<li><b>Стартери</b>: една зависност наместо десетици (<code>spring-boot-starter-web</code>).</li>
<li><b>Автоматска конфигурација</b>: ги гледа библиотеките на classpath и сам ги конфигурира потребните бинови.</li>
<li><b>Вграден сервер</b>: Tomcat е дел од апликацијата, старт со main(), без инсталација.</li>
<li><b>application.properties</b>: конфигурација на едно место, без XML.</li>
</ul>
<h2>Креирање проект</h2>
<p>start.spring.io (или IntelliJ → New Project → Spring Boot) · Maven · Java 17+ · Group <code>com.example</code>, Artifact <code>notifications</code> · Dependencies: Spring Web · Generate → отвори → стартувај <code>main()</code> → <code>http://localhost:8080</code>.</p>
${C(`
notifications
├── pom.xml
└── src
    ├── main
    │   ├── java/com/example/notifications/NotificationsApplication.java
    │   └── resources/application.properties
    └── test/java/com/example/notifications/NotificationsApplicationTests.java`)}
<p>Во pom.xml parent е <code>spring-boot-starter-parent</code>. Кај стартерот <b>нема верзија</b>: Boot ги усогласува верзиите на сите библиотеки.</p>
<h2>@SpringBootApplication = три анотации</h2>
${C(`
@SpringBootApplication
public class NotificationsApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationsApplication.class, args);
    }
}`)}
<div class="tbl-wrap"><table>
<tr><th>@Configuration</th><td>класата може да дефинира бинови преку @Bean методи</td></tr>
<tr><th>@EnableAutoConfiguration</th><td>креира бинови од класите на надворешните библиотеки што ги користи апликацијата</td></tr>
<tr><th>@ComponentScan</th><td>скенира го пакетот и потпакетите, креира бинови од @Component и изведените</td></tr>
</table></div>
<p><code>SpringApplication.run()</code> го креира <b>ApplicationContext</b> и го стартува вградениот <b>Tomcat</b> (порта 8080).</p>
<h2>Прва апликација</h2>
${C(`
@Component
public class EmailSender implements NotificationSender { ... }

@Service
public class NotificationService {
    private final NotificationSender sender;
    public NotificationService(NotificationSender sender) { this.sender = sender; } // еден конструктор, без @Autowired
}

@RestController
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service = service; }
    @GetMapping("/notify")
    public String notifyUser() { service.notifyUser("ana@finki.ukim.mk", "Добредојде!"); return "Испратено"; }
}`)}
<div class="key">Еден конструктор → автоматско вметнување, <b>без @Autowired</b>.</div>
<div class="tbl-wrap"><table>
<tr><th>Што гледаме во кодот</th><th>Кој го обезбедува</th></tr>
<tr><td>@Component, @Service, конструктор со зависност</td><td>Spring Framework (IoC, бинови, DI)</td></tr>
<tr><td>@RestController, @GetMapping("/notify")</td><td>Spring MVC (HTTP барање → Java метод)</td></tr>
<tr><td>@SpringBootApplication, стартери, вграден Tomcat</td><td>Spring Boot (стартување и конфигурација)</td></tr>
</table></div>
`,
  questions:[
    {type:"sort", q:"Која од трите анотации во @SpringBootApplication го прави тоа?", cats:["@Configuration","@EnableAutoConfiguration","@ComponentScan"], items:[["Класата може да дефинира @Bean методи","@Configuration"],["Конфигурира бинови од библиотеките на classpath","@EnableAutoConfiguration"],["Ги наоѓа @Component класите во пакетот и потпакетите","@ComponentScan"]], exp:"@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan."},
    {type:"mc", q:"Што прави SpringApplication.run()?", opts:["Го креира ApplicationContext и го стартува вградениот Tomcat (8080)","Само ги компајлира класите","Го пакува .war","Ги чита web.xml сервлетите"], ans:[0], exp:"По креирањето на контекстот се прави component scan, се креираат бинoвите и се стартува серверот."},
    {type:"mc", q:"Зошто кај spring-boot-starter-web во pom.xml нема верзија?", opts:["spring-boot-starter-parent ги усогласува верзиите","Maven ја погодува","Стартерите немаат верзии","Се зема најновата од интернет"], ans:[0], exp:"Boot гарантира компатибилни верзии на сите библиотеки."},
    {type:"mc", q:"Кој е редоследот на креирање на биновите EmailSender, NotificationService, NotificationController?", opts:["EmailSender → NotificationService → NotificationController","NotificationController → NotificationService → EmailSender","Сите истовремено","Зависи од азбучниот ред"], ans:[0], exp:"Прво бинот без зависности, па оној што зависи од него, итн. Spring сам го одредува редоследот."},
    {type:"sort", q:"Кој дел од Spring го обезбедува тоа?", cats:["Spring Framework","Spring MVC","Spring Boot"], items:[["@Component, @Service, DI преку конструктор","Spring Framework"],["@RestController, @GetMapping","Spring MVC"],["@SpringBootApplication, стартери, вграден Tomcat","Spring Boot"],["ApplicationContext (IoC контејнер)","Spring Framework"],["URL → Java метод","Spring MVC"]], exp:"Framework = бинови и DI. MVC = веб слој. Boot = стартување и конфигурација."},
    {type:"mc", q:"Каде се наоѓа application.properties?", opts:["src/main/resources","src/main/java","WEB-INF","во root на проектот до pom.xml"], ans:[0], exp:"Spring Boot ја чита автоматски од classpath при стартување."}
  ]
}
]});

/* ================= diagrams ================= */
Object.assign(DIAGRAMS, {
wiring(el){
  let mode = "new", sender = "Email";
  const out = {Email:"EMAIL до ana@finki.ukim.mk: Добредојде!", Sms:"SMS до ana@finki.ukim.mk: Добредојде!", Fake:"(ништо не е пратено) fake.lastMessage = \"Добредојде!\""};
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">од new до Spring DI</span></div>${ex("Избери начин на поврзување и имплементација. Гледај кој код мора да се смени за да се смени sender-от.")}
    <div class="diag-controls"><span class="seg" id="wMode"><button data-m="new">1 · new во класата</button><button data-m="manual">2 · рачно DI</button><button data-m="spring">3 · Spring DI</button></span></div>
    <div class="diag-controls"><span style="font-weight:600;font-size:14px">Sender:</span><span class="seg" id="wSend"><button data-s="Email">EmailSender</button><button data-s="Sms">SmsSender</button><button data-s="Fake">FakeSender (тест)</button></span></div>
    <div class="twocol"><div><b style="font-size:13px">NotificationService</b><pre class="raw" id="wSvc"></pre></div><div><b style="font-size:13px">Кој склопува</b><pre class="raw" id="wMain"></pre></div></div>
    <div id="wRes"></div>`;
  const draw = () => {
    el.querySelectorAll("#wMode button").forEach(b=>b.classList.toggle("on",b.dataset.m===mode));
    el.querySelectorAll("#wSend button").forEach(b=>b.classList.toggle("on",b.dataset.s===sender));
    const cls = sender+"Sender";
    if (mode==="new"){
      $("#wSvc",el).textContent = `public class NotificationService {\n  private ${cls} sender = new ${cls}();  // <- мора да се менува ТУКА\n  public void notifyUser(String to, String msg) {\n    sender.send(to, msg);\n  }\n}`;
      $("#wMain",el).textContent = `var service = new NotificationService();\nservice.notifyUser("ana@finki.ukim.mk", "Добредојде!");`;
      $("#wRes",el).innerHTML = `<div class="result bad">Цврсто поврзување<small>За да смениш во ${cls} мораше да го смениш кодот на самиот сервис. ${sender==="Fake"?"Тестот би морал да го менува производниот код.":""} Излез: ${esc(out[sender])}</small></div>`;
    } else if (mode==="manual"){
      $("#wSvc",el).textContent = `public class NotificationService {\n  private final NotificationSender sender;\n  public NotificationService(NotificationSender sender) {\n    this.sender = sender;   // не знае која имплементација\n  }\n  ...\n}`;
      $("#wMain",el).textContent = `// Main (или тест) склопува рачно\nNotificationSender sender = new ${cls}();   // <- менуваш само ТУКА\nvar service = new NotificationService(sender);\nvar controller = new NotificationController(service);\ncontroller.handle();`;
      $("#wRes",el).innerHTML = `<div class="result mid">Лабаво поврзување, рачно склопување<small>Сервисот не се смени. Изборот е во Main, кој расте со секоја нова класа. Излез: ${esc(out[sender])}</small></div>`;
    } else {
      $("#wSvc",el).textContent = `@Service\npublic class NotificationService {\n  private final NotificationSender sender;\n  public NotificationService(NotificationSender sender) {\n    this.sender = sender;\n  }\n}`;
      $("#wMain",el).textContent = sender==="Fake" ? `// unit тест: ние сме „контејнерот“\nvar fake = new FakeSender();\nvar service = new NotificationService(fake);\nservice.notifyUser("ana@finki.ukim.mk", "Добредојде!");` : `@Component${sender==="Email"?"   // единствениот бин од тип NotificationSender":""}\npublic class ${cls} implements NotificationSender { ... }\n\n// нема new, нема Main што склопува.\n// Spring: скенира, креира ${cls}, го вметнува во сервисот.`;
      $("#wRes",el).innerHTML = `<div class="result ok">IoC: Spring склопува<small>Ги означуваш класите, Spring одлучува кога и како да ги креира. ${sender==="Fake"?"Во тест без Spring ти го предаваш fake-от преку конструкторот.":"Ако имаш и Email и Sms како @Component, треба @Primary или @Qualifier (Л5)."} Излез: ${esc(out[sender])}</small></div>`;
    }
  };
  el.querySelectorAll("#wMode button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;draw();});
  el.querySelectorAll("#wSend button").forEach(b=>b.onclick=()=>{sender=b.dataset.s;draw();});
  draw();
},
scanSim(el){
  const st = {emailAnn:true, emailPkg:"sender", svcAnn:true, ctrlAnn:true, bean:false};
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">component scan и стартување</span></div>${ex("Главната класа е во <code>com.example.notifications</code>. Вклучи/исклучи анотации, премести класа во друг пакет, па стартувај.")}
    <div class="sim">
      <div class="box"><h4>EmailSender</h4><label class="opt-line"><input type="checkbox" id="sE" checked> @Component</label>
        <div class="ctl" style="margin-top:6px"><label for="sEP">пакет</label><select id="sEP"><option value="sender">com.example.notifications.sender</option><option value="other">com.other</option></select></div></div>
      <div class="box"><h4>SenderConfig</h4><label class="opt-line"><input type="checkbox" id="sB"> @Configuration + @Bean emailSender()</label></div>
      <div class="box"><h4>NotificationService</h4><label class="opt-line"><input type="checkbox" id="sS" checked> @Service</label><small style="color:var(--muted)">конструктор: (NotificationSender sender)</small></div>
      <div class="box"><h4>NotificationController</h4><label class="opt-line"><input type="checkbox" id="sC" checked> @RestController</label><small style="color:var(--muted)">конструктор: (NotificationService service)</small></div>
    </div>
    <div class="diag-controls"><button class="btn primary" id="sRun">▶ Стартувај NotificationsApplication.main()</button></div>
    <div class="console" id="sLog"><span class="c-dim">// притисни стартувај</span></div>`;
  const log = h => { const L=$("#sLog",el); L.insertAdjacentHTML("beforeend", h+"<br>"); };
  const run = () => {
    st.emailAnn = $("#sE",el).checked; st.emailPkg = $("#sEP",el).value; st.svcAnn = $("#sS",el).checked; st.ctrlAnn = $("#sC",el).checked; st.bean = $("#sB",el).checked;
    $("#sLog",el).innerHTML = "";
    log(`<span class="c-dim">SpringApplication.run() → креирање ApplicationContext</span>`);
    log(`<span class="c-ev">@ComponentScan: com.example.notifications и потпакети</span>`);
    const found = [];
    if (st.emailAnn && st.emailPkg==="sender") found.push("EmailSender");
    if (st.emailAnn && st.emailPkg==="other") log(`<span class="c-dim">  com.other.EmailSender: надвор од скенираниот пакет, прескокнат</span>`);
    if (st.bean) found.push("SenderConfig");
    if (st.svcAnn) found.push("NotificationService");
    if (st.ctrlAnn) found.push("NotificationController");
    log(`<span class="c-ev">  најдени: ${found.join(", ")||"ништо"}</span>`);
    const senders = (st.emailAnn && st.emailPkg==="sender" ? 1:0) + (st.bean?1:0);
    if (st.bean) log(`<span class="c-init">бин emailSender (од @Bean метод во SenderConfig)</span>`);
    if (st.emailAnn && st.emailPkg==="sender") log(`<span class="c-init">бин emailSender (EmailSender, @Component)</span>`);
    if (st.svcAnn){
      if (senders===0){ log(`<span class="c-des">***************************<br>APPLICATION FAILED TO START<br>***************************<br>Parameter 0 of constructor in com.example.notifications.service.NotificationService<br>required a bean of type 'com.example.notifications.sender.NotificationSender' that could not be found.<br><br>Action: Consider defining a bean of type '...NotificationSender' in your configuration.</span>`); return; }
      if (senders===2){ log(`<span class="c-des">***************************<br>APPLICATION FAILED TO START<br>***************************<br>Error creating bean 'emailSender': a bean with that name is already defined.<br>// иста класа регистрирана двапати (@Component + @Bean)</span>`); return; }
      log(`<span class="c-init">бин notificationService ← вметнат emailSender</span>`);
    }
    if (st.ctrlAnn){
      if (!st.svcAnn){ log(`<span class="c-des">***************************<br>APPLICATION FAILED TO START<br>***************************<br>Parameter 0 of constructor in ...NotificationController<br>required a bean of type '...NotificationService' that could not be found.</span>`); return; }
      log(`<span class="c-init">бин notificationController ← вметнат notificationService</span>`);
    }
    log(`<span class="c-svc">Tomcat started on port 8080 · Started NotificationsApplication</span>`);
    if (!st.ctrlAnn) log(`<span class="c-dim">// стартува, но нема контролер, па GET /notify враќа 404</span>`);
  };
  $("#sRun",el).onclick = run;
},
bootStartup(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"што прави Spring при стартување",
    nodes:[["main()","SpringApplication.run"],["ApplicationContext","IoC контејнер"],["Component scan","@Component..."],["Бинови","креирање + DI"],["Tomcat","порта 8080"]],
    steps:[
      [0,"<code>main()</code> го повикува <code>SpringApplication.run(NotificationsApplication.class, args)</code>."],
      [1,"Се креира <b>ApplicationContext</b>, IoC контејнерот."],
      [2,"<b>Component scan</b> го минува пакетот на главната класа и потпакетите: ги наоѓа EmailSender, NotificationService, NotificationController."],
      [3,"Го креира бинот <b>EmailSender</b> (нема зависности)."],
      [3,"Го креира <b>NotificationService</b> и му го вметнува sender-от преку конструкторот. Потоа контролерот со сервисот."],
      [4,"Го стартува вградениот <b>Tomcat</b> на порта 8080. Апликацијата чека барања."]
    ]});
}
});
})();
