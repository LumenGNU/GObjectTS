import GObject from "gi://GObject?version=2.0";
import { delete_property_collector, delete_signals_collector, get_property_collector, get_signals_collector, } from "./_Private.js";
import { DecoratorError } from "./Error.js";
function Interface(config) {
    // @fixme
    const construct_metadata = (config === undefined) ? { Requires: [GObject.Object] } : (typeof config === 'string') ? { GTypeName: config, Requires: [GObject.Object] } : config;
    // @fixme abstract +  extends GObject.Interface
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
            throw new DecoratorError({ class: target.name, decorator: '@Interface', message: `Interface registration error: ${error.message}` });
        }
    };
}
export { Interface };
// @fixme нужно?
export const { TypeFlags } = GObject;
