#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: src/Ljs/GObjectTS/examples/Adw.Hello-world/Hello-world.ts */
/** @fileoverview: --- */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: *.*.* */
/** @changelog ... */

// Import Libadwaita and GTK4 libraries
import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';

// Import custom decorators to simplify GObject workflow
import {
    Class
} from '../../GObjectTS/Class.js';
import {
    Widget,
    Template
} from '../../GObjectTS/Widget.js';
import {
    Action
} from '../../GObjectTS/Action.js';
import {
    Property
} from '../../GObjectTS/Property.js';
import {
    StylePriority,
    Styling
} from '../../GObjectTS/Styling.js';

/** Custom label widget with popover functionality.
 *
 * Implements a label that can display a popover on demand.
 * The popover shows when triggered by actions and properly handles
 * positioning updates during widget resize events. */
@Widget('MyLabelWithPopup')
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<template class="MyLabelWithPopup" parent="GtkLabel">

    <object class="GtkPopover" id="popover">
        <property name="position">top</property>

        <property name="child">
        <object class="GtkLabel">
            <property name="label">I said: "Hello!" from Popover</property>
            <property name="margin-bottom">24</property>
            <property name="margin-end">24</property>
            <property name="margin-start">24</property>
            <property name="margin-top">24</property>
        </object>
        </property>
    </object>

    <child>
    <object class='GtkShortcutController'><!-- контроллер клавиатурных комбинаций -->
        <property name='scope'>global</property>
        <child>
        <object class='GtkShortcut'><!-- F1 -->
            <property name='trigger'>F1</property>
            <property name='action'>action(widget.popup)</property>
        </object>
        </child>
    </object>
    </child>

