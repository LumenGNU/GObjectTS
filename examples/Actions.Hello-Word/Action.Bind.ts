#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

import Adw from 'gi://Adw?version=1';
import GLib from 'gi://GLib?version=2.0';

import {
    Widget,
} from '../../GObjectTS/Widget.js';
import {
    Action
} from '../../GObjectTS/Action.js';
import {
    Property
} from '../../GObjectTS/Property.js';
import {
    Class
} from '../../GObjectTS/Class.js';

@Widget('NumericActionTestWindow')
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<template class="NumericActionTestWindow" parent="AdwApplicationWindow">
    <property name="title">Numeric Action Bind Test</property>
    <property name="default-width">800</property>
    <property name="default-height">600</property>

    <!-- Bind own properties -->
    <property name="int-value" bind-source="int_spin_adjustment" bind-property="value" bind-flags="sync-create"/>

    <property name="content">
        <object class="AdwToolbarView">
            <child type="top">
                <object class="AdwHeaderBar">
                    <property name="title-widget">
                        <object class="AdwWindowTitle">
                            <property name="title">Numeric Action Bind Test</property>
                        </object>
                    </property>
                </object>
            </child>

            <property name="content">
                <object class="GtkScrolledWindow">
                    <property name="child">
                        <object class="GtkBox">
                            <property name="orientation">vertical</property>
                            <property name="spacing">12</property>
                            <property name="margin-start">24</property>
                            <property name="margin-end">24</property>
                            <property name="margin-top">24</property>
                            <property name="margin-bottom">24</property>

                            <!-- Integer Tests -->
                            <child>
                                <object class="AdwPreferencesGroup">
                                    <property name="title">Integer Types (32-bit)</property>
                                    <property name="description">Testing int and uint with SpinButtons and Scale widgets</property>

                                    <child>
                                        <object class="AdwActionRow">
                                            <property name="title">UInt32 Value</property>
                                            <binding name="subtitle">
                                                <closure type="gchararray" function="format_uint32_closure">
                                                    <lookup name="uint-value">NumericActionTestWindow</lookup>
                                                </closure>
                                            </binding>
                                            <child type="suffix">
                                                <object class="GtkSpinButton">
                                                    <property name="adjustment">
                                                        <object class="GtkAdjustment" id="uint_spin_adjustment">
                                                            <property name="value" bind-source="NumericActionTestWindow" bind-property="uint-value" bind-flags="bidirectional|sync-create"/>
                                                            <property name="lower">0</property>
                                                            <property name="upper">${GLib.MAXUINT32}</property> <!-- UINT32_MAX -->
                                                            <property name="step-increment">1</property>
                                                            <property name="page-increment">100</property>
                                                        </object>
                                                    </property>
                                                </object>
                                            </child>
                                        </object>
                                    </child>

                                    <child>
                                        <object class="AdwActionRow">
                                            <property name="title">Int32 Value</property>
                                            <property name="subtitle">Inverted uint32 value</property>
                                            <child type="suffix">
                                                <object class="GtkSpinButton">
                                                    <property name="sensitive">false</property>
                                                    <property name="adjustment">
                                                        <object class="GtkAdjustment" id="int_spin_adjustment">

                                                            <binding name="value">
                                                                <closure type="gint" function="invert_int_closure">
                                                                    <lookup name="value">uint_spin_adjustment</lookup>
                                                                </closure>
                                                            </binding>

                                                            <property name="lower">${GLib.MININT32}</property> <!-- INT32_MIN -->
                                                            <property name="upper">${GLib.MAXINT32}</property>  <!-- INT32_MAX -->
                                                            <property name="step-increment">1</property>
                                                            <property name="page-increment">10</property>
                                                        </object>
                                                    </property>
                                                </object>
                                            </child>
                                        </object>
                                    </child>

                                </object>
                            </child>

                            <!-- Double Tests -->
                            <child>
                                <object class="AdwPreferencesGroup">
                                    <property name="title">Floating Point Type</property>
                                    <property name="description">Testing double with Scale widgets</property>

                                    <child>
                                        <object class="AdwActionRow">
                                            <property name="title">Double Value</property>

                                            <binding name="subtitle">
                                                <closure type="gchararray" function="format_double_closure">
                                                    <lookup name="double-value">NumericActionTestWindow</lookup>
                                                </closure>
                                            </binding>

                                            <child type="suffix">
                                                <object class="GtkScale">
                                                    <property name="orientation">horizontal</property>
                                                    <property name="draw-value">true</property>
                                                    <property name="digits">6</property>
                                                    <property name="width-request">200</property>
                                                    <property name="adjustment">
                                                        <object class="GtkAdjustment">
                                                            <property name="value" bind-source="NumericActionTestWindow" bind-property="double-value" bind-flags="bidirectional|sync-create"/>
                                                            <property name="lower">-100000.0</property>
                                                            <property name="upper">100000.0</property>
                                                            <property name="step-increment">0.000001</property>
                                                            <property name="page-increment">1.0</property>
                                                        </object>
                                                    </property>
                                                </object>
                                            </child>
                                        </object>
                                    </child>

                                    <child>
                                    <object class="GtkBox">
                                        <property name="orientation">horizontal</property>

                                        <child>
                                        <object class="GtkButton">
                                            <property name="hexpand">true</property>
                                            <property name="label">Set double to π</property>
                                            <property name="action-name">app.double-value</property>
                                            <property name="action-target">3.14159</property>
                                        </object>
                                        </child>

                                        <child>
                                        <object class="GtkButton">
                                            <property name="hexpand">true</property>
                                            <property name="label">Set double to e</property>
                                            <property name="action-name">app.double-value</property>
                                            <property name="action-target">2.71828</property>
                                        </object>
                                        </child>

                                        <child>
                                        <object class="GtkButton">
                                            <property name="hexpand">true</property>
                                            <property name="label">Set double to Φ</property>
                                            <property name="action-name">app.double-value</property>
                                            <property name="action-target">1.61803</property>
                                        </object>
                                        </child>

                                        <child>
                                        <object class="GtkButton">
                                            <property name="hexpand">true</property>
                                            <property name="label">Reset double to 0.0</property>
                                            <property name="action-name">app.double-value</property>
                                            <property name="action-target">0.0</property>
                                        </object>
                                        </child>

                                    </object>
                                    </child>
                                </object>
                            </child>

                            <!-- Status Display -->
                            <child>
                                <object class="GtkLabel">
                                    <property name="use-markup">true</property>
                                    <property name="xalign">0.0</property>
                                    <property name="wrap">true</property>
                                    <style>
                                        <class name="dim-label"/>
                                        <class name="numeric" />
                                    </style>

                                    <binding name="label">
                                    <closure type="gchararray" function="update_status_closure">
                                        <lookup name="uint-value">NumericActionTestWindow</lookup>
                                        <lookup name="int-value">NumericActionTestWindow</lookup>
                                        <lookup name="double-value">NumericActionTestWindow</lookup>
                                    </closure>
                                    </binding>
                                </object>
                            </child>

                        </object>
                    </property>
                </object>
            </property>
        </object>
    </property>
