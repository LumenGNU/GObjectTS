# GObjectTS - TypeScript Декораторы

> В первую очередь рассчитан на Gtk4.

> Состояние: Эксперимент, который уже можно использовать для реальных задач.

Набор **TypeScript** декораторов для упрощения работы с GObject.registerClass в GJS приложениях.


## Что это такое

Декораторы представляют собой **синтаксический сахар** для регистрации GObject классов в GJS/GTK приложениях. Вместо явного вызова GObject.registerClass() с объектом метаданных, декораторы позволяют использовать более декларативный подход через аннотации.

Создание кастомных GTK виджетов в GJS требует много вспомогательного кода - регистрация свойств, сигналов, template привязок через `GObject.registerClass()`.

Этот набор TypeScript декораторов, которые превращают регистрацию GObject классов в простые аннотации прямо над полями и методами.

**Традиционный подход**:

~~~typescript
class MyWidget extends Gtk.Widget {
    static {
        GObject.registerClass({
            GTypeName: 'MyWidget',
            Properties: {
                'my-property': GObject.ParamSpec.string('my-property', '', '',
                    GObject.ParamFlags.READWRITE, '')
            },
            Signals: {
                'my-signal': {}
            }
        }, this);
    }
}
~~~

**С декораторами**:

~~~typescript
@Widget({ GTypeName: 'MyWidget' })
class MyWidget extends Gtk.Widget {

    @Action.Bind('app.int-value')
    @Property.Int(0, -100, 100)
    declare int_value: number;

    @Signals({
        'my-signal': {
            param_types: [GObject.TYPE_INT]
        },
    })
    declare $signals: Gtk.Widget.SignalSignatures & {
        'my-signal': (value: number) => void;
    };
    declare emit: EmitMethod<MyWidget>;
    declare connect: ConnectMethod<MyWidget>;
    declare connect_after: ConnectMethod<MyWidget>;
}
~~~

### Это для вас, если:
- Создаёте много кастомных GTK виджетов
- Хотите современный TypeScript код вместо пухлого GObject API
- Цените читаемость и простоту рефакторинга

### Это НЕ для вас, если:
- Нужна динамическая регистрация классов во время выполнения
- Работаете с performance-критичными библиотеками низкого уровня
- Предпочитаете прямые вызовы без дополнительных абстракций
- Не можете использовать experimentalDecorators в своем проекте

### Зачем нужны

Улучшение читаемости кода

- Метаданные класса находятся рядом с соответствующими элементами
- Меньше вспомогательного кода, фокус на бизнес логике приложения
- Более интуитивный синтаксис для разработчиков, знакомых с современными фреймворками

Упрощение рефакторинга

- Изменения в свойствах и сигналах локализованы
- Меньше риска рассинхронизации метаданных и реализации


### Для чего НЕ подходят

Динамическая регистрация классов

- Декораторы применяются на этапе компиляции/загрузки модуля
- Не подходят для случаев, когда метаданные класса определяются во время выполнения

Сложные случаи регистрации

- Условная регистрация свойств/сигналов
- Динамическое формирование GTypeName
- Сложная логика инициализации, требующая доступа к runtime информации

Performance-критичные случаи

- Дополнительный слой абстракции может влиять на производительность
- Для библиотек низкого уровня лучше использовать прямые вызовы


### Когда полезны

Новые проекты на TypeScript

- Более современный стек разработки
- Приоритет на удобной поддержке кода

Большие кодовые базы

- Множество кастомных виджетов
- Сложная иерархия классов
- Необходимость в консистентности кода

Прототипирование и быстрая разработка

- Сокращение времени на написание вспомогательного кода
- Фокус на бизнес-логике, а не на технических деталях регистрации
- Создание пере используемых компонентов

Декораторы - это удобный инструмент для улучшения developer experience в GJS+Gtk проектах, но они требуют понимания их ограничений и правильной настройки окружения разработки.


## Совместимость

