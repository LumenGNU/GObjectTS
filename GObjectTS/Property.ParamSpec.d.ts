/** @file: src/Ljs/GObjectTS/Decorator.Property.ParamSpec.ts */
/** @fileoverview: Типизированная обёртка для создания GObject.ParamSpec всех поддерживаемых типов. */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 3.0.1 */
/**
 * @changelog
 *
 * # 3.0.1 - Рефакторинг
 *
 * # 3.0.0 - Вынес Variant в отдельный модуль
 *         - Избавился от зависимости от GLib
 *         - // @todo не избавился!
 *
 * # 2.1.0 - Переработан api передачи информации о ошибке
 *
 * # 2.0.0 - Переосмыслено и переделано
 *
 * # 1.2.1 - Рефакторинг
 *
 * # 1.2.0 - Реализованы все спеки о которых я знаю.
 *         - Добавлены проверки
 *         - Проходит начальные тесты
 *
 * # 1.1.0 - Реализация SpecType.variant, SpecType.flags и SpecType.override.
 *         - Корректировка типов.
 *
 * # 1.0.0 - Первый вариант
 */
import GObject from 'gi://GObject?version=2.0';
/** Утилиты для работы с GObject ParamSpec
 *
 * Типизированная обёртка для создания GObject.ParamSpec всех поддерживаемых
 * типов.
 * Обеспечивает автоматическую валидацию имён свойств, типизированные
 * конфигурации и защиту от проблем GJS/GLib интеграции.
 *
 * ### API
 *
 * #### Функции создания ParamSpec:
 *
 * - **Примитивные типы:**
 *   `boolean_param_spec()`,
 *   `string_param_spec()`,
 *   `unichar_param_spec()`
 *
 * - **Числовые типы:**
 *   `char_param_spec()`,
 *   `uchar_param_spec()`,
 *   `int_param_spec()`,
 *   `uint_param_spec()`,
 *   `long_param_spec()`,
 *   `ulong_param_spec()`,
 *   `int64_param_spec()`,
 *   `uint64_param_spec()`,
 *   `float_param_spec()`,
 *   `double_param_spec()`
 *
 * - **Типизированные:**
 *   `boxed_param_spec()`,
 *   `gtype_param_spec()`,
 *   `object_param_spec()`,
 *   `param_param_spec()`,
 *   `enum_param_spec()`,
 *   `flags_param_spec()`
 *
 * - **Специальные:**
 *   `variant_param_spec()`,
 *   `override_param_spec()`,
 *   `pointer_param_spec()`,
 *   `jsobject_param_spec()`
 *
 * #### Утилиты:
 * - `to_name()` — преобразование имён в kebab-case
 *
 * #### Ошибки:
 * - `ParamSpecErrorInfo` — объект-ошибка создания ParamSpec
 *
 * ### Особенности использования
 *
 * Каждый тип поддерживает две формы параметров: именованную конфигурацию
 * (Config) и позиционные параметры (Params).
 *
 * Смотри типы:
 * - `*Config` - описание доступной конфигурации для каждого типа.
 * - `*Param` - описание доступных параметров для каждого типа.
 *
 * ~~~
 * boolean_param_spec('my-prop', [true])
 * int_param_spec('count', [0, -100, 100])
 * object_param_spec('widget', [Gtk.Widget])
 * ~~~
 *
 * эквивалентно:
 *
 * ~~~
 * boolean_param_spec('my-prop', [{default_value: true}])
 * int_param_spec('count', [{default_value: 0, minimum: -100, maximum: 100}])
 * object_param_spec('widget', [{g_type: Gtk.Widget}])
 * ~~~
 *
 * #### Числовые типы
 *
 * Числовые ParamSpec поддерживают гибкую конфигурацию границ и значений:
 *
 * ~~~
 * int_param_spec('value', [])              // все по умолчанию
 * int_param_spec('value', [42])            // только default_value
 * int_param_spec('value', [42, 0, 100])    // полная конфигурация
 * ~~~
 *
 * эквивалентно:
 *
 * ~~~
 * int_param_spec('value', [{}])                                    // все по умолчанию
 * int_param_spec('value', [{default_value: 42}])                   // только default_value
 * int_param_spec('value', [{default_value: 42, minimum: 0, maximum: 100}])  // полная конфигурация
 * ~~~
 *
 * При использовании только `default_value` границы устанавливаются максимально
 * широкими для данного типа. Частичное указание границ не поддерживается -
 * если указана одна из границ, требуется и противоположная.
 *
 * `default_value` по умолчанию для числовых ParamSpec -- `0`.
 *
 * #### Флаги ParamSpec
 *
 * По умолчанию для всех свойств устанавливаются флаги READABLE | WRITABLE.
 * При указании любых пользовательских флагов значение по умолчанию
 * сбрасывается - необходимо явно указать флаги доступа:
 *
 * ~~~
 * // По умолчанию: READABLE | WRITABLE
 * int_param_spec('count', [42])
 *
 * // Нужно явно указать доступ при добавлении флагов
 * int_param_spec('count', [{
 *     default_value: 42,
 *     flags: GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE | GObject.ParamFlags.CONSTRUCT
 * }])
 * ~~~
 *
 * Дополнительно:
 * @see https://gjs.guide/guides/gobject/gtype.html
 * @see https://gjs.guide/guides/gobject/gvalue.html
 */
