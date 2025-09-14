import GObject from "gi://GObject?version=2.0";
import { ClassConfig } from "./_Private.js";
declare function Interface(config?: ClassConfig & {
    Requires: {
        $gtype: GObject.GType;
    }[];
} | string): (target: any) => void;
export { Interface };
export declare const TypeFlags: typeof GObject.TypeFlags;
