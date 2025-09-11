# GObjectTS - TypeScript Decorators

> Primarily designed for Gtk4.

> Status: Experimental, but already usable for real projects.

A set of **TypeScript** decorators to simplify working with GObject.registerClass in GJS applications.


# What is this

Decorators are **syntactic sugar** for registering GObject classes in GJS+GTK applications. Instead of explicit calls to [`GObject.registerClass()`](https://gjs-docs.gnome.org/gjs/overrides.md#gobject-registerclass) with metadata objects, decorators allow using a more declarative approach through annotations.

Creating custom GTK widgets in GJS requires a lot of boilerplate code - registering properties, signals, template bindings through `GObject.registerClass()`.

This is a set of TypeScript decorators that transform GObject class registration into simple annotations directly above fields and methods.

**Traditional approach**:

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

**With decorators**:

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

### This is for you if:
- You create many custom GTK widgets
- You want modern TypeScript code instead of verbose GObject API
- You value readability and easier refactoring


### This is NOT for you if:
- You need dynamic class registration at runtime
- You work with performance-critical low-level libraries
- You prefer direct calls without additional abstractions
- You cannot use `experimentalDecorators` in your project


### Why needed

**Code readability improvement**
- Class metadata is located next to corresponding elements
- Less boilerplate code, focus on application business logic
- More intuitive syntax for developers familiar with modern frameworks

**Prototyping and rapid development**
- Reduced time spent writing boilerplate code
- Focus on business logic rather than technical registration details
- Creating reusable components

**Simplified refactoring**
- Changes in properties and signals are localized
- Less risk of metadata and implementation desynchronization
- More modern development stack
- Priority on convenient code maintenance

**Large codebases**
- Multiple custom widgets
- Complex class hierarchies
- Need for code consistency


### What they are NOT suitable for

**Dynamic class registration**
- Decorators are applied at compilation/module loading stage
- Not suitable for cases where class metadata is determined at runtime

**Complex registration cases**
- Conditional registration of properties/signals
- Dynamic GTypeName formation
- Complex initialization logic requiring access to runtime information

**Performance-critical cases**
- Additional abstraction layer may affect performance
- For low-level libraries, direct calls are better

Decorators are a convenient tool for improving developer experience in GJS+Gtk projects, but they require understanding their limitations and proper development environment setup.


## Compatibility

Since this is **syntactic sugar** over standard [`GObject.registerClass()`](https://gjs-docs.gnome.org/gjs/overrides.md#gobject-registerclass), you can:
- Use decorators in new classes while leaving old ones as they are
- Gradually migrate existing code
- Combine approaches in different parts of the project

**Important:** Don't mix decorators and `GObject.registerClass()` within the same class - choose one approach for each specific case.


## TypeScript Setup


### Requirements

- **TypeScript** with experimental decorators support
- **@girs types** version `4.0.0-beta.25` or higher (for proper signal typing)


### Example tsconfig.json configuration

~~~json
{
  "compilerOptions": {
    "allowJs": false,
    "alwaysStrict": true,
    "downlevelIteration": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "lib": [
      "ES2022"
    ],
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "noEmitOnError": true,
    "skipDefaultLibCheck": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022",
    "types": [
      "@girs/adw-1",
      "@girs/gdk-4.0",
      "@girs/gio-2.0",
      "@girs/giounix-2.0",
      "@girs/gjs",
      "@girs/gjs/dom",
      "@girs/glib-2.0",
      "@girs/glibunix-2.0",
      "@girs/gobject-2.0",
      "@girs/gtk-4.0",
      "@girs/pango-1.0"
    ]
  }
}
~~~

TODO


## Ecosystem


### @Class

Decorator for registering GObject classes. Registers a GObject class using configuration collected from other decorators.

~~~typescript
@Class({
    GTypeName: 'MyCustomObject',
    Implements: [Gtk.Buildable.$gtype],
})
class MyCustomObject extends GObject.Object {
    // ...
}
~~~

Collects configuration from decorators:
- `@Property`, 
- `@Property.*`
- `@Signals`

**Usage:** For classes inheriting from `GObject.Object`.

**Important:** Must be the last decorator in the class decorator chain (on top).

[Decorator @Class](Decorator/Class.md)


### @Widget

Specialized decorator for `Gtk.Widget` classes. Automatically configures widget-specific parameters. Registers a GObject class and configures the widget using configuration collected from other decorators.

~~~typescript
@Widget('MyButton')
class MyButton extends Gtk.Button {
    ...
}
~~~

Collects configuration from decorators:
- `@Widget.Template`
- `@Property`
- `@Property.*`
- `@Signals`
- `@Action.*`
- `@Styling`

**Usage:** For classes inheriting from `Gtk.Widget`.

**Important:** Must be the last decorator in the class decorator chain (on top). Not compatible with `@Class` decorator.

[Decorator @Widget](Decorator/Widget.md)


### @Widget.Template

Decorator for attaching `Gtk.Builder` templates.

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
`)  // Embedding template in custom widget module code
    // allows using it as a full standalone component
class MainWindow extends Gtk.ApplicationWindow {
    ...
}
~~~

**Usage:** For classes inheriting from `Gtk.Widget`.

[Decorator @Widget.Template](Decorator/Widget.Template.md)


### @Template.Child / @Template.Object

Bind fields with child elements from template.

~~~typescript
@Widget()
@Widget.Template('resource:///com/example/window.ui')
class MainWindow extends Gtk.ApplicationWindow {

    @Template.Child
    declare header_bar: Gtk.HeaderBar;

    @Template.Child
    declare my_button: Gtk.Button;

    @Template.Object  // alias for @Template.Child
    declare size_group: Gtk.SizeGroup;

    @Template.Child // looks for id="my_button"
    declare my_button: Gtk.Button;

    @Template.Child // looks for id="my-button"
    declare ['my-button']: Gtk.Button;

    @Template.Child // looks for id="myButton"
    declare myButton: Gtk.Button;

    @Template.Child // looks for id="_my_button"
    declare _my_button: Gtk.Button;
}
~~~

The ID name is taken from the field name as is.

**Usage:** For fields of classes inheriting from `Gtk.Widget`.

[Decorator @Template.Child](Decorator/Template.Child.md)
[Decorator @Template.Object](Decorator/Template.Object.md)


### @Property.*

Family of decorators for registering GObject properties.

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

Automatic property name binding: field name is converted to canonical kebab-case form for GObject (field `myProperty` → property `"my-property"`).

[More about name conversion](Decorator/Property.key_to_canonical_name.md)

Universal `@Property` allows specifying arbitrary `GObject.ParamSpec`.

All `@Property.*` decorators support both short form parameter passing and full configuration through configuration object.

**Usage:** For fields of classes inheriting from `GObject.Object`.

**Complete list of property decorators:**
- [@Property](Decorator/Property.md)
- [@Property.Boolean](Decorator/Property.Boolean.md)
- [@Property.Boxed](Decorator/Property.Boxed.md)
- [@Property.Char](Decorator/Property.Char.md)
- [@Property.Double](Decorator/Property.Double.md)
- [@Property.Enum](Decorator/Property.Enum.md)
- [@Property.Flags](Decorator/Property.Flags.md)
- [@Property.GType](Decorator/Property.GType.md)
- [@Property.Int](Decorator/Property.Int.md)
- [@Property.Int64](Decorator/Property.Int64.md)
- [@Property.JSObject](Decorator/Property.JSObject.md)
- [@Property.Long](Decorator/Property.Long.md)
- [@Property.Object](Decorator/Property.Object.md)
- [@Property.Override](Decorator/Property.Override.md)
- [@Property.Param](Decorator/Property.Param.md)
- [@Property.Pointer](Decorator/Property.Pointer.md)
- [@Property.String](Decorator/Property.String.md)
- [@Property.UChar](Decorator/Property.UChar.md)
- [@Property.UInt](Decorator/Property.UInt.md)
- [@Property.UInt64](Decorator/Property.UInt64.md)
- [@Property.ULong](Decorator/Property.ULong.md)
- [@Property.UniChar](Decorator/Property.UniChar.md)
- [@Property.Variant](Decorator/Property.Variant.md) (модуль ParamSpec.GLib) TODO


### @Signals

Decorator for registering custom GObject signals.

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

    // declare typed methods for working with signals (using `declare` keyword)
    declare emit: EmitMethod<MyWidget>;
    declare connect: ConnectMethod<MyWidget>;
    declare connect_after: ConnectMethod<MyWidget>;

    private on_button_clicked() {
        // Full typing
        const result = this.emit('value-changed', 42, 'hello');
        this.emit('ready');
    }
}
~~~

**Usage:** For the `$signals` field of a class inheriting from `GObject.Object`.

**Utility types:**
- `ConnectMethod<T>` - typed interface for `connect` and `connect_after`
- `EmitMethod<T>` - typed interface for `emit`

Provide typed interfaces for `emit`, `connect` and `connect_after` methods with compile-time type checking.

[Decorator @Signals](Decorator/Signals.md)


### @Action.Bind

Decorator creates an action (GAction) and binds it to a widget property. Uses [`Gtk.Widget.install_property_action`](https://docs.gtk.org/gtk4/class_method.Widget.install_property_action.html).

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Action.Bind('app.volume') // Now action 'app.volume' triggers volume property change
    @Property.Int(50, 0, 100)
    declare volume: number;

    @Action.Bind('win.show-sidebar') // Activating 'win.show-sidebar' will show/hide the sidebar
    @Property.Boolean(true)
    declare show_sidebar: boolean;
}
~~~

Action is bound to property: action state reflects property value, action activation changes property.

**Usage:** For fields with `@Property.*` decorator in classes inheriting from `Gtk.Widget`.

[Decorator @Action.Bind](Decorator/Action.Bind.md)


### @Action.InstallAction

Decorator for installing custom actions via [`Gtk.Widget.install_action`](https://docs.gtk.org/gtk4/class_method.Widget.install_action.html).

~~~typescript
@Widget()
class MyWidget extends Gtk.Widget {

    @Action.InstallAction('widget.save')
    private on_save_action(parameter?: GLib.Variant | null) {
        console.log('Save action triggered');
        // save logic
    }

    @Action.InstallAction('widget.copy', 's') // string parameter
    private on_copy_action(parameter?: GLib.Variant | null) {
        const text = parameter?.get_string()[0] ?? '';
        // copy logic
    }

    @Action.InstallAction('widget.delete')
    private on_delete_action() {
        // parameters can be omitted if not needed
    }
}
~~~

Applied to methods of classes inheriting from Gtk.Widget, with signature `(parameter?: GLib.Variant | null) => void`.


### @Styling

Decorator simplifying CSS styling of widgets.

~~~typescript
@Styling({
    [StylePriority.WIDGET + 10]: `file://${GLib.get_current_dir()}/widget-overrides.css`,
    [StylePriority.APPLICATION]: 'resource:///com/example/theme.css'
})
class MyWindow extends Adw.ApplicationWindow {
    constructor() {
        super();

        Styling.apply(this.get_display(),
            // apply styles provided by our widgets
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
}) // Embedding CSS in custom widget module code
   // allows using it as a full standalone component
class MyWidget extends Gtk.Widget {
    ...
}
~~~

**Usage:** For classes inheriting from `Gtk.Widget`.

**Utility functions:**
- `Styling.apply()` - applies styles once to specified display
- `Styling.applyPreserve()` - applies styles to specified display with possibility of reapplication

[Decorator @Styling](Decorator/Styling.md)


## Using together

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

This approach provides:

- Automatic registration in GObject system
- Clean and readable code
- Typing where possible
- Easier refactoring and maintenance


### @AddSignalMethods

Decorator for integrating GJS signal system into native TypeScript classes. Provides a wrapper over [`Signals.addSignalMethods`](https://gjs-docs.gnome.org/gjs/signals.md) for using signal system in classes that don't inherit from `GObject.Object`.


~~~typescript
// Define signal signatures
interface MyWorkerSignals {
    'started': () => boolean;
    'progress': (completed: number, total: number) => boolean;
    'finished': (result: string) => boolean;
}

@AddSignalMethods
class MyWorker {
    // Declare typed signal system methods
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

// Usage
const worker = new MyWorker();

worker.connect('started', () => {
    console.log('Start...');
    return SignalPropagate.CONTINUE;
});

worker.connect('progress', (_globalThis, completed: number, total: number) => {
    console.log(`Progress: ${completed}/${total}`);
    
    if (completed >= 50) {
        return SignalPropagate.STOP; // Stop further emission
    }
    
    return SignalPropagate.CONTINUE;
});
~~~

**Features:**
- Full signal typing with IDE autocompletion
- Compatibility with GObject signal system
- Propagation control via `SignalPropagate.CONTINUE`/`STOP`
- Automatic connection/disconnection management

**Usage:** For native TypeScript classes that don't inherit from `GObject.Object` but need signal system.

**Utility types:**
- `SignalMethods<T>` - typed interface for all signal system methods
- `SignalPropagate` - constants for controlling signal propagation

**When to use:** For business logic, controllers, service classes that need event model but don't need to inherit from GObject.

[Decorator @AddSignalMethods](Decorator/AddSignalMethods.md)


