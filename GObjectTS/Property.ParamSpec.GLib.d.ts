/** @file: src/Ljs/GObjectTS/Decorator.Property.ParamSpec.GLib.ts */
import GObject from 'gi://GObject?version=2.0';
import GLib from 'gi://GLib?version=2.0';
import { BaseConfig, CanonicalName } from './Property.ParamSpec.js';
/** Конфигурация для variant ParamSpec */
interface VariantConfig<T = any> extends BaseConfig {
    /** Тип данных варианта */
    variant_type: GLib.VariantType<T extends string ? string : never>;
    /** Значение по умолчанию. Должно соответствовать указанному variant_type */
    default_value?: GLib.Variant<T extends string ? string : never> | null;
}
/** Позиционные параметры для variant ParamSpec */
type VariantParams<T = any> = [
    variant_type: GLib.VariantType<T extends string ? string : never>,
    default_value?: GLib.Variant<T extends string ? string : never> | null
];
declare function variant_metadata(canonical_name: CanonicalName, params: [VariantConfig] | VariantParams): {
    type: string;
    params: {
        canonical_name: CanonicalName;
        nick: string | null;
        blurb: string | null;
        flags: GObject.ParamFlags;
        default_value: GLib.Variant<string> | null;
        variant_type: GLib.VariantType<string>;
    };
};
/** Создает ParamSpec для variant свойства
 * @param name Идентификатор свойства
 * @param params Кортеж [variant_type, default_value? | null] или объект VariantConfig
 * @returns GObject.ParamSpec типа "GVariant"
 * @throws ParamSpecErrorInfo при неправильных параметрах, невалидном имени или некорректном VariantType
 * @link https://docs.gtk.org/gobject/func.param_spec_variant.html */
declare function variant_param_spec(canonical_name: CanonicalName, params: [VariantConfig] | VariantParams): GObject.ParamSpec<unknown>;
export type { VariantConfig, VariantParams, };
export { variant_param_spec, };
export { // @fixme только для тестов
variant_metadata, };
