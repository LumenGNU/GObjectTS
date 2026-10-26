# TODO: включить `ParamSpec.spec.ts`

**Статус:** спеки отключены (`ParamSpec.spec.ts--` не собирается `tsc`), потому что не соответствуют реализации
`src/Property.ParamSpec.ts`. Проверено при миграции на `@girs/*` 5.5.0 — к миграции не относится.

## Результат пробного запуска

204 спека, 92 падают, остальные 112 проходят.

### 1. Форма метаданных (88 падений)

`describe('Правильно создают метаданные из пустых параметров, если возможно:')` ждёт

```ts
{ type: 'boolean', params: { canonical_name: 'param' } }
```

реализация отдаёт

```ts
{ 'param-spec-type': 'boolean', params: { name: 'param' } }
```

Решить, какая форма окончательная (скорее всего, реализация), и привести спеки в соответствие.

### 2. Проверки аргументов (4 падения)

`***_param_spec: Генерируют ошибку если получают не правильные параметры`, например `object_param_spec` не бросает
исключение для не-типов: проверки `g_type` в `src/Property.ParamSpec.ts` закомментированы (`@fixme`).
Либо вернуть проверки, либо убрать эти тесты.

## Чтобы включить

1. Переименовать `ParamSpec.spec.ts--` в `ParamSpec.spec.ts`.
2. Исправить импорты: `../Decorator.Property.ParamSpec.js` -> `../Property.ParamSpec.js`,
   `../Decorator.Property.ParamSpec.GLib.js` -> `../Property.ParamSpec.GLib.js`.
3. Добавить `@types/jasmine` (^5.1.8) в `devDependencies` корневого `package.json`.
4. Установить [jasmine-gjs](https://github.com/ptomato/jasmine-gjs) (команда `jasmine`; в apt его нет).
5. Закрыть пункты 1 и 2, затем запускать:

   ```bash
   npx tsc && jasmine --module GObjectTS/specs/ParamSpec.spec.js
   ```

6. Добавить скрипт `test` в `package.json`.
