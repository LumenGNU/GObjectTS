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
const AddSignalMethods = function (target) {
    imports.signals.addSignalMethods(target.prototype);
};
/** Signal propagation control constants */
const SignalPropagate = Object.freeze({
    /** Continue emission */
    CONTINUE: false,
    /** Continue emission */
    STOP: true
});
export { SignalPropagate, AddSignalMethods };
