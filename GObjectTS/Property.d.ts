import GObject from 'gi://GObject?version=2.0';
import { to_canonical_name } from './Property.ParamSpec.js';
import type { BaseConfig, BooleanConfig, BooleanParams, TypedNumericConfig, TypedNumericParams, GTypeConfig, GTypeParams, OverrideConfig, OverrideParams, StringConfig, StringParams, NumericConfig, NumericParams, UniCharConfig, UniCharParams } from './Property.ParamSpec.js';
import type { VariantConfig, VariantParams } from './Property.ParamSpec.GLib.js';
import { PropertyDecorator } from './_Private.js';
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
declare function Property(spec: GObject.ParamSpec): PropertyDecorator<GObject.Object>;
declare namespace Property {
    var Boolean: (...spec_params: [BooleanConfig] | BooleanParams) => PropertyDecorator<GObject.Object>;
    var Boxed: (...spec_params: [GTypeConfig] | GTypeParams) => PropertyDecorator<GObject.Object>;
    var Enum: (...spec_params: [TypedNumericConfig] | TypedNumericParams) => PropertyDecorator<GObject.Object>;
    var Flags: (...spec_params: [TypedNumericConfig] | TypedNumericParams) => PropertyDecorator<GObject.Object>;
    var GType: (...spec_params: [GTypeConfig] | GTypeParams) => PropertyDecorator<GObject.Object>;
    var JSObject: (...spec_params: [BaseConfig] | []) => PropertyDecorator<GObject.Object>;
    var Object: (...spec_params: [GTypeConfig] | GTypeParams) => PropertyDecorator<GObject.Object>;
    var Override: (...spec_params: [OverrideConfig] | OverrideParams) => PropertyDecorator<GObject.Object>;
    var Param: (...spec_params: [GTypeConfig] | GTypeParams) => PropertyDecorator<GObject.Object>;
    var Pointer: (...spec_params: [BaseConfig] | []) => PropertyDecorator<GObject.Object>;
    var String: (...spec_params: [StringConfig] | StringParams) => PropertyDecorator<GObject.Object>;
    var Variant: (...spec_params: [VariantConfig] | VariantParams) => PropertyDecorator<GObject.Object>;
    var Char: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var Double: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var _Float: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var Int: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var Int64: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var Long: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var UChar: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var UInt: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var UInt64: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var ULong: (...spec_params: [NumericConfig] | NumericParams) => PropertyDecorator<GObject.Object>;
    var UniChar: (...spec_params: [UniCharConfig] | UniCharParams) => PropertyDecorator<GObject.Object>;
    var key_to_canonical_name: typeof to_canonical_name;
}
export { Property };
export declare const ParamFlags: typeof GObject.ParamFlags;
