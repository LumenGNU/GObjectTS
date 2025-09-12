/** @file: src/Ljs/GObjectTS/Decorator.Property.ParamSpec.GLib.ts */
import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import { _flags_guarder } from './Property.ParamSpec.js';
function variant_metadata(canonical_name, params) {
    const param = params[0];
    if (param instanceof GLib.VariantType) { // только тип и значение
        return {
            type: 'variant',
            params: {
                canonical_name: canonical_name,
                nick: null,
                blurb: null,
                flags: GObject.ParamFlags.READWRITE,
                default_value: params[1] ?? null,
                variant_type: param
            }
        };
    }
    if (!param || !param.variant_type) {
        throw {
            message: 'Variant type is invalid',
            type: 'variant',
            params: {
                canonical_name: canonical_name,
                variant_type: '<invalid data>',
            }
        };
    }
    return {
        type: 'variant',
        params: {
            canonical_name: canonical_name,
            nick: param.nick ?? null,
            blurb: param.blurb ?? null,
            flags: param.flags ?? GObject.ParamFlags.READWRITE,
            default_value: param.default_value ?? null,
            variant_type: param.variant_type
        }
    };
}
/** Создает ParamSpec для variant свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [variant_type, default_value? | null] или объект VariantConfig
 * @returns GObject.ParamSpec типа "GVariant"
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или некорректном VariantType
 * @link https://docs.gtk.org/gobject/func.param_spec_variant.html */
function variant_param_spec(canonical_name, params) {
    const spec_info = _flags_guarder(variant_metadata(canonical_name, params));
    const param_spec_variant = GObject.param_spec_variant(spec_info.params.canonical_name, spec_info.params.nick, spec_info.params.blurb, spec_info.params.variant_type, spec_info.params.default_value, spec_info.params.flags);
    if (param_spec_variant !== null) {
        return param_spec_variant;
    }
    else {
        throw { message: 'The call "GObject.param_spec_variant" function returned NULL.', ...spec_info };
    }
}
export { variant_param_spec, };
export { // @fixme только для тестов
variant_metadata, };
