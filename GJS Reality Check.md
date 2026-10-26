# GJS Reality Check.md

Особенности и бзики GJS (JS/Typescript)

Эта информация получена как и из документации, так и основана на наблюдениях и тестах.


## Архитектурная философия GJS

GJS != Browser != Node.js

GJS предоставляет только "some widely used standards from the Web API" и "does not include support for most of these APIs" - они осознанно ограничивают Web API только самыми базовыми.


### Что ДОСТУПНО в GJS:
- setTimeout/setInterval - доступны с GJS 1.70 (GNOME 41) как часть WHATWG Timers API
- Console API - доступен с GJS 1.70
- TextEncoder/TextDecoder - доступны с GJS 1.70


### ❌ Что НЕ доступно в GJS:
- AbortController/AbortSignal - нет упоминаний в документации
- requestIdleCallback - нет упоминаний в документации
- fetch - явно исключен: "GJS is not intended as an environment for web development and does not include support for most of these APIs"
- URL constructor - используйте Gio.File.new_for_uri() вместо new URL()


## Memory management

*Когда объекты GTK убираются сборщиком мусора?*
*Ответ:* Неизвестно.

*Нужно ли явно отключать сигналы или это автоматически?*
*Ответ:* В ручную подключенные сигналы - отключать нужно вручную. Отключать сигналы нужно обязательно. Сигналы подключенные через builder (в template) - будут управлятся builder`ом.

*Проблемы с циклическими ссылками виджет ↔ колбек?*
*Ответ:* Да, постоянно.

### Немного о memory management

GJS — это JavaScript-привязки для GNOME, что означает, что за кулисами происходит два типа управления памятью: отслеживание ссылок (JavaScript) и подсчет ссылок (GObject).

Концепция подсчета ссылок: когда GObject создается впервые, его счетчик ссылок равен 1. Когда счетчик ссылок падает до 0, все ресурсы и память объекта автоматически освобождаются системою GObject.

Концепция отслеживания ссылок может вызвать путаницу, поскольку зависит от внешних факторов. Но в общих чертах: когда значение или объект больше не присвоен никакой переменной, он подвергается сборке мусора. Другими словами, если движок JavaScript не может «отследить» значение до переменной, он освобождает это значение.

То есть, пока GJS может отследить GObject до переменной, он будет обеспечивать, чтобы счетчик ссылок на этот объект не опускался до 0.

Другие GObjects могут содержать ссылку на GObjects, например, объект-контейнер. Это означает, что даже если его нельзя отследить из переменной JavaScript, он будет иметь положительный счетчик ссылок и не будет освобожден.

~~~js
let myLabel = new Gtk.Label({
    label: 'Some Text',
});

// Как только мы добавим `myLabel` к `myFrame`, количество ссылок на GObject
// увеличится и не позволит его освободить, даже если его больше нельзя
// отследить из переменной JavaScript.
const myFrame = new Gtk.Frame();
myFrame.set_child(myLabel);

// Теперь мы можем безопасно прекратить отслеживание GObject из `myLabel`, установив его
// в другое значение.
// В большинстве случаев этого делать не нужно, так как переменная перестанет
// отслеживать GObject, когда выйдет из области видимости.
myLabel = null;
~~~

Однако, если единственной вещью, препятствующей сбору GObject, является другой GObject, содержащий ссылку, то как только он откажется от этой ссылки, она будет освобождена.

~~~js
const myFrame = new Gtk.Frame();

if (myFrame) {
    const myLabel = new Gtk.Label({
        label: 'Some Text',
    });

    myFrame.set_child(myLabel);
}

// количество ссылок на GtkLabel уменьшится до 0, и GObject будет освобожден.
myFrame.set_child(null);
~~~

Большинство функций, влияющих на управление памятью, недоступны в GJS, но есть некоторые исключения. Функции, которые можно найти в некоторых библиотеках, принудительно освобождают GObject, как если бы его счетчик ссылок упал до 0. Но они не могут помешать переменной JavaScript отслеживать этот GObject.

Попытка получить доступ к GObject после его завершения (освобождения) является ошибкой программиста. Попытка использовать такой объект вызовет критическую ошибку.

Это надуманный пример, но смысл передает:
~~~js
const myFrame = new Gtk.Frame();

if (myFrame) {
    const myLabel = new Gtk.Label({
        label: 'Some Text',
    });

    myFrame.set_child(myLabel);
...
    // количество ссылок на GtkLabel уменьшится до 0, и GObject будет освобожден.
    myFrame.set_child(null);

    // В данном случае мы находимся в той-же области видимости что и myLabel, поэтому
    // правильным решением будет присвоить переменной значение `null`, чтобы сборщик
    // мусора мог освободить обертку JS.
    myLabel = null;
...
}
~~~

Самый простой способ вызвать утечку ссылок — перезаписать переменную или вывести ее за пределы области видимости. Если эта переменная указывает на GObject с положительным счетчиком ссылок, за освобождение которого вы несете ответственность, вы фактически вызовете утечку его памяти.

Если вы потеряете отслеживание переменной, идентификатора сигнала или обратного вызова источника, вы упустите эту ссылку.

~~~js
export default class ExampleExtension extends Extension {
    enable() {
        const indicator = new PanelMenu.Button(0.0, 'MyIndicator', false);
        const randomId = GLib.uuid_string_random();

        Main.panel.addToStatusArea(randomId, indicator);
    }

    disable() {
        // Когда `enable()` завершил выполнение, и `indicator`, и `randomId` вышли из
        // области видимости и были собраны GC.
        // Однако область состояния панели все еще содержит ссылку на GObject PanelMenu.Button.
        //
        // Каждый раз, когда расширение отключается/включается (например, при
        // блокировке/разблокировке экрана), к панели добавляется новый, не удаляемый
        // индикатор.
    }
}
~~~

~~~js
export default class ExampleExtension extends Extension {
    enable() {
        this._indicators = {};

        const indicator1 = new PanelMenu.Button(0.0, 'MyIndicator1', false);
        const indicator2 = new PanelMenu.Button(0.0, 'MyIndicator2', false);

        Main.panel.addToStatusArea(GLib.uuid_string_random(), indicator1);
        Main.panel.addToStatusArea(GLib.uuid_string_random(), indicator2);

        this._indicators['MyIndicator1'] = indicator1;
        this._indicators['MyIndicator1'] = indicator2;
    }

    disable() {
        // Несмотря на то, что автор кода намеревался сохранить ссылки на все индикаторы
        // в объекте indicators, он допустил небольшую ошибку: ссылка на indicator2
        // сохраняется в indicators['MyIndicator1'], перезаписывая ссылку на indicator1!
        // В результате ссылка на объект под indicator1 теряется, и объект не может
        // быть освобожден в disable().
        for (const [name, indicator] of Object.entries(this._indicators))
            indicator.destroy();

        this._indicators = {};
    }
}
~~~

Очень распространенным способом утечки GSource является добавление рекурсивных (повторяющихся) источников в цикл событий GLib. Обычно это повторяющиеся циклы с таймаутом, используемые для обновления чего-либо в пользовательском интерфейсе.

В данном случае утечка вызвана тем, что главный цикл удерживает ссылку на GSource, в то время как программист утратил возможность ее удалить. При вызове обратного вызова источника будет предпринята попытка доступа к объекту после его уничтожения, что приведет к критической ошибке:

~~~js
const MyIndicator = GObject.registerClass(
class MyIndicator extends PanelMenu.Button {
    startUpdating() {
        // Когда `startUpdating()` вернется, мы потеряем ссылку на
        // `sourceId`, поэтому мы не сможем удалить его из главного цикла.
        const sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5,
            this.update.bind(this));
    }

    update() {
        // Если объект был уничтожен, это приведет к критической ошибке.
        //
        // Использование Function.bind() позволяет отследить `this` до объекта
        // JavaScript, независимо от состояния GObject.
        this.visible = !this.visible;

        // Возврат `true` или `GLib.SOURCE_CONTINUE` заставляет GSource
        // сохраняться, так что обратный вызов будет запущен, когда будет достигнут
        // следующий тайм-аут.
        return GLib.SOURCE_CONTINUE;
    }

    _onDestroy() {
        // У нас нет ссылки на `sourceId, поэтому мы не можем удалить
        // источник из цикла. Нам следовало бы присвоить идентификатор источника
        // на уровне класса

        super._onDestroy();
    }
});


