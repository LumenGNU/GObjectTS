/** @file: src/Ljs/GObjectTS/Signals.ts */
/** @fileoverview: Type-safe GObject signal decorator for TypeScript */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 1.0.0 */
/**
 * @changelog
 *
 * # 1.0.0 - Первый вариант
 *  */
/**
 * @fileoverview Type-safe GObject signal decorator for TypeScript
 *
 * Provides declarative signal registration with compile-time type safety
 * for GObject-based classes. Enables TypeScript autocomplete and type
 * checking for signal names and callback signatures.
 *
 * @requires ts-for-gir v4.0.0-beta.24 or higher
 * @see https://github.com/gjsify/ts-for-gir/releases/tag/v4.0.0-beta.24
 */
import GObject from "gi://GObject?version=2.0";
import { PropertyDecorator, SignalDefinition } from './_Private.js';
/** Type constraint for objects that have a $signals property.
 *
 * Used internally by the @Signals decorator to ensure it's only
 * applied to classes with the required $signals declaration. */
type TypeWithSignals = {
    $signals: any;
};
/** Utility type that extracts signal names from a class's $signals property.
 *
 * Ensures that signal keys are strings and all values are functions.
 * Used internally by EmitMethod and ConnectMethod for type safety.
 *
 * @template T - Class with defined $signals property
 * @returns Union of signal names or never if invalid */
type SignalKeyType<T extends {
    $signals: {
        [K in keyof T['$signals']]: (...args: any[]) => any;
    };
}> = keyof T['$signals'] extends string ? keyof T['$signals'] : never;
/** Type-safe interface for the `emit` method on classes with defined signals.
 *
 * Overrides the standard GObject emit method signature to restrict it to only
 * signals declared in the class's `$signals` property. Provides compile-time
 * validation of signal names and parameter types.
 *
 * **Usage Pattern:**
 * This interface is designed to be used with TypeScript's `declare` keyword
 * to override the emit method's type without changing its runtime behavior.
 *
 * **Runtime vs Compile-time:**
 * - Runtime: Uses the original GObject.Object.prototype.emit method
 * - Compile-time: TypeScript uses this interface for type checking
 *
 * @template T - GObject class that extends GObject.Object and has `$signals` property
 *
 * @example Basic usage
 * ~~~typescript
 * class MyObject extends GObject.Object {
 *   declare $signals: {
 *     'data-ready': (data: string) => void;
 *     'processing': (progress: number) => boolean;
 *   };
 *   declare emit: EmitMethod<MyObject>;
 *
 *   someMethod() {
 *     this.emit('data-ready', 'hello');           // Valid
 *     const result = this.emit('processing', 50); // Valid, result: boolean
 *     this.emit('unknown', 'test');               // Compile error
 *     this.emit('data-ready');                    // Compile error - missing param
 *     this.emit('data-ready', 123);               // Compile error - wrong type
 *   }
 * }
 * ~~~
 *
 * @example Signal return values
 * ~~~typescript
 * declare $signals: {
 *   'validate': (input: string) => boolean;
 *   'process': () => void;
 * };
 *
 * // TypeScript correctly infers return types:
 * const isValid: boolean = this.emit('validate', 'test'); // boolean
 * const nothing: void = this.emit('process');             // void
 * ~~~
 *
 * @see {@link ConnectMethod} for connect method typing
 * @see {@link Signals} for signal registration
 */
interface EmitMethod<T extends GObject.Object & {
    $signals: {
        [K in keyof T['$signals']]: (...args: any[]) => any;
    };
}> {
    <K extends SignalKeyType<T>>(signal: K, ...args: Parameters<T['$signals'][K]>): ReturnType<T['$signals'][K]>;
}
/** Type-safe interface for `connect` and `connect_after` methods on classes
 * with defined signals.
 *
 * Overrides the standard GObject connect method signatures to restrict them to only
 * signals declared in the class's `$signals` property. Provides compile-time
 * validation of signal names and callback parameter types.
 *
 * **GObject Signal Callback Convention:**
 * All signal callbacks receive the sender object as the first parameter, followed
 * by the signal-specific parameters. This interface enforces this convention.
 *
 * **Usage Pattern:**
 * This interface is designed to be used with TypeScript's `declare` keyword
 * to override the connect methods' types without changing their runtime behavior.
 *
 * **Runtime vs Compile-time:**
 * - Runtime: Uses the original GObject.Object.prototype.connect method
 * - Compile-time: TypeScript uses this interface for type checking
 *
 * @template T - GObject class that extends GObject.Object and has $signals property
 *
 * @returns Connection handler ID (number) for use with disconnect()
 *
 * @example Basic signal connection
 * ~~~typescript
 * class MyObject extends GObject.Object {
 *   declare $signals: {
 *     'data-ready': (data: string, count: number) => void;
 *     'error': (message: string) => void;
 *   };
 *   declare connect: ConnectMethod<MyObject>;
 *
 *   setupConnections() {
 *     // Valid connections with full type safety:
 *     this.connect('data-ready', (sender, data, count) => {
 *       // sender: MyObject (auto-inferred)
 *       // data: string, count: number (from signal signature)
 *       console.log(`Received: ${data}, count: ${count}`);
 *     });
 *
 *     const handlerId = this.connect('error', (sender, message) => {
 *       // sender: MyObject, message: string
 *       console.error('Error occurred:', message);
 *     });
 *
 *     // Later disconnect:
 *     this.disconnect(handlerId);
 *   }
 * }
 * ~~~
 *
 * @example Type checking prevents errors
 * ~~~typescript
 * // These cause compile-time errors:
 * this.connect('unknown-signal', () => {});           // Invalid signal name
 * this.connect('error', (sender, count: number) => {}); // Wrong parameter type
 * ~~~
 *
 * @example Working with inherited signals
 * ~~~typescript
 * // Works with standard GObject signals:
 * this.connect('notify', (sender, pspec) => {
 *   // sender: MyObject, pspec: GObject.ParamSpec
 *   console.log('Property changed:', pspec?.get_name());
 * });
 *
 * // Detail signals (notify::property-name) also supported:
 * this.connect('notify::some-property', (sender, pspec) => {
 *   // Called only when 'some-property' changes
 * });
 * ~~~
 *
 * @example Sender type inference for subclasses
 * ~~~typescript
 * class CustomButton extends Gtk.Button {
 *   declare $signals: { 'custom-click': () => void } & Gtk.Button.SignalSignatures;
 *   declare connect: ConnectMethod<CustomButton>;
 *
 *   customMethod() { return 'custom'; }
 * }
 *
 * const btn = new CustomButton();
 * btn.connect('custom-click', (sender) => {
 *   // sender: CustomButton (not just Gtk.Button!)
 *   console.log(sender.customMethod()); // TypeScript knows about customMethod
 * });
 * ~~~
 *
 * @see {@link EmitMethod} for emit method typing
 * @see {@link Signals} for signal registration
 * @see GObject.SignalCallback for the underlying callback type
 */
interface ConnectMethod<T extends GObject.Object & {
    $signals: {
        [K in keyof T['$signals']]: (...args: any[]) => any;
    };
}> {
    <K extends SignalKeyType<T>>(signal: K, callback: GObject.SignalCallback<T, T['$signals'][K]>): number;
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
declare function Signals(config: Record<string, SignalDefinition>): PropertyDecorator<GObject.Object & TypeWithSignals, '$signals'>;
export { Signals, };
export type { ConnectMethod, EmitMethod, SignalDefinition, };