Поскольку это — **синтаксический сахар** поверх стандартного `GObject.registerClass()`, Вы можете:
- Использовать декораторы в новых классах, оставив старые как есть
- Постепенно мигрировать существующий код
- Комбинировать подходы в разных частях проекта

**Важно:** Не смешивайте декораторы и `GObject.registerClass()` в пределах одного класса - выберите один подход для каждого конкретного случая.


## Настройка TypeScript

TODO: конфигурация tsconfig.json для поддержки декораторов (experimentalDecorators), настройка среды разработки, примеры конфигурации для разных сценариев использования.


## Экосистема


### @Class

Декоратор для регистрации GObject классов.

~~~typescript
@Class({
    GTypeName: 'MyCustomObject',
    Implements: [Gtk.Buildable.$gtype],
})
class MyCustomObject extends GObject.Object {
    // ...
}
~~~

Собирает конфигурацию из декораторов:
- `@Property`, `@Property.*`
- `@Signals`

**Применение:** К классам, наследующим от `GObject.Object`.

**Важно:** Должен быть последним декоратором в цепочке декораторов класса (сверху).

[Декоратор @Class](Decoretor.Class.md)


### @Widget

Специализированный декоратор для `Gtk.Widget` классов. Автоматически настраивает виджет-специфичные параметры. Регистрирует GObject класс и настраивает виджет, используя метаинформацию, собранную другими декораторами.

~~~typescript
@Widget('MyButton')
class MyButton extends Gtk.Button {
    ...
}
~~~

Собирает конфигурацию из декораторов:
- `@Widget.Template`
- `@Property.*`
- `@Signals`
- `@Action.*`
- `@Styling`

**Применение:** К классам, наследующим от `Gtk.Widget`.

**Важно:** Должен быть последним декоратором в цепочке декораторов класса (сверху). Не совместим с декоратором `@Class`.

[Декоратор @Widget](Decorator.Widget.md)


### @Widget.Template

Декоратор для прикрепления `Gtk.Builder` templates.

~~~typescript
@Widget()
@Widget.Template('resource:///com/example/window.ui')
class MainWindow extends Gtk.ApplicationWindow {
    ...
}
~~~

~~~typescript
@Widget()
@Widget.Template(/*xml*/`
<interface>
    <template class="MainWindow" parent="GtkApplicationWindow">
        <!-- ... -->
    </template>
</interface>
`)  // Встраивание шаблона в код модуля кастомного виджета
    // позволяет использовать его как полноценный самостоятельный компонент
class MainWindow extends Gtk.ApplicationWindow {
    ...
}
~~~

**Применение:** К классам, наследующим от `Gtk.Widget`.

[Декоратор @Widget.Template](Decorator.Widget.Template.md)


### @Template.Child / @Template.Object

Связывают поля с дочерними элементами из template.

~~~typescript
@Widget()
@Widget.Template('resource:///com/example/window.ui')
class MainWindow extends Gtk.ApplicationWindow {

    @Template.Child
    declare header_bar: Gtk.HeaderBar;

    @Template.Child
    declare my_button: Gtk.Button;

    @Template.Object  // псевдоним для @Template.Child
    declare size_group: Gtk.SizeGroup;

    @Template.Child // ищет id="my_button"
    declare my_button: Gtk.Button;

    @Template.Child // ищет id="my-button"
    declare ['my-button']: Gtk.Button;

    @Template.Child // ищет id="myButton"
    declare myButton: Gtk.Button;

    @Template.Child // ищет id="_my_button"
    declare _my_button: Gtk.Button;
}
~~~

Имя ID берется из имени поля как есть.

**Применение:** К полям классов, наследующих от `Gtk.Widget`.

[Декоратор @Template.Child](Decorator.Template.Child.md)
[Декоратор @Template.Object](Decorator.Template.Object.md)


### @Property.*

