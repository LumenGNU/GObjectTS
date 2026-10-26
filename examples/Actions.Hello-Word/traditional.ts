#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m

import Adw from 'gi://Adw?version=1';
import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject?version=2.0';

Adw.init();

const CounterApp = GObject.registerClass({
    GTypeName: 'CounterApp'
}, class extends Adw.Application {
    private counter = 42;

    vfunc_activate(): void {
        const window = new Adw.ApplicationWindow({
            application: this,
            title: 'Counter Demo',
            default_width: 400,
            default_height: 300
        });

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 20,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER
        });

        // Счетчик
        const label = new Gtk.Label({ label: this.counter.toString() });
        label.add_css_class('title-1');

        // Кнопки
        const buttons = new Gtk.Box({ spacing: 10 });

        const minus = new Gtk.Button({ label: '-' });
        const plus = new Gtk.Button({ label: '+' });
        const reset = new Gtk.Button({ label: 'Reset' });
        const hello = new Gtk.Button({ label: 'Hello (F1)' });

        // Popover - просто прикрепляем к кнопке!
        const popover = new Gtk.Popover({
            child: new Gtk.Label({
                label: 'I said: "Hello!" from Popover',
                margin_top: 20,
                margin_bottom: 20,
                margin_start: 20,
                margin_end: 20
            })
        });
        popover.set_parent(hello); // Привязываем к кнопке

        buttons.append(minus);
        buttons.append(plus);
        buttons.append(reset);
        buttons.append(hello);

        box.append(label);
        box.append(buttons);
        window.set_content(box);

        // События
        minus.connect('clicked', () => {
            this.counter--;
            label.set_text(this.counter.toString());
        });

        plus.connect('clicked', () => {
            this.counter++;
            label.set_text(this.counter.toString());
        });

        reset.connect('clicked', () => {
            this.counter = 0;
            label.set_text(this.counter.toString());
        });

        hello.connect('clicked', () => popover.popup());

        // F1
        const controller = new Gtk.EventControllerKey();
        controller.connect('key-pressed', (_, key) => {
            if (key === 65470) { // F1
                popover.popup();
                return true;
            }
            return false;
        });
        window.add_controller(controller);

        window.present();
    }
});

new CounterApp().run(null);