export default class ExampleExtension extends Extension {
    enable() {
        this._indicator = new MyIndicator();

        // Каждый раз, когда расширение включается, новый GSource будет добавлен в главный цикл
        // этой функцией.
        this._indicator.startUpdating();
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;

        // Даже если мы уничтожили GObject и прекратили его отслеживание из
        // переменной `indicator`, обратный вызов GSource будет продолжать
        // вызываться каждые 5 секунд.
    }
}
~~~

Как и источники, сигнал, при подключении, возвращает идентификатор обработчика. Неудачное удаление источников или отключение сигналов может привести к сценариям «использования после освобождения», но также возможны и утечки ссылок в обратном вызове.

В приведенном ниже примере обратный вызов для сигнала 'changed::licensed' отслеживает словарь `agent`. Обратный вызов продолжает работать после возврата из constructor(). Фактически, даже после того, как мы установили `myObject` в `null` в `disable()`, словарь по-прежнему отслеживается из обратного вызова сигнала.

~~~js
const mySettings = new Gio.Settings({
    schema_id: 'org.gnome.desktop.interface',
});

class MyObject {
    constructor() {
        const agent = {
            'family': 'Bond',
            'given': 'James',
            'codename': '007',
            'licensed': true,
        };

        // Здесь мы должны были сохранить идентификатор обработчика
        const id = mySettings.connect('changed::licensed', (settings, key) => {
            // Здесь мы отслеживаем ссылку на словарь `agent`. Поскольку
            // идентификатор обработчика сигнала теряется, он никогда не отключается, и
            // поэтому словарь `agent` тоже утекает.
            agent.licensed = mySettings.get_boolean(key);
        });
    }
}