Семейство декораторов для регистрации GObject свойств.

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Property(GObject.ParamSpec.string(/* ... */))
    declare my_prop: string;

    @Property.String('default-value')
    declare title: string;

    @Property.Int(0, 0, 100)
    declare count: number;

    @Property.Boolean(false)
    declare visible: boolean;

    @Property.Double(1.0, 0.0, 2.0)
    declare scale: number;

    @Property.Object(Gtk.Widget.$gtype)
    declare child: Gtk.Widget | null;

    @Property.Enum(Gtk.Orientation.$gtype, Gtk.Orientation.HORIZONTAL)
    declare orientation: Gtk.Orientation;
}
~~~

Автоматическое связывание имен свойств: имя поля преобразуется в каноничную форму kebab-case для GObject (поле `myProperty` → свойство `"my-property"`).

[Подробнее о преобразовании имен](Decorator.Property.key_to_canonical_name.md)

Универсальный `@Property` позволяет указать произвольный `GObject.ParamSpec`.

Все `@Property.*` декораторы поддерживают как краткую форму передачи параметров, так и полную настройку через объект конфигурации.

**Применение:** К полям классов, наследующих от `GObject.Object`.

**Полный список декораторов свойств:**
- [@Property](Decorator.Property.md)
- [@Property.Boolean](Decorator.Property.Boolean.md)
- [@Property.Boxed](Decorator.Property.Boxed.md)
- [@Property.Char](Decorator.Property.Char.md)
- [@Property.Double](Decorator.Property.Double.md)
- [@Property.Enum](Decorator.Property.Enum.md)
- [@Property.Flags](Decorator.Property.Flags.md)
- [@Property.GType](Decorator.Property.GType.md)
- [@Property.Int](Decorator.Property.Int.md)
- [@Property.Int64](Decorator.Property.Int64.md)
- [@Property.JSObject](Decorator.Property.JSObject.md)
- [@Property.Long](Decorator.Property.Long.md)
- [@Property.Object](Decorator.Property.Object.md)
- [@Property.Override](Decorator.Property.Override.md)
- [@Property.Param](Decorator.Property.Param.md)
- [@Property.Pointer](Decorator.Property.Pointer.md)
- [@Property.String](Decorator.Property.String.md)
- [@Property.UChar](Decorator.Property.UChar.md)
- [@Property.UInt](Decorator.Property.UInt.md)
- [@Property.UInt64](Decorator.Property.UInt64.md)
- [@Property.ULong](Decorator.Property.ULong.md)
- [@Property.UniChar](Decorator.Property.UniChar.md)
- [@Property.Variant](Decorator.Property.Variant.md) (модуль ParamSpec.GLib)


### @Signals

Декоратор для регистрации пользовательских сигналов.

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Signals({
        'value-changed': {
            param_types: [GObject.TYPE_INT, GObject.TYPE_STRING],
            return_type: GObject.TYPE_BOOLEAN
        },
        'item-selected': {
            param_types: [GObject.TYPE_OBJECT]
        },
        'ready': {}
    })
    declare $signals: Gtk.Widget.SignalSignatures & {
        'value-changed': (value: number, text: string) => boolean;
        'item-selected': (item: Gtk.Widget) => void;
        'ready': () => void;
    };

    // Типизированные методы для работы с сигналами
    declare emit: EmitMethod<MyWidget>;
    declare connect: ConnectMethod<MyWidget>;
    declare connect_after: ConnectMethod<MyWidget>;

    private on_button_clicked() {
        // Полная типизация
        const result = this.emit('value-changed', 42, 'hello');
        this.emit('ready');
    }
}
~~~

**Применение:** К полю `$signals` класса, наследующего от `GObject.Object`.

**Утилитарные типы:**
- `ConnectMethod<T>` - типизированный интерфейс для `connect` и `connect_after`
- `EmitMethod<T>` - типизированный интерфейс для `emit`

Предоставляют типизированные интерфейсы для методов `emit`, `connect` и `connect_after` с проверкой типов во время компиляции.

[Декоратор @Signals](Decorator.Signals.md)


### @Action.Bind

