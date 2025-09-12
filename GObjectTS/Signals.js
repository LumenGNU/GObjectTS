/** @file: src/Ljs/GObjectTS/Signals.ts */
/** @fileoverview: Type-safe GObject signal decorator for TypeScript */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 1.0.0 */
/**
 * @changelog
 *
 * # 1.0.0 - Первый вариант
 *  */
import { DecoratorError, } from "./Error.js";
import { SIGNALS_COLLECTOR_KEY } from './_Private.js';
;
;
/** Gets or creates the signals collector map for a class constructor.
*
* Used internally by @Signals decorator to store signal definitions
* before they're registered with GObject.registerClass.
* */
function ensure_signals_collector(target) {
    return target[SIGNALS_COLLECTOR_KEY] ??= new Map();
}
/** Decorator for declarative GObject signal registration with TypeScript support.
 *
 * This decorator implements a hybrid approach that bridges GObject's signal system
 * with TypeScript's type safety. It operates on two levels:
 *
 * **Runtime Level (GObject):**
 * - Registers signals with GObject.registerClass() during class decoration
 * - Enables actual signal emission and connection in JavaScript runtime
 *
 * **Optional Compile-time Level (TypeScript):**
 * - Provides type-safe interfaces for emit/connect methods
 * - Enables autocomplete for signal names and parameter validation
 * - Prevents typos and signature mismatches at compile time
 *
 * **Key Concept:**
 * The decorator config defines the GObject signal specification, while the
 * `$signals` property declaration defines TypeScript signatures. These work
 * together but serve different purposes:
 * - Decorator config → Runtime behavior (actual signals)
 * - $signals declaration → Compile-time types (TypeScript safety)
 *
 * **Why `declare`?**
 * All TypeScript declarations (emit, connect, $signals) use `declare` keyword
 * because they provide only type information - no runtime code is generated.
 * The actual methods come from GObject.Object prototype chain.
 *
 * @see
 * - {@link $signals} - Compile-time signal type information
 * - {@link EmitMethod} и
 * - {@link ConnectMethod} - вспомогательные интерфейсы
 *
 * @param config Object defining signals where keys are signal names and
 *   values are GObject signal definitions (see {@link SignalDefinition})
 *
 * @returns PropertyDecorator applicable only to '$signals' property
 *
 * @throws {DecoratorError} When multiple @Signals decorators are applied to same class
 *
 * @example Basic signal definition
 * ~~~typescript
 * \@Class({ GTypeName: 'DataProcessor' })
 * class DataProcessor extends GObject.Object {
 *   \@Signals({
 *     // GObject signal specification (as for GObject.registerClass())
 *     'processing-complete': {
 *       param_types: [GObject.TYPE_STRING, GObject.TYPE_INT],
 *       return_type: GObject.TYPE_NONE
 *     },
 *     'error-occurred': {
 *       param_types: [GObject.TYPE_STRING],
 *       return_type: GObject.TYPE_NONE
 *     }
 *   })
 *   declare $signals: {
 *     // TypeScript signatures (must match GObject spec above)
 *     'processing-complete': (result: string, count: number) => void;
 *     'error-occurred': (message: string) => void;
 *   } & GObject.Object.SignalSignatures; // Inherit base class signals
 *
 *   // Type-safe method declarations
 *   declare emit: EmitMethod<DataProcessor>;
 *   declare connect: ConnectMethod<DataProcessor>;
 *   declare connect_after: ConnectMethod<DataProcessor>;
 *
 *   // Now you can safely use signals in your code
 * }
 * ~~~
 *
 * **Important: Manual Synchronization Required**
 * There is NO automatic synchronization between GObject signal definitions
 * and TypeScript signatures. You must manually keep them in sync:
 *
 * ~~~typescript
 * @Signals({
 *   'data-ready': {
 *     param_types: [GObject.TYPE_STRING, GObject.TYPE_INT], // ← GObject spec
 *     return_type: GObject.TYPE_NONE
 *   }
 * })
 * declare $signals: {
 *   'data-ready': (data: string, count: number) => void;    // ← TS signature (must match!)
 * }
 * ~~~
 *
 * If they get out of sync, you'll have runtime behavior that doesn't match
 * TypeScript expectations. The benefit is that both definitions are now
 * co-located in the same place, making maintenance easier.
 *
 * @example Signal return values
 * ~~~typescript
 * \@Signals({
 *   'validation-check': {
 *     param_types: [GObject.TYPE_STRING],
 *     return_type: GObject.TYPE_BOOLEAN  // Signal returns boolean
 *   }
 * })
 * declare $signals: {
 *   'validation-check': (data: string) => boolean;
 * }
 *
 * // Usage:
 * const isValid = obj.emit('validation-check', 'test-data');
 * // isValid: boolean (TypeScript knows the return type)
 * ~~~
 *
 * @example Inheriting from base class signals
 * ~~~typescript
 * // Works with existing GObject signals like 'notify'
 * obj.connect('notify', (sender, pspec) => {
 *   // Full type safety for standard GObject signals
 * });
 *
 * obj.connect('notify::property-name', () => {
 *   // Detail signals also supported
 * });
 * ~~~
 *
 * *Base Class Signal Inheritance**
 * You MUST manually include base class signal signatures using intersection types.
 * TypeScript won't automatically inherit signal types from parent classes:
 *
 * ~~~typescript
 * // Correct - includes base class signals:
 * declare $signals: {
 *   'custom-signal': (data: string) => void;
 * } & GObject.Object.SignalSignatures;  // ← Essential!
 *
 * // Wrong - base class signals not available:
 * declare $signals: {
 *   'custom-signal': (data: string) => void;
 * }; // No 'notify', 'destroy', etc. signals available
 * ~~~
 *
 * **Match Your Inheritance Chain:**
 * The signal signatures must match your class inheritance:
 *
 * ~~~typescript
 * // For GObject.Object subclass:
 * class MyObject extends GObject.Object {
 *   declare $signals: { ... } & GObject.Object.SignalSignatures;
 * }
 *
 * // For Gtk.Widget subclass:
 * class MyWidget extends Gtk.Widget {
 *   declare $signals: { ... } & Gtk.Widget.SignalSignatures;
 * }
 *
 * // For Gtk.Button subclass:
 * class MyButton extends Gtk.Button {
 *   declare $signals: { ... } & Gtk.Button.SignalSignatures;
 * }
 * ~~~
 *
 * **Maintenance Warning:**
 * If you change your base class (e.g., `extends GObject.Object` → `extends Gtk.Widget`),
 * you MUST update the signal signatures accordingly. There's no automatic checking
 * for this - it's your responsibility to keep them synchronized.
 *
 * **Why This Matters:**
 * Without proper base class inclusion, standard signals won't be type-safe:
 *
 * ~~~typescript
 * // With correct base class signatures:
 * widget.connect('notify', (sender, pspec) => {}); // Type-safe
 * button.connect('clicked', (sender) => {});        // Type-safe
 *
 * // Without base class signatures:
 * widget.connect('notify', ...);  // unknown signal
 * button.connect('clicked', ...); // unknown signal
 * ~~~
 *
 * @see {@link EmitMethod} for emit method typing
 * @see {@link ConnectMethod} for connect method typing
 * @see {@link SignalDefinition} for signal configuration format
 *
 * */
function Signals(config) {
    return function (target, _signals_key) {
        const collector = ensure_signals_collector(target.constructor);
        if (collector.size > 0) {
            throw new DecoratorError({ class: target.constructor.name, decorator: '@Signals', message: 'Signals already registered. Only one @Signals decorator per class is allowed.' });
        }
        Object.entries(config).forEach(([key, value]) => {
            collector.set(key, value);
        });
    };
}
export { Signals, };