export default class ExampleExtension extends Extension {
    enable() {
        this._myObject = new MyObject();
    }

    disable() {
        this._myObject = null;
    }
}
~~~

Cairo является исключением в GJS, поскольку в конце метода рисования необходимо вручную освободить память CairoContext. Это легко сделать, но если забыть - может произойти утечка большого количества памяти, поскольку виджеты могут перерисовываться довольно часто.

~~~js
// Create a drawing area and set a drawing function
const drawingArea = new Gtk.DrawingArea();

drawingArea.set_draw_func((area, cr, _width, _height) => {
    // Perform operations on the surface context

    // Freeing the context before returning from the callback
    cr.$dispose();
});
~~~

#### Или, если по простому:

~~~js
widget.connect('signal', () => {
    // Поздравляю, ты только что создал утечку памяти!
    // widget захватил this, this держит widget. И все довольны... кроме памяти
});
~~~


### Преждевременная сборка GC - когда объект "собрали из-под носа"

Противоположность утечке памяти - когда GC собирает объект который еще нужен, потому что переменная вышла из области видимости, а GC не знает что объект все еще используется через GObject.

Типичный сценарий: обработчик сигнала перестает работать:

~~~typescript
class GSettingsProvider {
    private gsettings: Gio.Settings;
    private settings_schema_id = ...;
    private settings_key = ...;

    constructor() {
        this.gsettings = Gio.Settings.new(this.settings_schema_id);
    }

    // печатать все изменения в настройках в консоль
    start_monitor() {
        this.gsettings.connect(`changed::${this.settings_key}`, function(settings, key) {
            console.log('changed:', settings.get_value(key));
        });
        // Активируем мониторинг (особенность GSettings)
        this.gsettings.get_value(this.settings_key);
        console.log('Monitoring started');
    }
}

