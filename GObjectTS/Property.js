import GObject from 'gi://GObject?version=2.0';
import { boolean_param_spec, boxed_param_spec, char_param_spec, double_param_spec, enum_param_spec, flags_param_spec, float_param_spec, gtype_param_spec, int_param_spec, int64_param_spec, jsobject_param_spec, long_param_spec, object_param_spec, override_param_spec, param_param_spec, pointer_param_spec, string_param_spec, to_canonical_name, uchar_param_spec, uint_param_spec, uint64_param_spec, ulong_param_spec, unichar_param_spec, } from './Property.ParamSpec.js';
import { variant_param_spec, } from './Property.ParamSpec.GLib.js';
import { DecoratorError } from './Error.js';
import { property_collector } from './_Private.js';
function prepare_err_context(target, property_key, decorator_name, error) {
    return {
        class: target.constructor.name,
        decorator: decorator_name,
        'js-property': property_key,
        ...error,
    };
}
function ensure_property_collector(target) {
    return target[property_collector] ??= {
        property_specs_map: new Map(),
        unique_names_map: new Map(),
    };
}
//interface Property {
function collect_property_specs(target, property_key, param_spec) {
    const collector = ensure_property_collector(target.constructor);
    if (collector.property_specs_map.has(property_key)) {
        throw { message: 'Property already has a @Property decorator. Multiple @Property decorators on same property not allowed.' };
    }
    const canonical_name = param_spec.name;
    if (collector.unique_names_map.has(canonical_name)) {
        throw { message: `Property name conflict. Both '${property_key}' and '${collector.unique_names_map.get(canonical_name)}' resolve to canonical name '${canonical_name}'.` };
    }
    collector.unique_names_map.set(canonical_name, property_key);
    collector.property_specs_map.set(property_key, param_spec);
}
;
// @todo про сопоставление имен и про преобразование в каноничную форму
/** Декоратор для регистрации свойства GObject с готовым ParamSpec.
 *
 * Вспомогательный API для случаев когда нужен полный контроль над ParamSpec
 * или когда специализированные декораторы не подходят.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property(GObject.ParamSpec.int(
 *         'custom-prop', 'Custom Property', 'Custom property description',
 *         GObject.ParamFlags.READWRITE,
 *         0, 100, 50))
 *     declare custom_prop: number;
 * }
 * ~~~
 *
 * Для стандартных типов рекомендуется использовать специализированные декораторы
 * вместо создания ParamSpec вручную.
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/class.ParamSpec.html GObject.ParamSpec documentation }
 * - {@link https://docs.gtk.org/gobject/type_func.ParamSpec.internal.html GObject.ParamSpec documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec Готовый GObject.ParamSpec для свойства
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 *
 * @returns PropertyDecorator применимый к GObject.Object. */
function Property(spec) {
    return function (target, property_key) {
        if (!spec) {
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property', { message: 'ParamSpec could not be created.' }));
        }
        collect_property_specs(target, property_key, spec);
    };
}
;
/** Декоратор для boolean свойства GObject.
 *
 * Автоматически создает ParamSpec для boolean значения и преобразует
 * JavaScript имя свойства в каноническую форму.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Boolean(false)
 *     declare is_enabled: boolean;  // -> 'is-enabled' в GObject
 *
 *     \@Property.Boolean({ default_value: true })
 *     declare show_content: boolean;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_boolean.html GObject.ParamSpec.boolean documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * // @todo всем как тут
 * @param spec_params {@link BooleanConfig Конфигурация} или {@link BooleanParams позиционные параметры} для ParamSpec.
 * @param spec_params Позиционные параметры:
 *   `default_value?: boolean (false)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 *
 * @returns PropertyDecorator применимый к GObject.Object. */
