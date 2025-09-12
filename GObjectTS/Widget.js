import GObject from 'gi://GObject?version=2.0';
import { check_template_collector, delete_property_collector, delete_signals_collector, delete_template_collector, get_property_collector, get_signals_collector, template_collector, child_collector, 
// internal_child_collector,
check_child_collector, delete_child_collector, check_actions_collector, bind_actions_collector, delete_handler_actions_collector, delete_bind_actions_collector, check_handler_actions_collector, handler_actions_collector,
// check_internal_child_collector,
// delete_internal_child_collector
 } from './_Private.js';
import { DecoratorError } from './Error.js';
import { css_name_collector } from './_Private.js';
function prepare_err_context(target, decorator_name, error) {
    return {
        class: target.name,
        decorator: decorator_name,
        ...error,
    };
}
/** Интерфейс для работы с GTK виджетами.
 *
 * Предоставляет специализированные декораторы для регистрации и настройки
 * GTK виджетов, включая шаблоны и стилизацию.
 *
 * @affects Расширяет базовую регистрацию GObject для виджетов.
 * @affects Интегрируется с системой шаблонов и стилей GTK.
 *
 * Регистрирует класс в системе типов GObject, и выполняет дополнительные
 * настройки для GTK виджетов.
 *
 * Автоматически настраивает дополнительные возможности виджетов.
 *
 * @affects Регистрирует класс через {@link GObject.registerClass}.
 * @affects Выполняет дополнительную работу.
 *
 * @returns RegistrationDecorator ограниченный типом Gtk.WidgetClass.
 */
function Widget(config) {
    const construct_metadata /* // @todo GObject.MetaInfo<> */ = (config === undefined) ? {} : (typeof config === 'string') ? { GTypeName: config } : config;
    return function (target) {
        // @todo checks
        const properties = get_property_collector(target);
        delete_property_collector(target); // сразу удаляем, чтобы не было проблем с циклическими ссылками // @todo
        if (properties !== undefined) {
            construct_metadata.Properties = Object.fromEntries(properties);
        }
        const signals = get_signals_collector(target);
        delete_signals_collector(target); // сразу удаляем, // @todo
        if (signals !== undefined) {
            construct_metadata.Signals = Object.fromEntries(signals);
        }
        if (check_template_collector(target)) {
            construct_metadata.Template = target[template_collector];
            delete_template_collector(target); // сразу удаляем, чтобы не было проблем с циклическими ссылками // @todo
        }
        if (check_child_collector(target)) {
            construct_metadata.Children = target[child_collector];
            delete_child_collector(target);
        }
        if (css_name_collector in target) {
            construct_metadata.CssName = target[css_name_collector];
            delete target[css_name_collector];
        }
        // if(check_internal_child_collector(target)) {
        //     construct_metadata.InternalChildren = (target as any)[internal_child_collector];
        //     delete_internal_child_collector(target);
        // }
        try {
            const registered_class = GObject.registerClass(construct_metadata, target);
            // @todo интересно - GObject.registerClass добавляет свои символы в прототип, что в них? они нужны?
            // почему не удаляет?
            // Cleanup: удаляем символы-мусор после регистрации
            // @fixme - я только предполагаю что эти символы - мусор, а может и не мусор!
            // Object.getOwnPropertySymbols(registered_class).forEach(symbol => {
            //     // @ts-ignore
            //     delete registered_class[symbol]; // это ничего не сломало в простом примере
            // });
            if (check_actions_collector(target)) {
                target[bind_actions_collector].forEach((canonical_name, action_name) => {
                    registered_class.install_property_action(action_name, canonical_name);
                });
                delete_bind_actions_collector(target);
            }
            if (check_handler_actions_collector(target)) {
                const ACTIONS_HANDLERS_MAP_KEY = Symbol('widget::actions::handlers_map');
                registered_class[ACTIONS_HANDLERS_MAP_KEY] = new Map();
                const ACTIONS_ROUTER_KEY = Symbol('widget::actions::router');
                registered_class[ACTIONS_ROUTER_KEY] = function (widget, action_name, parameter) {
                    const handler = registered_class[ACTIONS_HANDLERS_MAP_KEY].get(action_name); //?.call(widget, parameter);
                    // @ts-ignore
                    widget[handler].call(widget, parameter);
                };
                target[handler_actions_collector].forEach((action_param, action_name) => {
                    //    registered_class.install_action(action_name, action_param.parameter_type, Reflect.get(registered_class, action_param.handler_key));
                    //    // Создаем wrapper, который вызывает метод инстанса
                    //     registered_class.install_action(action_name, action_param.parameter_type, function(widget, actionName, parameter) {
                    //         // widget - это инстанс виджета, на котором активировалось действие
                    //         // Вызываем метод на инстансе
                    //         const method = widget[action_param.handler_key];
                    //         if (typeof method === 'function') {
                    //             return method.call(widget, actionName, parameter);
                    //         }
                    //     });
                    // const ACTIONS_HANDLER_KEY = Symbol(`widget::actions::handler-key::${action_name}`);
                    // (registered_class as any)[ACTIONS_HANDLER_KEY] = function (widget: Gtk.Widget, action_name: string, parameter: GLib.Variant | null) {
                    //     (widget as any)[action_param.handler_key].call(widget, action_name, parameter);
                    // };
                    registered_class[ACTIONS_HANDLERS_MAP_KEY].set(action_name, action_param.handler_key);
                    registered_class.install_action(action_name, action_param.parameter_type, registered_class[ACTIONS_ROUTER_KEY]);
                });
                delete_handler_actions_collector(target);
            }
        }
        catch (error) {
            throw new DecoratorError(prepare_err_context(target, '@Widget', { message: `Class registration error: ${error.message}` }));
        }
    };
}
export { Widget };
//
/** Интерфейс для подключения шаблонов виджета.
 *
 * Позволяет определить UI структуру виджета декларативно через
 * XML (GtkBuilder) или Blueprint форматы.
 *
 * @affects Смешение XML и Bpl декораторов для декорации одного класса
 *   не допускается.
 * @affects Устанавливает шаблон через {@link Gtk.Widget.set_template}.
 * @affects Автоматически связывает элементы шаблона со свойствами класса.
 */
