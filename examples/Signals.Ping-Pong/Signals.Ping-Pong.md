# PingPong Widget Example

## Important Note on UI Architecture

**For complex UI applications, consider declarative approaches** using expressions, closures, and activities rather than imperative signal handling. Signal-based architecture can quickly become unmaintainable "spaghetti code" when overused.

**Modern UI patterns like reactive programming, data binding, and computed properties** often provide cleaner solutions than manual signal connections.

**This example demonstrates signals because:** you asked for it, and sometimes signals are the right tool. But don't use this pattern everywhere - use it judiciously.

## Target Audience

**Developers with GTK experience** transitioning to GJS/TypeScript who want to understand:
- How to structure signal-based components properly
- Advanced signal patterns not covered in basic documentation
- Integration of TypeScript decorators with GObject signals

## Complexity Level

**Intermediate** - assumes familiarity with:
- GTK widget hierarchy and lifecycle
- GObject signal system concepts
- Basic TypeScript/JavaScript

## What This Example Shows

**Signal Architecture Patterns:**
- Component-to-parent communication via custom signals
- Signal as request pattern (not just notifications)
- Temporary signal connections with proper cleanup
- Integration with GTK animation system

**Integration Points:**
- Template-based UI definition
- CSS styling separated from logic
- TypeScript type safety throughout

## Architecture Overview

### Component Structure

~~~
TestWindow (Adw.ApplicationWindow)
├── PingPong (Custom Gtk.Box)
│   ├── ping_button (Gtk.Button)
│   ├── scale (Gtk.Scale)
│   └── pong_button (Gtk.Button)
└── auto_kick_button (Gtk.ToggleButton)
~~~

### Signal Flow Architecture

User Interaction Flow:

    User clicks Ping/Pong button
    Button emits native 'clicked' signal
    PingPong catches it, emits custom 'ball-kick' signal
    TestWindow handles 'ball-kick', triggers animation
    Animation completes, emits 'ball-in-player' signal
    Cycle continues with auto-kick logic

Configuration Flow:

    PingPong emits 'auto-kick-request' signal (request pattern)
    TestWindow returns boolean based on toggle button state
    PingPong stores result and uses for auto-play logic

### Key Architectural Decisions

**Separation of Concerns:**
- **PingPong widget**: Game logic and custom signals
- **TestWindow**: UI coordination and configuration
- **Template**: Declarative UI structure
- **CSS**: Visual feedback and animations

**Signal Patterns Used:**
- **Event bubbling**: Component signals bubble up to parent
- **Request pattern**: Child asks parent for configuration
- **Temporary connections**: Animation callbacks with cleanup
- **Fallback handling**: Default behavior via `connect_after`

### Why Signals Here?

This example uses signals because:
- **Component communication**: Clean parent-child messaging
- **Animation integration**: GTK animation system is callback-based
- **Configuration injection**: Parent controls child behavior
- **Event-driven timing**: Auto-kick logic based on animation completion

**Note:** Many of these patterns could be replaced with reactive approaches in larger applications.

Key Patterns Explained
1. Signal as Request Pattern

~~~typescript

// PingPong asks parent for configuration
'auto-kick-request': () => boolean;

// Child requests information:
this.auto_kick = this.emit('auto-kick-request');

// Parent provides answer:
this.ping_pong.connect('auto-kick-request', () => {
    return this.auto_kick_button.get_active();
});
~~~

Why this pattern?

    Dependency Injection: Child doesn't know about UI controls
    Configuration: Parent controls child behavior without tight coupling
    Return Values: Signal returns actual data, not just notification

Alternative approaches:

    Constructor parameters (less flexible)
    Property binding (more complex setup)
    Direct parent reference (tight coupling)

2. Temporary Signal Connections

const animation_hid = this.animation.connect('done', () => {
    this.emit('ball-in-player', next_player);
    this.animation.disconnect(animation_hid);  // ← Critical cleanup
});

Why temporary connections?

    One-shot callbacks: Only needed for single animation cycle
    Memory management: Prevents handler accumulation
    Lifecycle control: Connection lifetime matches animation lifetime

Common mistake: Forgetting disconnect() leads to handler leaks.

3. Accumulator with Fallback

// Signal definition with accumulator:
'auto-kick-request': {
    return_type: GObject.TYPE_BOOLEAN,
    accumulator: GObject.AccumulatorType.FIRST_WINS  // ← Takes first handler's result
}

// Fallback handler (runs after all others):
this.connect_after('auto-kick-request', () => {
    throw new Error('auto-kick-request никто не обработал!');
});

How it works:

    Multiple handlers can connect to signal
    FIRST_WINS accumulator stops after first non-null return
    connect_after runs only if no handler provided result
    Provides graceful fallback mechanism

4. Signal Chaining Architecture

// Chain: button.clicked → ball-kick → animation → ball-in-player
this.ping_button.connect('clicked', (sender) => {
    this.emit('ball-kick', sender);           // Transform native to custom
});

this.ping_pong.connect('ball-kick', (_, player) => {
    this.ping_pong.kick(player);              // Trigger action
});

// Inside kick() method:
animation.connect('done', () => {
    this.emit('ball-in-player', next_player); // Continue chain
});

Benefits:

    Loose coupling: Each component only knows immediate neighbors
    Composability: Easy to insert/remove intermediate steps
    Testability: Each signal can be tested independently

5. Visual Feedback via Signals

this.ping_pong.connect('ball-kick', (_, player) => {
    player.add_css_class('kicker');           // Visual feedback
    setTimeout(() => {
        player.remove_css_class('kicker');    // Cleanup
    }, 500);
});

Pattern: Signals trigger visual changes, CSS handles presentation.

