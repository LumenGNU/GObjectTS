# Декоратор @AddSignalMethods

Декоратор для интеграции сигнальной системы GJS в нативные TypeScript классы. Предоставляет типизированную обертку над `Signals.addSignalMethods` для использования событийной модели в классах, которые не наследуют от `GObject.Object`.

## Назначение

`@AddSignalMethods` решает задачу добавления событийной модели в обычные TypeScript классы с полной типизацией и совместимостью с сигнальной системой GObject. Подходит для бизнес-логики, контроллеров, сервисных классов и других компонентов, которым нужна событийная архитектура.

## Синтаксис

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
} from 'GObjectTS/SignalMethods.ts';

\@AddSignalMethods
class MyClass {
    declare emit: SignalMethods<MySignals>['emit'];
    declare connect: SignalMethods<MySignals>['connect'];
    declare connectAfter: SignalMethods<MySignals>['connectAfter'];
    declare disconnect: SignalMethods<MySignals>['disconnect'];
    declare disconnectAll: SignalMethods<MySignals>['disconnectAll'];
    declare signalHandlerIsConnected: SignalMethods<MySignals>['signalHandlerIsConnected'];
}
~~~

## Определение сигналов

Сначала определите интерфейс с сигнатурами сигналов:

~~~typescript
interface MyClassSignals {
    'started': () => boolean;
    'progress': (completed: number, total: number) => boolean;
    'finished': (result: string) => boolean;
    'error': (message: string, code?: number) => boolean;
}
~~~

Правила для сигнатур:

- Все сигналы должны возвращать boolean
- Первый параметр (globalThis) в обработчик подставляется автоматически
- Параметры соответствуют аргументам, передаваемым в `emit()`

## Основные примеры

### Простой класс с событиями

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface TaskManagerSignals {
    'task-added': (task: Task) => boolean;
    'task-completed': (taskId: string) => boolean;
    'all-completed': () => boolean;
}

@AddSignalMethods
class TaskManager {
    declare emit: SignalsMethods<TaskManagerSignals>['emit'];
    declare connect: SignalsMethods<TaskManagerSignals>['connect'];
    declare disconnect: SignalsMethods<TaskManagerSignals>['disconnect'];
    declare disconnectAll: SignalsMethods<TaskManagerSignals>['disconnectAll'];

    private tasks: Task[] = [];

    addTask(task: Task) {
        this.tasks.push(task);
        this.emit('task-added', task);
    }

    completeTask(taskId: string) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = true;
            this.emit('task-completed', taskId);
            
            if (this.tasks.every(t => t.completed)) {
                this.emit('all-completed');
            }
        }
    }
}
~~~

### Подключение обработчиков

~~~typescript
const taskManager = new TaskManager();

// Обработчик без параметров
taskManager.connect('all-completed', () => {
    console.log('Все задачи выполнены!');
    return SignalPropagate.CONTINUE;
});

// Обработчик с типизированными параметрами
taskManager.connect('task-added', (_globalThis, task: Task) => {
    console.log(`Добавлена задача: ${task.title}`);
    
    // Можно остановить дальнейшую обработку
    if (task.priority === 'critical') {
        return SignalPropagate.STOP;
    }
    
    return SignalPropagate.CONTINUE;
});

// Обработчик с connectAfter (вызывается после всех connect)
const handlerId = taskManager.connectAfter('task-completed', (_globalThis, taskId: string) => {
    console.log(`Задача ${taskId} завершена (connectAfter)`);
    return SignalPropagate.CONTINUE;
});

// Отключение конкретного обработчика
taskManager.disconnect(handlerId);

// Отключение всех обработчиков
taskManager.disconnectAll();
~~~

### Управление распространением

Используйте `SignalPropagate` для контроля эмиссии:

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface ValidationSignals {
    'validate-input': (value: string) => boolean;
    'validation-complete': (isValid: boolean) => boolean;
}

@AddSignalMethods
class InputValidator {
    declare emit: SignalsMethods<ValidationSignals>['emit'];
    declare connect: SignalsMethods<ValidationSignals>['connect'];