// Приложение, использует GSettingsProvider
class MyApp extends Gio.Application {
    ...
    vfunc_startup() {
        super.vfunc_startup();
        this.hold();

        // Создали provider в локальной переменной
        const settings_provider = new GSettingsProvider();

        // Подключили обработчик и начали мониторинг
        settings_provider.start_monitor();

        // Ожидается, что каждое изменение в настройках будет логироваться в консоли.
        // Но после одного-двух сообщений логирование прекращается.

        // Почему так произошло:
        // Функция завершилась → переменная `settings_provider` вышла из области видимости
        // `this.gsettings.connect` в `start_monitor` не создает ссылку для JS и никаким
        // образом не препятствует сборке `settings_provider`
        // → GC собирает объект `settings_provider` через пару циклов
        // → обработчик перестает работать
    }
}

#### Решение:

Хранить ссылку на `settings_provider` все время, пока он нужен. Например, как поле класса:

~~~typescript
class MyApp extends Gio.Application {

    ...

    private settings_provider!: GSettingsProvider; // храним ссылку

    vfunc_startup() {
        super.vfunc_startup();
        this.hold();

        // Создали provider как поле класса
        this.settings_provider = new GSettingsProvider();

        // Подключили обработчик и начали мониторинг
        this.settings_provider.start_monitor();

        // Каждое изменение в настройках будет логироваться в консоли.
    }
}
~~~


#### Важно понимать:

"Слабое связывание" не защищает от GC.

Методы вроде .connect(), .bind_property(), подключение колбеков и обработчиков не создают "сильных" ссылок с точки зрения JavaScript GC. Для GC это "слабое связывание" - он его игнорирует при принятии решений о сборке мусора.

То есть:

- object.connect('signal', callback) - НЕ защищает object от сборки
- widget1.bind_property('prop', widget2, 'prop2') - НЕ защищает widget1 от сборки
- setTimeout(callback, 1000) - НЕ защищает объекты внутри callback от сборки

GC видит только явные ссылки через переменные, поля объектов, элементы массивов и т.п. Все остальное для него "прозрачно".

Если объект должен жить пока активен его обработчик/таймер/источник/binding - убедись что на него есть явная ссылка.


## Event loop и асинхронность

*Однопоточность JS vs GTK main loop*
*Ответ*: JS код выполняется в, как ни странно, в потоке JS. Но, работа некоторых методов, например, метод-сортировка может выполнятся в потоке GLib. И, хотя, на уровне GLib это синхронная операция - вызов этого метода может сразу вернуть управление в JS, хотя метод все еще продолжает выполнятся. Это создает некоторые трудности.

*Можно ли полагаться на то что между строками кода ничего не вклинится?*
*Ответ*: Можно, JS работает так как это от него и ожидается.


### Таймеры и интервалы

New in GJS 1.72 (GNOME 42)


#### `setInterval`/`setTimeout` vs `GLib.timeout_add` - когда что использовать

`setInterval` и `setTimeout` в GJS реализованы через `GLib.timeout_add`, но более аккуратно работают в потоке JS. Тогда как `GLib.timeout_add`, для корректной работы, потребует предварительной настройки (а не просто "создать и передать колбэк").


### Что возвращают, как типизированы

GJS реализует спецификацию WHATWG Timers с некоторыми изменениями, чтобы приспособить цикл событий GLib.

В частности, возвращаемое значение функций `setInterval()` и `setTimeout()` - это не число, а объект `GLib.Source`.

**Импорт**: Эти функции доступны глобально, без импорта.

~~~js
/** **setTimeout**
 * Планирует таймаут для запуска обработчика по истечении delay миллисекунд.
 * Любые аргументы передаются прямо в обработчик.
 * @param callback Обратный вызов, который нужно вызвать
 * @param delay Продолжительность в миллисекундах для ожидания перед выполнением
 * обратного вызова
 * @param args Необязательные аргументы для передачи в обратный вызов
 * @returns Идентификатор */
`function setTimeout(callback: (...args: any[]) => any, delay?: number, ...args: any[]): GLib.Source`