Декоратор создает активность (GAction), и связывает её с свойством виджета. Использует  [`Gtk.Widget.install_property_action`](https://docs.gtk.org/gtk4/class_method.Widget.install_property_action.html).

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Action.Bind('app.volume') // Теперь action 'app.volume' вызывает изменение свойства volume
    @Property.Int(50, 0, 100)
    declare volume: number;

    @Action.Bind('win.show-sidebar') // Активация 'win.show-sidebar' будет показывать/скрывать боковую панель
    @Property.Boolean(true)
    declare show_sidebar: boolean;

}
~~~

Action привязывается к свойству: состояние action отражает значение свойства, активация action изменяет свойство.

**Применение:** К полям с декоратором `@Property.*` в классах, наследующих от `Gtk.Widget`.

[Декоратор @Action.Bind](Decorator.Action.Bind.md)


### @Action.InstallAction

Декоратор для установки пользовательских действий через [`Gtk.Widget.install_action`](https://docs.gtk.org/gtk4/class_method.Widget.install_action.html).

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Action.InstallAction('widget.save')
    private on_save_action(parameter?: GLib.Variant | null) {
        console.log('Save action triggered');
        // логика сохранения
    }

    @Action.InstallAction('widget.copy', 's') // параметр string
    private on_copy_action(parameter?: GLib.Variant | null) {
        const text = parameter?.get_string()[0] ?? '';
        // логика копирования
    }

    @Action.InstallAction('widget.delete')
    private on_delete_action() {
        // можно опустить параметры если не нужны
    }
}
~~~

Применим к методу класса наследующего от Gtk.Widget, с сигнатурой `(parameter?: GLib.Variant | null) => void`.


### @Styling

Декоратор упрощающий CSS стилизацию виджетов.

~~~typescript
@Styling({
    [StylePriority.WIDGET + 10]: `file://${GLib.get_current_dir()}/widget-overrides.css`,
    [StylePriority.APPLICATION]: 'resource:///com/example/theme.css'
})
class MyWindow extends Adw.ApplicationWindow {
    constructor() {
        super();

        Styling.apply(this.get_display(),
            // применяем стили предоставленные нашими виджетами
            MyLabel,
            MyButton,
            MyChevron,
            MyWindow
        );

        ...
    }
}
~~~

~~~typescript
@Styling({
    CssName: 'my-custom-widget',

    [StylePriority.WIDGET]: /*css*/`
    my-custom-widget {
        background: inherit;
        border-radius: 6px;
        padding: 8px;
    }

    my-custom-widget:hover {
        background: @accent_bg_color;
    }`
}) // Встраивание CSS в код модуля кастомного виджета
   // позволяет использовать его как полноценный самостоятельный компонент
class MyWidget extends Gtk.Widget {
    ...
}
~~~

**Применение:** К классам, наследующим от `Gtk.Widget`.

**Утилитарные функции:**
- `Styling.apply()` - применяет стили одноразово на указанный дисплей
- `Styling.applyPreserve()` - применяет стили на указанный дисплей, с возможностью повторного применения

[Декоратор @Styling](Decorator.Styling.md)


## Использование вместе

~~~typescript
@Widget({ GTypeName: 'MusicPlayer' })
@Widget.Template('resource:///com/example/music-player.ui')
@Styling({[StylePriority.APPLICATION]: 'resource:///com/example/theme.css'})
class MusicPlayer extends Gtk.Window {

    @Template.Child()
    declare play_button: Gtk.Button;

    @Template.Child()
    declare volume_scale: Gtk.Scale;

    @Action.Bind('app.volume')
    @Property.Double(0.8, 0.0, 1.0)
    declare volume: number;

    @Action.Bind('app.playing')
    @Property.Boolean(false)
    declare playing: boolean;

    @Signals({
        'song-changed': {
            param_types: [GObject.TYPE_STRING]
        }
    })
    declare $signals: Gtk.Widget.SignalSignatures & {
        'song-changed': (song_title: string) => void;
    };
    declare emit: EmitMethod<MusicPlayer>;