    validate(input: string): boolean {
        // Эмитим сигнал валидации
        this.emit('validate-input', input);
        
        // Логика валидации...
        const isValid = input.length > 0;
        
        this.emit('validation-complete', isValid);
        return isValid;
    }
}

const validator = new InputValidator();

// Первый валидатор - проверка длины
validator.connect('validate-input', (_globalThis, value: string) => {
    if (value.length === 0) {
        console.log('Пустое значение!');
        return SignalPropagate.STOP; // Остановить дальнейшую валидацию
    }
    return SignalPropagate.CONTINUE;
});

// Второй валидатор - не выполнится если первый вернул STOP
validator.connect('validate-input', (_globalThis, value: string) => {
    if (!/^[a-zA-Z]+$/.test(value)) {
        console.log('Только буквы разрешены!');
        return SignalPropagate.STOP;
    }
    return SignalPropagate.CONTINUE;
});
~~~

### Управление жизненным циклом

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface NetworkManagerSignals {
    'connection-changed': (connected: boolean) => boolean;
    'data-received': (data: unknown) => boolean;
}

@AddSignalMethods
class NetworkManager {
    declare emit: SignalsMethods<NetworkManagerSignals>['emit'];
    declare connect: SignalsMethods<NetworkManagerSignals>['connect'];
    declare disconnect: SignalsMethods<NetworkManagerSignals>['disconnect'];
    declare disconnectAll: SignalsMethods<NetworkManagerSignals>['disconnectAll'];
    declare signalHandlerIsConnected: SignalsMethods<NetworkManagerSignals>['signalHandlerIsConnected'];

    private external_connections: number[] = [];

    constructor() {
        // Подключаемся к внешним объектам
        this.external_connections.push(
            some_external_service.connect('status-changed', this.onExternalStatusChanged.bind(this))
        );
    }

    destroy() {
        // Отключаем внешние подключения
        this.external_connections.forEach(id => {
            if (some_external_service.signalHandlerIsConnected(id)) {
                some_external_service.disconnect(id);
            }
        });
        this.external_connections = [];

        // Отключаем все внутренние обработчики
        this.disconnectAll();
    }

    private onExternalStatusChanged(connected: boolean) {
        this.emit('connection-changed', connected);
        return SignalPropagate.CONTINUE;
    }
}
~~~

### Интеграция с GObject классами

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface CustomWidgetSignals {
    'data-loaded': (data: DataModel) => boolean;
    'user-action': (action: string, params: unknown) => boolean;
}

// Сервисный класс с событиями
@AddSignalMethods
class DataService {
    declare emit: SignalsMethods<CustomWidgetSignals>['emit'];
    declare connect: SignalsMethods<CustomWidgetSignals>['connect'];

    async loadData(): Promise<void> {
        const data = await fetch('/api/data');
        this.emit('data-loaded', data);
    }
}

// GTK виджет использующий сервис
@Widget()
class MyWidget extends Gtk.Widget {

    private dataService = new DataService();

    constructor() {
        super();
        
        // Подключаемся к событиям сервиса
        this.dataService.connect('data-loaded', (_globalThis, data: DataModel) => {
            this.updateUI(data);
            return SignalPropagate.CONTINUE;
        });
    }

    private updateUI(data: DataModel) {
        // Обновление интерфейса
    }
}
~~~

## Утилитарные типы

### SignalsMethods<T>

Типизированный интерфейс для всех методов сигнальной системы:

~~~typescript
interface SignalsMethods<S extends Record<keyof S, (...args: any[]) => boolean>> {
    emit: <K extends SignalNames<S>>(signal: K, ...args: Parameters<S[K]>) => void;
    connect: <K extends SignalNames<S>>(signal: K, callback: GObject.SignalCallback<typeof globalThis, S[K]>) => number;
    connectAfter: <K extends SignalNames<S>>(signal: K, callback: GObject.SignalCallback<typeof globalThis, S[K]>) => number;
    disconnect: (handler_id: number) => void;
    disconnectAll: () => void;
    signalHandlerIsConnected: (handler_id: number) => boolean;
}
~~~

