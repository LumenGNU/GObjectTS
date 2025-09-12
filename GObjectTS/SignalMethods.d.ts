/** @file: src/SignalMethods.ts */
/** @fileoverview: TypeScript decorator for GJS signal system integration */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 2.0.0 */
/**
 * @changelog
 *
 * # 2.0.0 - Теперь это - декоратор
 *
 * # 1.0.0 - Первый вариант
 */
import type GObject from 'gi://GObject?version=2.0';
export type SignalNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => boolean ? K : never;
}[keyof T];
interface SignalMethods<S extends Record<keyof S, (...args: any[]) => boolean>> {
    /** Emits a signal for the object.
     * Signal emission stops if a handler returns true.
     * @param signal Signal name
     * @param args Signal arguments */
    emit: <K extends SignalNames<S>>(signal: K, ...args: Parameters<S[K]>) => void;
    /** Connects a callback to a signal by name. Pass the returned ID to
     * `disconnect()` to remove the handler.
     * If callback returns true, emission stops and other handlers aren't called.
     * Note: Unlike GObject signals, this signal in callback always refers to globalThis. */
    connect: <K extends SignalNames<S>>(signal: K, callback: GObject.SignalCallback<typeof globalThis, S[K]>) => number;
    /** Connects a callback to a signal by name (after other handlers).
     * Pass the returned ID to `disconnect()` to remove the handler.
     * If callback returns true, emission stops and other handlers aren't called.
     * Note: Unlike GObject signals, this signal in callback always refers to globalThis. */
    connectAfter: <K extends SignalNames<S>>(signal: K, callback: GObject.SignalCallback<typeof globalThis, S[K]>) => number;
    /** Disconnects a signal handler.
     * @param handler_id Handler ID to disconnect */
    disconnect: (handler_id: number) => void;
    /** Disconnects all signal handlers. */
    disconnectAll: () => void;
    /** Checks if a handler ID is connected.
     * @param handler_id Handler ID to check
     * @returns true if connected, false otherwise */
    signalHandlerIsConnected: (handler_id: number) => boolean;
}
type NotGObjectClass<T> = T extends new (...args: any[]) => GObject.Object ? "ERROR: @AddSignalMethods cannot be used on classes that extend GObject.Object" : T;
/** Decorator @AddSignalMethods provides a wrapper over {@link https://gjs-docs.gnome.org/gjs/signals.md Signals.addSignalMethods}
 * for using signal system in native GJS classes.
 *
 * Integrates GObject-compatible signal system into native classes that don't inherit from GObject.Object.
 *
 * SignalPropagate constants control signal emission:
 * - `CONTINUE` (false): continue calling other handlers
 * - `STOP` (true): stop emission, don't call remaining handlers
 *
 * ### Usage
 *
 * ~~~typescript
 * // Define signal signatures
 * interface MyClassSignals {
 *    'started': () => boolean;
 *    'progress': (completed: number, total: number) => boolean;
 *    'finished': (result: string) => boolean;
 * }
 *
 * \@AddSignalMethods
 * export class MyClassWithSignals {
 *     // Declare typed signal methods
 *     declare emit: SignalMethods<MyClassSignals>['emit'];
 *     declare connect: SignalMethods<MyClassSignals>['connect'];
 *     declare connectAfter: SignalMethods<MyClassSignals>['connectAfter'];
 *     declare disconnect: SignalMethods<MyClassSignals>['disconnect'];
 *     declare disconnectAll: SignalMethods<MyClassSignals>['disconnectAll'];
 *     declare signalHandlerIsConnected: SignalMethods<MyClassSignals>['signalHandlerIsConnected'];
 *
 *     start_work() {
 *         this.emit('started');
 *         this.emit('progress', 50, 100);
 *         this.emit('finished', 'success');
 *     }
 * }
 * ~~~
 *
 * ### Features
 * - Full signal typing with IDE autocompletion
 * - GObject signal system compatibility
 * - Propagation control via SignalPropagate.CONTINUE/STOP
 *
 * ### When to use
 * For business logic, controllers, service classes that need event model
 * but don't need to inherit from GObject.Object.
 *
 * Documentation: {@link https://github.com/LumenGNU/GObjectTS/blob/main/Decorator/AddSignalMethods.md } */
declare const AddSignalMethods: <T extends new (...args: any[]) => object>(target: NotGObjectClass<T>) => void;
/** Signal propagation control constants */
declare const SignalPropagate: Readonly<{
    /** Continue emission */
    CONTINUE: false;
    /** Continue emission */
    STOP: true;
}>;
export { SignalPropagate, SignalMethods, AddSignalMethods };
