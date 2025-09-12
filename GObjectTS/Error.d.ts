import GObject from "gi://GObject?version=2.0";
import type GLib from "gi://GLib?version=2.0";
export interface ErrObj {
    class: string;
    decorator: string;
    'js-property'?: string;
    'js-method'?: string;
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
}
export declare class DecoratorError extends Error {
    readonly name = "DecoratorError";
    constructor(err_obj: ErrObj);
    private static format_msg;
    private static replacer;
}
