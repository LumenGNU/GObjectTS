#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: examples/Hello-World/Adwaita.ts */
/** @fileoverview: --- */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: *.*.* */
/** @changelog ... */

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

// @Widget decorator registers the class as a GObject widget with name 'TestWindow'
// This replaces the GObject.registerClass() call and makes code more declarative
@Widget('TestWindow')
// @Widget.Template decorator defines UI template directly in code
// Template describes interface structure in GTK Builder XML format
// Как параметр либо XML-строка либо URI-строка с схемой file: или resource:
// Смотри исходный код org/gnome/gjs/modules/core/overrides/Gtk.js
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<!-- Template definition for TestWindow class inheriting from AdwApplicationWindow -->
<template class="TestWindow" parent="AdwApplicationWindow">
    <!-- Main window properties -->
    <property name="title">Adwaita Hello World</property>
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
            <!-- Button to close window using action -->
            <object class="GtkButton">
                <property name="label">Close window</property>
                <property name="action-name">window.close</property><!-- standard action name to close window -->
                <property name="vexpand">false</property>
                <property name="hexpand">false</property>
                <property name="valign">center</property>
                <property name="halign">center</property>
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
    }

    // Virtual function called when attempting to close window
    // Returns false to allow window closure
    // GJS automatically connects methods named on_<signal_name> to corresponding signals
    on_close_request() {
        console.log('Window closed. Goodbye!');
        return false; // allow window to close
    }

}

// @Class decorator registers class as GObject with specified name
// This is a simpler version for classes not requiring UI templates
@Class('HelloWorldApplication')
class HelloWorldApplication extends Adw.Application {
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
(new HelloWorldApplication({ application_id: 'object-ts.example.hello-world' }))
    .run(null);