Property.Boolean = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, boolean_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Boolean', error));
        }
    };
};
/** Декоратор для boxed свойства GObject.
 *
 * Автоматически создает ParamSpec для boxed типа (структуры).
 * Требует указания GType boxed типа.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Boxed(Gdk.RGBA.$gtype)
 *     declare background_color: Gdk.RGBA;  // -> 'background-color' в GObject
 *
 *     \@Property.Boxed({ gtype: Pango.FontDescription.$gtype })
 *     declare font_desc: Pango.FontDescription;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_boxed.html GObject.ParamSpec.boxed documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `g_type: GObject.GType`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Boxed = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, boxed_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Boxed', error));
        }
    };
};
/** Декоратор для enum свойства GObject.
 *
 * Автоматически создает ParamSpec для перечислимого типа. Требует указания GType
 * enum'а и значения по умолчанию из этого enum'а.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Enum(Gtk.Orientation.$gtype, Gtk.Orientation.HORIZONTAL)
 *     declare orientation: Gtk.Orientation;  // -> 'orientation' в GObject
 *
 *     \@Property.Enum({
 *         g_type: MyCustomEnum.$gtype,
 *         default_value: MyCustomEnum.DEFAULT
 *     })
 *     declare mode: MyCustomEnum;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_enum.html GObject.ParamSpec.enum documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `g_type: GObject.GType`,
 *   `default_value?: number (0)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Enum = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, enum_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Enum', error));
        }
    };
};
/** Декоратор для flags свойства GObject.
 *
 * Автоматически создает ParamSpec для битовых флагов. Требует указания GType
 * flags типа и значения по умолчанию.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Flags(Gtk.StateFlags.$gtype, Gtk.StateFlags.NORMAL)
 *     declare state_flags: Gtk.StateFlags;  // -> 'state-flags' в GObject
 *
 *     \@Property.Flags({
 *         gtype: MyCustomFlags.$gtype,
 *         default_value: MyCustomFlags.NONE
 *     })
 *     declare custom_flags: MyCustomFlags;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_flags.html GObject.ParamSpec.flags documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `g_type: GObject.GType`,
 *   `default_value?: number (0)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Flags = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, flags_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Flags', error));
        }
    };
};
/** Декоратор для GType свойства GObject.
 *
 * Автоматически создает ParamSpec для свойства содержащего GType.
 * Используется для хранения типов классов GObject.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.GType(GObject.Object.$gtype)
 *     declare widget_type: GObject.GType;  // -> 'widget-type' в GObject
 *
 *     \@Property.GType({ gtype: Gtk.Widget.$gtype })
 *     declare child_type: GObject.GType;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_gtype.html GObject.ParamSpec.gtype documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `gtype: GObject.GType`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.GType = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, gtype_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.GType', error));
        }
    };
};
/** Декоратор для JavaScript object свойства GObject.
 *
 * Автоматически создает ParamSpec для произвольного JavaScript объекта.
 * Позволяет хранить любые JS значения в GObject свойстве.
 *
 * Технически представляет собою коробочную структуру.
 *
 * GObject.TYPE_JSOBJECT is a special GType in GJS, created so that
 * JavaScript types that inherit from Object can be used with the GObject
 * framework. This allows you to use them as property types and in signal
 * parameters in your GObject subclasses.
 *
 * GObject.TYPE_JSOBJECT is a boxed type, so it may not be used where a
 * GObject is expected, such as with Gio.ListModel.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.JSObject()
 *     declare user_data: any;  // -> 'user-data' в GObject
 *
 *     \@Property.JSObject({ nick: 'Configuration' })
 *     declare config: { [key: string]: any };
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_boxed.html GObject.ParamSpec.boxed documentation }
 * - {@link org/gnome/gjs/modules/core/overrides/GObject.js#L486 Исходный код GObject.ParamSpec overrides в GJS }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры: нет
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.JSObject = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, jsobject_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.JSObject', error));
        }
    };
};
/** Декоратор для object свойства GObject.
 *
 * Автоматически создает ParamSpec для свойства содержащего GObject.
 * Требует указания GType класса объекта.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Object(Gtk.Widget.$gtype)
 *     declare child_widget: Gtk.Widget;  // -> 'child-widget' в GObject
 *
 *     \@Property.Object({ gtype: Gio.File.$gtype, nick: 'Current File' })
 *     declare current_file: Gio.File;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_object.html GObject.ParamSpec.object documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `g_type: GObject.GType`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Object = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, object_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Object', error));
        }
    };
};
/** Декоратор для переопределения свойства родительского класса.
 *
 * Автоматически создает ParamSpec для переопределения существующего свойства.
 * Требует указания имени переопределяемого свойства.
 *
 * ~~~ts
 * class MyButton extends Gtk.Button {
 *     \@Property.Override(Gtk.Button.$gtype)
 *     declare sensitive: boolean;  // переопределяем свойство 'sensitive' родителя
 *
 *     \@Property.Override({ source_type: Gtk.Button.$gtype })
 *     declare visible: boolean;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_override.html GObject.ParamSpec.override documentation }
 * - {@link https://gjs.guide/guides/gobject/interfaces.html#properties Override Properties in Interfaces }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `source_type: GObject.GType`,
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Override = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, override_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Override', error));
        }
    };
};
/** Декоратор для ParamSpec свойства GObject.
 *
 * Автоматически создает ParamSpec для свойства содержащего другой ParamSpec.
 * Требует указания GType ParamSpec типа.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Param(GObject.ParamSpec.$gtype)
 *     declare property_spec: GObject.ParamSpec;  // -> 'property-spec' в GObject
 *
 *     \@Property.Param({ gtype: GObject.ParamSpecString.$gtype' })
 *     declare string_spec: GObject.ParamSpecString;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_param.html GObject.ParamSpec.param documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `g_type: GObject.GType`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 */