/** Базовая конфигурация для всех ParamSpec типов
 *
 * Содержит общие поля доступные для любого ParamSpec:
 * - nick: краткое описание (может отображаться в UI)
 * - blurb: подробное описание (для tooltip'ов и документации)
 * - flags: флаги поведения (readable/writable/construct и т.д.) */
interface BaseConfig {
    nick?: string | null;
    blurb?: string | null;
    flags?: GObject.ParamFlags;
}
/** Конфигурация для boolean ParamSpec */
interface BooleanConfig extends BaseConfig {
    default_value?: boolean;
}
/** Позиционные параметры для boolean ParamSpec */
type BooleanParams = [default_value?: boolean];
/** Конфигурация для enum/flags ParamSpec типов */
interface TypedNumericConfig<T extends GObject.Object = any> extends BaseConfig {
    /** GType enum'а или flags. Должен быть зарегистрированным enum/flags типом */
    g_type: GObject.GType<T>;
    default_value?: number;
}
/** Позиционные параметры для enum/flags ParamSpec типов */
type TypedNumericParams<T extends GObject.Object = any> = [g_type: GObject.GType<T>, default_value?: number];
/** Конфигурация для GType-based ParamSpec типов */
interface GTypeConfig extends BaseConfig {
    g_type: GObject.GType;
}
/** Позиционные параметры для GType-based ParamSpec типов */
type GTypeParams = [g_type: GObject.GType];
/** Конфигурация для override ParamSpec */
interface OverrideConfig<T extends GObject.Object = any> {
    /** GType класса/интерфейса где изначально определено свойство */
    source_type: GObject.GType<T>;
}
/** Позиционные параметры для override ParamSpec */
type OverrideParams<T extends GObject.Object = any> = [source_type: GObject.GType<T>];
/** Позиционные параметры для string ParamSpec */
interface StringConfig extends BaseConfig {
    default_value?: string | null;
}
/** Позиционные параметры для string ParamSpec */
type StringParams = [default_value?: string | null];
/** Конфигурация для числовых ParamSpec (без параметров) */
interface NumericConfigEmpty extends BaseConfig {
    default_value?: never;
    minimum?: never;
    maximum?: never;
}
/** Конфигурация для числовых ParamSpec только с default_value */
interface NumericConfigWithDefault extends BaseConfig {
    default_value: number;
    minimum?: never;
    maximum?: never;
}
/** Полная конфигурация для числовых ParamSpec */
interface NumericConfigComplete extends BaseConfig {
    minimum: number;
    maximum: number;
    default_value: number;
}
/** Конфигурация для числовых ParamSpec типов
 *
 * Поддерживает три варианта:
 * - Пустая конфигурация - все значения по умолчанию
 * - Только default_value - границы максимально широкие для типа
 * - Полная конфигурация - с границами и значением по умолчанию */
type NumericConfig = NumericConfigEmpty | NumericConfigWithDefault | NumericConfigComplete;
/** Позиционные параметры для числовых ParamSpec типов
 *
 * Поддерживает три варианта:
 * - [] - все значения по умолчанию
 * - [default_value] - только значение по умолчанию
 * - [default_value, minimum, maximum] - полная конфигурация */
type NumericParams = [] | [default_value: number] | [default_value: number, minimum: number, maximum: number];
/** Конфигурация для unichar ParamSpec */
interface UniCharConfig extends BaseConfig {
    default_value?: string;
}
/** Позиционные параметры для unichar ParamSpec */
type UniCharParams = [default_value?: string];
declare const __CanonicalName: unique symbol;
export type CanonicalName = string & {
    readonly [__CanonicalName]: never;
};
/**
 * // @todo: пример проблемы. как воспроизвести.
 * */
declare function _flags_guarder<T extends {
    params: {
        flags: GObject.ParamFlags;
    };
}>(spec_info: T): T;
declare function boolean_metadata(name: CanonicalName, params: [BooleanConfig] | BooleanParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: boolean;
    };
};
/** Создает ParamSpec для boolean свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект BooleanConfig
 * @returns GObject.ParamSpec типа 'gboolean'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_boolean.html */