</template>
</interface>`
)
class MyLabelWithPopup extends Gtk.Label {

    // Gets popover from template
    @Template.Child
    // @Property.Object(Gtk.Popover.$gtype) // Uncomment if you need popover to
    // be a GObject property. For example, to connect a different one by passing
    // it through constructor parameters or in the main window template
    declare popover: Gtk.Popover;

    // true if popover is visible
    public get popover_state(): boolean {
        return this.popover.visible;
    }

    /** Handle widget size allocation changes.
     *
     * @affects popover Updates popover position - this is a requirement for widget
     * implementations with attached popovers.
     * @see {@link https://docs.gtk.org/gtk4/method.Popover.present.html}
     *
     * @param width New width
     * @param height New height
     * @param baseline Baseline */
    public vfunc_size_allocate(width: number, height: number, baseline: number): void {
        super.vfunc_size_allocate(width, height, baseline);
        this.popover?.present(); // Updates position according to GTK documentation
    }

    constructor(constructor_props?: Partial<Gtk.Label.ConstructorProps> & {
        // popover: Gtk.Popover
    }) {
        super(constructor_props);
        // Set popover as child element.
        this.popover.set_parent(this);
    }

    public popup(): void {
        if (!(this.popover.visible)) {
            this.popover.popup();
        }
    }

    public popdown(): void {
        if ((this.popover.visible)) {
            this.popover.popdown();
        }
    }

    /** @Action.Handler('widget.popup') adds an action to the widget and registers this method as its handler.
     * The action can be triggered via activate_action() call or through GTK's action system (shortcuts, etc.).
     *
     * @param widget Widget instance that triggered the action
     * @param action_name Name of the triggered action */
    @Action.InstallAction('widget.popup')
    protected actions_handler(): void {
        if (this.popover_state) {
            // popover is already visible
            return;
        }

        this.popup();
    }
}

/** Main application window with counter functionality.
 *
 * Demonstrates usage of various decorators for creating a complete GTK4/Libadwaita window
 * with template binding, properties, actions, and custom widgets.
 * Features a counter that can be incremented/decremented and a custom label with popover. */
// @Widget decorator registers the class as a GObject widget with name 'TestWindow'
// This replaces the GObject.registerClass() call and makes code more declarative
@Widget('TestWindow')
// @Widget.Template.XML.FromString decorator defines UI template directly in code
// Template describes interface structure in GTK Builder XML format
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<!-- Template definition for TestWindow class inheriting from AdwApplicationWindow -->
<template class="TestWindow" parent="AdwApplicationWindow">
    <!-- Main window properties -->
    <property name="title">Counter Demo</property>
    <property name="default-width">640</property>
    <property name="default-height">480</property>
    <property name="resizable">false</property>

    <!-- Initial value for counter GObject property (overrides decorator default) -->
    <property name="counter">42</property>

    <!-- Window content - using AdwToolbarView -->
    <property name="content">
        <object class="AdwToolbarView">

        <!-- Top panel with header bar -->
        <child type="top">
        <object class="AdwHeaderBar" >
            <child type="start">
            <!-- Button that triggers 'window.say-hello' action, see handler below in TestWindow class -->
            <object class="GtkButton">
                <property name="halign">center</property>
                <property name="label">F1 to say Hello!</property>
                <property name="action-name">window.say-hello</property>
            </object>
            </child>
        </object>
        </child>

        <!-- Main window content area -->
        <!-- Main window content area with counter controls and display.
             Contains custom label widget that shows counter value via property binding
             and control buttons that operate through GTK action system -->
        <property name="content">
        <object class="GtkBox">
            <property name="halign">center</property>
            <property name="height-request">240</property>
            <property name="orientation">vertical</property>
            <property name="valign">center</property>
            <property name="width-request">320</property>

            <child>
            <object class="MyLabelWithPopup" id="my_label">
                <style>
                    <class name="counter-label"/>
                    <class name="numeric"/>
                </style>
                <property name="valign">center</property>
                <property name="vexpand">True</property>
                <!-- Label text is bound to counter property via closure binding -->
                <binding name="label">
                <closure type="gchararray" function="format_counter_closure">
                    <lookup name="counter">TestWindow</lookup>
                </closure>
                </binding>

            </object>
            </child>

            <child>
            <object class="GtkBox">
                <property name="spacing">3</property>

                <!-- Counter control buttons - each triggers actions with specific names and parameters when needed -->

                <child>
                <object class="GtkBox">
                    <property name="halign">start</property>
                    <property name="hexpand">true</property>
                    <property name="spacing">3</property>

                    <child>
                    <object class="GtkButton">
                        <property name="action-name">window.change-counter</property>
                        <property name="action-target">-1</property>
                        <property name="label">-1</property>
                    </object>
                    </child>

                    <child>
                    <object class="GtkButton">
                        <property name="action-name">window.change-counter</property>
                        <property name="action-target">-10</property>
                        <property name="label">-10</property>
                    </object>
                    </child>

                </object>
                </child>

                <child>
                <object class="GtkButton">
                    <property name="halign">center</property>
                    <property name="label">Reset to 0</property>
                    <property name="action-name">window.reset-counter</property>
                </object>
                </child>

                <child>
                <object class="GtkBox">
                    <property name="halign">end</property>
                    <property name="hexpand">true</property>
                    <property name="spacing">3</property>

                    <child>
                    <object class="GtkButton">
                        <property name="action-name">window.change-counter</property>
                        <property name="action-target">1</property>
                        <property name="label">+1</property>
                    </object>
                    </child>

                    <child>
                    <object class="GtkButton">
                        <property name="action-name">window.change-counter</property>
                        <property name="action-target">10</property>
                        <property name="label">+10</property>
                    </object>
                    </child>

                </object>
                </child>

            </object>
            </child>
        </object>
        </property>

        <!-- Bottom panel with status label (initial without text) -->
        <child type="bottom">
         <!-- Label with ID for code access -->
        <object class="GtkLabel" id="status_label">
            <style>
                <!-- CSS class for status label for styling -->
                <class name="status-label" />
            </style>
            <property name="vexpand">True</property>
        </object>
        </child>

        </object>
    </property>
</template>
</interface>`)
@Styling({
    [StylePriority.WIDGET]: /*css*/`
    .counter-label {
        font-size: 3em;
        font-weight: bold;
    }`
})
class TestWindow extends Adw.ApplicationWindow {

    // @Template.Child decorator automatically binds class property
    // to template widget by ID. This replaces manual template.get_child() calls
    // 'declare' tells TypeScript that property will be initialized externally
    @Template.Child
    declare status_label: Gtk.Label;