Property.Param = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, param_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Param', error));
        }
    };
};
/** Декоратор для pointer свойства GObject.
 *
 * Автоматически создает ParamSpec для указателя на произвольные данные.
 * Используется для хранения нетипизированных указателей. Не рекомендуется
 * использовать.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Pointer()
 *     declare native_handle: any;  // -> 'native-handle' в GObject
 *
 *     \@Property.Pointer({ })
 *     declare user_context: any;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_pointer.html GObject.ParamSpec.pointer documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры: не имеет
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 */
Property.Pointer = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, pointer_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Pointer', error));
        }
    };
};
/** Декоратор для строкового свойства GObject.
 *
 * Автоматически создает ParamSpec для строкового значения и преобразует
 * JavaScript имя свойства в каноническую форму.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.String('')
 *     declare file_path: string;  // -> 'file-path' в GObject
 *
 *     \@Property.String({ default_value: 'untitled' })
 *     declare document_name: string | null;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_string.html GObject.ParamSpec.string documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: string | null (null)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 */
Property.String = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, string_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.String', error));
        }
    };
};
// @fixme
/** Декоратор для GVariant свойства GObject.
 *
 * Автоматически создает ParamSpec для GLib.Variant значения.
 * Требует указания типа variant'а через GLib.VariantType.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Variant(GLib.VariantType.new('s'), GLib.Variant.new_string(''))
 *     declare settings_data: GLib.Variant;  // -> 'settings-data' в GObject
 *
 *     \@Property.Variant({
 *         variant_type: GLib.VariantType.new('i'),
 *         default_value: GLib.Variant.new_int32(0)
 *     })
 *     declare counter: GLib.Variant;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_variant.html GLib.ParamSpec.variant documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `variant_type: GLib.VariantType`,
 *   `default_value?: GLib.Variant | null (null)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Variant = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, variant_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Variant', error));
        }
    };
};
/** Декоратор для числового свойства GObject (char).
 *
 * Автоматически создает ParamSpec для знакового байта (int8).
 * Подходит для хранения символов или малых чисел.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Char(0, -100, 100)
 *     declare offset_char: number;  // -> 'offset-char' в GObject
 *
 *    \@Property.Char({ default_value: 65, minimum: 32, maximum: 126 })
 *     declare ascii_code: number;  // ASCII символы
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_char.html GObject.ParamSpec.char documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (GLib.MININT8)`,
 *   `maximum?: number (GLib.MAXINT8)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Char = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, char_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Char', error));
        }
    };
};
/** Декоратор для числового свойства GObject (double).
 *
 * Автоматически создает ParamSpec для значения с плавающей точкой двойной точности
 * с возможностью задания минимума, максимума и значения по умолчанию.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Double(1.0, 0.0, 10.0)
 *     declare scale_factor: number;  // -> 'scale-factor' в GObject
 *
 *     \@Property.Double({ default_value: 0.5, minimum: 0.0, maximum: 1.0 })
 *     declare opacity: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_double.html GObject.ParamSpec.double documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0.0)`,
 *   `minimum?: number (-Number.MAX_VALUE)`,
 *   `maximum?: number (Number.MAX_VALUE)`,
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Double = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, double_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Double', error));
        }
    };
};
/** Декоратор для числового свойства GObject (float). Не рекомендуется к
 * использованию в GJS.
 *
 * Автоматически создает ParamSpec для значения с плавающей точкой одинарной
 * точности.
 *
 * ~~~
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Float(1.0, 0.0, 100.0)
 *     declare zoom_level: number;  // -> 'zoom-level' в GObject
 *
 *    \ @Property.Float({ default_value: 0.5, minimum: 0.0, maximum: 1.0 })
 *     declare alpha: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_float.html GObject.ParamSpec.float documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0.0)`,
 *   `minimum?: number (-3.4028234663852886e+38)`,
 *   `maximum?: number (3.4028234663852886e+38)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property._Float = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, float_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Float', error));
        }
    };
};
/** Декоратор для числового свойства GObject (int).
 *
 * Автоматически создает ParamSpec для целочисленного значения с возможностью
 * задания минимума, максимума и значения по умолчанию.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Int(0, -100, 100)
 *     declare offset: number;  // -> 'offset' в GObject
 *
 *     \@Property.Int({ default_value: 50, minimum: 0, maximum: 100 })
 *     declare progress: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_int.html GObject.ParamSpec.int documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (GLib.MININT32)`,
 *   `maximum?: number (GLib.MAXINT32)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Int = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, int_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Int', error));
        }
    };
};
// @bm: ---------------------------------
/** Декоратор для числового свойства GObject (int64).
 *
 * Автоматически создает ParamSpec для 64-битного знакового целого числа.
 * Подходит для больших чисел, временных меток, размеров файлов.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Int64(0, 0, Number.MAX_SAFE_INTEGER)
 *     declare file_size: number;  // -> 'file-size' в GObject
 *
 *     \@Property.Int64({ default_value: Date.now(), minimum: 0 })
 *     declare timestamp: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_int64.html GObject.ParamSpec.int64 documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (Number.MIN_SAFE_INTEGER)`,
 *   `maximum?: number (Number.MAX_SAFE_INTEGER)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Int64 = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, int64_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Int64', error));
        }
    };
};
/** Декоратор для числового свойства GObject (long).
 *
 * Автоматически создает ParamSpec для типа long (зависит от платформы).
 * Обычно 32-бит на 32-битных системах, 64-бит на 64-битных.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.Long(0, -1000000, 1000000)
 *     declare large_counter: number;  // -> 'large-counter' в GObject
 *
 *     \@Property.Long({ default_value: 100, minimum: 0, maximum: 110 })
 *     declare capacity: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_long.html GObject.ParamSpec.long documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (Number.MIN_SAFE_INTEGER)`,
 *   `maximum?: number (Number.MAX_SAFE_INTEGER)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.Long = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, long_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.Long', error));
        }
    };
};
/** Декоратор для числового свойства GObject (uchar).
 *
 * Автоматически создает ParamSpec для беззнакового байта (0 до 255).
 * Подходит для хранения RGB компонентов, индексов, малых счетчиков.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.UChar(128, 0, 255)
 *     declare red_component: number;  // -> 'red-component' в GObject
 *
 *     \@Property.UChar({ default_value: 0, maximum: 100 })
 *     declare progress_percent: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_uchar.html GObject.ParamSpec.uchar documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0),
 *   `minimum?: number 0`,
 *   `maximum?: number (GLib.MAXUINT8)`,
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.UChar = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, uchar_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.UChar', error));
        }
    };
};
/** Декоратор для числового свойства GObject (uint).
 *
 * Автоматически создает ParamSpec для беззнакового 32-битного целого числа.
 * Подходит для счетчиков, индексов, размеров, ID объектов.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     @Property.UInt(0, 0, 4294967295)
 *     declare item_count: number;  // -> 'item-count' в GObject
 *
 *     @Property.UInt({ default_value: 1, minimum: 1, maximum: 1000 })
 *     declare page_number: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_uint.html GObject.ParamSpec.uint documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (0)`,
 *   `maximum?: number (GLib.MAXUINT32)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства
 */