declare function boolean_param_spec(name: CanonicalName, params: [BooleanConfig] | BooleanParams): GObject.ParamSpec<unknown>;
declare function string_metadata(name: CanonicalName, params: [StringConfig] | StringParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: string | null;
    };
};
/** Создает ParamSpec для string свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект StringConfig
 * @returns GObject.ParamSpec типа 'gchararray'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_string.html */
declare function string_param_spec(name: CanonicalName, params: [StringConfig] | StringParams): GObject.ParamSpec<unknown>;
declare function unichar_metadata(name: CanonicalName, params: [UniCharConfig] | UniCharParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: string;
    };
};
/** Создает ParamSpec для unichar свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект UniCharConfig
 * @returns GObject.ParamSpec типа 'guint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_unichar.html */
declare function unichar_param_spec(name: CanonicalName, params: [UniCharConfig] | UniCharParams): GObject.ParamSpec<unknown>;
declare function override_metadata(name: CanonicalName, params: [OverrideConfig] | OverrideParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        source_type: GObject.GType<any>;
    };
};
/** Создает ParamSpec для переопределения свойства из родительского класса
 *
 * Позволяет переопределить свойство из родительского класса или интерфейса.
 * Используется для реализации интерфейсов или изменения поведения наследуемых
 * свойств.
 * @param name Идентификатор свойства
 * @param params Кортеж с source_type или объект OverrideConfig
 * @returns GObject.ParamSpec наследующий тип от source_type
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или проблемах с переопределением
 * @link https://docs.gtk.org/gobject/func.param_spec_override.html
 * @link https://gjs.guide/guides/gobject/interfaces.html */
declare function override_param_spec(name: CanonicalName, params: [OverrideConfig] | OverrideParams): any;
declare function boxed_metadata(name: CanonicalName, params: [GTypeConfig] | GTypeParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        g_type: GObject.GType<unknown>;
    };
};
/** Создает ParamSpec для boxed свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec с указанным boxed типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-boxed типе
 * @link https://docs.gtk.org/gobject/func.param_spec_boxed.html */
declare function boxed_param_spec(name: CanonicalName, params: [GTypeConfig] | GTypeParams): GObject.ParamSpec<unknown>;
declare function gtype_metadata(name: CanonicalName, params: [GTypeConfig] | GTypeParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        g_type: GObject.GType<unknown>;
    };
};
/** Создает ParamSpec для gtype свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec типа 'GType'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_gtype.html */
declare function gtype_param_spec(name: CanonicalName, params: [GTypeConfig] | GTypeParams): GObject.ParamSpec<unknown>;
declare function object_metadata(name: CanonicalName, params: [GTypeConfig] | GTypeParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        g_type: GObject.GType<unknown>;
    };
};
/** Создает ParamSpec для object свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec с указанным типом объекта
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-object типе
 * @link https://docs.gtk.org/gobject/func.param_spec_object.html */
declare function object_param_spec(name: CanonicalName, params: [GTypeConfig] | GTypeParams): GObject.ParamSpec<unknown>;
declare function param_metadata(name: CanonicalName, params: [GTypeConfig] | GTypeParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        g_type: GObject.GType<unknown>;
    };
};
/** Создает ParamSpec для param свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec типа 'GParam'
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-param типе
 * @link https://docs.gtk.org/gobject/func.param_spec_param.html */
declare function param_param_spec(name: CanonicalName, params: [GTypeConfig] | GTypeParams): GObject.ParamSpec<unknown>;
declare function enum_metadata(name: CanonicalName, params: [TypedNumericConfig] | TypedNumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: number;
        g_type: GObject.GType<any>;
    };
};
/** Создает ParamSpec для enum свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [enum_type, default_value?] или объект TypedNumericConfig
 * @returns GObject.ParamSpec с указанным enum типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-enum типе
 * @link https://docs.gtk.org/gobject/func.param_spec_enum.html */
declare function enum_param_spec(name: CanonicalName, params: [TypedNumericConfig] | TypedNumericParams): GObject.ParamSpec<unknown>;
declare function flags_metadata(name: CanonicalName, params: [TypedNumericConfig] | TypedNumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: number;
        g_type: GObject.GType<any>;
    };
};
/** Создает ParamSpec для flags свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [flags_type, default_value?] или объект TypedNumericConfig
 * @returns GObject.ParamSpec с указанным flags типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-flags типе
 * @link https://docs.gtk.org/gobject/func.param_spec_flags.html */
