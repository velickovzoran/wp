/* Л5: DI во пракса, опсези, конфигурација, тестирање (05 Spring.pdf) */
(function(){
const ex = (t) => `<p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:72ch">${t}</p>`;
const ANN = ["ниту едно","@Autowired","@Bean","@Component","@ComponentScan","@Configuration","@Controller","@Primary","@Profile(\"tmf\")","@Qualifier(\"fcseStudents\")","@Qualifier(\"tmfStudents\")","@Repository","@Service","@Value(\"${app.name}\")","@Value(\"app.name\")"];
const ai = a => ANN.indexOf(a);

LECTURES.push({id:"l5", short:"Л5", title:"DI во пракса и конфигурација", deck:"05 Spring",
  blurb:"@Autowired, слоеви, @Primary/@Qualifier, singleton и опсези, животен циклус, @Value, профили, тестирање.",
  sections:[
{
  id:"l5-autowired", num:"Час 3", title:"@Autowired и видови вметнување", deep:true,
  sub:"Конструктор, setter, поле. Кога @Autowired мора, а кога е вишок.",
  diagram:["injectSim"],
  script:`
<h2>Три начини за вметнување</h2>
<div class="tbl-wrap"><table>
<tr><th>1 · Конструктор</th><th>2 · Setter</th><th>3 · Поле</th></tr>
<tr><td>Зависностите се параметри на конструкторот. <b>Препорачано, користи секаде.</b></td><td>Spring го повикува setter-от по креирањето. За <b>опционални</b> зависности.</td><td>@Autowired директно на полето. <b>Избегнувај</b> во апликациски код.</td></tr>
</table></div>
<p>Spring бара бин <b>по тип</b> (NotificationSender) и го вметнува на означеното место. Пакет: <code>org.springframework.beans.factory.annotation.Autowired</code>.</p>
<h2>Конструктор: со и без @Autowired</h2>
<p>Кога има <b>еден конструктор</b>, Spring автоматски го користи (Spring 4.3+). @Autowired е вишок.</p>
${C(`
@Service
public class NotificationService {
    private final NotificationSender sender;
    private final Clock clock;

    @Autowired                      // Spring го користи ОВОЈ
    public NotificationService(NotificationSender sender, Clock clock) { ... }

    public NotificationService(NotificationSender sender) {   // за рачно креирање со new
        this(sender, Clock.systemDefaultZone());
    }
}`)}
<div class="key"><b>Правило:</b> еден конструктор = без @Autowired · повеќе конструктори = @Autowired на еден. Без него Spring бара празен конструктор → грешка „No default constructor found“.</div>
<h2>Setter</h2>
${C(`
private NotificationSender sender;   // не може final
@Autowired
public void setSender(NotificationSender sender) { this.sender = sender; }`)}
<p>Без @Autowired setter-от <b>не се повикува</b> → sender е null. Полето не може да биде final.</p>
<h2>Поле (лош начин)</h2>
${C(`
@Autowired
private NotificationSender sender;

// unit тест без Spring:
var service = new NotificationService();
service.notifyUser("ana@finki.ukim.mk", "Здраво");   // NullPointerException, sender == null`)}
<p>Spring го поставува приватното поле со reflection. Најкратко, но зависноста е скриена, не може final, тешко се тестира без Spring. Прифатливо во тест класи (@SpringBootTest).</p>
<h2>Опционална зависност</h2>
${C(`
@Autowired(required = false)
public void setAuditLog(AuditLog auditLog) { this.auditLog = auditLog; }
// во методот: if (auditLog != null) auditLog.record(...)`)}
<p>Задолжителното преку конструктор, опционалното преку setter. Ако нема AuditLog бин, setter-от не се повикува и апликацијата стартува. Со стандардното <code>required = true</code> без бин апликацијата <b>не стартува</b>.</p>
<div class="tbl-wrap"><table>
<tr><th>Ситуација</th><th>@Autowired?</th><th>Зошто</th></tr>
<tr><td>Еден конструктор (final полиња)</td><td>не</td><td>Spring автоматски го користи</td></tr>
<tr><td>Повеќе конструктори</td><td>да, на еден</td><td>мора да знае кој да го повика</td></tr>
<tr><td>Setter метод</td><td>да</td><td>инаку не се повикува</td></tr>
<tr><td>Поле</td><td>да</td><td>инаку останува null</td></tr>
<tr><td>final поле поставено во конструктор</td><td>не</td><td>вметнувањето е преку конструкторот</td></tr>
<tr><td>Параметар на @Bean метод</td><td>не</td><td>Spring автоматски ги вметнува</td></tr>
</table></div>
<div class="trap"><b>@Autowired на final поле нема смисла:</b> final поле се поставува само во конструкторот.</div>
<p><b>Премногу зависности?</b> Конструктор со 7 параметри е знак дека класата има премногу одговорности (S). Подели ја. Конструкторот го прави проблемот видлив, тоа е добро.</p>
`,
  questions:[
    {type:"mc", q:"Сервисот има ЕДЕН конструктор со NotificationSender, без @Autowired. Што прави Spring?", opts:["Автоматски го користи тој конструктор и го вметнува бинот","Фрла грешка дека недостасува @Autowired","Бара празен конструктор","Го оставa sender на null"], ans:[0], exp:"Од Spring 4.3, еден конструктор не бара @Autowired."},
    {type:"mc", q:"Сервисот има ДВА конструктори, ниту еден со @Autowired. Што се случува?", opts:["Грешка: No default constructor found","Spring го бира подолгиот","Spring го бира пократкиот","Се креираат два бина"], ans:[0], exp:"Spring не знае кој да го повика и бара празен конструктор. Со @Autowired на еден, тој се користи."},
    {type:"sort", q:"Дали мора да се напише @Autowired?", cats:["Мора @Autowired","Не треба"], items:[["Еден конструктор","Не треба"],["Повеќе конструктори (на еден)","Мора @Autowired"],["Setter метод","Мора @Autowired"],["Поле","Мора @Autowired"],["Параметар на @Bean метод","Не треба"],["final поле поставено во конструктор","Не треба"]], exp:"Конструкторот и @Bean параметрите Spring ги решава сам. Setter и поле мора да се означат."},
    {type:"mc", q:"Зошто вметнувањето преку поле е лоша практика?", opts:["Зависноста е скриена, полето не може final, unit тест без Spring дава NullPointerException","Spring не го поддржува","Побавно е при извршување","Бара XML конфигурација"], ans:[0], exp:"Конструкторот ја покажува зависноста однадвор и гарантира дека е поставена."},
    {type:"mc", q:"Setter со @Autowired(required = false), а нема таков бин. Што се случува?", opts:["Setter-от не се повикува, апликацијата стартува","Апликацијата не стартува","Spring креира празен бин","Setter-от се повикува со null и фрла исклучок"], ans:[0], exp:"Затоа во методот се проверува if (auditLog != null)."},
    {type:"mc", q:"Конструктор со 7 зависности обично значи:", opts:["Класата има премногу одговорности, треба да се подели (S)","Треба да се премине на field injection","Треба @Primary","Сè е во ред"], ans:[0], exp:"Field injection само би го сокрил проблемот."}
  ]
},
{
  id:"l5-layers", num:"Час 3", title:"Слоеви на апликацијата", deep:true,
  sub:"Controller → Service → Repository: секој слој е бин со една одговорност.",
  diagram:["creationOrder"],
  script:`
<h2>Слоеви</h2>
<div class="tbl-wrap"><table>
<tr><th>Слој</th><th>Анотација</th><th>Одговорност</th></tr>
<tr><td>NotificationController</td><td>@RestController</td><td>прима барање, ги чита влезните податоци, го повикува сервисот, враќа одговор. <b>Без бизнис логика.</b></td></tr>
<tr><td>NotificationService</td><td>@Service</td><td>бизнис правила, избор на канал, проверки. <b>Не знае за HTTP.</b></td></tr>
<tr><td>NotificationRepository</td><td>@Repository</td><td>зачувување и читање (засега листа во меморија, подоцна база). <b>Не знае за правилата.</b></td></tr>
<tr><td>EmailSender / SmsSender</td><td>@Component</td><td>праќање известувања</td></tr>
</table></div>
<p>Зависностите одат <b>само надолу</b>, секој слој ја добива зависноста преку конструктор. Промена во еден слој (пр. база наместо листа) не бара промена во другите.</p>
<h2>Notification: податоци, не бин</h2>
${C(`
public record Notification(Long id, String to, String message, String channel) { }
var n = new Notification(1L, "ana@finki.ukim.mk", "Добредојде!", "email");
n.to();   // "ana@finki.ukim.mk"`)}
<p><code>record</code> = кратка класа со полиња, конструктор, getters, equals, toString. Нема анотација → <b>не е бин</b>. Креирање со new е сосема во ред: Spring не го елиминира new, само го презема креирањето на компонентите.</p>
<h2>Repository, Service, Controller</h2>
${C(`
@Repository
public class NotificationRepository {
    private final List<Notification> notifications = new CopyOnWriteArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);   // безбедно при паралелни барања
    public Notification save(String to, String msg, String ch) { ... }
    public List<Notification> findAll() { return List.copyOf(notifications); }
}

@Service
public class NotificationService {
    public NotificationService(NotificationSender sender, NotificationRepository repository) { ... }
    public Notification notifyUser(String to, String message) {
        if (message.isBlank()) throw new IllegalArgumentException("Празна порака");   // правилото е ТУКА
        sender.send(to, message);
        return repository.save(to, message, "email");
    }
}`)}
<p>Редослед на креирање: прво бинoвите <b>без зависности</b> (EmailSender, NotificationRepository), па NotificationService, па NotificationController. Spring го одредува редоследот, ние не пишуваме ниту една линија од тоа.</p>
`,
  questions:[
    {type:"sort", q:"Во кој слој припаѓа?", cats:["Controller","Service","Repository","Sender (@Component)"], items:[["Прима HTTP барање и враќа одговор","Controller"],["Правило: пораката не смее да е празна","Service"],["Чува листа / база со известувања","Repository"],["Праќа e-mail","Sender (@Component)"],["Избор на канал e-mail или SMS","Service"],["findAll() враќа копија од листата","Repository"]], exp:"Контролерот не прави логика, сервисот не знае за HTTP, репозиториумот не знае за правилата."},
    {type:"mc", q:"Во кој слој е најлогично да биде метод што чита корисници од CSV датотека (File, BufferedReader, CSVParser)?", opts:["Persistence","Service","Presentation","Domain Model","User Interface"], ans:[0], exp:"Читање и запишување податоци од извор (датотека, база) е податочен пристап."},
    {type:"mc", q:"Во кој слој припаѓаат класите анотирани со @Controller?", opts:["Presentation","Persistence","Service","Domain Model","User Interface"], ans:[0], exp:"Веб (презентациски) слој. Прегледот (HTML шаблонот) е UI."},
    {type:"mc", q:"Дали Notification record е бин?", opts:["Не, нема анотација и се креира со new","Да, сите record-и се бинови","Да, ако е во пакетот model","Само ако има @Autowired"], ans:[0], exp:"Податоците минуваат низ слоевите, но не ги управува Spring."},
    {type:"mc", q:"Кој бин Spring го креира прв?", opts:["Оние без зависности, пр. EmailSender и NotificationRepository","NotificationController","Оној со најмногу зависности","Азбучно прв"], ans:[0], exp:"Сервисот не може да се креира пред неговите зависности."}
  ]
},
{
  id:"l5-qualifier", num:"Час 3", title:"Два бина од ист тип", deep:true,
  sub:"@Primary, @Qualifier, име на параметарот и испитната задача со анотации.",
  diagram:["resolveSim"],
  script:`
<h2>Проблем</h2>
<p>EmailSender и SmsSender се двата <code>@Component</code> и имплементираат NotificationSender. Сервисот бара еден NotificationSender. Кој?</p>
${C(`
APPLICATION FAILED TO START
Parameter 0 of constructor in ...NotificationService
required a single bean, but 2 were found:
  - emailSender: defined in file [.../EmailSender.class]
  - smsSender: defined in file [.../SmsSender.class]
Action: Consider marking one of the beans as @Primary, ... or using @Qualifier`)}
<p>Име на бинот = име на класата со мала прва буква: <code>EmailSender → emailSender</code>.</p>
<h2>Решение 1: @Primary</h2>
<p>На имплементацијата: „ако има повеќе кандидати, избери го овој“. Сервисот не се менува. Добро за стандардна имплементација.</p>
<h2>Решение 2: @Qualifier("име")</h2>
${C(`
// конструктор: само @Qualifier на параметарот (еден конструктор → без @Autowired)
public NotificationService(@Qualifier("smsSender") NotificationSender sender) { ... }

// setter: @Autowired + @Qualifier
@Autowired
public void setSender(@Qualifier("smsSender") NotificationSender s) { ... }

// поле: @Autowired + @Qualifier
@Autowired
@Qualifier("smsSender")
private NotificationSender sender;`)}
<p>Бара бин со точно тоа име. <b>Посилно од @Primary.</b></p>
<h2>Решение 3: име на параметарот / полето</h2>
${C(`
public NotificationService(NotificationSender smsSender) { ... }   // ← името = бинот smsSender
@Autowired private NotificationSender emailSender;                 // ← името = бинот emailSender`)}
<h2>Како Spring избира (поедноставено)</h2>
<ul>
<li><b>0</b> бинови од типот → грешка <code>NoSuchBeanDefinition</code>.</li>
<li><b>1</b> → се вметнува.</li>
<li><b>2+</b> → по ред: (1) @Qualifier на местото на вметнување, (2) @Primary на една имплементација, (3) име на параметар/поле = име на бин, (4) инаку грешка <code>NoUniqueBeanDefinition</code>.</li>
</ul>
<p>Бинови од @Bean методи се вметнуваат исто како @Component бинови (по име на методот).</p>
<h2>Испитна задача (од слајдовите)</h2>
<p>„Со минимален број анотации пополни ги празните полиња за контејнерот да се иницијализира. Семантички најсоодветна анотација. Каде не треба: ниту едно.“</p>
${C(`
@Configuration                                   // [1]
class StudentRepositoryConfig {
    @Bean public StudentRepository fcseStudents() { ... }   // [2]
    @Bean public StudentRepository tmfStudents() { ... }    // [3]
}
@Repository class UserRepository { ... }         // [4]

@Service                                         // [5]
class FCSEStudentService {
    private final UserRepository repository;     // [6] ниту едно
    private final StudentRepository x;           // [7][8] ниту едно
    @Value("\${app.name}") private String appName;   // [9]
    public FCSEStudentService(UserRepository repository,       // [10][11] ниту едно
                              StudentRepository fcseStudents) { ... }  // [12][13] ниту едно, по име
}
@Service                                         // [14]
class TMFStudentsService {
    @Autowired private UserRepository repository;            // [15]
    @Autowired private StudentRepository tmfStudents;        // [16] ниту едно, [17] @Autowired, по име на полето
}
// [18] application.properties: app.name=FCSE, application-tmf.properties: app.name=TMF
//      профилот tmf не е активен → appName = "FCSE"`)}
`,
  questions:[
    {type:"mc", q:"EmailSender има @Primary. ReminderService прима @Qualifier(\"smsSender\") NotificationSender sender. Кој се вметнува во ReminderService?", opts:["smsSender, @Qualifier е посилен од @Primary","emailSender, поради @Primary","Грешка, двосмислено","Двата"], ans:[0], exp:"Редослед: @Qualifier → @Primary → име → грешка."},
    {type:"mc", q:"Два бина (emailSender, smsSender), без @Primary, без @Qualifier, параметарот се вика sender. Што се случува?", opts:["Грешка NoUniqueBeanDefinition (required a single bean, but 2 were found)","Се вметнува emailSender (азбучно прв)","Се вметнува последниот креиран","Се вметнува null"], ans:[0], exp:"Името sender не одговара на ниту еден бин."},
    {type:"mc", q:"Ист случај, но параметарот се вика smsSender. Што се вметнува?", opts:["smsSender, по име на параметарот","Грешка","emailSender","Двата во листа"], ans:[0], exp:"Ако името на параметарот/полето е исто со името на бинот, Spring го избира без анотација."},
    {type:"mc", q:"Кај constructor injection со @Qualifier, дали треба и @Autowired?", opts:["Не, ако има еден конструктор, доволен е @Qualifier на параметарот","Да, секогаш","Да, на полето","Само со @Primary"], ans:[0], exp:"Кај setter и поле треба @Autowired + @Qualifier."},
    {type:"fill", q:"Испитна задача: пополни ги полињата (минимален број анотации, „ниту едно“ каде не треба).", code:`[1] class StudentRepositoryConfig {
[2]   public StudentRepository fcseStudents() {...}
    }
[4] class UserRepository {...}
[5] class FCSEStudentService {
[6]   private final UserRepository repository;
[9]   private String appName;
      public FCSEStudentService(
[10]    UserRepository repository,
[12]    StudentRepository fcseStudents) {...}
    }
    class TMFStudentsService {
[15]  private UserRepository repository;
[17]  private StudentRepository tmfStudents;
    }`, rows:[
      ["[1]",ANN,ai("@Configuration")],
      ["[2]",ANN,ai("@Bean")],
      ["[4]",ANN,ai("@Repository")],
      ["[5]",ANN,ai("@Service")],
      ["[6]",ANN,ai("ниту едно")],
      ["[9]",ANN,ai("@Value(\"${app.name}\")")],
      ["[10]",ANN,ai("ниту едно")],
      ["[12]",ANN,ai("ниту едно")],
      ["[15]",ANN,ai("@Autowired")],
      ["[17]",ANN,ai("@Autowired")]], exp:"Конструкторот е еден, па параметрите не бараат ништо (fcseStudents се избира по име). Полињата во TMFStudentsService немаат конструктор, па мора @Autowired; tmfStudents се избира по име на полето. @Value(\"app.name\") би вметнало буквален текст."},
    {type:"mc", q:"Истата задача [18]: application.properties има app.name=FCSE, application-tmf.properties има app.name=TMF, ниту еден профил не е активен. Колку е appName?", opts:["FCSE","TMF","ниту едно од наведените","null"], ans:[0], exp:"application-tmf.properties се чита само кога е активен профилот tmf."}
  ]
},
{
  id:"l5-scope", num:"Час 4", title:"Опсези и сервиси без состојба", deep:true,
  sub:"Колку инстанци креира Spring и зошто сервисите не чуваат состојба.",
  diagram:["raceSim","scopeDemo"],
  script:`
<h2>Singleton: една инстанца за сите</h2>
<p>Стандардно <b>секој бин е singleton</b>: една инстанца за целиот контејнер, за сите корисници и барања. Ана и Марко од различни прелистувачи праќаат известувања → го делат <b>истиот</b> бројач во NotificationStats.</p>
<div class="tbl-wrap"><table>
<tr><th>#</th><th>Кој</th><th>Што</th><th>sent</th></tr>
<tr><td>1</td><td>Ана</td><td>notifyUser → stats.increment()</td><td>1</td></tr>
<tr><td>2</td><td>Марко</td><td>notifyUser → stats.increment()</td><td>2</td></tr>
<tr><td>3</td><td>Ана</td><td>notifyUser → stats.increment()</td><td>3</td></tr>
<tr><td>4</td><td>Марко</td><td>GET /stats → stats.sent()</td><td>3, ги брои и пораките на Ана</td></tr>
</table></div>
<h2>Состојба во singleton е опасна</h2>
${C(`
@Service
public class NotificationService {
    private String currentRecipient;          // заедничко за СИТЕ!
    public void prepare(String to) { currentRecipient = to; }
    public void send(String message) { sender.send(currentRecipient, message); }
}`)}
<p>Марко може да го смени примачот меѓу prepare() и send() на Ана. <b>Правило: сервисите се без состојба (stateless).</b> Сè што е потребно доаѓа преку параметри (<code>notifyUser(to, message)</code>), трајните податоци во репозиториум/база.</p>
<h2>Изгубено зголемување (race condition)</h2>
<p><code>return ++sent;</code> е всушност три чекори: чита → пресметува → запишува. Две нишки истовремено: двете читаат 5, двете запишуваат 6. Очекувано 7. Решение: <code>AtomicInteger.incrementAndGet()</code>, неделиво.</p>
<h2>Опсези (scopes)</h2>
<div class="tbl-wrap"><table>
<tr><th>Опсег</th><th>Колку инстанци</th><th>Пример</th><th>Кај сервлетите</th></tr>
<tr><td><b>singleton</b> (стандарден)</td><td>една за целиот контејнер</td><td>NotificationService</td><td>≈ application атрибут</td></tr>
<tr><td><b>prototype</b></td><td>нова секогаш кога се бара бинот</td><td>NotificationDraft</td><td>нема</td></tr>
<tr><td><b>request</b></td><td>една по HTTP барање</td><td>id на барањето за логови</td><td>request атрибут</td></tr>
<tr><td><b>session</b></td><td>една по HTTP сесија</td><td>преференци на корисникот</td><td>session атрибут</td></tr>
<tr><td><b>application</b></td><td>една по ServletContext</td><td>заеднички податоци</td><td>ServletContext атрибут</td></tr>
</table></div>
<p>На класата, заедно со @Component: <code>@Scope("prototype")</code>, <code>@RequestScope</code>, <code>@SessionScope</code>.</p>
<div class="trap"><b>Prototype ≠ request.</b> Prototype: нова инстанца при секое барање <i>од контејнерот</i> (getBean), не е поврзан со HTTP. Prototype вметнат во singleton се креира <b>само еднаш</b> (singleton-от се креира еднаш).</div>
`,
  questions:[
    {type:"mc", q:"Ана и Марко праќаат од различни прелистувачи. NotificationStats е @Service без @Scope. Дали секој има свој бројач?", opts:["Не, делат еден бројач (singleton)","Да, секој корисник добива инстанца","Да, секое барање добива инстанца","Зависи од сесијата"], ans:[0], exp:"Стандардниот опсег е singleton: една инстанца за сите корисници и барања."},
    {type:"mc", q:"Бин со @Scope(\"singleton\"): колку инстанци се креираат при повеќе ctx.getBean(\"x\")?", opts:["Една, иста за сите повици","Нова за секој getBean","Една по HTTP барање","Една по сесија"], ans:[0], exp:"Нова за секој getBean е prototype."},
    {type:"sort", q:"Кој опсег?", cats:["singleton","prototype","request","session","application"], items:[["Една инстанца за цел контејнер, стандарден","singleton"],["Нова секогаш кога се бара од контејнерот","prototype"],["Една по HTTP барање","request"],["Една по HTTP сесија (по корисник)","session"],["Една по ServletContext","application"]], exp:"Request/session/application одговараат на опсезите од сервлетите (Л3)."},
    {type:"mc", q:"Зошто return ++sent; губи зголемувања при паралелни барања?", opts:["Не е атомично: чита, пресметува, запишува, а нишките се преклопуваат","Јава не дозволува ++ во return","Spring креира два бина","int е премал"], ans:[0], exp:"AtomicInteger.incrementAndGet() е неделиво: Ана 6, Марко 7."},
    {type:"mc", q:"Prototype бин вметнат во singleton сервис. Колку пати се креира prototype-от?", opts:["Еднаш, кога се креира singleton-от","При секое HTTP барање","При секој повик на метод на сервисот","Никогаш"], ans:[0], exp:"Вметнувањето се случува само при креирањето на singleton-от."},
    {type:"mc", q:"Каде чуваш податоци за ЕДЕН корисник (пр. последен примач)?", opts:["Во сесија","Во поле на singleton сервис","Во static променлива","Во application.properties"], ans:[0], exp:"Singleton бинот е заеднички за сите корисници."}
  ]
},
{
  id:"l5-lifecycle", num:"Час 4", title:"Животен циклус на бин", deep:true,
  sub:"@PostConstruct, @PreDestroy и деталниот редослед што се бара на тест.",
  diagram:["beanLifecycle"],
  script:`
<h2>Основно</h2>
<p>Апликацијата стартува → Spring го креира бинот (<b>конструктор</b>) → зависностите се <b>вметнати</b> → <b>@PostConstruct</b> (иницијализација) → бинот е подготвен → апликацијата се гаси → <b>@PreDestroy</b> (чистење).</p>
${C(`
@Component
public class EmailSender implements NotificationSender {
    @PostConstruct
    public void connect() { System.out.println("Поврзување со SMTP сервер"); }
    @PreDestroy
    public void disconnect() { System.out.println("Затворање на врската"); }
}`)}
<ul>
<li><b>@PostConstruct</b>: по вметнувањето. Поврзување, почетни податоци, проверки. (Во конструкторот полињата со @Value / @Autowired на поле уште се null.)</li>
<li><b>@PreDestroy</b>: пред гаснење. Затворање ресурси.</li>
<li>Пакет: <code>jakarta.annotation</code>. Повеќето сервиси не им требаат.</li>
<li>За <b>prototype</b> бинови Spring <b>не</b> го повикува @PreDestroy.</li>
</ul>
<h2>Детален животен циклус (додатен материјал, но паѓа на тест)</h2>
<ol>
<li>Креирање / иницијализација на инстанцата (конструктор)</li>
<li>Поставување на својствата (populate properties, вметнување зависности)</li>
<li>setBeanName (BeanNameAware)</li>
<li>setBeanFactory (BeanFactoryAware)</li>
<li>setApplicationContext (ApplicationContextAware)</li>
<li>BeanPostProcessor: postProcessBeforeInitialization (тука се извршува и @PostConstruct)</li>
<li>@PostConstruct</li>
<li>afterPropertiesSet (InitializingBean), па init-method</li>
<li>BeanPostProcessor: postProcessAfterInitialization (прокси, AOP)</li>
<li>Бинот е креиран и постои во контејнерот</li>
<li>@PreDestroy</li>
<li>destroy (DisposableBean), па destroy-method</li>
</ol>
<div class="trap"><b>Внимание:</b> некои одговори што кружат на Discord ги ставаат afterPropertiesSet пред @PostConstruct. Според слајдот (и Spring), @PostConstruct се извршува во BeanPostProcessor „before“ фазата, пред afterPropertiesSet. Кога уништува: прво @PreDestroy, па destroy().</div>
`,
  questions:[
    {type:"mc", q:"Кога се извршува метод со @PostConstruct?", opts:["По креирањето и вметнувањето на зависностите","Пред конструкторот","При секое барање","При гаснење"], ans:[0], exp:"Затоа тука може безбедно да се користат вметнатите зависности и @Value вредностите."},
    {type:"mc", q:"Се повикува ли @PreDestroy за prototype бинови?", opts:["Не","Да, при гаснење","Да, по секое користење","Само ако имаат @Scope(\"prototype\") и @Lazy"], ans:[0], exp:"Spring не ги следи prototype бинoвите откако ќе ги предаде."},
    {type:"fill", q:"Подреди ги настаните од животниот циклус (1 = прв).", rows:[
      ["Креирање на инстанцата (конструктор)",["1","2","3","4","5","6","7","8","9","10","11"],0],
      ["Поставување на својствата (вметнување)",["1","2","3","4","5","6","7","8","9","10","11"],1],
      ["setBeanName (BeanNameAware)",["1","2","3","4","5","6","7","8","9","10","11"],2],
      ["setBeanFactory (BeanFactoryAware)",["1","2","3","4","5","6","7","8","9","10","11"],3],
      ["setApplicationContext (ApplicationContextAware)",["1","2","3","4","5","6","7","8","9","10","11"],4],
      ["postProcessBeforeInitialization + @PostConstruct",["1","2","3","4","5","6","7","8","9","10","11"],5],
      ["afterPropertiesSet (InitializingBean)",["1","2","3","4","5","6","7","8","9","10","11"],6],
      ["postProcessAfterInitialization",["1","2","3","4","5","6","7","8","9","10","11"],7],
      ["Бинот е креиран и постои во контејнерот",["1","2","3","4","5","6","7","8","9","10","11"],8],
      ["@PreDestroy",["1","2","3","4","5","6","7","8","9","10","11"],9],
      ["destroy (DisposableBean)",["1","2","3","4","5","6","7","8","9","10","11"],10]], exp:"Креирање → вметнување → Aware (name, factory, context) → BPP before (@PostConstruct) → afterPropertiesSet → BPP after → подготвен → @PreDestroy → destroy()."},
    {type:"mc", q:"Од кој пакет се @PostConstruct и @PreDestroy во Spring Boot 3+?", opts:["jakarta.annotation","javax.servlet","org.springframework.context","java.lang"], ans:[0], exp:"Од Spring 6 / Boot 3 се користи Jakarta EE (наместо javax)."},
    {type:"mc", q:"Во конструкторот на бинот читаш поле анотирано со @Value. Што добиваш?", opts:["null (или 0), полето уште не е поставено","Вредноста од application.properties","Исклучок при компајлирање","Името на својството"], ans:[0], exp:"@Value на поле се поставува ПО конструкторот. Користи @Value на параметар на конструкторот или @PostConstruct."}
  ]
},
{
  id:"l5-config", num:"Час 4", title:"application.properties, @Value и профили", deep:true,
  sub:"Вредности надвор од кодот, SpEL, приоритет на извори и профили.",
  diagram:["propSim","valueEval"],
  script:`
<h2>Не хардкодирај</h2>
<p>Наместо <code>if (msg.length() &gt; 160)</code> во кодот, вредноста оди во <code>application.properties</code>. Промена не бара прекомпајлирање.</p>
${C(`
# src/main/resources/application.properties
spring.application.name=notifications
server.port=8080
spring.profiles.active=dev
app.name=FINKI Notifications
notification.max-length=160
notification.default-channel=email
notification.signature=Тимот на ФИНКИ
notification.channels=email,sms
notification.enabled=true`)}
<p>Формат <code>клуч=вредност</code>, <code>#</code> коментар, точки за групирање, препорачано kebab-case. Името мора да е <b>application.properties</b> (app.properties не се чита автоматски). Истото може во <b>application.yml</b> (вовлекувањето е важно). Користи еден формат.</p>
<div class="tbl-wrap"><table>
<tr><th>Вградено својство</th><th>Ефект</th></tr>
<tr><td>server.port</td><td>порта на вградениот Tomcat</td></tr>
<tr><td>server.servlet.context-path</td><td>префикс за сите URL (пр. /api)</td></tr>
<tr><td>spring.application.name</td><td>име на апликацијата</td></tr>
<tr><td>spring.profiles.active</td><td>активен профил</td></tr>
<tr><td>logging.level.&lt;пакет&gt;</td><td>ниво на логирање</td></tr>
<tr><td>spring.datasource.url</td><td>база на податоци</td></tr>
</table></div>
<p>Во датотеката сè е текст, Spring го конвертира во типот на полето (int, boolean, String[]/List).</p>
<h2>@Value на три места</h2>
${C(`
@Value("\${notification.signature}") private String signature;          // поле: не final, null во конструктор

public NotificationService(NotificationSender sender,
        @Value("\${notification.max-length:160}") int maxLength) { ... } // конструктор: ПРЕПОРАЧАНО, final

@Value("\${notification.default-channel:email}")
public void setDefaultChannel(String ch) { ... }                         // setter: без @Autowired`)}
<div class="tbl-wrap"><table>
<tr><th>Израз</th><th>Резултат</th></tr>
<tr><td><code>@Value("\${app.name}")</code></td><td>FINKI Notifications, вредност од датотеката</td></tr>
<tr><td><code>@Value("app.name")</code></td><td><b>буквален текст</b> "app.name"</td></tr>
<tr><td><code>@Value("\${app.title:Notifications}")</code></td><td>Notifications, предефинирана ако клучот го нема</td></tr>
<tr><td><code>@Value("\${notification.channels}") String[]</code></td><td>{"email","sms"}</td></tr>
<tr><td><code>@Value("#{2 * 80}")</code></td><td>160, SpEL израз</td></tr>
</table></div>
<div class="key"><code>\${...}</code> = прочитај својство · <code>#{...}</code> = пресметај SpEL израз · без нив = буквален текст. Во <code>#{'\${x}'.toUpperCase()}</code> прво се заменува \${...}. Текст во SpEL оди во '...', статички методи со <code>T(java.time.Year).now()</code>.</div>
<div class="trap"><b>Чести грешки:</b> печатна грешка во клуч без default → <i>Could not resolve placeholder</i>, апликацијата не стартува. Буквален текст без \${}. Објект креиран со new → нема вметнување. <code>static</code> поле → Spring го игнорира (null). Промена на датотеката додека работи → нема ефект без рестарт.</div>
<h2>@ConfigurationProperties</h2>
${C(`
@ConfigurationProperties(prefix = "notification")
public record NotificationProperties(int maxLength, String defaultChannel, String signature,
                                     List<String> channels, boolean enabled) { }
// + @ConfigurationPropertiesScan на главната класа, потоа се вметнува како секој бин`)}
<p>Сите notification.* во еден типизиран објект. <code>max-length → maxLength</code> (relaxed binding). Нема SpEL. Правило: почни со @Value, кога клучевите со ист префикс стануваат многу, @ConfigurationProperties.</p>
<h2>Кој извор победува</h2>
<ol>
<li>(највисок) аргумент од командна линија: <code>--notification.max-length=100</code></li>
<li>променлива на околината: <code>NOTIFICATION_MAXLENGTH=120</code></li>
<li><code>application-{profile}.properties</code></li>
<li><code>application.properties</code></li>
<li>(најнизок) default во @Value: <code>\${notification.max-length:200}</code></li>
</ol>
<h2>Профили</h2>
<p>dev (конзола, порта 8081), test (лажни senders), prod (вистински SMTP, порта 80). Истиот код, различна конфигурација и бинови. Профилната вредност го <b>препокрива</b> истиот клуч, а останатите се земаат од application.properties. Активирање: <code>spring.profiles.active=dev</code>, <code>--spring.profiles.active=prod</code>, или IntelliJ Run Configuration.</p>
${C(`
@Component("emailSender") @Profile("dev")
public class ConsoleEmailSender implements NotificationSender { ... }   // само печати

@Component("emailSender") @Profile("prod")
public class EmailSender implements NotificationSender { ... }          // вистински SMTP
// двата се со име emailSender, но во секој профил постои само еден`)}
`,
  questions:[
    {type:"mc", q:"Што вметнува @Value(\"app.name\")?", opts:["Буквалниот текст \"app.name\"","Вредноста на app.name од датотеката","null","Грешка при стартување"], ans:[0], exp:"За вредност од конфигурацијата треба ${app.name}."},
    {type:"mc", q:"application.properties: port 8080, signature „Тимот на ФИНКИ“, max-length 160. application-dev.properties: port 8081, signature „[DEV] Тимот на ФИНКИ“. Активен е dev. Што важи?", opts:["8081, „[DEV] Тимот на ФИНКИ“, max-length 160","8080, „Тимот на ФИНКИ“, max-length 160","8081, „[DEV]...“, max-length не е дефиниран","Апликацијата не стартува, клучот е дефиниран двапати"], ans:[0], exp:"Профилната датотека ги препокрива само клучевите што ги има. max-length останува од application.properties."},
    {type:"mc", q:"Активен е prod (application-prod.properties: max-length=140), без аргументи и променливи. Колку е notification.max-length?", opts:["140","160","200","100"], ans:[0], exp:"application-{profile}.properties е над application.properties."},
    {type:"mc", q:"Колку е @Value(\"${app.title:Notifications}\") ако app.title не е дефиниран?", opts:["Notifications","null","app.title","Апликацијата не стартува"], ans:[0], exp:"Вредноста по : е предефинирана."},
    {type:"mc", q:"@Value(\"${notification.max-lenght}\") (печатна грешка, без default). Што се случува?", opts:["Апликацијата не стартува: Could not resolve placeholder","Полето е 0","Полето е null","Се зема 160"], ans:[0], exp:"Добро е што грешката се гледа веднаш при стартување."},
    {type:"sort", q:"Што е секој израз?", cats:["Прочитај својство","SpEL израз","Буквален текст"], items:[["${app.name}","Прочитај својство"],["#{2 * 80}","SpEL израз"],["app.name","Буквален текст"],["${notification.max-length:160}","Прочитај својство"],["#{'${notification.channels}'.contains('sms')}","SpEL израз"]], exp:"${} = конфигурација, #{} = пресметување, без ништо = обичен текст."},
    {type:"mc", q:"Како се вика пресликувањето max-length → maxLength кај @ConfigurationProperties?", opts:["Relaxed binding","SpEL","Autowiring","Component scan"], ans:[0], exp:"@Value го поддржува само делумно."}
  ]
},
{
  id:"l5-testing", num:"Час 4", title:"Тестирање со DI", deep:false,
  sub:"Зошто вметнувањето преку конструктор го прави тестирањето лесно.",
  diagram:null,
  script:`
<h2>Unit тест без Spring</h2>
<p>Тестира една класа, без Spring, мрежа и база. Трае милисекунди, ист резултат секој пат. <b>Лажен (fake) објект</b> е наша едноставна имплементација на интерфејсот: не праќа ништо, само памети што добил. Во тестот <b>ние сме „контејнерот“</b>: креираме со new и предаваме зависности преку конструктор.</p>
${C(`
class NotificationServiceTest {
    static class FakeSender implements NotificationSender {
        String lastTo, lastMessage;
        public void send(String to, String message) { lastTo = to; lastMessage = message; }
    }
    @Test
    void notifyUserSendsAndStores() {
        // 1. Подготви
        var fake = new FakeSender();
        var service = new NotificationService(fake, new NotificationRepository(), 160);
        service.setDefaultChannel("email");
        // 2. Изврши
        Notification n = service.notifyUser("ana@finki.ukim.mk", "Здраво");
        // 3. Провери
        assertEquals("ana@finki.ukim.mk", fake.lastTo);
        assertEquals(1L, n.id());
    }
}`)}
<ul>
<li><b>@Test</b>: JUnit го извршува методот (во spring-boot-starter-test).</li>
<li><b>assertEquals(очекувано, добиено)</b>, <b>assertTrue(услов)</b>: ако не важи, тестот паѓа (црвено).</li>
<li>Spring не стартува → полето со @Value (signature) останува <b>null</b>. Само конструкторот гарантира дека зависностите се поставени.</li>
<li>Без DI (<code>new EmailSender()</code> во сервисот) тестот би пратил вистински e-mail.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Поим</th><th>Важност во пракса</th></tr>
<tr><td>Бин, IoC, вметнување преку конструктор</td><td>висока</td></tr>
<tr><td>@Service, @Repository, @RestController</td><td>висока</td></tr>
<tr><td>Singleton и сервиси без состојба</td><td>висока</td></tr>
<tr><td>@Autowired, @Qualifier, @Primary</td><td>средна</td></tr>
<tr><td>application.properties, @Value, @Profile</td><td>средна</td></tr>
<tr><td>Детален животен циклус, XML, BeanFactory</td><td>ниска (додатно)</td></tr>
</table></div>
<p><b>BeanFactory vs ApplicationContext</b> (додатно): BeanFactory е основниот интерфејс и креира singleton бинови кога ќе се побараат. ApplicationContext го проширува, ги креира при стартување и додава настани, интернационализација, AOP. Историски бинoвите се дефинираа во XML (<code>ClassPathXmlApplicationContext</code>).</p>
`,
  questions:[
    {type:"mc", q:"Зошто DI го олеснува unit тестирањето?", opts:["Во тестот предаваме fake зависност преку конструкторот","Spring автоматски ги тестира класите","Тестовите не мораат да имаат assert","DI ги брише исклучоците"], ans:[0], exp:"Сервисот не знае дека sender-от е лажен, па ја тестираме само неговата логика."},
    {type:"mc", q:"Во unit тест без Spring, какво е полето анотирано со @Value?", opts:["null, никој не го поставил","Вредноста од application.properties","Вредноста по : во изразот","Исклучок"], ans:[0], exp:"Spring не е стартуван. Затоа вредностите што ти требаат во тест ги предаваш преку конструктор."},
    {type:"mc", q:"Што прави assertEquals(1L, n.id()) ако n.id() е 2?", opts:["Тестот паѓа","Тестот поминува со предупредување","Ја менува вредноста на 1","Ништо"], ans:[0], exp:"Првиот аргумент е очекуваната вредност, вториот добиената."},
    {type:"mc", q:"Која е разликата BeanFactory vs ApplicationContext?", opts:["ApplicationContext го проширува BeanFactory и ги креира singleton бинoвите при стартување","BeanFactory е понов","ApplicationContext работи само со XML","Нема разлика"], ans:[0], exp:"BeanFactory ги креира кога ќе се побараат, ApplicationContext при стартување, плус настани и i18n."}
  ]
}
]});

/* ================= diagrams ================= */
Object.assign(DIAGRAMS, {
injectSim(el){
  let type = "ctor1", ann = false, ctx = "spring";
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">дали ќе работи?</span></div>${ex("Избери начин на вметнување, дали има @Autowired и каде се креира објектот. Види што се случува.")}
    <div class="diag-controls"><span class="seg" id="ijT"><button data-t="ctor1">1 конструктор</button><button data-t="ctor2">2 конструктори</button><button data-t="setter">setter</button><button data-t="field">поле</button></span></div>
    <div class="diag-controls"><label class="opt-line"><input type="checkbox" id="ijA"> @Autowired е напишан</label><span class="seg" id="ijC"><button data-c="spring">Spring го креира</button><button data-c="test">unit тест со new</button></span></div>
    <pre class="raw" id="ijCode"></pre><div id="ijR"></div>`;
  const code = () => {
    const A = ann ? "@Autowired\n  " : "";
    if (type==="ctor1") return `@Service\npublic class NotificationService {\n  private final NotificationSender sender;\n  ${A}public NotificationService(NotificationSender sender) { this.sender = sender; }\n}`;
    if (type==="ctor2") return `@Service\npublic class NotificationService {\n  private final NotificationSender sender;\n  private final Clock clock;\n  ${A}public NotificationService(NotificationSender sender, Clock clock) { ... }\n  public NotificationService(NotificationSender sender) { this(sender, Clock.systemDefaultZone()); }\n}`;
    if (type==="setter") return `@Service\npublic class NotificationService {\n  private NotificationSender sender;\n  ${A}public void setSender(NotificationSender sender) { this.sender = sender; }\n}`;
    return `@Service\npublic class NotificationService {\n  ${A}private NotificationSender sender;\n}`;
  };
  const result = () => {
    if (ctx==="test"){
      if (type==="ctor1"||type==="ctor2") return ["ok","Работи.", "new NotificationService(fake) · ти ја предаваш зависноста. @Autowired не игра улога без Spring."];
      if (type==="setter") return ["mid","Работи само ако рачно го повикаш setter-от.", "var s = new NotificationService(); s.setSender(fake); Ако заборавиш: NullPointerException."];
      return ["bad","NullPointerException.", "Приватното поле нема како да се постави без Spring (reflection). sender == null."];
    }
    if (type==="ctor1") return ["ok", ann?"Работи, но @Autowired е вишок.":"Работи.", "Еден конструктор: Spring автоматски го користи (4.3+)."];
    if (type==="ctor2") return ann ? ["ok","Работи.","Spring го користи конструкторот означен со @Autowired (Clock мора да е бин)."] : ["bad","APPLICATION FAILED TO START: No default constructor found","Два конструктори без ознака: Spring бара празен конструктор, а таков нема."];
    if (type==="setter") return ann ? ["ok","Работи.","Spring го креира објектот, па го повикува setter-от. Полето не може да биде final."] : ["bad","Стартува, но sender == null → NullPointerException при прв повик.","Без @Autowired Spring не знае дека треба да го повика setter-от."];
    return ann ? ["mid","Работи во Spring.","Полето се поставува со reflection. Скриена зависност, не може final, тешко за тест."] : ["bad","Стартува, но sender == null → NullPointerException.","Без @Autowired полето останува null."];
  };
  const draw = () => {
    el.querySelectorAll("#ijT button").forEach(b=>b.classList.toggle("on",b.dataset.t===type));
    el.querySelectorAll("#ijC button").forEach(b=>b.classList.toggle("on",b.dataset.c===ctx));
    $("#ijA",el).checked = ann;
    $("#ijCode",el).textContent = code();
    const r = result(); $("#ijR",el).innerHTML = `<div class="result ${r[0]}">${esc(r[1])}<small>${esc(r[2])}</small></div>`;
  };
  el.querySelectorAll("#ijT button").forEach(b=>b.onclick=()=>{type=b.dataset.t;draw();});
  el.querySelectorAll("#ijC button").forEach(b=>b.onclick=()=>{ctx=b.dataset.c;draw();});
  $("#ijA",el).onchange = e => { ann = e.target.checked; draw(); };
  draw();
},
creationOrder(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"редослед на креирање на биновите",
    nodes:[["EmailSender","@Component"],["NotificationRepository","@Repository"],["NotificationService","@Service"],["NotificationController","@RestController"]],
    steps:[
      [[0,1],"Прво бинoвите <b>без зависности</b>: EmailSender и NotificationRepository.", "var sender = new EmailSender();\nvar repository = new NotificationRepository();"],
      [2,"NotificationService ги бара двата, па доаѓа после нив.", "var service = new NotificationService(sender, repository);"],
      [3,"NotificationController го бара сервисот.", "var controller = new NotificationController(service);"],
      [[0,1,2,3],"Ова е тоа што Spring го прави „зад сцената“. Ние не пишуваме ниту една линија. Секој бин се креира еднаш (singleton)."]
    ]});
},
resolveSim(el){
  const s = {email:true, sms:true, primary:"none", qual:"none", name:"sender"};
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">кој бин ќе се вметне?</span></div>${ex("<code>public NotificationService(NotificationSender ИМЕ)</code>. Вклучи бинови и анотации, следи го патот на одлуката.")}
    <div class="sim">
      <div class="box"><h4>Бинови</h4><label class="opt-line"><input type="checkbox" id="rsE" checked> emailSender (@Component)</label><label class="opt-line"><input type="checkbox" id="rsS" checked> smsSender (@Component)</label></div>
      <div class="box"><h4>@Primary на</h4><select id="rsP"><option value="none">никој</option><option value="emailSender">emailSender</option><option value="smsSender">smsSender</option></select></div>
      <div class="box"><h4>@Qualifier на параметарот</h4><select id="rsQ"><option value="none">нема</option><option value="emailSender">@Qualifier("emailSender")</option><option value="smsSender">@Qualifier("smsSender")</option></select></div>
      <div class="box"><h4>Име на параметарот</h4><select id="rsN"><option>sender</option><option>emailSender</option><option>smsSender</option></select></div>
    </div>
    <pre class="raw" id="rsCode" style="margin-top:10px"></pre>
    <div class="pathflow" id="rsFlow"></div>`;
  const draw = () => {
    s.email=$("#rsE",el).checked; s.sms=$("#rsS",el).checked; s.primary=$("#rsP",el).value; s.qual=$("#rsQ",el).value; s.name=$("#rsN",el).value;
    const beans = [s.email&&"emailSender", s.sms&&"smsSender"].filter(Boolean);
    $("#rsCode",el).textContent = `${s.primary!=="none"?`@Primary  // на ${s.primary}\n`:""}public NotificationService(${s.qual!=="none"?`@Qualifier("${s.qual}") `:""}NotificationSender ${s.name}) { ... }`;
    const steps = [];
    const add = (cls, t) => steps.push(`<div class="pf ${cls}">${t}</div>`);
    if (s.qual!=="none"){
      if (beans.includes(s.qual)){ add("hit",`@Qualifier("${s.qual}") → бинот постои → се вметнува <b>${s.qual}</b>.`); add("skip","@Primary, име: не се гледаат"); }
      else { add("stop",`@Qualifier("${s.qual}") → нема бин со тоа име → <b>NoSuchBeanDefinitionException</b>, апликацијата не стартува.`); }
    } else if (beans.length===0) add("stop","0 бинови од тип NotificationSender → <b>NoSuchBeanDefinition</b> („could not be found“).");
    else if (beans.length===1) add("hit",`Точно 1 бин од типот → се вметнува <b>${beans[0]}</b>.${s.primary!=="none"&&!beans.includes(s.primary)?" (@Primary на непостоечки бин не влијае)":""}`);
    else {
      add("","2 кандидати: emailSender, smsSender → треба дополнителна информација");
      add("skip","1. @Qualifier: нема");
      if (s.primary!=="none"){ add("hit",`2. @Primary на ${s.primary} → се вметнува <b>${s.primary}</b>.`); }
      else { add("skip","2. @Primary: нема");
        if (beans.includes(s.name)) add("hit",`3. Име на параметарот „${s.name}“ = име на бин → се вметнува <b>${s.name}</b>.`);
        else add("stop",`3. Име „${s.name}“ не одговара → <b>NoUniqueBeanDefinitionException</b>: required a single bean, but 2 were found.`);
      }
    }
    $("#rsFlow",el).innerHTML = steps.join("");
  };
  el.querySelectorAll("input,select").forEach(c => c.onchange = draw);
  draw();
},
raceSim(el){
  let atomic = false, i = 0;
  const plain = [["Ана: чита sent → 5","",5],["","Марко: чита sent → 5",5],["Ана: 5 + 1, запишува 6","",6],["","Марко: 5 + 1, запишува 6",6]];
  const at = [["Ана: incrementAndGet() → 6 (неделиво)","",6],["","Марко: incrementAndGet() → 7 (неделиво)",7]];
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">изгубено зголемување</span></div>${ex("Ана и Марко истовремено праќаат. Двете нишки ја извршуваат stats.increment() на ИСТИОТ singleton објект. Почетно sent = 5.")}
    <div class="diag-controls"><span class="seg" id="rcM"><button data-m="0">private int sent; ++sent</button><button data-m="1">AtomicInteger</button></span><button class="btn small primary" data-a="next">Следен чекор →</button><button class="btn small" data-a="reset">Одново</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>Чекор</th><th>Нишка: Ана</th><th>Нишка: Марко</th><th>sent</th></tr></thead><tbody id="rcB"></tbody></table></div><div id="rcR"></div>`;
  const draw = () => {
    el.querySelectorAll("#rcM button").forEach(b=>b.classList.toggle("on",(b.dataset.m==="1")===atomic));
    const rows = atomic ? at : plain;
    $("#rcB",el).innerHTML = rows.map((r,k)=>`<tr style="${k<i?"":"opacity:.2"}"><td>${k+1}</td><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join("");
    $("#rcR",el).innerHTML = i>=rows.length ? (atomic ? `<div class="result ok">sent = 7. Двете известувања се избројани.</div>` : `<div class="result bad">sent = 6, очекувано 7. Марко ја прочита старата вредност пред Ана да ја запише новата.<small>++sent = читај, пресметај, запиши: три чекори што можат да се преплетат.</small></div>`) : "";
  };
  el.querySelectorAll("#rcM button").forEach(b=>b.onclick=()=>{atomic=b.dataset.m==="1";i=0;draw();});
  el.querySelector('[data-a="next"]').onclick = () => { i = Math.min((atomic?at:plain).length, i+1); draw(); };
  el.querySelector('[data-a="reset"]').onclick = () => { i = 0; draw(); };
  draw();
},
scopeDemo(el){
  let scope = "singleton", calls = [], idc = 0, same = null;
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">singleton vs prototype</span></div>${ex("Повикај getBean неколку пати и спореди ги референците.")}
    <div class="diag-controls"><span class="seg" id="sdS"><button data-s="singleton">@Scope("singleton")</button><button data-s="prototype">@Scope("prototype")</button></span><button class="btn small primary" data-a="get">context.getBean(NotificationDraft.class)</button><button class="btn small" data-a="clr">Исчисти</button></div>
    <div class="console" id="sdL"></div>`;
  const draw = () => { el.querySelectorAll("#sdS button").forEach(b=>b.classList.toggle("on",b.dataset.s===scope)); $("#sdL",el).innerHTML = calls.length? calls.join("<br>") : `<span class="c-dim">// уште нема повици</span>`; };
  el.querySelectorAll("#sdS button").forEach(b=>b.onclick=()=>{scope=b.dataset.s;calls=[];same=null;draw();});
  el.querySelector('[data-a="get"]').onclick = () => {
    let id;
    if (scope==="singleton"){ if (same===null) same = "@"+(1000+(++idc)).toString(16); id = same; }
    else id = "@"+(1000+(++idc)).toString(16);
    const n = calls.length;
    calls.push(`<span class="c-svc">draft${n+1} = NotificationDraft${id}</span>${n>0?`  <span class="c-ev">draft${n} == draft${n+1} → ${scope==="singleton"}</span>`:""}`);
    draw();
  };
  el.querySelector('[data-a="clr"]').onclick = () => { calls=[]; same=null; draw(); };
  draw();
},
beanLifecycle(el){
  stepper(el, {title:"Интерактивен дијаграм", tag:"животен циклус на бин", arrow:"→",
    nodes:[["Креирање","конструктор"],["Вметнување","properties"],["Aware","name, factory, ctx"],["Иницијализација","@PostConstruct, afterPropertiesSet"],["Подготвен","се користи"],["Уништување","@PreDestroy, destroy()"]],
    steps:[
      [0,"Spring го повикува <b>конструкторот</b>. Полињата со @Value / @Autowired (на поле) уште се null."],
      [1,"<b>Populate properties</b>: се вметнуваат зависностите (setter, поле)."],
      [2,"Aware интерфејси: <code>setBeanName</code> → <code>setBeanFactory</code> → <code>setApplicationContext</code>."],
      [3,"<code>BeanPostProcessor.postProcessBeforeInitialization</code>. Тука се извршува и <b>@PostConstruct</b>."],
      [3,"<code>afterPropertiesSet()</code> (InitializingBean), па init-method."],
      [3,"<code>BeanPostProcessor.postProcessAfterInitialization</code> (прокси, AOP)."],
      [4,"Бинот е креиран и постои во контејнерот. Апликацијата го користи."],
      [5,"При гаснење: прво <b>@PreDestroy</b>, па <code>destroy()</code> (DisposableBean), па destroy-method. За prototype бинови ништо од ова."]
    ]});
},
propSim(el){
  el.innerHTML = `<div class="section-title">Симулација <span class="tag">кој извор победува</span></div>${ex("Датотеките од предавањето. Избери профил и додај аргумент / променлива на околината.")}
    <div class="twocol">
      <pre class="raw"># application.properties
server.port=8080
notification.max-length=160
notification.signature=Тимот на ФИНКИ

# application-dev.properties
server.port=8081
notification.signature=[DEV] Тимот на ФИНКИ

# application-prod.properties
server.port=80
notification.max-length=140

// @Value("\${notification.max-length:200}")</pre>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="ctl"><label for="ppP">spring.profiles.active</label><select id="ppP"><option value="">(ниту еден)</option><option>dev</option><option>prod</option></select></div>
        <label class="opt-line"><input type="checkbox" id="ppA"> java -jar app.jar --notification.max-length=100</label>
        <label class="opt-line"><input type="checkbox" id="ppE"> export NOTIFICATION_MAXLENGTH=120</label>
        <label class="opt-line"><input type="checkbox" id="ppD"> избриши max-length од application.properties</label>
      </div>
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>Својство</th><th>Вредност</th><th>Од каде</th></tr></thead><tbody id="ppB"></tbody></table></div>`;
  const draw = () => {
    const p = $("#ppP",el).value, A = $("#ppA",el).checked, E = $("#ppE",el).checked, D = $("#ppD",el).checked;
    const base = {"server.port":"8080","notification.max-length":D?null:"160","notification.signature":"Тимот на ФИНКИ"};
    const prof = {dev:{"server.port":"8081","notification.signature":"[DEV] Тимот на ФИНКИ"}, prod:{"server.port":"80","notification.max-length":"140"}}[p] || {};
    const rows = Object.keys(base).map(k => {
      if (k==="notification.max-length" && A) return [k,"100","1 · аргумент од командна линија"];
      if (k==="notification.max-length" && E) return [k,"120","2 · променлива на околината"];
      if (prof[k]) return [k,prof[k],`3 · application-${p}.properties`];
      if (base[k]!=null) return [k,base[k],"4 · application.properties"];
      return [k,"200","5 · default во @Value"];
    });
    $("#ppB",el).innerHTML = rows.map(r=>`<tr><td><code>${r[0]}</code></td><td><b>${esc(r[1])}</b></td><td>${r[2]}</td></tr>`).join("");
  };
  el.querySelectorAll("input,select").forEach(c => c.onchange = draw);
  draw();
},
valueEval(el){
  const E = [
    ['@Value("${app.name}") String',"FINKI Notifications","вредност од датотеката"],
    ['@Value("app.name") String',"app.name","буквален текст, нема ${}"],
    ['@Value("${app.title:Notifications}") String',"Notifications","app.title го нема → default по :"],
    ['@Value("${notification.max-length}") int',"160","автоматска конверзија во int"],
    ['@Value("${notification.enabled}") boolean',"true","конверзија во boolean"],
    ['@Value("${notification.channels}") String[]','{"email", "sms"}',"поделено со запирка"],
    ['@Value("#{2 * 80}") int',"160","SpEL израз"],
    ['@Value("#{${notification.max-length} - 20}") int',"140","прво ${} → 160, па SpEL 160 - 20"],
    ["@Value(\"#{'${notification.default-channel}'.toUpperCase()}\") String","EMAIL","текст во '...' и метод на String"],
    ["@Value(\"#{'${notification.channels}'.contains('sms')}\") boolean","true","услов"],
    ["@Value(\"#{${notification.enabled} ? 'вклучено' : 'исклучено'}\") String","вклучено","тернарен оператор"],
    ['@Value("© #{T(java.time.Year).now().value} ${app.name}") String',"© 2026 FINKI Notifications","T(Класа) = статички метод + текст + својство"],
    ['@Value("${app.name}") static String NAME',"null","static поле: Spring го игнорира"],
    ['@Value("${notification.max-lenght}") int',"APPLICATION FAILED TO START","Could not resolve placeholder (печатна грешка, нема default)"]
  ];
  el.innerHTML = `<div class="section-title">Интерактивно <span class="tag">што вметнува @Value?</span></div>${ex("Својства: app.name=FINKI Notifications, notification.max-length=160, notification.enabled=true, notification.default-channel=email, notification.channels=email,sms. Избери израз, погоди, па провери.")}
    <div class="ctl"><label for="veS">Израз</label><select id="veS">${E.map((e,k)=>`<option value="${k}">${esc(e[0])}</option>`).join("")}</select></div>
    <div class="diag-controls"><button class="btn small primary" id="veB">Покажи резултат</button></div><div id="veR"></div>`;
  $("#veS",el).onchange = () => { $("#veR",el).innerHTML = ""; };
  $("#veB",el).onclick = () => { const e = E[+$("#veS",el).value]; $("#veR",el).innerHTML = `<div class="result ${e[1].startsWith("APPLICATION")||e[1]==="null"?"bad":"ok"}"><code>${esc(e[1])}</code><small>${esc(e[2])}</small></div>`; };
}
});
})();