Widget.Template = function (XML) {
    return function (target) {
        if (check_template_collector(target)) {
            throw new DecoratorError(prepare_err_context(target, '@Widget.Template.XML.FromString', { message: 'Template already defined' }));
        }
        else {
            target[template_collector] = XML;
        }
    };
};
function ensure_child_collector(target) {
    return target[child_collector] ??= [];
}
// function ensure_internal_child_collector(target: Function): string[] {
//     return (target as any)[internal_child_collector] ??= [];
// }
/** Пространство имён для декораторов связывающих свойства класса с
 * элементами из XML/Blueprint шаблона виджета.
 *
 * Предоставляет декораторы для связывания свойств класса с элементами
 * из XML/Blueprint шаблона виджета (смотри {@link Gtk.Widget.set_template}).
 *
 * @affects Декораторы связывают свойства класса с объектами из шаблона.
 * @affects Создаёт автоматическую инициализацию при создании виджета. */
const Template = {
    /** Связывает свойство класса с дочерним элементом из шаблона.
     *
     * Автоматически получает ссылку на элемент с соответствующим id
     * из XML/Blueprint шаблона при инициализации виджета.
     *
     * @affects Свойство будет автоматически инициализировано при создании
     * виджета.
     * @affects Имя свойства должно совпадать с id элемента в шаблоне.
     *
     * @param internal Если true,( // @fixme )По умолчанию false.
     *
     * @returns PropertyDecorator применимый только к Gtk.Widget.
     */
    Child: function (target, property_key) {
        ensure_child_collector(target.constructor).push(property_key);
    },
    // => PropertyDecorator<Gtk.Widget>,
    /** Альтернативное имя для Child (нужен по стилистическим соображениям).
     *
     * Смотри {@link Template.Child} */
    //Object: (internal?: boolean) => PropertyDecorator<Gtk.Widget>,
};
export { Template };
export { Styling } from './Styling.js';
