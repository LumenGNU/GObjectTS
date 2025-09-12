import GObject from "gi://GObject?version=2.0";
import { delete_property_collector, delete_signals_collector, get_property_collector, get_signals_collector } from "./_Private.js";
import { DecoratorError } from "./Error.js";
function prepare_err_context(target, decorator_name, error) {
    return {
        class: target.name,
        decorator: decorator_name,
        ...error,
    };
}
/** Интерфейс для работы с базовыми GObject классами.
 *
 * Предоставляет декоратор для регистрации класса в системе типов GObject.
 * Применяется к классам, наследующим GObject.Object напрямую.
 *
 * @affects Регистрирует класс через {@link GObject.registerClass}.
 * @affects Добавляет GType метаданные в прототип класса.
 *  Регистрирует класс в системе типов GObject.
 *
 * Обёртка над {@link GObject.registerClass} с типобезопасностью.
 * Используется для классов, которые наследуют GObject.Object. Не должен,
 * но может, применятся к GTK виджетами).
 *
 * @affects Класс получает уникальный GType в системе GObject.
 * @affects Автоматически регистрирует свойства и сигналы класса.
 *
 * @returns RegistrationDecorator ограниченный типом GObject.ObjectClass.
 *
 * @example
 * ```typescript
 * \@Class.RegisterClass({
 *     GTypeName: 'MyDataModel',
 *     GTypeFlags: GObject.TypeFlags.NONE
 * })
 * class MyDataModel extends GObject.Object {
 *     // ...
 * }
 * ``` */
function Class(config) {
    const construct_metadata /* // @todo GObject.MetaInfo<> */ = (config === undefined) ? {} : (typeof config === 'string') ? { GTypeName: config } : config;
    return function (target) {
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
        try {
            const registered_class = GObject.registerClass(construct_metadata, target);
            // @todo интересно - GObject.registerClass добавляет свои символы в прототип, что в них? они нужны?
            // почему не удаляет?
            // Cleanup: удаляем символы-мусор после регистрации
            // @fixme - я только предполагаю что эти символы - мусор, а может и не мусор!
            // @fixme
            // Object.getOwnPropertySymbols(registered_class).forEach(symbol => {
            //     // @ts-ignore
            //     delete registered_class[symbol]; // это ничего не сломало **в простом** примере
            // });
        }
        catch (error) {
            throw new DecoratorError(prepare_err_context(target, '@Class', { message: `Class registration error: ${error.message}` }));
        }
    };
}
export { Class };
