import GObject from "gi://GObject?version=2.0";
import type GLib from "gi://GLib?version=2.0";


export interface ErrObj {
    class: string,
    decorator: string,
    'js-property'?: string,
    'js-method'?: string,
    message: string;
    type?: string;
    params?: {
        canonical_name: string;
        nick: string | null;
        blurb: string | null;
        g_type?: GObject.GType;
        source_type?: GObject.GType | string;
        flags?: number | null;
        variant_type?: string | GLib.VariantType;
    };
};



export class DecoratorError extends Error {

    readonly name = 'DecoratorError';

    constructor(err_obj: ErrObj) {
        super(DecoratorError.format_msg(err_obj));
    }

    private static format_msg(err_obj: ErrObj): string {
        return JSON.stringify(err_obj, DecoratorError.replacer, 2).split('\n').join('\n\t');
    }

    private static replacer(key: string, value: any) {

        if (key === 'g_type' || key === 'source_type') {
            return `GType<${GObject.type_name(value)}>`;
        }

        if (key === 'source_type' || key === 'source_type') {
            return `GType<${GObject.type_name(value)}>`;
        }

        if (key === 'flags') {
            const flag_names: string[] = [];
            // Основные GParamFlags
            if (value & GObject.ParamFlags.READABLE) flag_names.push('READABLE');
            if (value & GObject.ParamFlags.WRITABLE) flag_names.push('WRITABLE');
            if (value & GObject.ParamFlags.CONSTRUCT) flag_names.push('CONSTRUCT');
            if (value & GObject.ParamFlags.CONSTRUCT_ONLY) flag_names.push('CONSTRUCT_ONLY');
            if (value & GObject.ParamFlags.LAX_VALIDATION) flag_names.push('LAX_VALIDATION');
            if (value & GObject.ParamFlags.STATIC_NAME) flag_names.push('STATIC_NAME');
            if (value & GObject.ParamFlags.STATIC_NICK) flag_names.push('STATIC_NICK');
            if (value & GObject.ParamFlags.STATIC_BLURB) flag_names.push('STATIC_BLURB');
            if (value & GObject.ParamFlags.EXPLICIT_NOTIFY) flag_names.push('EXPLICIT_NOTIFY');
            if (value & GObject.ParamFlags.DEPRECATED) flag_names.push('DEPRECATED');
            return flag_names.length > 0 ? flag_names.join(' + ') : 'NONE';
        }

        if (key === 'variant_type') {
            return `GLib.VariantType<${value.dup_string()}>`;
        }
        return value;
    };
}