/** **clearTimeout**
 * Отменяет таймаут, установленный с помощью функции setTimeout()
 * @param timeout Идентификатор таймаута для очистки */
`function clearTimeout(timeout: GLib.Source): void`

/** **setInterval**
 * Планирует таймаут для запуска обработчика каждые delay миллисекунд.
 * Любые аргументы передаются прямо в обработчик.
 * @param callback Обратный вызов, который нужно вызывать
 * @param delay Продолжительность в миллисекундах ожидания между вызовами обратного
 * вызова
 * @param args Необязательные аргументы для передачи в обратный вызов
 * @returns Идентификатор */
`function setInterval(callback: (...args: any[]) => any, delay?: number, ...args: any[]): GLib.Source`

/** **clearInterval**
 * Отменяет интервал, установленный с помощью функции setInterval()
 * @param interval Идентификатор интервала для очистки */
`function clearInterval(interval: GLib.Source): void`
~~~

`setInterval`/`setTimeout` - лучше интегрированы с JS/GC поэтому предпочтительней GLib.timeout_add

НО, всегда может быть "но". Пользуйся здравым смыслом.

Дополнительно посмотри:
- [Реализацию таймеров в GJS](https://gitlab.gnome.org/GNOME/gjs/-/blob/master/modules/esm/_timers.js)
- [Asynchronous Programming in GJS](https://gjs.guide/guides/gjs/asynchronous-programming.html)


## Error handling:

*Какие исключения могут выбрасывать GTK методы?*:
*Ответ*: Поведение не консистентно: Некоторые объекты генерируют JS Error, некоторые - передают как ошибку GLib.Error. Ну а некоторые просто вызываю Critical Error, сообщение в консоль и падение всего приложения.

*Стоит ли оборачивать все в try-catch?*:
*Ответ*: В большинстве случаев это попросту бесполезно. Все требует своего подхода.


## GTK Expressions (GtkExpression)

**GtkExpression РАБОТАЮТ в GJS!** Полная поддержка декларативных bindings в UI файлах.


### Доступно:

**Базовые expressions:**
- `<constant>` - статичные значения
- `<lookup>` - свойства объектов
- `<closure>` - пользовательские функции

**Property bindings:**
~~~xml
<binding name="label">
    <lookup name="visible-child-name">stack_object</lookup>
</binding>
~~~

Closure expressions с методами класса:

~~~xml
<binding name="visible">
    <closure type="gboolean" function="should_show_toggle">
        <lookup name="visible-child-name">onair_stack</lookup>
        <lookup name="show-sidebar">split_view</lookup>
    </closure>
</binding>
~~~

~~~typescript
private should_show_toggle(_: typeof this, page: string, sidebar: boolean): boolean {
    return page === 'interactive' && !sidebar;
}
~~~

Автоматическая реактивность: closure вызывается при изменении любого lookup параметра.

И остальное.


### Практические применения:

- Conditional visibility - показ/скрытие элементов по сложным условиям
- Dynamic content - обновление текста/иконок
- Complex bindings - связывание нескольких свойств
- Замена императивного кода - вместо сигналов + обработчиков

Вывод: Используй expressions для декларативной логики UI!


### Expression lookups

Expression lookups работают только с:

✅ GObject properties:
~~~typescript
@GDecorator.StringProperty()
get my_property() { ... }  // ← доступно через lookup
~~~

✅ GTK/GLib properties:
<lookup name="visible">SomeWidget</lookup>  <!-- GTK свойство -->
<lookup name="label">SomeLabel</lookup>     <!-- GTK свойство -->

Не работают:

❌ JavaScript properties:
array.length        // ← Error: Type `JSObject` does not support properties
string.charAt()     // ← Error: Type `JSObject` does not support properties
object.someField    // ← Error: Type `JSObject` does not support properties

Поэтому closures незаменимы:
~~~xml
<!-- Приходится через closure для JS API -->
<closure type="gint" function="get_length">
    <lookup name="sins">ReportListRowBox</lookup>
</closure>
~~~

~~~typescript
protected get_length(_: this, sins: SinInfo[]): number {
    return sins.length;  // JS property доступно в коде
}
~~~

Граница миров:
Expression world = только GObject
Closure world = доступ к JavaScript API


## STATIC флаги ParamSpec - смертельно опасны!

❌ НИКОГДА не используйте STATIC_NAME/STATIC_NICK/STATIC_BLURB в GJS
- Приводят к повреждению памяти
- Вызывают падения с проблемами при валидации строки.

✅ Всегда используйте только базовые флаги:
GObject.ParamFlags.READWRITE // Без STATIC вариантов

Пример:

~~~javascript
const defaults_meta_info = Object.freeze([
  /* name */ "canonical-name",
  /* nick */ "param-spec-metadata.nick",
  /* blurb */ "param-spec-metadata.blurb",
]);

const spec1 = GObject.param_spec_boolean(
    ...defaults_meta_info,
  /* default_value */ false,
  /* flags */ GObject.ParamFlags.READWRITE | GObject.ParamFlags.STATIC_NAME | GObject.ParamFlags.STATIC_NICK,
);

console.log(
    "spec1:",
    [spec1.get_name(), spec1.get_nick(), spec1.get_blurb()].join(", "),
);
~~~

Результатом может быть, например:

~~~
Gjs-Console-Message: 17:47:11.834: spec1: canonical-name, SJ[tKY, param-spec-metadata.blurb
~~~

(Обрати внимание на мусор вместо blurb)

Или падение с ошибкой типа:

~~~
(gjs:153796): Gjs-CRITICAL **: 17:54:05.562: JS ERROR: TypeError: malformed UTF-8 character sequence at offset 2
~~~

GJS не гарантирует стабильность указателей на JS строки?


### Почему не "больно" в GTK4:

[Из документации GObject:](https://docs.gtk.org/gobject/type_func.ParamSpec.internal.html)
> Beyond the name, GParamSpecs have two more descriptive strings, the nick and blurb, which may be used as a localized label and description. For GTK and related libraries these are considered deprecated and may be omitted, while for other libraries such as GStreamer and its plugins they are essential. When in doubt, follow the conventions used in the surrounding code and supporting libraries.

Можно (нужно) просто НЕ использовать `nick` и `blurb` передавая `null`. И "проблема" статических сторок - больше не проблема.


## GTK Template Closures - особенности и странности в GJS

~~~typescript
protected ['my-closure'](this: never, _: never, is_valid: boolean, ...): boolean
~~~


### Два this в сигнатуре

*Правильно ли я понимаю:
- this: never - это JavaScript контекст (обычный this)
- _: never - это first параметр от GTK (тоже передает this объекта)
Т.е. GTK передает this дважды - и как JS контекст, и как первый параметр? Зачем две копии и в чем между ними разница?*
*Ответ*: Да, ты правильно понял. Зачем две копии и в чем между ними разница? -- а это вопрос к той <тут был эмоциональный комментарий> которая писала GTK биндинг к GJS.

GTK передает контекст объекта дважды:
1. **JavaScript `this`** - контекст вызова (как обычно в JS)
2. **Первый параметр** - GTK передает объект-владелец template

Оба ссылаются на один объект, но передаются разными путями.

Для подробностей можешь посмотреть [overrides/Gtk.js](https://gitlab.gnome.org/GNOME/gjs/-/blob/master/modules/core/overrides/Gtk.js)


### closures должны быть чистыми

Технически closure имеет доступ к контексту (это метод класса), но:

- Это создает побочные эффекты в декларативном UI
- GTK вызывает closures автоматически при изменении bindings
- Неочевидный порядок и частота вызовов
- Трудно отследить flow выполнения

**Плохо, но почемуто возможно**:

GTK автоматически пересчитывает bindings при изменении зависимостей. Если closure сам меняет состояние, которое влияет на другие bindings, получается:

- Непредсказуемый порядок обновлений
- Возможные infinite loops
- Racing conditions в UI
- Performance death

~~~typescript
// Closure привязан к свойству 'filter'
protected ['should-show'](self: typeof this, filter: string): boolean {
    // ❌ КАТАСТРОФА
    this.visible_count = this.calculate_count(filter);  // триггерит другие bindings
    return filter.length > 0;
}

// Где-то есть binding:
// visible_count → label → другая closure → меняет filter → ...
// = бесконечный цикл обновлений или хаотичное поведение
// Отладка покажет - проще написать заново, чем искать что исправлять
~~~

**Правило**: Closure = чистая функция вычисления. Для побочных эффектов используй сигналы и обработчики.

**Cкрытые зависимости**:

~~~xml
<!-- XML объявляет: "реагируем на width" -->
<binding name="visible">
    <closure type="gboolean" function="should-show">
        <lookup name="width">widget</lookup>
    </closure>
</binding>
~~~

~~~typescript
// ❌ Но closure читает ЕЩЕ и color
protected should_show(self: typeof this, width: number): boolean {
    return width > 100 && this.color === 'red';
}
~~~

~~~typescript
// WTF? почему виджет так странно реагирует?
~~~

Проблема:

- GTK видит зависимость только от width (из XML)
- Closure НЕ пересчитается когда изменится color
- НО color учитывается когда меняется размер!
- Результат: "Почему виджет не скрывается когда я меняю размер и (не)скрывается когда я меняю цвет?!"
- Debug = ад, потому что в XML нет намека на зависимость от color

**Правило**: Все входные данные closure должны быть явно объявлены в XML через <lookup>. Closure = чистая, и желательно детерминированная, функция зависимая **ТОЛЬКО** от параметров.

Поэтому, для избежания подобных проблем, я типизирую оба эти "this" как `never`, чтобы предотвратить **случайное** использование:

~~~typescript
// ❌ Плохо (несколько искуственных примеров, демонстрирующих проблему)
protected ['my-closure'](self: typeof this, value: string): boolean {
    this.list_store.append(value); // boom!
    self.emit('something');  // НЕ ДЕЛАТЬ
    self.get_parent().delete_child(this); // PROFIT! А теперь найди меня 😄
    this.list_store.set_sorter((item_A, item_B) => {
        // стрелочная функция захватила контекст...
        this.sort_method(item_A, item_B); // (Ещё больше побочек в сортировщике)
    }) // отправляем контекст в Dark Side на п.м.ж.
    return value.length > 0;
}
~~~

~~~typescript
// ✅ Хорошо
protected ['my-closure'](this: never, _: never, value: string): boolean {
    // this.list_store.set_filter(value); // ts - Свойство "list_store" не существует в типе "never".
    // работаем только с параметрами
    return value.length > 0;
}
~~~


#### Аргументация:

Это следование стандартной архитектуре GTK. В GTK/C closures изначально спроектированы как функции с явными параметрами без состояния:

~~~c
gboolean my_closure(gpointer self, const char* value) {
    // self получен явно как параметр
    // нет "магического" контекста который можно случайно задеть
    return strlen(value) > 0;
}
~~~

**Что в других биндингах**:

Во ВСЕХ биндингах ClosureExpression получает `this` как первый параметр, НО:

Rust:

~~~rust
closure!(|_: Option<Object>, label: &str| {
    format!("{} World", label)
})
~~~

Лямбда/closure - свободная функция, НЕ метод класса. Не имеет контекста. `|_: Option<Object>` - игнорируют через `_`.

C++ (gtkmm):

~~~cpp
Glib::ustring get_string(Glib::RefPtr<Glib::ObjectBase> this_, double a, int b) {
    return Glib::ustring::sprintf("a is %f, b is %d", a, b);
}
~~~

Обычная функция - НЕ метод класса. Не имеет контекста. Первый параметр `this_` (контекст expression) но он НЕ используется в теле функции.

Таким образом:
Rust/C++: Closures - это свободные функции
- Физически не имеют доступа к состоянию widget'а
- Первый параметр this - параметр от GTK
- this - использовать могут, НО только явно обращаясь к параметру
- this - параметр, не "магический контекст". Его нельзя **случайно** "захватить"/"изменить"/"передать"

Трудно сделать не правильно.

GJS:

GJS: Closures - это методы объекта (инстанса)
- Имеют доступ к состоянию через контекст `this`
- Первый параметр `self` - параметр от GTK (тот же `this`)

В GJS трудно сделать *правильно*, потому что методы класса по умолчанию имеют доступ к контексту. Есть возможность - есть соблазн это использовать.


#### Мое решение:

~~~typescript
this: never, _: never  // программная защита
~~~

Архитектурный фикс не идеального решения разработчиков GJS. Взвешенная компенсация архитектурных проблем биндинга.

В "правильной" архитектуре (Rust/C++) такая защита не нужна - там closures физически не могут получить доступ к состоянию, или изменить его "случайно".

А в GJS - все "иначе".


#### Замечание

*Что делать если closure реально нужно состояние объекта? Например:*

~~~typescript
// Хочу форматировать с учетом user_locale виджета
protected ['format-date'](this: never, _: never, timestamp: number): string {
    // Но user_locale это свойство this! Как быть?
    return format_with_locale(timestamp, this.user_locale); // ❌
}
~~~

Или хочется кэшировать вичисления и хранить результаты на объекте?

*Ответ*: Смотрим в инструкции: "Здравый смысл превыше всего - нет жестких правил, есть цель и инструмент"

~~~typescript
// Хочу форматировать с учетом user_locale виджета
protected ['format-date'](this: never, self: typeof this, timestamp: number): string {
    return format_with_locale(timestamp, self.user_locale); // используем параметр `self` (не `this` - а вдруг клосуры станут static в будущем)
}
~~~

Передавать `user_locale` через `<lookup>` -- тоже, решение. Но зачем?

#### Если еще осталось желание дискутировать:

Closures НЕ равно функции JS/React/etc - это такая абстракция для "подготовь для меня данные - я заберу". Понятное дело что в js - это будет функция, но ее прилепили не в то место. И получилось:

В "нормальных" привязках:
~~~
GTK: "подготовь для меня данные - я заберу" ->
Closure в C/Rust: "вот данные"
~~~

В GJS:
~~~
GTK: "подготовь для меня данные - я заберу" ->
Closure в GJS (метод класса): "вот данные. А еще я:
    - изменил this.counter++
    - запустил this.emit('changed')
    - добавил setTimeout(...)
    - обновил this.cache" ->
GTK: "А КТО ПРОСИЛ?!" 😤 ->
GJS: "ой, все!" *грохот падающего виджета и свист ~бомбордировщика~ GC
Closure в GJS: "да, я такая и мне не стыдно. НО код пысал ТЫ!"
~~~

**Суть**: Closure - это data transformer, не actor.

Transformer: (input) => output - чистая функция
Actor: (input) => { do_stuff(); emit(); change_state(); return output; } - побочные эффекты

GTK ожидает transformer, но GJS даёт возможность использовать как actor (через this), что чревато проблемами.
Поэтому this: never - это не "запрет на всё", это "напоминание что ты должен быть transformer, а не actor".


## Типизация (особенности Typescript)

*Когда типы @girs точные, а когда приблизительные?*
*Ответ*: Их можно рассматривать как "вполне точные". Но нюансы есть всегда!

**Если встретил "нюансы"**: Глушим
~~~
// @ts-expect-error TS говорит что ..., но в реальности...
~~~

и идем дальше в надежде что в новых версиях починят.


## Typescript для GJS

- [gjsify/ts-for-gir](https://github.com/gjsify/ts-for-gir/releases/)
- [Там-же много примеров](https://github.com/gjsify/ts-for-gir/tree/main/examples)
- [Не много, да и устарело](https://gjs.guide/extensions/development/typescript.html)
- [Мои потуги...](https://github.com/LumenGNU/GObjectTS)