Property.UInt = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, uint_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.UInt', error));
        }
    };
};
/** Декоратор для числового свойства GObject (uint64).
 *
 * Автоматически создает ParamSpec для беззнакового 64-битного целого числа.
 * Подходит для очень больших счетчиков, размеров, хеш-значений.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.UInt64(0, 0, Number.MAX_SAFE_INTEGER)
 *     declare total_bytes: number;  // -> 'total-bytes' в GObject
 *
 *     \@Property.UInt64({ default_value: 0, minimum: 0, maximum: Number.MAX_SAFE_INTEGER })
 *     declare hash_value: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_uint64.html GObject.ParamSpec.uint64 documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (0)`,
 *   `maximum?: number (Number.MAX_SAFE_INTEGER)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.UInt64 = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, uint64_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.UInt64', error));
        }
    };
};
/** Декоратор для числового свойства GObject (ulong).
 *
 * Автоматически создает ParamSpec для беззнакового типа long (зависит от платформы).
 * Обычно 32-бит на 32-битных системах, 64-бит на 64-битных.
 *
 * ~~~
 * class MyWidget extends Gtk.Widget {
 *     \@Property.ULong(0, 0, 4294967295)
 *     declare memory_size: number;  // -> 'memory-size' в GObject
 *
 *     \@Property.ULong({ default_value: 100 })
 *     declare buffer_size: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_ulong.html GObject.ParamSpec.ulong documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   `default_value?: number (0)`,
 *   `minimum?: number (0)`,
 *   `maximum?: number (Number.MAX_SAFE_INTEGER)`
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.ULong = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, ulong_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.ULong', error));
        }
    };
};
/** Декоратор для Unicode символа свойства GObject.
 *
 * Автоматически создает ParamSpec для Unicode символа (gunichar).
 * Подходит для хранения одиночных Unicode символов, включая эмодзи.
 *
 * ~~~ts
 * class MyWidget extends Gtk.Widget {
 *     \@Property.UniChar(0x41)  // 'A'
 *     declare hotkey_char: number;  // -> 'hotkey-char' в GObject
 *
 *     \@Property.UniChar({ default_value: 0x2665 })  // '♥'
 *     declare icon_symbol: number;
 * }
 * ~~~
 *
 * @see
 * - {@link https://docs.gtk.org/gobject/func.param_spec_unichar.html GObject.ParamSpec.unichar documentation }
 * - {@link https://gjs-docs.gnome.org/gjs/overrides.md#gobject-paramspec GObject.ParamSpec overrides in GJS }
 * - {@link https://gjs.guide/guides/gobject/subclassing.html#properties Declaring Properties in GJS Guide }
 *
 * @param spec_params Конфигурация или позиционные параметры для ParamSpec
 * @param spec_params Позиционные параметры:
 *   default_value?: number ('\0')
 *
 * @throws {DecoratorError} При любых проблемах регистрации свойства */
Property.UniChar = function (...spec_params) {
    return function (target, property_key) {
        try {
            collect_property_specs(target, property_key, unichar_param_spec(to_canonical_name(property_key), spec_params));
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            ;
            throw new DecoratorError(prepare_err_context(target, property_key, '@Property.UniChar', error));
        }
    };
};
// @fixme Expression: (...paramSpec: ParamSpecParams<SpecType.>) => InstancePropertyDecorator<Gtk.Widget>;
/** Вспомогательный метод для преобразования имён.
 *
 * Преобразует JavaScript имя свойства в canonical форму GObject.
 * Например: `myProperty` -> `my-property`.
 *
 * @affects Используется внутренне всеми декораторами свойств.
 *
 * @param name допустимый js идентификатор.
 * @returns Имя в canonical форме (kebab-case).
 */
Property.key_to_canonical_name = to_canonical_name;
export { Property };
export const ParamFlags = GObject.ParamFlags;
