#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: examples/Tick/NativeGJSSignalSystem.ts */
/** @fileoverview:  Native GJS Signal System */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: *.*.* */
/** @changelog ... */

import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import { Class } from '../../GObjectTS/Class.js';
import { Template, Widget, StylePriority, Styling } from '../../GObjectTS/Widget.js';
import { AddSignalMethods, SignalMethods, SignalPropagate } from '../../GObjectTS/SignalMethods.js';

interface SignalsInterface {
    'tick': (formatted_time: string) => boolean;
};

@AddSignalMethods
class ClockService {

    declare emit: SignalMethods<SignalsInterface>['emit'];
    declare connect: SignalMethods<SignalsInterface>['connect'];
    declare connectAfter: SignalMethods<SignalsInterface>['connectAfter'];
    declare disconnect: SignalMethods<SignalsInterface>['disconnect'];
    declare disconnectAll: SignalMethods<SignalsInterface>['disconnectAll'];
    declare signalHandlerIsConnected: SignalMethods<SignalsInterface>['signalHandlerIsConnected'];

    private time_interval_source?: GLib.Source;
    private formatter: Intl.DateTimeFormat;

    private _running: boolean;

    constructor() {

        this.formatter = new Intl.DateTimeFormat(undefined, {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        this._running = false;
    }

    public get running(): boolean {
        return this._running;
    }

    public set running(val: boolean) {
        this._running = val;
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

@Widget('TestWindow')
@Widget.Template(/* xml */ `
<interface>
<template class="TestWindow" parent="AdwApplicationWindow">
    <property name="title">Native GJS Signal System</property>
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

    private clock_service = new ClockService();

    private handlers_ids = {
        clock_service_hid: -1,
        pause_button_hid: -1
    };

    vfunc_realize(): void {
        super.vfunc_realize();

        this.handlers_ids.clock_service_hid =
            this.clock_service.connect('tick', (_, time) => {
                this.time_label.set_label(time);
                return SignalPropagate.STOP;
            });

        this.handlers_ids.pause_button_hid =
            this.pause_button.connect('toggled', (sender) => {

                this.clock_service.running = sender.get_active();

                sender.set_label(
                    this.clock_service.running ? 'Pause' : 'Resume'
                );
            });

        this.pause_button.emit('toggled');
    }

    vfunc_unrealize(): void {

        this.clock_service.disconnect(this.handlers_ids.clock_service_hid);
        this.pause_button.disconnect(this.handlers_ids.pause_button_hid);

        super.vfunc_unrealize();
    }

    constructor(application: Adw.Application) {
        super({ application });

        Styling.apply(this.get_display(), TestWindow);
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
    application_id: 'object-ts.example.Tick.Native-GJS-Signal-System'
})).run(null);
