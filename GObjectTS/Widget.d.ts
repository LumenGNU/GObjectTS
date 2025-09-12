import GObject from 'gi://GObject?version=2.0';
import { ClassConfig, ClassDecorator } from './_Private.js';
import Gtk from 'gi://Gtk?version=4.0';
/** Интерфейс для работы с GTK виджетами.
 *
 * Предоставляет специализированные декораторы для регистрации и настройки
 * GTK виджетов, включая шаблоны и стилизацию.
 *
 * @affects Расширяет базовую регистрацию GObject для виджетов.
 * @affects Интегрируется с системой шаблонов и стилей GTK.
 *
 * Регистрирует класс в системе типов GObject, и выполняет дополнительные
 * настройки для GTK виджетов.
 *
 * Автоматически настраивает дополнительные возможности виджетов.
 *
 * @affects Регистрирует класс через {@link GObject.registerClass}.
 * @affects Выполняет дополнительную работу.
 *
 * @returns RegistrationDecorator ограниченный типом Gtk.WidgetClass.
 */
declare function Widget(config?: ClassConfig): ClassDecorator<Gtk.WidgetClass>;
declare namespace Widget {
    var Template: (XML: string) => (target: Gtk.WidgetClass & GObject.ObjectConstructor) => void;
}
export { Widget };
/** Пространство имён для декораторов связывающих свойства класса с
 * элементами из XML/Blueprint шаблона виджета.
 *
 * Предоставляет декораторы для связывания свойств класса с элементами
 * из XML/Blueprint шаблона виджета (смотри {@link Gtk.Widget.set_template}).
 *
 * @affects Декораторы связывают свойства класса с объектами из шаблона.
 * @affects Создаёт автоматическую инициализацию при создании виджета. */
declare const Template: {
    /** Связывает свойство класса с дочерним элементом из шаблона.
     *
     * Автоматически получает ссылку на элемент с соответствующим id
     * из XML/Blueprint шаблона при инициализации виджета.
     *
     * @affects Свойство будет автоматически инициализировано при создании
     * виджета.
     * @affects Имя свойства должно совпадать с id элемента в шаблоне.
     *
     * @param internal Если true,( // @fixme )По умолчанию false.
     *
     * @returns PropertyDecorator применимый только к Gtk.Widget.
     */
    Child: (target: Gtk.Widget, property_key: string) => void;
};
export { Template };
export { StylePriority, Styling } from './Styling.js';
