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
import GLib from 'gi://GLib?version=2.0';
/**
 * // @todo: пример проблемы. как воспроизвести.
 * */
function _flags_guarder(spec_info) {
    if ((spec_info.params.flags & (GObject.ParamFlags.STATIC_NAME | GObject.ParamFlags.STATIC_NICK | GObject.ParamFlags.STATIC_BLURB)) !== 0) {
        console.warn('Bug: flag \'ParamFlags.STATIC_*\' has problem in GJS.');
    }
    // if ((spec_info.params.flags & GObject.ParamFlags.CONSTRUCT_ONLY) !== 0) {
    //     console.warn('Bug: flag \'ParamFlags.CONSTRUCT_ONLY\' has problem in GJS.');
    // }
    return spec_info;
}
;
function boolean_metadata(name, params) {
    const param = params[0];
    const default_ = false;
    // Если param примитив или undefined — обработать как примитив
    if (param === undefined || typeof param === 'boolean') {
        return {
            'param-spec-type': 'boolean',
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                default_value: param ?? default_,
            },
        };
    }
    // передан конфиг
    return {
        'param-spec-type': 'boolean',
        params: {
            name: name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            default_value: param.default_value ?? default_
        }
    };
}
/** Создает ParamSpec для boolean свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект BooleanConfig
 * @returns GObject.ParamSpec типа 'gboolean'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_boolean.html */
