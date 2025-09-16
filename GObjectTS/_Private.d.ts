import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
/** Базовый тип для декораторов классов.
 *
 * Обеспечивает типобезопасность при описании декораторов классов, гарантируя
 * что декоратор применяется только к классам порождающим `GObject.Object` (
 * смотри {@link GObject.ObjectConstructor}).
 *
 * Позволяет TypeScript проверять совместимость на этапе компиляции.
 *
 * @affects Декоратор этого типа не модифицирует конструктор.
 * @affects Декоратор этого типа может иметь эффект на прототип (смотри
 * {@link GObject.registerClass}).
 *
 * @template Target Позволяет сузить область применения декоратора до
 *   необходимого класса. Например:
 *   `ClassDecorator<Gtk.WidgetClass>` -- только для Gtk классов-виджетов. */
export type ClassDecorator<Target = never> = (target: Target & GObject.ObjectConstructor) => void;
export type WidgetClassDecorator = (target: Gtk.WidgetClass & WidgetConstructor) => void;
export type ClassConfig = {
    GTypeName?: string;
    GTypeFlags?: GObject.TypeFlags;
    Requires?: {
        $gtype: GObject.GType;
    }[];
    Implements?: {
        $gtype: GObject.GType;
    }[];
};
declare const __SignalKey: unique symbol;
type SignalKey = string & {
    readonly [__SignalKey]: never;
};
/** Определение параметров GObject сигнала.
 *
 * Описывает метаданные сигнала для регистрации в системе типов GObject.
 * Используется декоратором {@link Signals} для передачи параметров в
 * {@link GObject.signal_new}.
 *
 * @affects Определяет поведение сигнала при эмиссии и подключении.
 */
interface SignalDefinition {
    /** Флаги поведения сигнала.
     *
     * Управляют порядком вызова обработчиков, возможностью эмиссии из кода,
     * и другими аспектами поведения.
     * Смотри {@link GObject.SignalFlags}.
     */
    flags?: GObject.SignalFlags;
    /** Функция-аккумулятор для возвращаемых значений.
     *
     * Определяет как комбинировать результаты от множественных обработчиков.
     * Смотри {@link GObject.AccumulatorType}.
     */
    accumulator?: GObject.AccumulatorType;
    /** GType возвращаемого значения сигнала.
     *
     * `GObject.TYPE_NONE` для сигналов без возвращаемого значения (void).
     * Для других типов используйте соответствующие GObject.TYPE_*.
     */
    return_type?: GObject.GType;
    /** Массив GType для параметров сигнала.
     *
     * Определяет типы аргументов, которые будут переданы обработчикам.
     * Порядок важен - должен совпадать с TypeScript сигнатурой в `$signals`.
     */
    param_types?: GObject.GType[];
}
declare const SIGNALS_COLLECTOR_KEY: unique symbol;
declare function delete_signals_collector(target: Function): void;
declare function get_signals_collector(target: Function): Map<SignalKey, SignalDefinition> | undefined;
export { get_signals_collector, delete_signals_collector, SIGNALS_COLLECTOR_KEY, SignalDefinition, SignalKey };
declare const __PropertyKey: unique symbol;
type PropertyKey = string & {
    readonly [__PropertyKey]: never;
};
declare const property_collector: unique symbol;
declare function delete_property_collector(target: Function): void;
declare function get_property_collector(target: Function): Map<PropertyKey, GObject.ParamSpec> | undefined;
export { get_property_collector, delete_property_collector, property_collector, PropertyKey };
declare const template_collector: unique symbol;
declare function delete_template_collector(target: Function): void;
declare function check_template_collector(target: Function): boolean;
export { check_template_collector, delete_template_collector, template_collector, };
type NonCallable<T = any> = T extends (...args: any[]) => any ? never : T;
type PropertyDescriptor<T> = TypedPropertyDescriptor<NonCallable<T>>;
/** Базовый тип для декораторов свойств.
 *
 * Позволяет описать типобезопасные декораторы для свойств классов.
 *
 * @affects Декоратор этого типа не модифицирует свойство (return void).
 *
 * @template Target Позволяет сузить область применения декоратора до
 *   необходимого контекста применения. Например:
 *   `PropertyDecorator<Gtk.Widget>` -- только внутри классов-виджетов.
 *   `PropertyDecorator<Gtk.WidgetClass>` -- только внутри классов-виджетов,
 *   для статических свойств.
 *
 * @template Property Позволяет сузить область применения декоратора до
 *   необходимого контекста применения. Например:
 *   `PropertyDecorator<Gtk.Widget, 'Prop'>` -- только внутри классов-виджетов,
 *   для свойств с именем `Prop`.
 *   По-умолчанию - любое свойство.
 *  */
type PropertyDecorator<Target = never, Property extends string = string> = <T>(target: Target, property: Property, descriptor?: PropertyDescriptor<T>) => void;
export { PropertyDecorator, };
declare const child_collector: unique symbol;
declare function delete_child_collector(target: Function): void;
declare function check_child_collector(target: Function): boolean;
export { check_child_collector, delete_child_collector, child_collector, };
declare const bind_actions_collector: unique symbol;
declare function delete_bind_actions_collector(target: Function): void;
declare function check_actions_collector(target: Function): boolean;
declare const handler_actions_collector: unique symbol;
declare function delete_handler_actions_collector(target: Function): void;
declare function check_handler_actions_collector(target: Function): boolean;
export { check_actions_collector, delete_bind_actions_collector, bind_actions_collector, delete_handler_actions_collector, check_handler_actions_collector, handler_actions_collector };
declare const CSS_NAME_COLLECTOR_KEY: unique symbol;
interface CssNameCarrier {
    [CSS_NAME_COLLECTOR_KEY]?: string;
}
declare const STYLING_REGISTRY_COLLECTOR_KEY: unique symbol;
interface StylingRegistryCarrier {
    [STYLING_REGISTRY_COLLECTOR_KEY]?: Map<number, string>;
}
declare const CSS_DEPENDENCIES_COLLECTOR_KEY: unique symbol;
interface StylingDependenciesCarrier {
    [CSS_DEPENDENCIES_COLLECTOR_KEY]?: WidgetConstructor[];
}
type WidgetConstructor = new (...args: any[]) => Gtk.Widget;
type ObjectConstructor = new (...args: any[]) => GObject.Object;
export { CSS_NAME_COLLECTOR_KEY, STYLING_REGISTRY_COLLECTOR_KEY, CSS_DEPENDENCIES_COLLECTOR_KEY };
export type { CssNameCarrier, StylingRegistryCarrier, WidgetConstructor, StylingDependenciesCarrier, ObjectConstructor };