Separation of concerns:

    Logic component: Emits semantic events
    UI controller: Maps events to visual changes
    CSS: Defines actual visual presentation

Anti-Patterns to Avoid

Don't: Store signal handlers without cleanup

// Bad - handler never removed
this.animation.connect('done', () => { ... });

Don't: Mix logic and presentation

// Bad - visual logic in game component
player.set_background_color(red);  // Should use CSS classes

Don't: Deep signal chains without documentation

// Bad - hard to follow signal flow
signal1 → signal2 → signal3 → signal4 → ...

Code Walkthrough
PingPong Widget Implementation
Signal Definitions

@Signals({
    'ball-kick': {
        param_types: [Gtk.Button.$gtype]        // Pass button object
    },
    'ball-in-game': {},                         // No parameters
    'ball-in-player': {
        param_types: [Gtk.Button.$gtype],       // Current player
    },
    'auto-kick-request': {
        return_type: GObject.TYPE_BOOLEAN,      // Request returns value
        accumulator: GObject.AccumulatorType.FIRST_WINS
    }
})
declare $signals: Gtk.Box.SignalSignatures & {
    'ball-kick': (player: Gtk.Button) => void;
    'ball-in-game': () => void;
    'ball-in-player': (player: Gtk.Button) => void;
    'auto-kick-request': () => boolean;
};

Critical points:

    GObject definition (param_types) must match TypeScript signature
    Manual synchronization required - no automatic validation
    & Gtk.Box.SignalSignatures inherits base class signals

Animation Integration

const animation_hid = this.animation.connect('done', () => {
    this.emit('ball-in-player', target_player);
    this.animation.disconnect(animation_hid);
});

this.animation.play();

Animation callback pattern:

    Store handler ID before starting animation
    Emit signal when animation completes
    Always disconnect to prevent memory leaks
    TypeScript infers callback parameter types

Configuration via Signals

public game() {
    this.auto_kick = this.emit('auto-kick-request');  // Get config from parent
    this.emit('ball-in-player', this.ping_button);    // Start game
}

Request pattern implementation:

    Child asks parent for configuration on startup
    Parent returns boolean via signal return value
    Child stores result for later use
    Decouples child from parent's UI structure

TestWindow Integration
Signal Handler Setup

this.ping_pong.connect('auto-kick-request', () => {
    return this.auto_kick_button.get_active();        // Provide configuration
});

this.ping_pong.connect('ball-kick', (_, player) => {
    player.add_css_class('kicker');                   // Visual feedback
    setTimeout(() => {
        player.remove_css_class('kicker');
    }, 500);

    this.ping_pong.kick(player);                      // Trigger action
});

Parent responsibilities:

    Provide configuration when requested
    Coordinate visual feedback
    Delegate actions back to child components
    Manage CSS class lifecycle

Template Integration

<object class="PingPong" id="ping_pong">
    <property name="vexpand">true</property>
    <property name="halign">fill</property>
</object>

Template benefits:

    Declarative widget hierarchy
    Properties set at design time
    Automatic child binding via @Template.Child
    Separation of structure from logic

CSS Integration

@keyframes kick {
    1%   { border-color: @accent_bg_color; }
    49%  { border-color: transparent; }
    100% { border-color: @error_bg_color; }
}

.player.kicker {
    animation: kick 0.3s infinite;
}

CSS-Signal interaction:

    Signals trigger class changes
    CSS defines visual presentation
    Animation timing independent of code
    System colors for theme consistency

Error Handling

this.connect_after('auto-kick-request', () => {
    throw new Error('auto-kick-request никто не обработал!');
});

Fallback pattern:

    connect_after runs only if no other handler provided result
    Prevents silent failures in configuration
    Documents expected signal contracts
    Development-time safety net

Conclusion
Key Takeaways

Signal Architecture Patterns:

    Request Pattern: Use signals for configuration and dependency injection
    Temporary Connections: Always disconnect animation and one-shot handlers
    Event Bubbling: Let child components emit semantic events, parents handle coordination
    Fallback Handlers: Use connect_after for graceful error handling

Integration Points:

    Template + Signals: Declarative UI structure with imperative event handling
    CSS + Signals: Visual feedback triggered by events, styled with CSS
    Animation + Signals: Callback-based animation integrated with signal flow
    TypeScript Safety: Full type checking for signal names and parameters

When to Use These Patterns

Good Use Cases:

    Component libraries with reusable widgets
    Event-driven animations and transitions
    Parent-child configuration patterns
    Integration with callback-based GTK APIs

Avoid When:

    Simple forms with basic interactions
    Data-heavy applications (use reactive patterns)
    Complex state management (consider state machines)
    Rapid prototyping (signals add ceremony)

Performance Considerations

Signal Overhead:

    Each signal connection has memory cost
    Temporary connections must be cleaned up
    Deep signal chains add call stack depth
    Consider direct method calls for hot paths

Memory Management:

    Always disconnect() temporary handlers
    Be careful with closure captures in callbacks
    Monitor handler accumulation in long-lived widgets

Next Steps

Simpler Examples: Start with basic button-to-parent communication before attempting this level of complexity.

Advanced Patterns:

    Signal composition and middleware
    Error propagation through signal chains
    Integration with reactive frameworks
    Testing strategies for signal-based components

Final Notes

This example demonstrates intermediate-level GTK development with TypeScript decorators. The patterns shown here are powerful but come with complexity overhead.

Remember: Modern UI frameworks often provide cleaner alternatives to manual signal handling. Use these patterns judiciously and consider declarative approaches for complex applications.

The decorators (@Signals, @Template, @Styling) provide the foundation for maintainable GJS development, but architecture decisions remain your responsibility.