    @Action.InstallAction('player.toggle')
    private toggle_playback() {
        this.playing = !this.playing;
        if (this.playing) {
            this.emit('song-changed', 'Current Song Title');
        }
    }
}
~~~

Этот подход обеспечивает:

- Автоматическую регистрацию в GObject системе
- Чистый и читаемый код
- Типизацию там где это возможно
- Простоту рефакторинга и поддержки

### @AddSignalMethods

Декоратор для интеграции сигнальной системы GJS в нативные TypeScript классы. Предоставляет обертку над `Signals.addSignalMethods` для использования сигнальной системы в классах, которые не наследуют от `GObject.Object`.

~~~typescript
// Определяем сигнатуры сигналов
interface MyWorkerSignals {
    'started': () => boolean;
    'progress': (completed: number, total: number) => boolean;
    'finished': (result: string) => boolean;
}

@AddSignalMethods
class MyWorker {
    // Типизированные методы сигнальной системы
    declare emit: SignalMethods<MyWorkerSignals>['emit'];
    declare connect: SignalMethods<MyWorkerSignals>['connect'];
    declare connectAfter: SignalMethods<MyWorkerSignals>['connectAfter'];
    declare disconnect: SignalMethods<MyWorkerSignals>['disconnect'];
    declare disconnectAll: SignalMethods<MyWorkerSignals>['disconnectAll'];
    declare signalHandlerIsConnected: SignalMethods<MyWorkerSignals>['signalHandlerIsConnected'];

    start_work() {
        this.emit('started');
        
        for (let i = 0; i <= 100; i += 10) {
            this.emit('progress', i, 100);
        }
        
        this.emit('finished', 'success');
    }
}

// Использование
const worker = new MyWorker();

worker.connect('started', () => {
    console.log('Работа началась');
    return SignalPropagate.CONTINUE;
});

worker.connect('progress', (_globalThis, completed: number, total: number) => {
    console.log(`Прогресс: ${completed}/${total}`);
    
    if (completed >= 50) {
        return SignalPropagate.STOP; // Остановить дальнейшую эмиссию
    }
    
    return SignalPropagate.CONTINUE;
});
~~~

**Особенности:**
- Полная типизация сигналов с автодополнением IDE
- Совместимость с сигнальной системой GObject
- Управление распространением через `SignalPropagate.CONTINUE`/`STOP`
- Автоматическое управление подключениями/отключениями

**Применение:** К нативным TypeScript классам, которые не наследуют от `GObject.Object`, но нуждаются в сигнальной системе.

**Утилитарные типы:**
- `SignalMethods<T>` - типизированный интерфейс для всех методов сигнальной системы
- `SignalPropagate` - константы для управления распространением сигналов

**Когда использовать:** Для бизнес-логики, контроллеров, сервисных классов, которым нужна событийная модель, но нет необходимости наследовать от GObject.

[Декоратор @AddSignalMethods](Decorator.AddSignalMethods.md)


## TODO

- Settings экосистема:

@Settings.Bind('show-seconds', 'boolean')
@Property.Boolean()
declare show_seconds: boolean;  // автоматическая связь с GSettings

@Settings.Schema('org.gnome.desktop.interface')
class AppSettings extends GObject.Object { ... }

@Settings.Bind('org.gnome.desktop.interface', 'show-weekdate')
@Property.Boolean()
declare show_weekdate: boolean;  // двусторонняя связь!

@Settings.Bind('org.app.preferences', 'window-width')
@Property.Int()
declare window_width: number;

- @CachedClosure

@CachedClosure('expensive-calculation')
protected calculate_heavy_stuff(_: this, data: ComplexData): string {
    // тяжелые вычисления, но результат кэшируется
    return expensive_computation(data);
}
Идеально для:

    Форматирование в списках (размеры файлов, даты...)
    Layout вычисления
    Преобразования цветов/стилей
    Любые чистые функции с expensive operations
