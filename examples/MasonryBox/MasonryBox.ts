#!/usr/bin/env -S GTK_DEBUG=interactive gjs -m


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
import Gio from 'gi://Gio?version=2.0';
import { Styling, StylePriority } from '../../GObjectTS/Styling.js';

// let n = 0;

class SimpleImageLoader {

    static loadRandomImage() {
        const width = Math.floor(Math.random() * 115) + 100;
        const height = Math.floor(Math.random() * 115) + 100;

        const url = `https://picsum.photos/${width}/${height}`;
        // const url = `https://placehold.co/${width}x${height}?text=${++n}`;

        //console.log('Loading image:', url);

        const picture = new Gtk.Picture({
            //width_request: width,
            //height_request: height,
            content_fit: Gtk.ContentFit.CONTAIN,
            //  hexpand: true,
            css_classes: ['card']
        });

        try {
            const file = Gio.File.new_for_uri(url);
            picture.set_file(file);
        } catch (error) {
            console.error('Error setting image:', error);
            // Возвращаем пустую картинку
        }
        return picture;
    }
}


@Widget('MasonryBox')
@Widget.Template(/*xml*/`
<interface>
  <template class="MasonryBox" parent="AdwBin">

        <property name="child">
        <object class="GtkBox" id="main_box">
        <property name="homogeneous">true</property>

            <child>
            <object class="GtkBox" id="column_1">
                <property name="orientation">vertical</property>
                <property name="valign">start</property>
            </object>
            </child>

            <child>
            <object class="GtkBox" id="column_2">
                <property name="orientation">vertical</property>
                <property name="valign">start</property>
            </object>
            </child>

            <child>
            <object class="GtkBox" id="column_3">
                <property name="orientation">vertical</property>
                <property name="valign">start</property>
            </object>
            </child>


    </object>
    </property>

  </template>
</interface>
`)
class MasonryBox extends Adw.Bin {

    @Template.Child
    declare main_box: Gtk.Box;

    @Template.Child
    declare column_1: Gtk.Box;

    @Template.Child
    declare column_2: Gtk.Box;

    @Template.Child
    declare column_3: Gtk.Box;

    public append_image(image: Gtk.Widget) {


        const columns = [this.column_1, this.column_2, this.column_3];
        const heights = columns.map(col => col.measure(Gtk.Orientation.VERTICAL, 300)[1]);

        const min_height = Math.min(...heights);
        console.log('heights:', ...heights, '=>', heights.indexOf(min_height));
        const min_column = columns[heights.indexOf(min_height)];

        min_column.append(image);
        // this.main_box.queue_resize();
        // this.main_box.queue_allocate();
        // this.main_box.queue_draw();


    }

}


@Widget('TestWindow')
@Widget.Template(
/* xml */ `<?xml version='1.0' encoding='UTF-8'?>
<interface>
<!-- Template definition for TestWindow class inheriting from AdwApplicationWindow -->
<template class="TestWindow" parent="AdwApplicationWindow">
    <!-- Main window properties -->
    <property name="title">Hello World</property>
    <property name="default-width">480</property>
    <property name="default-height">720</property>
    <property name="resizable">true</property>

    <!-- Window content - using AdwToolbarView for modern layout -->
    <property name="content">
        <object class="AdwToolbarView" id="toolbar_view">

        <!-- Top panel with header bar (empty) -->
        <child type="top">
        <object class="AdwHeaderBar" />
        </child>

        <!-- Main window content area -->
        <property name="content">
  <object class="GtkScrolledWindow">
    <property name="child">
      <object class="GtkViewport">
            <property name="child">
            <object class="GtkBox">
                <property name="orientation">vertical</property>

                <child>
                <object class="MasonryBox" id="masonry_box"/>
                </child>

                <child>
                <object class="GtkButton">
                    <property name="label">Load +12 images</property>
                    <signal name="clicked" handler="load_images_handler" />
                </object>
                </child>

            </object>
            </property>
        <property name="vscroll-policy">natural</property>
      </object>
    </property>
    <property name="propagate-natural-height">True</property>
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
</template>
</interface>`)
@Styling({
    [StylePriority.APPLICATION]: /*css*/`
    .card {
        margin: 3px;
    }
    `
})
class TestWindow extends Adw.ApplicationWindow {

    @Template.Child
    declare status_label: Gtk.Label;

    @Template.Child
    declare masonry_box: MasonryBox;

    constructor(application: Adw.Application) {
        super({ application });

        Styling.apply(this.get_display(), TestWindow);

        this.status_label.set_label(`Gtk version: ${Gtk.MAJOR_VERSION}.${Gtk.MINOR_VERSION}.${Gtk.MICRO_VERSION};\tAdw version: ${Adw.VERSION_S};`);
    }

    protected load_images_handler() {
        for (let i = 0; i < 12; i++) {
            const image = SimpleImageLoader.loadRandomImage();
            this.masonry_box.append_image(image);
        }
    }

    on_close_request() {
        console.log('Window closed. Goodbye!');
        return false; // allow window to close
    }

}

@Class('HelloWorldApplication')
class HelloWorldApplication extends Adw.Application {

    constructor(constructor_props?: Partial<Adw.Application.ConstructorProps>) {
        super(constructor_props);
    }

    on_activate(): void {
        (new TestWindow(this)).present();
    }
}

(new HelloWorldApplication({ application_id: 'object-ts.example.hello-world' }))
    .run(null);
