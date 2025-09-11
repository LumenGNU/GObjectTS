#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: examples/Tick/CustomGObjectSignals.ts */
/** @fileoverview: Custom GObject Signals */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: *.*.* */
/** @changelog ... */

import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject?version=2.0';
import { Class } from '../../GObjectTS/Class.js';
import { Property } from '../../GObjectTS/Property.js';
import { Template, Widget } from '../../GObjectTS/Widget.js';
import { StylePriority, Styling } from '../../GObjectTS/Styling.js';
import { ConnectMethod, EmitMethod, Signals } from '../../GObjectTS/Signals.js';

@Class({ GTypeName: 'ClockService' })
class ClockService extends GObject.Object {

    @Property.Boolean(true)
    declare running: boolean;

    @Signals({
        'tick': {
            param_types: [GObject.TYPE_STRING]
        }
    })
    declare $signals: {
        'tick': (formatted_time: string) => void;
        'notify::running': (pspec: GObject.ParamSpec) => void;
    } & GObject.Object.SignalSignatures;
    declare emit: EmitMethod<ClockService>;
    declare connect: ConnectMethod<ClockService>;

    private time_interval_source?: GLib.Source;
    private formatter: Intl.DateTimeFormat;

    constructor() {
        super();

        this.formatter = new Intl.DateTimeFormat(undefined, {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        this.connect('notify::running', () => this.update_timer());
        this.update_timer();
    }

    private update_timer() {

        if (this.time_interval_source) {
            clearInterval(this.time_interval_source);
            this.time_interval_source = undefined;
        }

        if (this.running) {
            this.time_interval_source = setInterval(() => {
                this.emit('tick', this.formatter.format(new Date()));
            }, 333);
        }
    }
}

@Widget({ GTypeName: 'TestWindow' })
@Widget.Template(/* xml */ `
<interface>
<template class="TestWindow" parent="AdwApplicationWindow">
    <property name="title">Custom GObject Signals</property>
    <property name="default-width">640</property>
    <property name="default-height">480</property>
    <property name="resizable">false</property>

    <property name="content">
        <object class="AdwToolbarView">

            <child type="top">
                <object class="AdwHeaderBar" />
            </child>

            <property name="content">
                <object class="GtkBox">
                    <style>
                        <class name="content" />
                    </style>
                    <property name="orientation">vertical</property>
                    <property name="halign">center</property>
                    <property name="valign">center</property>

                    <child>
                    <object class="GtkLabel" id="time_label">
                        <style>
                            <class name="time-label"/>
                            <class name="numeric"/>
                        </style>
                        <property name="halign">center</property>
                    </object>
                    </child>

                    <child>
                    <object class="GtkToggleButton" id="pause_button">
                        <property name="label">Pause</property>
                        <property name="active">true</property>
                    </object>
                    </child>

                </object>
            </property>

            <child type="bottom">
            <object class="GtkLabel" id="status">
                <property name="css-name">status-widget</property>
                <property name="vexpand">True</property>
                <property name="margin-top">12</property>
            </object>
            </child>

        </object>
    </property>
</template>
</interface>`)
@Styling({
    [StylePriority.APPLICATION - 10]: /* css */`
    .test-window.content {
        margin: 24px;
        border-spacing: 16px;
    }
    .time-label {
        color: #0F1237;
    }
    .dark .time-label {
        color: #f55b1e;
    }
    .time-label {
        padding: 5rem;
        font-size: 6rem;
        font-weight: bold;
        text-shadow: 0px 0px 200px alpha(@window_fg_color, 0.5);
    }` // ---
})
class TestWindow extends Adw.ApplicationWindow {

    @Template.Child
    declare time_label: Gtk.Label;

    @Template.Child
    declare pause_button: Gtk.ToggleButton;

    @Property.Object(ClockService.$gtype)
    declare clock_service: ClockService;

    private handlers_ids = {
        clock_service_hid: -1,
        clock_service_notify_hid: -1,
        pause_button_hid: -1
    };

    vfunc_realize(): void {
        super.vfunc_realize();

        this.handlers_ids.clock_service_hid =
            this.clock_service.connect('tick', (_, time) => {
                this.time_label.set_label(time);
            });

        this.handlers_ids.pause_button_hid =
            this.pause_button.connect('toggled', () => {
                this.clock_service.running = this.pause_button.get_active();
                this.update_pause_button_label();
            });

        this.handlers_ids.clock_service_notify_hid =
            this.clock_service.connect('notify::running', () => {
                this.update_pause_button_label();
            });
    }

    vfunc_unrealize(): void {

        this.clock_service.disconnect(this.handlers_ids.clock_service_hid);
        this.clock_service.disconnect(this.handlers_ids.clock_service_notify_hid);
        this.pause_button.disconnect(this.handlers_ids.pause_button_hid);

        super.vfunc_unrealize();
    }

    constructor(application: Adw.Application) {
        super({ application });

        Styling.apply(this.get_display(), TestWindow);

        this.clock_service = new ClockService();
    }

    private update_pause_button_label() {
        this.pause_button.set_label(
            this.clock_service.running ? 'Pause' : 'Resume'
        );
    }

}

@Class('HelloWorldApplication')
class HelloWorldApplication extends Adw.Application {

    constructor(constructor_props?: Partial<Adw.Application.ConstructorProps>) {
        super(constructor_props);
    }

    on_activate(): void {

        const app_window = new TestWindow(this);

        if (this.style_manager.dark) {
            app_window.add_css_class('dark');
        }

        this.style_manager.connect('notify::dark', () => {
            if (this.style_manager.dark) {
                app_window.add_css_class('dark');
                return;
            }
            app_window.remove_css_class('dark');
        });

        app_window.present();
    }
}

(new HelloWorldApplication({
    application_id: 'object-ts.example.Tick.Custom-GObject-Signals'
})).run(null);
