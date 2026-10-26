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



// /** Базовый тип для декораторов регистрирующих GObject класс.
//  *
//  * Обеспечивает единообразный интерфейс для декораторов, которые регистрируют
//  * классы в системе типов GObject (смотри {@link GObject.registerClass}).
//  *
//  * Принимает конфигурационный объект с параметрами регистрации и возвращает
//  * декоратор класса, применимый к указанному типу.
//  *
//  * @affects Декоратор регистрирует класс в системе типов GObject.
//  * @affects Декоратор может добавлять метаданные в прототип класса.
//  *
//  * @template T Позволяет ограничить применение декоратора конкретным типом класса.
//  * Например:
//  * `RegistrationDecorator<GObject.ObjectClass>` -- для базовых GObject классов.
//  * `RegistrationDecorator<Gtk.WidgetClass>` -- только для GTK виджетов.
//  *
//  * @param Config Параметры регистрации класса:
//  * @param Config.GTypeName Уникальное имя типа в системе GObject.
//  * @param Config.GTypeFlags Флаги типа (смотри {@link GObject.TypeFlags}).
//  * @param Config.Requires Массив зависимых типов, которые должны быть загружены.
//  * @param Config.Implements Интерфейсы GObject, которые реализует класс.
//  *
//  * @returns ClassDecorator с ограничением на тип T.
//  * */
// export interface RegistrationDecorator<T = never> {
//     (config: ClassConfig): ClassDecorator<T>;
// }

export type WidgetClassDecorator = (target: Gtk.WidgetClass & WidgetConstructor) => void;


export type ClassConfig = {
    GTypeName?: string;
    GTypeFlags?: GObject.TypeFlags;
    Requires?: { $gtype: GObject.GType; }[];
    Implements?: { $gtype: GObject.GType; }[];
};


// Signals

declare const __SignalKey: unique symbol;
type SignalKey = string & { readonly [__SignalKey]: never; };

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

const SIGNALS_COLLECTOR_KEY = Symbol('gobject:collector:signals');

function delete_signals_collector(target: Function): void {
    if (!(SIGNALS_COLLECTOR_KEY in target)) {
        return;
    }
    delete target[SIGNALS_COLLECTOR_KEY];
}

function get_signals_collector(target: Function): Map<SignalKey, SignalDefinition> | undefined {
    if ((SIGNALS_COLLECTOR_KEY in target)) {
        return (target as any)[SIGNALS_COLLECTOR_KEY];
    }
    return undefined;
}

export {
    get_signals_collector,
    delete_signals_collector,
    SIGNALS_COLLECTOR_KEY,
    SignalDefinition,
    SignalKey
};

// Properties

declare const __PropertyKey: unique symbol;
type PropertyKey = string & { readonly [__PropertyKey]: never; };

const property_collector = Symbol('gobject:collector:property-specs');

function delete_property_collector(target: Function): void {
    if (!(property_collector in target)) {
        return;
    }
    delete target[property_collector];
}

function get_property_collector(target: Function): Map<PropertyKey, GObject.ParamSpec> | undefined {
    if ((property_collector in target)) {
        return (target as any)[property_collector].property_specs_map;
    }
    return undefined;
}

export {
    get_property_collector,
    delete_property_collector,
    property_collector,
    PropertyKey
};

// template

const template_collector = Symbol('widget:collector:template');

function delete_template_collector(target: Function): void {
    if (!(template_collector in target)) {
        return;
    }
    delete target[template_collector];
}

function check_template_collector(target: Function): boolean {
    if ((template_collector in target)) {
        return true;
    }
    return false;
}


export {
    check_template_collector,
    delete_template_collector,
    template_collector,
};

type NonCallable<T = any> = T extends (...args: any[]) => any ? never : T;

// запрещает применять декоратор к методам
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
type PropertyDecorator<
    Target = never,
    Property extends string = string> = <T>(target: Target, property: Property, descriptor?: PropertyDescriptor<T>) => void;

export {
    PropertyDecorator,
};

// template

const child_collector = Symbol('widget:collector:child');

function delete_child_collector(target: Function): void {
    if (!(child_collector in target)) {
        return;
    }
    delete target[child_collector];
}

function check_child_collector(target: Function): boolean {
    if ((child_collector in target)) {
        return true;
    }
    return false;
}

// const internal_child_collector = Symbol('widget:collector:internal-child');

// function delete_internal_child_collector(target: Function): void {
//     if (!(internal_child_collector in target)) {
//         return;
//     }
//     delete target[internal_child_collector];
// }

// function check_internal_child_collector(target: Function): boolean {
//     if ((internal_child_collector in target)) {
//         return true;
//     }
//     return false;
// }

export {
    check_child_collector,
    delete_child_collector,
    child_collector,
    // check_internal_child_collector,
    // delete_internal_child_collector,
    // internal_child_collector,
};


// actions

const bind_actions_collector = Symbol('widget:collector:bind-actions');

function delete_bind_actions_collector(target: Function): void {
    if (!(bind_actions_collector in target)) {
        return;
    }
    delete target[bind_actions_collector];
}

function check_actions_collector(target: Function): boolean {
    return (bind_actions_collector in target) ? true : false;
}

const handler_actions_collector = Symbol('widget:collector:handler-actions');

function delete_handler_actions_collector(target: Function): void {
    if (!(handler_actions_collector in target)) {
        return;
    }
    delete target[handler_actions_collector];
}

function check_handler_actions_collector(target: Function): boolean {
    return (handler_actions_collector in target) ? true : false;
}

export {
    check_actions_collector,
    delete_bind_actions_collector,
    bind_actions_collector,
    delete_handler_actions_collector,
    check_handler_actions_collector,
    handler_actions_collector
};



// Decorator.Styling

const CSS_NAME_COLLECTOR_KEY = Symbol('widget:collector:css-name');

interface CssNameCarrier {
    [CSS_NAME_COLLECTOR_KEY]?: string;
}

const STYLING_REGISTRY_COLLECTOR_KEY = Symbol('widget:collector:styling-registry');

interface StylingRegistryCarrier {
    [STYLING_REGISTRY_COLLECTOR_KEY]?: Map<number, string>;
}

const CSS_DEPENDENCIES_COLLECTOR_KEY = Symbol('widget:collector:css-dependencies');

interface StylingDependenciesCarrier {
    [CSS_DEPENDENCIES_COLLECTOR_KEY]?: WidgetConstructor[];
}

type WidgetConstructor = new (...args: any[]) => Gtk.Widget;
type ObjectConstructor = new (...args: any[]) => GObject.Object;

export {
    CSS_NAME_COLLECTOR_KEY,
    STYLING_REGISTRY_COLLECTOR_KEY,
    CSS_DEPENDENCIES_COLLECTOR_KEY
};

export type {
    CssNameCarrier,
    StylingRegistryCarrier,
    WidgetConstructor,
    StylingDependenciesCarrier,
    ObjectConstructor
};