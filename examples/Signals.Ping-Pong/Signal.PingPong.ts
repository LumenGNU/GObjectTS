#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m
// Инженерная карма: если где-то слишком хорошо, всегда найдётся кто-то, кто портирует туда GTK! 
/** @file: src/Ljs/GObjectTS/examples/Signals.Ping-Pong/Signal.PingPong.ts */
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
import {
    ConnectMethod,
    EmitMethod,
    Signals
} from '../../GObjectTS/Signals.js';
import GObject from 'gi://GObject?version=2.0';
import { StylePriority, Styling } from '../../GObjectTS/Styling.js';

// поскольку пользуем сигналы -- буду писать в императивном стиле
// хотя все знают - сигналы в ui уже прошлый век. Все используют декларативный стиль.
// НЕ пишите так! пожалуйста!
@Widget('PingPong')
class PingPong extends Gtk.Box {

    private place_range = [0, 100] as const;
    // players
    private ping_button: Gtk.Button;
    private pong_button: Gtk.Button;
    private scale: Gtk.Scale;

    private adjustment = Gtk.Adjustment.new(0, ...this.place_range, 1, 1, 1);

    public auto_kick: boolean | undefined;

    private animation: Adw.SpringAnimation;

    @Signals({
        'ball-kick': {
            param_types: [Gtk.Button.$gtype]
        },
        'ball-in-game': {},
        'ball-in-player': {
            param_types: [Gtk.Button.$gtype],
        },
        'auto-kick-request': {
            return_type: GObject.TYPE_BOOLEAN,
            accumulator: GObject.AccumulatorType.FIRST_WINS
        }
    })
    declare $signals: Gtk.Box.SignalSignatures & {
        'ball-kick': (player: Gtk.Button) => void;
        'ball-in-game': () => void;
        'ball-in-player': (player: Gtk.Button) => void;
        'auto-kick-request': () => /*auto-kick*/ boolean;
    };
    declare emit: EmitMethod<PingPong>;
    declare connect: ConnectMethod<PingPong>;
    declare connect_after: ConnectMethod<PingPong>;

    constructor() {
        // Call parent class constructor
        super({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            margin_top: 48,
            margin_bottom: 48,
            margin_start: 48,
            margin_end: 48
        });

        this.animation = Adw.SpringAnimation.new(
            this,
            0,
            0,
            Adw.SpringParams.new(0.20, 0.7, 850),
            Adw.CallbackAnimationTarget.new((v) => {
                // отскоки
                if (v < this.place_range[0]) {
                    v = Math.abs(v);
                }
                if (v > this.place_range[1]) {
                    const k = v - this.place_range[1];
                    v = this.place_range[1] - k;
                }


                this.scale.adjustment.value = v;
            })
        );

        this.append(this.ping_button ??= new Gtk.Button({ label: 'Ping', css_classes: ['player'], valign: Gtk.Align.CENTER }));
        this.append(this.scale ??= new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            hexpand: true,
            halign: Gtk.Align.FILL,
            has_origin: false,
            adjustment: this.adjustment
        }));
        this.append(this.pong_button ??= new Gtk.Button({ label: 'Pong', css_classes: ['player'], valign: Gtk.Align.CENTER }));

        // подготовка

        this.connect_after('auto-kick-request', () => {
            throw new Error('auto-kick-request никто не обработал!');
        });

        // для автоплея
        this.connect('ball-in-player', (_, player) => {
            if (this.auto_kick) {
                setTimeout(() => {
                    this.kick(player);
                }, 500);
            }
        });

        this.ping_button.connect('clicked', (sender) => {
            this.emit('ball-kick', sender);
        });

        this.pong_button.connect('clicked', (sender) => {
            this.emit('ball-kick', sender);
        });
    }

    public game() {
        // запрашиваем автокик в начале самостоятельно
        this.auto_kick = this.emit('auto-kick-request');
        // отправляем начальное событие
        this.emit('ball-in-player', this.ping_button);
    }

    public kick(player: Gtk.Button) {

        this.animation.value_from = this.adjustment.value;
        this.animation.value_to = (player.label == 'Ping') ? this.place_range[1] : this.place_range[0];

        const animation_hid = this.animation.connect('done', () => {

            this.emit('ball-in-player', (player.label == 'Ping') ? this.pong_button : this.ping_button);

            this.animation.disconnect(animation_hid);

        });

        this.animation.play();
    }
}



@Widget('TestWindow')
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<!-- Template definition for TestWindow class inheriting from AdwApplicationWindow -->
<template class="TestWindow" parent="AdwApplicationWindow">
    <!-- Main window properties -->
    <property name="title">???????</property>
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
            <property name="orientation">vertical</property>
            <property name="spacing">32</property>
            <property name="margin-bottom">32</property>

                <child>
                <object class="PingPong" id="ping_pong">
                    <property name="vexpand">true</property>
                    <property name="hexpand">true</property>
                    <property name="valign">center</property>
                    <property name="halign">fill</property>
                </object>
                </child>

                <child>
                <object class="GtkToggleButton" id="auto_kick_button">
                    <property name="label">Auto kick</property>
                    <property name="halign">center</property>
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
    [StylePriority.APPLICATION]: /*css*/`
    .player {
        min-width: 68px;
        border: 3px solid @borders;
    }

    /* большой шарик */
    slider {
    min-width: 48px;
    min-height: 48px;
    }

    trough {
    background: none;
    }

    @keyframes kick {
    1%   { border-color: @accent_bg_color; }
    49%   { border-color: transparent; }
    100% { border-color: @error_bg_color;}
    }
    .player.kicker {
    animation: kick 0.3s infinite;
    }

    .player.in-game {
    outline: 3px solid @orange_4;
    }
    ` // ---
})
class TestWindow extends Adw.ApplicationWindow {


    @Template.Child
    declare ping_pong: PingPong;

    @Template.Child
    declare auto_kick_button: Gtk.ToggleButton;

    @Template.Child
    declare status_label: Gtk.Label;


    // Constructor accepts Adw.Application to bind window with application
    constructor(application: Adw.Application) {
        // Call parent class constructor with application passed
        super({ application });

        Styling.apply(this.get_display(), TestWindow);

        this.ping_pong.connect('auto-kick-request', () => {
            return this.auto_kick_button.get_active();
        });

        this.ping_pong.connect('ball-kick', (_, player) => {
            // установить на полсекунды визул "кикер"
            player.add_css_class('kicker');
            setTimeout(() => {
                player.remove_css_class('kicker');
            }, 500);
            // пнуть мяч
            this.ping_pong.kick(player);
        });

        this.ping_pong.connect('ball-in-player', (_, player) => {
            // установить на полсекунды визул "in-game"
            player.add_css_class('in-game');
            setTimeout(() => {
                player.remove_css_class('in-game');
            }, 500);
        });

        this.auto_kick_button.connect('toggled', () => {
            this.ping_pong.auto_kick = this.auto_kick_button.get_active();
        });

        this.status_label.set_label(`Gtk version: ${Gtk.MAJOR_VERSION}.${Gtk.MINOR_VERSION}.${Gtk.MICRO_VERSION};\tAdw version: ${Adw.VERSION_S};`);

        this.ping_pong.game();
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

(new HelloWorldApplication({ application_id: 'object-ts.example.hello-world' }))
    .run(null);
