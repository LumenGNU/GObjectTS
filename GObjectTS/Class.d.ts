import GObject from "gi://GObject?version=2.0";
import { ClassConfig, ClassDecorator } from "./_Private.js";
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
declare function Class(config?: ClassConfig): ClassDecorator<GObject.ObjectClass>;
export { Class };
export declare const TypeFlags: typeof GObject.TypeFlags;
