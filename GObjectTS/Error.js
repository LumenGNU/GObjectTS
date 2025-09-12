import GObject from "gi://GObject?version=2.0";
;
export class DecoratorError extends Error {
    name = 'DecoratorError';
    constructor(err_obj) {
        super(DecoratorError.format_msg(err_obj));
    }
    static format_msg(err_obj) {
        return JSON.stringify(err_obj, DecoratorError.replacer, 2).split('\n').join('\n\t');
    }
    static replacer(key, value) {
        if (key === 'g_type' || key === 'source_type') {
            return `GType<${GObject.type_name(value)}>`;
        }
        if (key === 'source_type' || key === 'source_type') {
            return `GType<${GObject.type_name(value)}>`;
        }
        if (key === 'flags') {
            const flag_names = [];
            // Основные GParamFlags
            if (value & GObject.ParamFlags.READABLE)
                flag_names.push('READABLE');
            if (value & GObject.ParamFlags.WRITABLE)
                flag_names.push('WRITABLE');
            if (value & GObject.ParamFlags.CONSTRUCT)
                flag_names.push('CONSTRUCT');
            if (value & GObject.ParamFlags.CONSTRUCT_ONLY)
                flag_names.push('CONSTRUCT_ONLY');
            if (value & GObject.ParamFlags.LAX_VALIDATION)
                flag_names.push('LAX_VALIDATION');
            if (value & GObject.ParamFlags.STATIC_NAME)
                flag_names.push('STATIC_NAME');
            if (value & GObject.ParamFlags.STATIC_NICK)
                flag_names.push('STATIC_NICK');
            if (value & GObject.ParamFlags.STATIC_BLURB)
                flag_names.push('STATIC_BLURB');
            if (value & GObject.ParamFlags.EXPLICIT_NOTIFY)
                flag_names.push('EXPLICIT_NOTIFY');
            if (value & GObject.ParamFlags.DEPRECATED)
                flag_names.push('DEPRECATED');
            return flag_names.length > 0 ? flag_names.join(' + ') : 'NONE';
        }
        if (key === 'variant_type') {
            return `GLib.VariantType<${value.dup_string()}>`;
        }
        return value;
    }
    ;
}
