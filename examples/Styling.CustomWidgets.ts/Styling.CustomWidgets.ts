#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: src/Ljs/GObjectTS/examples/Styling.CustomWidgets.ts/Styling.CustomWidgets.ts */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 1.0.0 */
/** @changelog Initial implementation with custom colored labels and theme switching */

/**
 * @fileoverview Custom Widgets Styling Example - Decorator Capabilities Demonstration
 *
 * IMPORTANT: This example demonstrates @Styling decorator capabilities,
 * not necessarily the "correct" way to style GTK applications in all cases.
 *
 * The @Styling decorator is designed for specific use cases:
 * - Static, declarative styling tied to widget classes
 * - Styling that doesn't change during runtime
 * - Simple CSS that can be defined at class level
 *
 * The decorator is NOT suitable for:
 * - Dynamic styling that changes based on user interactions
 * - Complex theming systems with runtime theme switching
 * - Dynamic styling that needs to change during runtime
 * - Styles that need to be reloaded or updated after application startup
 * - Cases where you need to apply styles multiple times to the same classes
 *
 * **MANUAL STYLING APPLICATION REQUIRED**:
 * The @Styling decorator only collects style metadata - it does NOT automatically
 * apply styles. You must call Styling.apply() manually because:
 *
 * 1. **Timing**: Decorators execute during class definition, when no displays exist yet
 * 2. **Display selection**: The decorator cannot determine which display to use
 * 3. **Control**: Manual application gives you full control over when and where
 *    styles are applied
 *
 * ```typescript
 * @Styling({ ... }) // ← Decorator runs here, no widgets exist yet
 * class MyWidget extends Gtk.Widget { }
 *
 * ...
 *
 * // This works - display is available, developer controls timing
 * const window = new MyWindow(app);
 * Styling.apply(window.get_display(), MyWindow); // ← Called when display exists
 * ```
 *
 * ## Features demonstrated in this example:
 * - Custom widget creation with individual CSS styling
 * - CSS name assignment for semantic styling
 * - Priority-based style application and overrides
 * - Styling application to multiple widget classes
 * - Theme-aware styling with automatic light/dark mode adaptation
 * - Integration of custom widgets in GTK Builder templates
 *
 * The application creates three custom label widgets (Purple, Green, Red) with
 * different background colors that adapt to the system theme. In light mode,
 * the colors are rendered in softer, pastel variants.
 *
 * **DEMONSTRATION PURPOSE ONLY**:
 * This example shows what's possible with @Styling decorator, but creating
 * separate widget classes for simple color variations is not recommended
 * for real applications. Consider using CSS classes instead:
 *
 * Alternative approach:
 * ```typescript
 * // Instead of PurpleLabel, GreenLabel, RedLabel classes:
 * new Gtk.Label({
 *   label: 'Purple label',
 *   css_classes: ['fancy-label', 'purple-variant']
 * });
 * ``` */

// Import Libadwaita and GTK4 libraries
import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';

// Import custom decorators to simplify GObject workflow
import {
    Class
} from '../../GObjectTS/Class.js';
import {
    Widget,
    Template
} from '../../GObjectTS/Widget.js';
import {
    CSSParseError,
    StylePriority,
    Styling
} from '../../GObjectTS/Styling.js';


/** Custom label widget with purple background styling.
 *
 * Demonstrates:
 * - Custom CSS name assignment via CssName property
 * - Widget-level styling priority
 * - Integration with fancy-label CSS class */
@Widget('PurpleLabel')
@Styling({
    CssName: 'purple-label',
    [StylePriority.WIDGET]: /* css */`
        purple-label {
            background-color: purple;
            outline: 3px solid purple;
            outline-offset: 5px;
        }
    ` // ---
})
class PurpleLabel extends Gtk.Label {
    /** Creates a new PurpleLabel with predefined text and styling classes. */
    constructor() {
        super({ label: 'Purple label', css_classes: ['fancy-label'] });
    }
}