    // @Property.Int(0) creates a reactive GObject property with default value 0
    // Initial value will be set from template (see counter property in XML template)
    // Stores the counter value. Display automatically tracks its changes via property binding system
    // Any modifications to this property will automatically update the UI through GTK's binding mechanism
    @Property.Int(0)
    declare counter: number;

    @Template.Child
    declare my_label: MyLabelWithPopup;

    // Constructor accepts Adw.Application to bind window with application
    constructor(application: Adw.Application) {
        // Call parent class constructor with application passed
        super({ application });

        Styling.apply(this.get_display(), TestWindow);

        // Set text in status label with Libadwaita version
        // status_label is available thanks to @Template.Child decorator
        this.status_label.set_label(`Gtk version: ${Gtk.MAJOR_VERSION}.${Gtk.MINOR_VERSION}.${Gtk.MICRO_VERSION};\tAdw version: ${Adw.VERSION_S};`);
    }

    // Virtual function called when attempting to close window
    // Returns false to allow window closure
    // GJS automatically connects methods named on_<signal_name> to corresponding signals
    protected on_close_request() {
        console.log('Window closed. Goodbye!');
        return false; // allow window to close
    }

    /** Formats counter value for display in the UI.
     * Used as closure function in template binding to convert numeric counter to formatted string.
     *
     * @param _ Widget instance (unused in this closure)
     * @param counter Counter value to format (may be undefined if no initial value passed through constructor/template)
     * @returns Formatted string with leading zeros and proper sign handling */
    protected format_counter_closure(_: this, counter?: number): string {
        if (!counter) return '000'; // Handle undefined case when no initial value is set
        return counter < 0  // Format with sign consideration
            ? '-' + Math.abs(counter).toString().padStart(3, '0')
            : counter.toString().padStart(3, '0');
    }

    /** Handles 'window.say-hello' action.
     * Triggers popup display by activating 'widget.popup' action on the custom label widget.
     *
     * @param this_widget Window instance that owns the action
     * @param action_name Name of the triggered action
     * @param parameter Action parameter (unused for this action) */
    @Action.InstallAction('window.say-hello')
    protected actions_handler(): void {
        this.my_label.activate_action('widget.popup', null);
        // Or direct call:
        // if(!this.my_label.popover_state) {
        //     this.my_label.popup();
        // }
    }

    /** Handles counter manipulation actions.
     * Processes both 'window.reset-counter' (no parameter) and 'window.change-counter' (with integer parameter).
     *
     * @param this_widget Window instance that owns the actions
     * @param action_name Name of the triggered action
     * @param parameter Action parameter (integer for change amount, unused for reset)
     */
    @Action.InstallAction('window.reset-counter')
    protected reset_handler() {
        this.counter = 0;
    }

    @Action.InstallAction('window.change-counter', 'i') // 'i' specifies GVariant type - integer. See: https://docs.gtk.org/glib/struct.VariantType.html#gvariant-type-strings
    protected increment_handler(parameter?: GLib.Variant<'i'> | null): void {
        const increment = parameter?.get_int32() ?? 0; // Get integer parameter
        this.counter += increment;
    }
}

// @Class decorator registers class as GObject with specified name
// This is a simpler version for classes not requiring UI templates
@Class('ExampleApplication')
class ExampleApplication extends Adw.Application {
    // Constructor accepts parameters for creating Adw.Application
    // Partial<> means all properties are optional
    // IMPORTANT: Constructor must accept optional parameters!
    // - constructor_props must be optional (with ? mark)
    // - All user parameters must be optional
    // - Otherwise @Class decorator rejects the class
    constructor(constructor_props?: Partial<Adw.Application.ConstructorProps>) {
        super(constructor_props);
    }

    // Signal handler for 'activate' signal
    // GJS automatically connects methods named on_<signal_name> to corresponding signals
    on_activate(): void {
        // Create and display main window
        // present() makes window visible and active
        (new TestWindow(this)).present();
    }
}

// Create and run application
// application_id should be unique identifier in reverse DNS format
// run(null) starts application main loop
(new ExampleApplication({ application_id: 'object-ts.example.action-handler' }))
    .run(null);
