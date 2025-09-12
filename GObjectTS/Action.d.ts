import type Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import { PropertyDecorator } from './_Private.js';
/** Базовый тип для декораторов методов.
 *
 * Позволяет описать типобезопасные декораторы для методов классов.
 *
 * @affects Декоратор этого типа не модифицирует метод (return void).
 *
 * @template Target Позволяет сузить область применения декоратора до
 *   необходимого контекста применения. Например:
 *   `MethodDecorator<Gtk.Widget, ...>` -- только внутри классов-виджетов.
 *   `MethodDecorator<Gtk.WidgetClass, ...>` -- только внутри классов-виджетов,
 *   для статических методов.
 *
 * @template Func Позволяет сузить область применения декоратора до
 *   необходимого контекста применения - сигнатуры метода. Например:
 *   `MethodDecorator<Gtk.Widget, () => number>` -- только внутри классов-виджетов,
 *   для методов возвращающих `number`.
 *   Обязательно должен быть указан. Смотри {@link Action.InstallAction} для примера.
 *
 * @template Property Позволяет сузить область применения декоратора до
 *   необходимого контекста применения - имени метода. Например:
 *   `MethodDecorator<Gtk.Widget, ..., 'Method'>` -- только внутри классов-виджетов,
 *   для методов с именем `Method`.
 *   По-умолчанию - любой метод.
 */
type MethodDecorator<Target = never, Func extends Function = never, Property extends string = string> = (target: Target, property: Property, descriptor: TypedPropertyDescriptor<Func>) => void;
declare const Action: {
    /** Устанавливает и связывает свойство с GTK действием.
     *
     * Устанавливает действие с именем action_name на декорированный класс-виджет,
     * и связывает его состояние со значением свойства, к которому применяется
     * декоратор.
     *
     * @see
     * - {@link https://docs.gtk.org/gtk4/class_method.Widget.install_property_action.html}
     *
     * @affects Изменение свойства будет активировать действие.
     * @affects Действие будет изменять свойство.
     * @affects Свойство должно иметь совместимый тип с действием.
     *
     * @param action_name Полное имя действия (например, 'app.quit').
     *
     * ~~~typescript
     * class MyWindow extends Adw.ApplicationWindow {
     *     \@Action.Bind('app.counter')
     *     \@Property.Int(0)
     *     declare counter: number;
     *
     *     \@Action.Bind('app.precision-value')
     *     \@Property.Double(3.14159)
     *     declare precision_value: number;
     * }
     * ~~~
     *
     * Limitations
     *
     * Type Support: Currently only string, boolean, int and double types are fully supported
     * Action Scope:
     * Property Requirements: Properties must be declared with @Property decorator
     * GObject Constraints: Follows GObject property naming conventions
     *
     * @returns PropertyDecorator применимый только к Gtk.Widget. */
    Bind: (action_name: string) => PropertyDecorator<Gtk.Widget>;
    /** Регистрирует метод как обработчик GTK действия.
     *
     * Метод будет вызываться при активации указанного действия.
     * Должен быть статическим методом с сигнатурой {@link Gtk.WidgetActionActivateFunc}.
     *
     * @affects Регистрирует действие на уровне класса виджета.
     * @affects Метод должен быть статическим.
     *
     * @param action_name Имя действия (без префикса группы).
     * @param parameter_type Тип параметра GVariant для действия или null.
     *
     * @returns MethodDecorator с проверкой сигнатуры функции.
     */
    InstallAction: <S = unknown>(action_name: string, parameter_type?: (S extends string ? S : never) | null) => MethodDecorator<Gtk.Widget, (parameter?: GLib.Variant<(S extends string ? S : never)> | null) => void>;
};
export { Action };