/** Custom label widget with green background styling.
 *
 * Demonstrates:
 * - Custom CSS name assignment via CssName property
 * - Widget-level styling priority
 * - Integration with fancy-label CSS class */
@Widget('GreenLabel')
@Styling({
    CssName: 'green-label',
    [StylePriority.WIDGET]: /* css */`
        green-label {
            background-color: green;
            outline: 3px dashed green;
            outline-offset: 5px;
        }
    ` // ---
})
class GreenLabel extends Gtk.Label {
    /** Creates a new GreenLabel with predefined text and styling classes. */
    constructor() {
        super({ label: 'Green label', css_classes: ['fancy-label'] });
    }
}

/** Custom label widget with red background styling.
 *
 * Demonstrates:
 * - Custom CSS name assignment via CssName property
 * - Widget-level styling priority
 * - Integration with fancy-label CSS class */
@Widget('RedLabel')
@Styling({
    CssName: 'red-label',
    [StylePriority.WIDGET]: /* css */`
        red-label {
            background-color: red;
            outline: 3px double red;
            outline-offset: 5px;
        }
    ` // ---
})
class RedLabel extends Gtk.Label {
    /** Creates a new RedLabel with predefined text and styling classes. */
    constructor() {
        super({ label: 'Red label', css_classes: ['fancy-label'] });
    }
}

/** Main application window demonstrating custom widget styling capabilities.
 *
 * Features:
 * - Custom colored label widgets (Purple, Green, Red)
 * - Theme-aware styling with light/dark mode support
 * - Advanced CSS priority management
 * - Styling application for multiple widget classes */
@Widget('TestWindow')
// @Widget.Template decorator defines UI template
@Widget.Template(
/* xml */ `
<interface>
<!-- Template definition for TestWindow class inheriting from AdwApplicationWindow -->
<template class="TestWindow" parent="AdwApplicationWindow">
    <!-- Main window properties -->
    <property name="title">Custom Widgets Styling Demo</property>
    <property name="default-width">640</property>
    <property name="default-height">480</property>
    <property name="resizable">false</property>

    <!-- Window content - using AdwToolbarView for modern layout -->
    <property name="content">
        <object class="AdwToolbarView">

        <!-- Top panel with header bar (empty) -->
        <child type="top">
        <object class="AdwHeaderBar" />
        </child>

        <!-- Main window content area -->
        <property name="content">
        <object class="GtkBox">
            <property name="halign">center</property>
            <property name="hexpand">true</property>
            <property name="orientation">vertical</property>
            <property name="vexpand">true</property>

            <!-- Use custom widget classes as children -->
            <child>
            <object class="PurpleLabel">
                <property name="valign">end</property>
                <property name="vexpand">true</property>
            </object>
            </child>

            <child>
            <object class="GreenLabel">
                <property name="valign">center</property>
                <property name="vexpand">true</property>
            </object>
            </child>

            <child>
            <object class="RedLabel">
                <property name="valign">start</property>
                <property name="vexpand">true</property>
            </object>
            </child>

            <child><!-- window close button -->
            <object class="GtkButton">
                <property name="action-name">window.close</property>
                <property name="label">Close window</property>
                <property name="valign">start</property>
                <property name="vexpand">true</property>
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
            <property name="vexpand">true</property>
        </object>
        </child>

        </object>
    </property>
</template>
</interface>`)
// @link https://docs.gtk.org/gtk4/css-overview.html
// @link https://docs.gtk.org/gtk4/css-properties.html
// @link https://docs.gtk.org/gtk3/css-overview.html#colors
// @link https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/css-variables.html
// @link https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html
@Styling({
    CssDependencies: [RedLabel, PurpleLabel, GreenLabel],
    [StylePriority.APPLICATION]: /* css */`
    window {
        box-shadow: rgba(3, 101, 214, 0.62) 0px 0px 0px 3px;
    }
    window.dark {
        box-shadow: rgba(240, 116, 0, 0.64) 0px 0px 0px 3px;
    }

    .fancy-label {
        padding: 6px 12px;
        border-radius: 7px;
    }
    `, // ---
    // Light theme overrides with higher priority (WIDGET + 10).
    // Provides softer, pastel colors for custom widgets when not in dark mode.
    [StylePriority.WIDGET + 10]: /* css */`
    window:not(.dark) purple-label {
        background-color: rgba(236, 212, 255, 1);
    }
    window:not(.dark) green-label {
        background-color: rgba(212, 255, 212, 1);
    }
    window:not(.dark) red-label {
        background-color: rgba(255, 212, 212, 1);
    }
    `, // ---
})
class TestWindow extends Adw.ApplicationWindow {

