#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';

import {
    Widget,
    Template,
} from '../../GObjectTS/Widget.js';
import {
    Action
} from '../../GObjectTS/Action.js';
import {
    Property
} from '../../GObjectTS/Property.js';
import { Class } from '../../GObjectTS/Class.js';


@Widget('TestWindow')
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<template class="TestWindow" parent="AdwApplicationWindow">
    <property name="title">Hello World</property>
    <property name="default-width">640</property>
    <property name="default-height">480</property>
    <property name="resizable">false</property>

    <property name="content">

        <object class="AdwToolbarView">

        <child type="top">
        <object class="AdwHeaderBar">
        <child type="start">
            <object class="GtkToggleButton" id="panel_toggle_btn1">
                <property name="action-name">app.panel-toggle</property>
                <property name="halign">end</property>
                <property name="valign">start</property>
                <binding name="label">
                    <closure type="gchararray" function="chose_string_closure">
                        <lookup name="panel-toggle">TestWindow</lookup>
                    </closure>
                </binding>
            </object>
        </child>
        </object>
        </child>

        <!-- контент окна -->
        <property name="content">
        <object class="AdwOverlaySplitView"><!-- Виджет с панелью -->
            <property name="collapsed">true</property>
            <property name="show-sidebar" bind-source="TestWindow" bind-property="panel-toggle" bind-flags="sync-create|bidirectional" />

            <property name="content">
            <object class="GtkBox">
                <property name="orientation">vertical</property>

                <child>
                <object class="GtkLabel" id="info_label">
                    <property name="use-markup">true</property>
                    <property name="justify">center</property>
                    <property name="wrap">true</property>
                </object>
                </child>

                <child>
                <object class="GtkToggleButton">
                    <property name="halign">center</property>
                    <property name="label" bind-source="panel_toggle_btn1" bind-property="label" bind-flags="sync-create"/>
                    <property name="action-name" bind-source="panel_toggle_btn1" bind-property="action-name" bind-flags="sync-create"/>
                </object>
                </child>
            </object>
            </property>

            <property name="sidebar"><!-- Панель -->
            <object class="GtkBox">
                <property name="halign">center</property>
                <property name="orientation">vertical</property>
                <property name="valign">center</property>

                <child>
                <object class="GtkLabel">
                    <property name="justify">center</property>
                    <property name="label">Контент панели</property>
                    <property name="wrap">true</property>
                </object>
                </child>

                <child>
                <object class="GtkToggleButton">
                    <property name="halign">end</property>
                    <property name="valign">start</property>
                    <property name="label" bind-source="panel_toggle_btn1" bind-property="label" bind-flags="sync-create"/>
                    <property name="action-name" bind-source="panel_toggle_btn1" bind-property="action-name" bind-flags="sync-create"/>
                </object>
                </child>
            </object>
            </property>
        </object>
        </property>

        <child type="bottom">
        <object class="GtkLabel" id="status_label">
            <style>
                <class name="status-label" />
            </style>
            <property name="vexpand">True</property>
        </object>
        </child>

        </object>
    </property>

    <child>
    <object class='GtkShortcutController'><!-- контроллер клавиатурных комбинаций -->
        <property name='scope'>local</property>
        <child>
        <object class='GtkShortcut'><!-- Ctrl+B - открыть/закрыть боковую панель -->
            <property name='trigger'>&lt;Control&gt;b</property>
            <property name='action'>action(app.panel-toggle)</property>
        </object>
        </child>
    </object>
    </child>

</template>
</interface>`)
class TestWindow extends Adw.ApplicationWindow {

    @Template.Child
    declare status_label: Gtk.Label;

    @Template.Child
    declare info_label: Gtk.Label;

    @Action.Bind('app.panel-toggle')
    @Property.Boolean(true)
    declare panel_toggle: boolean;

    constructor(application: Adw.Application) {
        super({ application });

        this.status_label.set_label(`Adw version: ${Adw.VERSION_S}`);

        this.info_label.set_label('<big><b>Демонстрация связывания компонентов через активности</b></big>\n\n'
            + 'Используй любую кнопку что бы показать/скрыть панель\n\n'
            + 'Используй клавиатурную комбинацию Ctrl+B для того-же');
    }

    protected chose_string_closure(_: this, panel_toggle: boolean): string {
        return panel_toggle ? 'Hide panel' : 'Show panel';
    }

    on_close_request() {
        console.log('by!');
        return false; // позволяем окну закрыться
    }

}

// @Class decorator registers class as GObject with specified name
// This is a simpler version for classes not requiring UI templates
@Class('ExampleApplication')
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
(new HelloWorldApplication({ application_id: 'object-ts.example.action-hello-world' }))
    .run(null);
