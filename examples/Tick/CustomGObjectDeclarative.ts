#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

/** @file: examples/Tick/CustomGObjectDeclarative.ts */
/** @fileoverview:  Data Binding via Template */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: *.*.* */
/** @changelog ... */

import Adw from 'gi://Adw?version=1';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject?version=2.0';
import { Class } from '../../GObjectTS/Class.js';
import { Property } from '../../GObjectTS/Property.js';
import { Widget, Template } from '../../GObjectTS/Widget.js';
import { Styling, StylePriority } from '../../GObjectTS/Styling.js';
import { ConnectMethod, EmitMethod } from '../../GObjectTS/Signals.js';

@Class({ GTypeName: 'ClockService' })
class ClockService extends GObject.Object {

    @Property.String({ flags: GObject.ParamFlags.READABLE })
    public get current_time(): string { return this._current_time; }
    private set current_time(time: string) {
        this._current_time = time;
        this.notify('current-time');
    }
    private _current_time = '';

    @Property.Boolean(true)
    public get running(): boolean { return this.internal_running; };
    public set running(value: boolean) { this.internal_running = value; this.update_timer(); };
    declare internal_running: boolean;

    declare $signals: {
        'notify::running': (pspec: GObject.ParamSpec) => void;
        'notify::current-time': (pspec: GObject.ParamSpec) => void;
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

        this.update_timer();
    }

    private update_timer() {

        if (this.time_interval_source) {
            clearInterval(this.time_interval_source);
            this.time_interval_source = undefined;
        }

        if (this.running) {
            this.time_interval_source = setInterval(() => {
                this.current_time = this.formatter.format(new Date());
            }, 333);
        }
    }
}

@Widget({ GTypeName: 'TestWindow' })
@Widget.Template(/* xml */ `
<interface>
<object class="ClockService" id="clock_service">
    <property name="running" bind-source="pause_button" bind-property="active" bind-flags="sync-create|bidirectional" />
</object>

<template class="TestWindow" parent="AdwApplicationWindow">
    <property name="title">Data Binding via Template</property>
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
                        <class name="time-label" />
                        <class name="numeric" />
                    </style>
                    <property name="halign">center</property>
                    <property name="label" bind-source="clock_service" bind-property="current-time" bind-flags="sync-create" />
                </object>
                </child>

                <child>
                <object class="GtkToggleButton" id="pause_button">
                    <property name="label">Pause</property>
                    <property name="active">true</property>
                    <binding name="label">
                        <closure type="gchararray" function="get_pause_label_closure">
                            <lookup name="running">clock_service</lookup>
                        </closure>
                    </binding>
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
    @Property.Object(ClockService.$gtype)
    declare clock_service: ClockService;

    constructor(application: Adw.Application) {
        super({ application });
        Styling.apply(this.get_display(), TestWindow);
    }

    protected get_pause_label_closure(_sender: typeof this, running: boolean): string {
        return running ? 'Pause' : 'Resume';
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
    application_id: 'object-ts.example.Tick.Custom-GObject-Declarative'
})).run(null);