    // @Template.Child decorator automatically binds class property
    // to template widget by ID. This replaces manual template.get_child() calls
    // 'declare' tells TypeScript that property will be initialized externally
    @Template.Child
    declare status_label: Gtk.Label;

    // Constructor accepts Adw.Application to bind window with application
    constructor(application: Adw.Application) {
        // Call parent class constructor with application passed
        super({ application });

        // Set text in status label with Libadwaita version
        // status_label is available thanks to @Template.Child decorator
        this.status_label.set_label(`Gtk version: ${Gtk.MAJOR_VERSION}.${Gtk.MINOR_VERSION}.${Gtk.MICRO_VERSION};\tAdw version: ${Adw.VERSION_S};`);

        // Apply styling to all custom widget classes in batch
        // NOTE: This demonstrates batch application capabilities.
        // The decorator applies styles statically - they cannot be reapplied
        // or modified after this call. For dynamic styling needs, use direct
        // Gtk.CssProvider management instead.
        try {
            const display = this.get_display();
            Styling.apply(display, TestWindow);
        }
        catch (error) {
            if (error instanceof CSSParseError) {
                console.warn(error.message);
            }
            else {
                throw error;
            }
        }
    }

    // Virtual function called when attempting to close window
    // Returns false to allow window closure
    // GJS automatically connects methods named on_<signal_name> to corresponding signals
    on_close_request() {
        console.log('Window closed. Goodbye!');
        return false; // allow window to close
    }

}

/** Main application class for the Custom Widgets Styling demonstration.
 *
 * This application showcases:
 * - Custom widget creation with individual styling
 * - Batch styling application
 * - Theme-aware UI adaptation (light/dark mode) */
@Class('HelloWorldApplication')
class HelloWorldApplication extends Adw.Application {

    /** Creates a new HelloWorldApplication instance.
     *
     * @param constructor_props - Optional Adwaita Application constructor properties.
     *   Must be optional for @Class decorator compatibility.
     */
    constructor(constructor_props?: Partial<Adw.Application.ConstructorProps>) {
        super(constructor_props);
    }

    /** Application activation handler.
     *
     * Called when the application is activated.
     * This method is automatically connected to the 'activate' signal
     * by GJS due to the on_<signal_name> naming convention. */
    on_activate(): void {

        // Create and display main window

        const app_window = new TestWindow(this);

        // Apply dark theme CSS class if system is in dark mode
        if (this.style_manager.dark) {
            app_window.add_css_class('dark');
        }

        // Listen for system theme changes and update window styling accordingly
        // This enables automatic switching between light and dark color schemes
        // applied 'dark' CSS class to main window if dark mode is enabled.
        this.style_manager.connect('notify::dark', () => {
            if (this.style_manager.dark) {
                app_window.add_css_class('dark');
                return;
            }
            app_window.remove_css_class('dark');
        });

        // Display the window and bring it to foreground
        app_window.present();
    }
}

// Create and run application
// application_id should be unique identifier in reverse DNS format
// run(null) starts application main loop
(new HelloWorldApplication({ application_id: 'object-ts.example.hello-css' }))
    .run(null);