function boolean_param_spec(name, params) {
    // try {
    const spec_info = _flags_guarder(boolean_metadata(name, params));
    try {
        const param_spec_boolean = GObject.param_spec_boolean(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_boolean !== null) {
            return param_spec_boolean;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_boolean\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function string_metadata(name, params) {
    const param = params[0];
    const default_ = null;
    // Если param примитив или undefined — обработать как примитив
    if (param === undefined || param === null || typeof param === 'string') {
        return {
            'param-spec-type': 'string',
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                default_value: param ?? default_,
            },
        };
    }
    // передан конфиг
    return {
        'param-spec-type': 'string',
        params: {
            name: name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            default_value: param.default_value ?? default_
        }
    };
}
/** Создает ParamSpec для string свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект StringConfig
 * @returns GObject.ParamSpec типа 'gchararray'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_string.html */
function string_param_spec(name, params) {
    // try {
    const spec_info = _flags_guarder(string_metadata(name, params));
    try {
        const param_spec_string = GObject.param_spec_string(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_string !== null) {
            return param_spec_string;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_string\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function unichar_metadata(name, params) {
    const param = params[0];
    // Если param примитив или undefined — обработать как примитив
    if (param === undefined || typeof param === 'string') {
        return {
            'param-spec-type': 'unichar',
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                default_value: param ?? /* default_value */ '\0',
            },
        };
    }
    // передан конфиг
    return {
        'param-spec-type': 'unichar',
        params: {
            name: name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            default_value: param.default_value ?? /* default_value */ '\0'
        }
    };
}
/** Создает ParamSpec для unichar свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с default_value или объект UniCharConfig
 * @returns GObject.ParamSpec типа 'guint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_unichar.html */
function unichar_param_spec(name, params) {
    const spec_info = _flags_guarder(unichar_metadata(name, params));
    try {
        const param_spec_unichar = GObject.param_spec_unichar(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_unichar !== null) {
            return param_spec_unichar;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_unichar\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function override_metadata(name, params) {
    const param = params[0];
    // передан тип
    if (('name' in param && GObject.type_from_name(param.name)) || '__type__' in param) {
        return {
            'param-spec-type': 'override',
            params: {
                name: name,
                source_type: param,
            }
        };
    }
    if (!param || !param.source_type) {
        throw {
            message: 'Source type is invalid',
            'param-spec-type': 'override',
            params: {
                name: name,
                source_type: '<invalid data>',
            }
        };
    }
    // передан конфиг
    return {
        'param-spec-type': 'override',
        params: {
            name: name,
            source_type: param.source_type
        }
    };
}
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
function override_param_spec(name, params) {
    const spec_info = override_metadata(name, params);
    try {
        if (spec_info.params.source_type === GObject.TYPE_INTERFACE || spec_info.params.source_type === GObject.TYPE_OBJECT) {
            throw { message: `Cannot use abstract types '${(spec_info.params.source_type === GObject.TYPE_INTERFACE) ? 'G_TYPE_INTERFACE' : 'G_TYPE_OBJECT'}' for override. Specific interface or class type required.` };
        }
        const base_type = GObject.type_fundamental(spec_info.params.source_type);
        if (base_type !== GObject.TYPE_INTERFACE && base_type !== GObject.TYPE_OBJECT) {
            throw { message: 'Invalid source type for override. Only interface or object types can be overridden.' };
        }
        // // @todo проверка final?
        // @ts-expect-error
        const Gi = imports._gi;
        const param_spec_override = Gi.override_property(spec_info.params.name, spec_info.params.source_type);
        if (param_spec_override !== null) {
            return param_spec_override;
        }
        else {
            throw { message: 'The call \'Gi.override_property\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function boxed_metadata(name, params) {
    return types_only_metadata(name, params[0], 'boxed');
}
/** Создает ParamSpec для boxed свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec с указанным boxed типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-boxed типе
 * @link https://docs.gtk.org/gobject/func.param_spec_boxed.html */
function boxed_param_spec(name, params) {
    const spec_info = _flags_guarder(boxed_metadata(name, params));
    try {
        if (spec_info.params.g_type === GObject.TYPE_BOXED) {
            throw { message: 'Cannot use abstract G_TYPE_BOXED, specific boxed type required.' };
        }
        if (GObject.type_fundamental(spec_info.params.g_type) !== GObject.TYPE_BOXED) {
            throw { message: 'Type is not a boxed type. Only types derived from G_TYPE_BOXED supported for boxed ParamSpec.' };
        }
        const param_spec_boxed = GObject.param_spec_boxed(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.flags);
        if (param_spec_boxed !== null) {
            return param_spec_boxed;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_boxed\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function gtype_metadata(name, params) {
    return types_only_metadata(name, params[0], 'gtype');
}
/** Создает ParamSpec для gtype свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec типа 'GType'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_gtype.html */
function gtype_param_spec(name, params) {
    const spec_info = _flags_guarder(gtype_metadata(name, params));
    try {
        const param_spec_gtype = GObject.param_spec_gtype(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.flags);
        if (param_spec_gtype !== null) {
            return param_spec_gtype;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_gtype\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function object_metadata(name, params) {
    return types_only_metadata(name, params[0], 'object');
}
/** Создает ParamSpec для object свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec с указанным типом объекта
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-object типе
 * @link https://docs.gtk.org/gobject/func.param_spec_object.html */
function object_param_spec(name, params) {
    const spec_info = _flags_guarder(object_metadata(name, params));
    try {
        // if (spec_info.params.g_type === GObject.TYPE_OBJECT) {
        //     throw { message: 'Cannot use abstract G_TYPE_OBJECT, specific object type required.' };
        // }
        // @fixme эта проверка должна учитывать что g_type может быть интерфейсом
        // if (GObject.type_fundamental(spec_info.params.g_type) !== GObject.TYPE_OBJECT) {
        //     throw { message: 'Type is not an object type. Only GObject-derived types supported for object ParamSpec.' };
        // }
        const param_spec_object = GObject.param_spec_object(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.flags);
        if (param_spec_object !== null) {
            return param_spec_object;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_object\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function param_metadata(name, params) {
    return types_only_metadata(name, params[0], 'param');
}
/** Создает ParamSpec для param свойства
 * @param name Идентификатор свойства
 * @param params Кортеж с GType или объект GTypeConfig
 * @returns GObject.ParamSpec типа 'GParam'
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-param типе
 * @link https://docs.gtk.org/gobject/func.param_spec_param.html */
function param_param_spec(name, params) {
    const spec_info = _flags_guarder(param_metadata(name, params));
    try {
        // if (param_spec_metadata.param_type === GObject.TYPE_PARAM) { // @fixme ? проверить
        if (GObject.type_fundamental(spec_info.params.g_type) !== GObject.TYPE_PARAM) {
            throw { message: 'Type fundamental is not G_TYPE_PARAM. Only ParamSpec-derived types supported for param ParamSpec.' };
        }
        const param_spec_param = GObject.param_spec_param(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.flags);
        if (param_spec_param !== null) {
            return param_spec_param;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_param\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function types_only_metadata(name, param, type_name) {
    // передан тип
    if (('name' in param && GObject.type_from_name(param.name)) || '__type__' in param) {
        return {
            'param-spec-type': type_name,
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                g_type: param
            }
        };
    }
    if (!param?.g_type) {
        throw {
            message: 'g_type is not defined',
            'param-spec-type': type_name,
            params: {
                name: name,
                g_type: '<invalid data>'
            }
        };
    }
    // передан конфиг
    return {
        'param-spec-type': type_name,
        params: {
            name: name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            g_type: param.g_type
        }
    };
}
function enum_metadata(name, params) {
    return typed_numeric_metadata(name, params[0], 'enum', params[1] ?? 0);
}
/** Создает ParamSpec для enum свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [enum_type, default_value?] или объект TypedNumericConfig
 * @returns GObject.ParamSpec с указанным enum типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-enum типе
 * @link https://docs.gtk.org/gobject/func.param_spec_enum.html */
function enum_param_spec(name, params) {
    const spec_info = _flags_guarder(enum_metadata(name, params));
    try {
        if (spec_info.params.g_type === GObject.TYPE_ENUM) {
            throw { message: 'Cannot use abstract G_TYPE_ENUM, specific enum type required.' };
        }
        if (GObject.type_fundamental(spec_info.params.g_type) !== GObject.TYPE_ENUM) {
            throw { message: 'Type fundamental is not G_TYPE_ENUM. Only enum types supported for enum ParamSpec.' };
        }
        const param_spec_enum = GObject.param_spec_enum(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_enum !== null) {
            return param_spec_enum;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_enum\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function flags_metadata(name, params) {
    return typed_numeric_metadata(name, params[0], 'flags', params[1] ?? 0);
}
/** Создает ParamSpec для flags свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [flags_type, default_value?] или объект TypedNumericConfig
 * @returns GObject.ParamSpec с указанным flags типом
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или не-flags типе
 * @link https://docs.gtk.org/gobject/func.param_spec_flags.html */
function flags_param_spec(name, params) {
    const spec_info = _flags_guarder(flags_metadata(name, params));
    try {
        if (spec_info.params.g_type === GObject.TYPE_FLAGS) {
            throw { message: 'Cannot use abstract G_TYPE_FLAGS, specific flags type required.' };
        }
        if (GObject.type_fundamental(spec_info.params.g_type) !== GObject.TYPE_FLAGS) {
            throw { message: 'Type fundamental is not G_TYPE_FLAGS. Only flags types supported for flags ParamSpec.' };
        }
        const param_spec_flags = GObject.param_spec_flags(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.g_type, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_flags !== null) {
            return param_spec_flags;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_flags\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function typed_numeric_metadata(name, param, type_name, default_) {
    if (('name' in param && GObject.type_from_name(param.name)) || '__type__' in param) { // только тип и значение
        return {
            'param-spec-type': type_name,
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                default_value: default_,
                g_type: param
            }
        };
    }
    if (!param?.g_type) {
        throw {
            message: 'g_type is not defined',
            'param-spec-type': type_name,
            params: {
                name: name,
                g_type: '<invalid data>',
            }
        };
    }
    return {
        'param-spec-type': type_name,
        params: {
            name: name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            default_value: param.default_value ?? default_,
            g_type: param.g_type
        }
    };
}
function pointer_metadata(name, params) {
    return base_only_metadata(name, params, 'pointer');
}
/** Создает ParamSpec для pointer свойства
 *
 * Не рекомендуется использовать.
 * @param name Идентификатор свойства
 * @param params Пустой кортеж или объект BaseConfig
 * @returns GObject.ParamSpec типа 'gpointer'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_pointer.html */
function pointer_param_spec(name, params) {
    const spec_info = _flags_guarder(pointer_metadata(name, params));
    try {
        const param_spec_pointer = GObject.param_spec_pointer(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.flags);
        if (param_spec_pointer !== null) {
            return param_spec_pointer;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_pointer\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function jsobject_metadata(name, params) {
    return base_only_metadata(name, params, 'jsobject');
}
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
function jsobject_param_spec(name, params) {
    const spec_info = _flags_guarder(jsobject_metadata(name, params));
    try {
        const param_spec_boxed = GObject.param_spec_boxed(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, Object.$gtype, spec_info.params.flags);
        if (param_spec_boxed !== null) {
            return param_spec_boxed;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_boxed\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function base_only_metadata(name, param, type_name) {
    if (!param) {
        throw {
            message: 'param is undefined',
            'param-spec-type': type_name,
            params: {
                name: name,
                any: '<invalid data>',
            }
        };
    }
    if (param.length === 0) {
        return {
            'param-spec-type': type_name,
            params: {
                name: name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
            }
        };
    }
    // передан конфиг
    return {
        'param-spec-type': type_name,
        params: {
            name: name,
            nick: param[0].nick ?? null,
            blurb: param[0].blurb ?? null,
            flags: param[0].flags ?? GObject.ParamFlags.READWRITE,
        }
    };
}
function char_metadata(name, params) {
    return numeric_metadata(name, params[0], 'char', 0, params[1] ?? GLib.MININT8, // -128
    params[2] ?? GLib.MAXINT8);
}
/** Создает ParamSpec для char свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gchar'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_char.html */
function char_param_spec(name, params) {
    const spec_info = _flags_guarder(char_metadata(name, params));
    try {
        const param_spec_char = GObject.param_spec_char(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_char !== null) {
            return param_spec_char;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_char\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function uchar_metadata(name, params) {
    return numeric_metadata(name, params[0], 'uchar', 0, params[1] ?? 0, params[2] ?? GLib.MAXUINT8);
}
/** Создает ParamSpec для uchar свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guchar'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uchar.html */
function uchar_param_spec(name, params) {
    const spec_info = _flags_guarder(uchar_metadata(name, params));
    try {
        const param_spec_uchar = GObject.param_spec_uchar(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_uchar !== null) {
            return param_spec_uchar;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_uchar\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function int_metadata(name, params) {
    return numeric_metadata(name, params[0], 'int', 0, params[1] ?? GLib.MININT32, // -2147483648,
    params[2] ?? GLib.MAXINT32);
}
/** Создает ParamSpec для int свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_int.html */
function int_param_spec(name, params) {
    const spec_info = _flags_guarder(int_metadata(name, params));
    try {
        const param_spec_int = GObject.param_spec_int(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_int !== null) {
            return param_spec_int;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_int\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function uint_metadata(name, params) {
    return numeric_metadata(name, params[0], 'uint', 0, params[1] ?? 0, params[2] ?? GLib.MAXUINT32);
}
/** Создает ParamSpec для uint свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guint'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uint.html */
function uint_param_spec(name, params) {
    const spec_info = _flags_guarder(uint_metadata(name, params));
    try {
        const param_spec_uint = GObject.param_spec_uint(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_uint !== null) {
            return param_spec_uint;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_uint\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function long_metadata(name, params) {
    return numeric_metadata(name, params[0], 'long', 0, params[1] ?? Number.MIN_SAFE_INTEGER, // -9007199254740991,
    params[2] ?? Number.MAX_SAFE_INTEGER);
}
/** Создает ParamSpec для long свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'glong'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_long.html */
function long_param_spec(name, params) {
    const spec_info = _flags_guarder(long_metadata(name, params));
    try {
        const param_spec_long = GObject.param_spec_long(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_long !== null) {
            return param_spec_long;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_long\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function ulong_metadata(name, params) {
    return numeric_metadata(name, params[0], 'ulong', 0, params[1] ?? 0, params[2] ?? Number.MAX_SAFE_INTEGER);
}
/** Создает ParamSpec для ulong свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gulong'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_ulong.html */
function ulong_param_spec(name, params) {
    const spec_info = _flags_guarder(ulong_metadata(name, params));
    try {
        const param_spec_ulong = GObject.param_spec_ulong(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_ulong !== null) {
            return param_spec_ulong;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_ulong\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function int64_metadata(name, params) {
    return numeric_metadata(name, params[0], 'int64', 0, params[1] ?? Number.MIN_SAFE_INTEGER, params[2] ?? Number.MAX_SAFE_INTEGER);
}
/** Создает ParamSpec для int64 свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gint64'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_int64.html */
function int64_param_spec(name, params) {
    const spec_info = _flags_guarder(int64_metadata(name, params));
    try {
        const param_spec_int64 = GObject.param_spec_int64(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_int64 !== null) {
            return param_spec_int64;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_int64\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function uint64_metadata(name, params) {
    return numeric_metadata(name, params[0], 'uint64', 0, params[1] ?? 0, params[2] ?? Number.MAX_SAFE_INTEGER);
}
/** Создает ParamSpec для uint64 свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'guint64'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_uint64.html */
function uint64_param_spec(name, params) {
    const spec_info = _flags_guarder(uint64_metadata(name, params));
    try {
        const param_spec_uint64 = GObject.param_spec_uint64(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_uint64 !== null) {
            return param_spec_uint64;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_uint64\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
/** Границы подобраны для максимальной совместимости с GObject */
function float_metadata(name, params) {
    return numeric_metadata(name, params[0], 'float', 0, params[1] ?? -3.4028234663852886e+38, params[2] ?? 3.4028234663852886e+38);
}
/** Создает ParamSpec для float свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gfloat'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_float.html */
function float_param_spec(name, params) {
    const spec_info = _flags_guarder(float_metadata(name, params));
    try {
        const param_spec_float = GObject.param_spec_float(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_float !== null) {
            return param_spec_float;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_float\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function double_metadata(name, params) {
    return numeric_metadata(name, params[0], 'double', 0.0, params[1] ?? -Number.MAX_VALUE, // -1.79E+308,
    params[2] ?? Number.MAX_VALUE);
}
/** Создает ParamSpec для double свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [] | [default] | [default, min, max] или объект NumericConfig
 * @returns GObject.ParamSpec типа 'gdouble'
 * @throws ParamSpecErrorInfo при неправильных параметрах или невалидном имени
 * @link https://docs.gtk.org/gobject/func.param_spec_double.html */
function double_param_spec(name, params) {
    const spec_info = _flags_guarder(double_metadata(name, params));
    try {
        const param_spec_double = GObject.param_spec_double(spec_info.params.name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.minimum, spec_info.params.maximum, spec_info.params.default_value, spec_info.params.flags);
        if (param_spec_double !== null) {
            return param_spec_double;
        }
        else {
            throw { message: 'The call \'GObject.param_spec_double\' function returned NULL.' };
        }
    }
    catch (error) {
        throw { message: error.message, ...spec_info };
    }
}
function numeric_metadata(name, param, type_name, default_, minimum, maximum) {
    if (param === undefined || typeof param === 'number') {
        // Если param примитив или undefined — обработать как примитив
        return {
            'param-spec-type': type_name,
            params: {
                name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                minimum: minimum,
                default_value: param ?? default_,
                maximum: maximum,
            }
        };
    }
    return {
        'param-spec-type': type_name,
        params: {
            name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            minimum: param.minimum ?? minimum,
            default_value: param.default_value ?? default_,
            maximum: param.maximum ?? maximum
        }
    };
}
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
function to_canonical_name(property_key) {
    const name = property_key
        // Шаг 1: Разбиваем camelCase и PascalCase
        // Вставляем дефис перед заглавными буквами (кроме начала строки)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // Шаг 2: Обрабатываем последовательности заглавных букв (акронимы)
        // XMLHttp → XML-Http, но HTTPSProxy → HTTPS-Proxy
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        // Шаг 3: Заменяем подчеркивания на дефисы
        .replace(/_/g, '-')
        // Шаг 4: Приводим к lowercase
        .toLowerCase()
        // Шаг 5: Убираем дублирующиеся дефисы
        .replace(/-+/g, '-')
        // Шаг 6: Убираем дефисы в начале и конце
        .replace(/^-+|-+$/g, '');
    // Проверяем валидность имени согласно правилам GObject
    if (GObject.ParamSpec.is_valid_name(name)) {
        return name;
    }
    throw {
        message: `Invalid property name: '${property_key}' → '${name}' which violates GObject naming rules. See \'Canonical parameter names\' chapter for details of the rules for name: https://docs.gtk.org/gobject/class.ParamSpec.html#parameter-names`
    };
}
export { boolean_param_spec, string_param_spec, unichar_param_spec, override_param_spec, boxed_param_spec, gtype_param_spec, object_param_spec, param_param_spec, enum_param_spec, flags_param_spec, pointer_param_spec, jsobject_param_spec, char_param_spec, uchar_param_spec, int_param_spec, uint_param_spec, long_param_spec, ulong_param_spec, int64_param_spec, uint64_param_spec, float_param_spec, double_param_spec, to_canonical_name, };
export { // Для внутреннего использования
_flags_guarder, };
export { // @fixme экспортированы для тестов
//CanonicalName,
boolean_metadata, string_metadata, unichar_metadata, override_metadata, boxed_metadata, gtype_metadata, object_metadata, param_metadata, enum_metadata, flags_metadata, pointer_metadata, jsobject_metadata, char_metadata, uchar_metadata, int_metadata, uint_metadata, long_metadata, ulong_metadata, int64_metadata, uint64_metadata, float_metadata, double_metadata, };
