# Decorator @AddSignalMethods

Decorator for integrating GJS signal system into native GJS classes. Provides a typed wrapper over `Signals.addSignalMethods` for using event model in classes that don't inherit from `GObject.Object`.

## See also

- [Decorator @Signals - for GObject classes](Signals.md)
- [GJS Signals Documentation](https://gjs-docs.gnome.org/gjs/signals.md)
- [addSignalMethods implementation code in GJS](https://gitlab.gnome.org/GNOME/gjs/-/blob/master/modules/core/_signals.js)
- [Additional examples](examples/Tick/NativeGJSSignalSystem.ts)


## Purpose

`@AddSignalMethods` solves the task of adding event model to regular GJS classes with full TypeScript typing and compatibility with GObject signal system. Suitable for business logic, controllers, service classes and other components that need event architecture.


## Requirements

**Mandatory dependencies:**
- @girs types version `4.0.0-beta.25` or higher

> Important: Earlier versions of @girs (before 4.0.0-beta.25) don't contain type definitions for GObject.SignalCallback, which will lead to typing errors when using.


## Syntax

~~~typescript
import {
    AddSignalMethods,
    SignalMethods,
} from 'GObjectTS/SignalMethods.ts';

@AddSignalMethods
class MyClass {
    declare emit: SignalMethods<MySignals>['emit'];
    declare connect: SignalMethods<MySignals>['connect'];
    declare connectAfter: SignalMethods<MySignals>['connectAfter'];
    declare disconnect: SignalMethods<MySignals>['disconnect'];
    declare disconnectAll: SignalMethods<MySignals>['disconnectAll'];
    declare signalHandlerIsConnected: SignalMethods<MySignals>['signalHandlerIsConnected'];
}
~~~

## Signal Definition

First, define an interface with signal signatures:

~~~typescript
interface MyClassSignals {
    'started': () => boolean;
    'progress': (completed: number, total: number) => boolean;
    'finished': (result: string) => boolean;
    'error': (message: string, code?: number) => boolean;
}
~~~

Rules for signatures:

- All signals must return `boolean`
- First parameter (`globalThis`) is automatically injected into the handler
- Parameters correspond to arguments passed to `emit()`


## Basic Examples

### Simple class with events

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

### Connecting handlers

~~~typescript
const taskManager = new TaskManager();

// Handler without parameters
taskManager.connect('all-completed', () => {
    console.log('All tasks completed!');
    return SignalPropagate.CONTINUE;
});

// Handler with typed parameters
taskManager.connect('task-added', (_globalThis, task: Task) => {
    console.log(`Task added: ${task.title}`);
    
    // Can stop further processing
    if (task.priority === 'critical') {
        return SignalPropagate.STOP;
    }
    
    return SignalPropagate.CONTINUE;
});

// Handler with connectAfter (called after all connect handlers)
const handlerId = taskManager.connectAfter('task-completed', (_globalThis, taskId: string) => {
    console.log(`Task ${taskId} completed (connectAfter)`);
    return SignalPropagate.CONTINUE;
});

// Disconnect specific handler
taskManager.disconnect(handlerId);

// Disconnect all handlers
taskManager.disconnectAll();
~~~

### Propagation Control

Use `SignalPropagate` to control emission:

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
        // Emit validation signal
        this.emit('validate-input', input);
        
        // Validation logic...
        const isValid = input.length > 0;
        
        this.emit('validation-complete', isValid);
        return isValid;
    }
}

const validator = new InputValidator();

// First validator - length check
validator.connect('validate-input', (_globalThis, value: string) => {
    if (value.length === 0) {
        console.log('Empty value!');
        return SignalPropagate.STOP; // Stop further validation
    }
    return SignalPropagate.CONTINUE;
});

// Second validator - won't execute if first returned STOP
validator.connect('validate-input', (_globalThis, value: string) => {
    if (!/^[a-zA-Z]+$/.test(value)) {
        console.log('Only letters allowed!');
        return SignalPropagate.STOP;
    }
    return SignalPropagate.CONTINUE;
});
~~~

### Lifecycle Management

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
        // Connect to external objects
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

        // Disconnect all internal handlers
        this.disconnectAll();
    }

    private onExternalStatusChanged(connected: boolean) {
        this.emit('connection-changed', connected);
        return SignalPropagate.CONTINUE;
    }
}
~~~

### Integration with GObject classes

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

// Service class with events
@AddSignalMethods
class DataService {
    declare emit: SignalsMethods<CustomWidgetSignals>['emit'];
    declare connect: SignalsMethods<CustomWidgetSignals>['connect'];

    async loadData(): Promise<void> {
        const data = await fetch('/api/data');
        this.emit('data-loaded', data);
    }
}

// GTK widget using the service
@Widget()
class MyWidget extends Gtk.Widget {

    private dataService = new DataService();

    constructor() {
        super();
        
        // Connect to service events
        this.dataService.connect('data-loaded', (_globalThis, data: DataModel) => {
            this.updateUI(data);
            return SignalPropagate.CONTINUE;
        });
    }

    private updateUI(data: DataModel) {
        // UI update
    }
}
~~~


## Utility Types


### SignalMethods<T>

Typed interface for all signal system methods:

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

Constants for controlling signal propagation:

~~~typescript
const SignalPropagate = {
    CONTINUE: false,  // Continue emission
    STOP: true        // Stop emission
};
~~~

## Features and Limitations

Differences from GObject signals

Aspect	          | AddSignalMethods    | GObject signals
------------------|---------------------|------------------
First parameter	  | globalThis	        | sender object
Registration	  | Not required	    | Via GObject.registerClass
Inheritance	      | Native GJS classes	| GObject classes
Performance       | Lightweight	        | Optimized C implementation

### Recommendations

Use when:

- Need event model in native classes
- Full signal typing is required
- Class shouldn't inherit from GObject
- Code readability and maintenance are important

Don't use when:

- Class already inherits from GObject.Object
- Maximum performance is needed
- Complex signal logic is required (details, blocking)

~~~typescript
// Good: Clear signal names and typing
interface FileManagerSignals {
    'file-created': (path: string, size: number) => boolean;
    'file-deleted': (path: string) => boolean;
    'operation-progress': (completed: number, total: number) => boolean;
}

// Good: Grouping related methods
@AddSignalMethods
class FileManager {
    declare emit: SignalsMethods<FileManagerSignals>['emit'];
    declare connect: SignalsMethods<FileManagerSignals>['connect'];
    declare disconnect: SignalsMethods<FileManagerSignals>['disconnect'];
    declare disconnectAll: SignalsMethods<FileManagerSignals>['disconnectAll'];
    
    // Business logic
}

~~~

## More Examples

**MVC Controller**

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
            // Model update logic
            this.emit('model-updated', modelName, data);
        } catch (error) {
            this.emit('error-occurred', error as Error);
        }
    }
}
~~~

**Notification System**

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