</template>
</interface>`)
class NumericActionTestWindow extends Adw.ApplicationWindow {

    // 32-bit integers
    @Action.Bind('app.int-value')
    @Property.Int(0) // INT32_MIN to INT32_MAX
    declare int_value: number;

    @Action.Bind('app.uint-value')
    @Property.UInt(100) // 0 to UINT32_MAX
    declare uint_value: number;

    @Action.Bind('app.double-value')
    @Property.Double(2.718281828459045, -100000.0, 100000.0) // 64-bit double
    declare double_value: number;

    constructor(application: Adw.Application) {
        super({ application });
    }

    protected update_status_closure(_: this, uint_value: number, int_value: number, double_value: number): string {
        return [
            '<b>Current Action Values:</b>',
            `UInt32: ${uint_value} => 0x${uint_value.toString(16).toUpperCase()}`,
            `Int32: ${int_value} => 0x${int_value.toString(16).toUpperCase()}`,
            `Double: ${double_value.toFixed(4)} => 0x${double_value.toString(16).toUpperCase()}`,
        ].join('\n');

    }

    // Closure functions for XML bindings
    protected format_uint32_closure(_: this, value: number): string {
        return `Value: ${value} (0x${value.toString(2).toUpperCase()})`;
    }

    protected format_double_closure(_: this, value: number): string {
        return `Value: ${value.toFixed(4)}`;
    }

    protected invert_int_closure(_: this, value: number): number {
        return -value;
    }
}

@Class('NumericActionTestApplication')
class NumericActionTestApplication extends Adw.Application {
    constructor(constructor_props?: Partial<Adw.Application.ConstructorProps>) {
        super(constructor_props);
    }

    on_activate(): void {
        (new NumericActionTestWindow(this)).present();
    }
}

// Run the test application
(new NumericActionTestApplication({
    application_id: 'object-ts.example.numeric-action-test'
})).run(null);