### SignalPropagate

Константы для управления распространением сигналов:

~~~typescript
const SignalPropagate = {
    CONTINUE: false,  // Продолжить эмиссию
    STOP: true        // Остановить эмиссию
};
~~~

## Особенности и ограничения

Отличия от GObject сигналов

Аспект	            @AddSignalMethods	GObject сигналы
------------------|-------------------|------------------
Первый параметр	    globalThis	        sender объект
Регистрация	        Не требуется	    Через GObject.registerClass
Типизация
Наследование	    Нативные классы	    GObject классы
Производительность	Легковесная	        Оптимизированная C реализация

### Рекомендации

Используйте когда:

- Нужна событийная модель в нативных классах
- Требуется полная типизация сигналов
- Класс не должен наследовать от GObject
- Важна читаемость и поддержка кода

Не используйте когда:

- Класс уже наследует от GObject.Object
- Нужна максимальная производительность
- Требуется сложная логика сигналов (детали, blocking)

~~~typescript
// Хорошо: Четкие имена сигналов и типизация
interface FileManagerSignals {
    'file-created': (path: string, size: number) => boolean;
    'file-deleted': (path: string) => boolean;
    'operation-progress': (completed: number, total: number) => boolean;
}

// Хорошо: Группировка связанных методов
@AddSignalMethods
class FileManager {
    declare emit: SignalsMethods<FileManagerSignals>['emit'];
    declare connect: SignalsMethods<FileManagerSignals>['connect'];
    declare disconnect: SignalsMethods<FileManagerSignals>['disconnect'];
    declare disconnectAll: SignalsMethods<FileManagerSignals>['disconnectAll'];
    
    // Бизнес логика
}

// Плохо: Смешивание с GObject наследованием
@AddSignalMethods  // Не нужно - у GObject.Object уже есть сигналы
class BadExample extends GObject.Object {
    // ...
}
~~~

## Еще примеры

**MVC контроллер**

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface AppControllerSignals {
    'view-changed': (viewName: string) => boolean;
    'model-updated': (modelName: string, data: unknown) => boolean;
    'error-occurred': (error: Error) => boolean;
}

@AddSignalMethods
class AppController {
    declare emit: SignalsMethods<AppControllerSignals>['emit'];
    declare connect: SignalsMethods<AppControllerSignals>['connect'];

    private currentView: string = 'main';

    navigateTo(viewName: string) {
        if (this.currentView !== viewName) {
            this.currentView = viewName;
            this.emit('view-changed', viewName);
        }
    }

    updateModel(modelName: string, data: unknown) {
        try {
            // Логика обновления модели
            this.emit('model-updated', modelName, data);
        } catch (error) {
            this.emit('error-occurred', error as Error);
        }
    }
}
~~~

**Система уведомлений**

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
    SignalPropagate,
} from 'GObjectTS/SignalMethods.ts';

interface NotificationServiceSignals {
    'notification-added': (notification: Notification) => boolean;
    'notification-dismissed': (id: string) => boolean;
    'notifications-cleared': () => boolean;
}

@AddSignalMethods
class NotificationService {
    declare emit: SignalsMethods<NotificationServiceSignals>['emit'];
    declare connect: SignalsMethods<NotificationServiceSignals>['connect'];

    private notifications: Map<string, Notification> = new Map();

    show(notification: Notification) {
        this.notifications.set(notification.id, notification);
        this.emit('notification-added', notification);
    }

    dismiss(id: string) {
        if (this.notifications.delete(id)) {
            this.emit('notification-dismissed', id);
        }
    }

    clearAll() {
        this.notifications.clear();
        this.emit('notifications-cleared');
    }
}
~~~

## См. также

- [Декоратор @Signals - для GObject классов](Decorator.Signals.md)
- [GJS Signals Documentation](https://gjs-docs.gnome.org/gjs/signals.md)
- [Код реализации addSignalMethods в GJS](org/gnome/gjs/modules/core/_signals.js)
- [Дополнительные примеры](examples/Signals.Tick.ts/Signals.Tick.WithoutGObject.ts)
