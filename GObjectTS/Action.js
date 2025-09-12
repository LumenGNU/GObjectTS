import GLib from 'gi://GLib?version=2.0';
import { get_property_collector, bind_actions_collector, handler_actions_collector, check_actions_collector } from './_Private.js';
import { DecoratorError } from './Error.js';
import GObject from 'gi://GObject?version=2.0';
function ensure_property_action_collector(target) {
    return target[bind_actions_collector] ??= new Map();
}
function ensure_handler_action_collector(target) {
    return target[handler_actions_collector] ??= new Map();
}
const Action = {
    /** Устанавливает и связывает свойство с GTK действием.
     *
     * Устанавливает действие с именем action_name на декорированный класс-виджет,
     * и связывает его состояние со значением свойства, к которому применяется
     * декоратор.
     *
     * @see
     * - {@link https://docs.gtk.org/gtk4/class_method.Widget.install_property_action.html}
     *
     * @affects Изменение свойства будет активировать действие.
     * @affects Действие будет изменять свойство.
     * @affects Свойство должно иметь совместимый тип с действием.
     *
     * @param action_name Полное имя действия (например, 'app.quit').
     *
     * ~~~typescript
     * class MyWindow extends Adw.ApplicationWindow {
     *     \@Action.Bind('app.counter')
     *     \@Property.Int(0)
     *     declare counter: number;
     *
     *     \@Action.Bind('app.precision-value')
     *     \@Property.Double(3.14159)
     *     declare precision_value: number;
     * }
     * ~~~
     *
     * Limitations
     *
     * Type Support: Currently only string, boolean, int and double types are fully supported
     * Action Scope:
     * Property Requirements: Properties must be declared with @Property decorator
     * GObject Constraints: Follows GObject property naming conventions
     *
     * @returns PropertyDecorator применимый только к Gtk.Widget. */
    Bind: function (action_name) {
        return (target, property_key) => {
            const properties = get_property_collector(target.constructor);
            if (properties === undefined || !properties.has(property_key)) {
                throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Bind', 'js-property': property_key, message: '@Action.Bind must be used together with a @Property decorator and applied after it.' });
            }
            const property_actions = ensure_property_action_collector(target.constructor);
            if (property_actions.has(action_name)) {
                // @fixme
                throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Bind', 'js-property': property_key, message: 'Action name already registered for property ...' });
            }
            const param_spec = properties.get(property_key);
            const param_type = param_spec.value_type;
            if (![
                GObject.TYPE_INT.name,
                GObject.TYPE_UINT.name,
                GObject.TYPE_DOUBLE.name,
                GObject.TYPE_BOOLEAN.name,
                GObject.TYPE_STRING.name,
            ].includes(param_type.name)) {
                throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Bind', 'js-property': property_key, message: `@Action.Bind decorator cannot be used with property type '${param_type.name}'. See: https://docs.gtk.org/gtk4/class_method.Widget.install_property_action.html` });
            }
            ensure_property_action_collector(target.constructor).set(action_name, param_spec.get_name());
        };
    },
    /** Регистрирует метод как обработчик GTK действия.
     *
     * Метод будет вызываться при активации указанного действия.
     * Должен быть статическим методом с сигнатурой {@link Gtk.WidgetActionActivateFunc}.
     *
     * @affects Регистрирует действие на уровне класса виджета.
     * @affects Метод должен быть статическим.
     *
     * @param action_name Имя действия (без префикса группы).
     * @param parameter_type Тип параметра GVariant для действия или null.
     *
     * @returns MethodDecorator с проверкой сигнатуры функции.
     */
    // Handler: function (action_name: string, parameter_type?: string | null) /*: MethodDecorator<Gtk.WidgetClass, Gtk.WidgetActionActivateFunc>*/ {
    //     return (target: any /*Gtk.WidgetClass*/, handler_key: string): void => {
    //         if (parameter_type) {
    //             if (!GLib.VariantType.string_is_valid(parameter_type)) {
    //                 throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: `Invalid type ... ${parameter_type}` });
    //             }
    //         }
    //         const collector = ensure_handler_action_collector(target);
    //         if (check_actions_collector(target)) {
    //             if (ensure_property_action_collector(target.constructor).has(action_name)) {
    //                 // @fixme
    //                 throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: 'Action name already registered for property ...' });
    //             }
    //         }
    //         if (collector.has(action_name)) {
    //             // @fixme
    //             throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: 'Action name already registered for handler  ...' });
    //         }
    //         collector.set(action_name, { handler_key: handler_key, parameter_type: parameter_type ?? null });
    //     };
    // },
    InstallAction: function (action_name, parameter_type) {
        return (target, handler_key) => {
            if (parameter_type) {
                if (!GLib.VariantType.string_is_valid(parameter_type)) {
                    throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: `Invalid type ... ${parameter_type}` });
                }
            }
            const collector = ensure_handler_action_collector(target.constructor);
            if (check_actions_collector(target.constructor)) {
                if (ensure_property_action_collector(target.constructor).has(action_name)) {
                    // @fixme
                    throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: 'Action name already registered for property ...' });
                }
            }
            if (collector.has(action_name)) {
                // @fixme
                throw new DecoratorError({ class: target.constructor.name, decorator: '@Action.Handler', 'js-method': handler_key, message: 'Action name already registered for handler  ...' });
            }
            collector.set(action_name, { handler_key: handler_key, parameter_type: parameter_type ?? null });
        };
    },
};
export { Action };