declare function flags_param_spec(name: CanonicalName, params: [TypedNumericConfig] | TypedNumericParams): GObject.ParamSpec<unknown>;
declare function pointer_metadata(name: CanonicalName, params: [BaseConfig] | []): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
    };
};
/** Создает ParamSpec для pointer свойства
 *
 * Не рекомендуется использовать.
 * @param name Идентификатор свойства
 * @param params Пустой кортеж или объект BaseConfig
 * @returns GObject.ParamSpec типа 'gpointer'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_pointer.html */
declare function pointer_param_spec(name: CanonicalName, params: [BaseConfig] | []): GObject.ParamSpec<unknown>;
declare function jsobject_metadata(name: CanonicalName, params: [BaseConfig] | []): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
    };
};
/** Создает ParamSpec для jsobject свойства
 *
 * GObject.TYPE_JSOBJECT is a special GType in GJS, created so that
 * JavaScript types that inherit from Object can be used with the GObject
 * framework. This allows you to use them as property types and in signal
 * parameters in your GObject subclasses.
 *
 * GObject.TYPE_JSOBJECT is a boxed type, so it may not be used where a
 * GObject is expected, such as with Gio.ListModel.
 *
 * @param name Идентификатор свойства
 * @param params Пустой кортеж или объект BaseConfig
 * @returns GObject.ParamSpec типа 'JSObject'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_boxed.html
 * @link gjs_resources/libgjs.so.0.0.0/org/gnome/gjs/modules/core/overrides/GObject.js#L486 */
declare function jsobject_param_spec(name: CanonicalName, params: [BaseConfig] | []): GObject.ParamSpec<unknown>;
declare function char_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для char свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gchar'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_char.html */
declare function char_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function uchar_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для uchar свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guchar'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uchar.html */
declare function uchar_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function int_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для int свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_int.html */
declare function int_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function uint_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для uint свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uint.html */
declare function uint_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function long_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для long свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'glong'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_long.html */
declare function long_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function ulong_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для ulong свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gulong'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_ulong.html */
declare function ulong_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function int64_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для int64 свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gint64'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_int64.html */
declare function int64_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function uint64_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для uint64 свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guint64'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uint64.html */
declare function uint64_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
/** Границы подобраны для максимальной совместимости с GObject */
declare function float_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для float свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gfloat'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_float.html */
declare function float_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
declare function double_metadata(name: CanonicalName, params: [NumericConfig] | NumericParams): {
    'param-spec-type': string;
    params: {
        name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        minimum: number;
        default_value: number;
        maximum: number;
    };
};
/** Создает ParamSpec для double свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gdouble'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_double.html */
declare function double_param_spec(name: CanonicalName, params: [NumericConfig] | NumericParams): GObject.ParamSpec<unknown>;
/** Преобразует различные стили именования в kebab-case
 *
 * @param property_key Имя в любом стиле (camelCase, snake_case, PascalCase, mixed)
 * @returns Имя в kebab-case формате
 *
 * @example
 * ~~~
 * to_kebab_case('myProperty')      // → 'my-property'
 * to_kebab_case('my_property')     // → 'my-property'
 * to_kebab_case('MyPropertyName')  // → 'my-property-name'
 * to_kebab_case('my_propertyName') // → 'my-property-name'
 * to_kebab_case('XMLHttpRequest')  // → 'xml-http-request'
 * to_kebab_case('my-property')     // → 'my-property' (уже kebab)
 * ~~~
 */
declare function to_canonical_name(property_key: string): CanonicalName;
export type { BaseConfig, BooleanConfig, BooleanParams, TypedNumericConfig, TypedNumericParams, GTypeConfig, GTypeParams, OverrideConfig, OverrideParams, StringConfig, StringParams, NumericConfig, NumericParams, UniCharConfig, UniCharParams };
export { boolean_param_spec, string_param_spec, unichar_param_spec, override_param_spec, boxed_param_spec, gtype_param_spec, object_param_spec, param_param_spec, enum_param_spec, flags_param_spec, pointer_param_spec, jsobject_param_spec, char_param_spec, uchar_param_spec, int_param_spec, uint_param_spec, long_param_spec, ulong_param_spec, int64_param_spec, uint64_param_spec, float_param_spec, double_param_spec, to_canonical_name, };
export { // Для внутреннего использования
_flags_guarder, };
export { // @fixme экспортированы для тестов
boolean_metadata, string_metadata, unichar_metadata, override_metadata, boxed_metadata, gtype_metadata, object_metadata, param_metadata, enum_metadata, flags_metadata, pointer_metadata, jsobject_metadata, char_metadata, uchar_metadata, int_metadata, uint_metadata, long_metadata, ulong_metadata, int64_metadata, uint64_metadata, float_metadata, double_metadata, };
