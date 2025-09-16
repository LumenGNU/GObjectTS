/** @file: src/Ljs/GObjectTS/Decorator.Styling.ts */
/** @fileoverview Styling decorator for GJS+Gtk TypeScript applications */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 1.0.0 */
/**
 * @changelog
 *
 * # 1.0.0 - Первый вариант
 */
/**
 * @fileoverview Styling decorator for GJS+Gtk TypeScript applications
 *
 * Provides a declarative way to apply CSS styles to Gtk.Widget classes using decorators.
 * The decorator collects styling metadata during class definition and applies it manually
 * when the display becomes available.
 *
 * @example Basic usage
 * ~~~typescript
 * import { Styling, StylePriority } from './Decorator.Styling.js';
 *
 * @Styling({
 *   CssName: 'my-widget',
 *   [StylePriority.WIDGET]: 'button { background: red; }',
 *   [StylePriority.APPLICATION]: 'resource:///my/app/styles.css'
 * })
 * class MyWidget extends Gtk.Button {
 *   // ...
 * }
 *
 * // Later, when display is available:
 * const display = this.get_display();
 * Styling.apply(display, MyWidget);
 * ~~~
 */
import GLib from 'gi://GLib?version=2.0';
import Gtk from 'gi://Gtk?version=4.0';
import { DecoratorError } from './Error.js';
import { CSS_DEPENDENCIES_COLLECTOR_KEY, CSS_NAME_COLLECTOR_KEY, STYLING_REGISTRY_COLLECTOR_KEY } from './_Private.js';
/** Specialized error class for CSS parsing failures in widget styling.
 *
 * Thrown by `Styling.apply()` when one or more CSS parsing errors occur during
 * style application. Contains detailed information about each parsing error
 * including widget class, priority level, source, and specific error locations.
 *
 * @example Error message structure
 * ~~~
 * CSS parsing errors found in widget styling:
 * MyWidget::[500]::<data>:
 *  ▪ 1:6-8 Unknown pseudoclass
 *  ▪ 3:12-15 Expected an identifier
 * AnotherWidget::[600]::styles.css:
 *  ▪ 25:1-10 Invalid property name
 * ~~~
 *
 * Message format explanation:
 * - `MyWidget::[500]::<data>:` - ClassName::[Priority]::Source:
 * - `1:6-8 Unknown pseudoclass` - Line:Column-Range Error description
 * - `<data>` - Inline CSS string source
 * - `styles.css` - External file source
 *
 * Note: This error is typically not called directly.
 * CSSParseError instances are created and thrown by `Styling.apply()`.
 *
 * @see
 * - {@link Styling.apply `Styling.apply` - Method that throws this error }
 * - {@link StylingConfig `StylingConfig` - Configuration that may cause parsing errors }
 * - {@link StylePriority `StylePriority` - Priority levels shown in error messages }
 * */
class CSSParseError extends Error {
    name = 'CSSParseError';
}
function ensure_styling_registry(target) {
    return target[STYLING_REGISTRY_COLLECTOR_KEY] ??= new Map();
}
// function ensure_styling_dependencies(target: WidgetConstructor) {
//     return (target as StylingDependenciesCarrier)[CSS_DEPENDENCIES_COLLECTOR_KEY] ??= [];
// }
/** Declarative styling decorator for Gtk.Widget classes.
 *
 * Provides a declarative way to apply CSS styles to widget classes using decorators.
 * Collects style metadata during class determination and applies it manually using
 * the `Styling.apply()` call when the display becomes available.
 *
 * ## Key Features
 *
 * - **Declarative API**: Define styles directly on widget classes
 * - **Priority-based**: Support for GTK style priority levels
 * - **Flexible sources**: CSS strings, files, or resources
 * - **Error reporting**: Detailed CSS parsing error information
 * - **Manual control**: Apply styles when display is ready
 *
 * ## Basic Usage
 *
 * @example Simple CSS styling
 * ~~~typescript
 * \@Styling({
 *   [StylePriority.WIDGET]: `
 *     my-button {
 *       background: linear-gradient(to bottom, #4CAF50, #45a049);
 *       border-radius: 4px;
 *       color: white;
 *     }
 *   `
 * })
 * class MyButton extends Gtk.Button {}
 *
 * // Apply when display is available
 * const display = this.get_display();
 * Styling.apply(display, MyButton);
 * ~~~
 *
 * @example CSS name and multiple priorities
 * ~~~typescript
 * \@Styling({
 *   CssName: 'custom-widget',
 *   [StylePriority.THEME]: `
 *     custom-widget {
 *       padding: 8px;
 *       border: 1px solid #ccc;
 *     }
 *   `,
 *   [StylePriority.WIDGET]: `
 *     custom-widget:hover {
 *       background: #f0f0f0;
 *     }
 *   `
 * })
 * class CustomWidget extends Gtk.Widget {}
 * ~~~
 *
 * @example External files and resources
 * ~~~typescript
 * \@Styling({
 *   CssName: 'themed-window',
 *   [StylePriority.THEME]: 'resource:///my/app/themes/default.css',
 *   [StylePriority.APPLICATION]: 'file:///path/to/app-overrides.css'
 * })
 * class ThemedWindow extends Gtk.ApplicationWindow {}
 * ~~~
 *
 * ## Priority System
 *
 * Higher numeric values override lower ones:
 *
 * @example Priority hierarchy
 * ~~~typescript
 * \@Styling({
 *   // Applied first - base styling
 *   [StylePriority.THEME]: 'button { background: gray; }',
 *
 *   // Applied later - overrides theme
 *   [StylePriority.APPLICATION]: 'button { background: blue; }'
 * })
 * class PriorityExample extends Gtk.Button {}
 * ~~~
 *
 * Available priorities (low to high):
 * - `DEFINITIONS` (0) - Component documentation and color definitions
 * - `FALLBACK` (1) - Default fallback styles
 * - `THEME` (200) - Theme-level styling
 * - `SETTINGS` (400) - User settings overrides
 * - `WIDGET` (500) - Widget-specific behavior
 * - `APPLICATION` (600) - Application-wide styles
 * - `USER` (800) - User customization (highest)
 *
 * ## Component Documentation Pattern
 *
 * Use `DEFINITIONS` priority to document your component's styling API:
 *
 * - {@link StylePriority `StylePriority.DEFINITIONS`}
 *
 * @example Component styling contract
 * ~~~typescript
 * \@Styling({
 *   [StylePriority.DEFINITIONS]: `
 *     // Define component color palette
 *     \@define-color my-toggle-bg-color @sidebar_bg_color;
 *     \@define-color my-toggle-text-color mix(@theme_fg_color, @theme_bg_color, 0.8);
 *     \@define-color my-toggle-hover-color alpha(mix(@my-toggle-bg-color, @accent_color, 0.35), 0.15);
 *
 *     // Component structure definitions
 *     my-toggle {
 *       // Base toggle - uses @my-toggle-bg-color
 *     }
 *
 *     my-toggle:hover {
 *       // Hover state - uses @my-toggle-hover-color
 *     }
 *
 *     my-toggle:checked {
 *       // Active state
 *     }
 *
 *     my-toggle.small {
 *       // Compact size variant
 *     }
 *   `,
 *
 *   [StylePriority.WIDGET]: `
 *     my-toggle {
 *       background: @my-toggle-bg-color;
 *       color: @my-toggle-text-color;
 *       transition: all 0.2s ease;
 *     }
 *
 *     my-toggle:hover {
 *       background: @my-toggle-hover-color;
 *     }
 *   `
 * })
 * class MyToggle extends Gtk.Widget {}
 * ~~~
 *
 * Users can then override colors at higher priorities:
 * ~~~typescript
 * \@Styling({
 *   [StylePriority.APPLICATION]: `
 *     @define-color my-toggle-bg-color @headerbar_bg_color;
 *     @define-color my-toggle-hover-color alpha(@accent_color, 0.2);
 *   `
 * })
 * class AppThemedToggle extends MyToggle {}
 * ~~~
 *
 * ## Application Integration
 *
 * @example Application startup integration
 * ~~~typescript
 * class MyApplication extends Gtk.Application {
 *   activate() {
 *     const window = new Gtk.ApplicationWindow({ application: this });
 *     const display = window.get_display();
 *
 *     // Apply all widget styles at startup
 *     try {
 *       Styling.apply(display,
 *         HeaderWidget,
 *         SidebarWidget,
 *         ContentWidget,
 *         FooterWidget
 *       );
 *     } catch (error) {
 *       if (error instanceof CSSParseError) {
 *         console.warn('CSS parsing errors:', error.message);
 *         // Continue with default styling
 *       } else {
 *         throw error;
 *       }
 *     }
 *
 *     window.present();
 *   }
 * }
 * ~~~
 *
 * @example Widget constructor integration
 * ~~~typescript
 * class StyledWidget extends Gtk.Widget {
 *   constructor() {
 *     super();
 *
 *     // Apply styles when widget is ready
 *     this.connect('realize', () => {
 *       const display = this.get_display();
 *       Styling.apply(display, StyledWidget);
 *     });
 *   }
 * }
 * ~~~
 *
 * ## Error Handling
 *
 * @example Comprehensive error handling
 * ~~~typescript
 * try {
 *   Styling.apply(display, MyWidget, AnotherWidget);
 * } catch (error) {
 *   if (error instanceof CSSParseError) {
 *     // CSS parsing failed - application can continue
 *     console.error('CSS parsing errors:', error.message);
 *
 *     if (isDevelopment()) {
 *       // Show detailed errors in development
 *       showDeveloperNotification(error);
 *     } else {
 *       // Log silently in production
 *       logger.warn('CSS styling degraded');
 *     }
 *   } else {
 *     // Unexpected error - may need to abort
 *     console.error('Unexpected styling error:', error);
 *     throw error;
 *   }
 * }
 * ~~~
 *
 * CSS parsing errors contain detailed information:
 * ~~~
 * Failed to parse CSS for the following classes for priority and source:
 * MyWidget::[500]::<data>:
 *  ▪ 1:6-8 Unknown pseudoclass
 *  ▪ 3:12-15 Expected an identifier
 * ~~~
 *
 * ## Important Limitations
 *
 * - **Manual application required**: `Styling.apply()` must be called manually
 * - **One-time consumption**: Metadata is removed after successful application
 * - **Display dependency**: Styles can only be applied when display is available
 *
 * @decorator
 * @param config {@link StylingConfig Styling configuration }
 * @returns Decorator function for widget classes
 *
 * @throws {DecoratorError} If styling already registered for the class
 *
 * @see
 * - {@link StylingConfig} Configuration object structure
 * - {@link StylePriority} Available priority levels
 * - {@link CSSParseError} CSS parsing error details
 * - {@link Styling.apply} Static method to apply collected styles
 *
 * */
const Styling = function (config) {
    const { CssName, CssDependencies, ...Styles } = config;
    config = undefined;
    return function (target) {
        if ((CSS_NAME_COLLECTOR_KEY in target) || (STYLING_REGISTRY_COLLECTOR_KEY in target) || (CSS_DEPENDENCIES_COLLECTOR_KEY in target)) {
            throw new DecoratorError({ class: target.name, decorator: '@Styling', message: 'Styling decorator already applied to this class. Each class can have only one @Styling decorator.' });
        }
        if (CssName) {
            target[CSS_NAME_COLLECTOR_KEY] = CssName;
        }
        if (CssDependencies) {
            target[CSS_DEPENDENCIES_COLLECTOR_KEY] = CssDependencies;
        }
        const style_entries = Object.entries(Styles);
        if (style_entries.length > 0) {
            const styling_registry = ensure_styling_registry(target);
            style_entries.forEach(([key, styling]) => {
                styling_registry.set(Number(key), styling);
            });
        }
    };
};
/** Applies collected styling metadata to the specified display.
 *
 * IMPORTANT: This method must be called manually - the @Styling decorator
 * only collects metadata and cannot automatically apply styles because:
 *
 * 1. **Timing**: Decorators execute during class definition when displays don't exist
 * 2. **Display selection**: Cannot determine which display to target in multi-monitor setups
 * 3. **Control**: Manual application ensures styles are applied at the right moment
 *
 * **IMPORTANT**: Styles are applied globally to the display via
 * `Gtk.StyleContext.add_provider_for_display()`, NOT to individual widget instances.
 * Once applied, the CSS becomes available for ALL widgets on that display that match
 * the defined selectors and CSS names.
 *
 * @affects Styling metadata is consumed and removed from classes after application
 * @affects Subsequent calls to apply() with the same classes will have no effect
 * @affects Each class can only have its styles applied once per application lifetime
 *
 * @param display - The Gdk.Display to apply styles to
 * @param widget_classes - Widget classes decorated with @Styling to apply styles for
 *
 * @example
 * ~~~typescript
 * // In widget constructor or after window creation:
 * const display = this.get_display();
 *
 * // First call - styles will be applied
 * Styling.apply(display, MyWidget, AnotherWidget);
 *
 * // Second call - no effect, metadata was consumed in first call
 * Styling.apply(display, MyWidget, AnotherWidget); // Does nothing
 *
 * // Different classes - will work if they have styling metadata
 * Styling.apply(display, YetAnotherWidget);
 * ~~~
 *
 * @example Basic usage
 * ~~~typescript
 * const display = this.get_display();
 *
 * // Styles become available globally on this display
 * Styling.apply(display, MyWidget, AnotherWidget);
 *
 * // ALL instances of MyWidget on this display will use the styles
 * const widget1 = new MyWidget(); // Styled
 * const widget2 = new MyWidget(); // Also styled
 * ~~~
 *
 * @throws {Error} If CSS parsing fails during style application
 *
 * @see
 * - {@link Styling} Main decorator documentation with detailed examples
 * - {@link CSSParseError} Error details and handling patterns
 * */
// Styling.apply = function (display: Gdk.Display, widget_class: WidgetConstructor) {
//     const all_parsing_errors = new Map<string, string>();
//     apply_for_class(display, false, widget_class, all_parsing_errors);
//     if (all_parsing_errors.size > 0) {
//         const message = [] as string[];
//         message.push('CSS parsing errors found in widget styling:');
//         all_parsing_errors.forEach((value, key) => {
//             message.push(`${key}:`);
//             message.push(value);
//         });
//         throw new CSSParseError(message.join('\n'));
//     }
// };
/** Applies collected styling metadata to the specified display.
 *
 * @param display - The Gdk.Display to apply styles to
 * @param widget_classes - Widget classes decorated with @Styling to apply styles for
 *
 * @example
 * ~~~typescript
 * const display = this.get_display();
 * Styling.apply(display, MyWidget, AnotherWidget);
 * ~~~
 */
Styling.apply = function (display, ...widget_classes) {
    apply_for_classes(display, ...widget_classes);
};
function apply_for_classes(display, ...widget_classes) {
    const all_parsing_errors = new Map();
    widget_classes.forEach((widget_class) => {
        apply_for_class(display, widget_class, all_parsing_errors);
    });
    if (all_parsing_errors.size > 0) {
        const message = [];
        message.push('CSS parsing errors found in widget styling:');
        all_parsing_errors.forEach((value, key) => {
            message.push(`${key}:`);
            message.push(value);
        });
        throw new CSSParseError(message.join('\n'));
    }
}
function apply_for_class(display, widget_class, all_parsing_errors) {
    // Сначала обрабатываем CSS зависимости рекурсивно
    if (CSS_DEPENDENCIES_COLLECTOR_KEY in widget_class) {
        const dependencies = widget_class[CSS_DEPENDENCIES_COLLECTOR_KEY];
        if (dependencies && dependencies.length > 0) {
            dependencies.forEach((dependency_class) => {
                apply_for_class(display, dependency_class, all_parsing_errors);
            });
        }
        delete widget_class[CSS_DEPENDENCIES_COLLECTOR_KEY];
    }
    // Затем обрабатываем собственные стили класса
    if (STYLING_REGISTRY_COLLECTOR_KEY in widget_class) {
        try {
            const collector = ensure_styling_registry(widget_class);
            collector.forEach((styling, priority) => {
                const css_provider = Gtk.CssProvider.new();
                const parsing_error_buffer = new Map();
                const error_hid = css_provider.connect('parsing-error', function (_source, css_section, gerror) {
                    parsing_error_buffer.set(css_section.to_string(), gerror.message);
                });
                try {
                    const uri = GLib.Uri.parse(styling, GLib.UriFlags.NONE);
                    const scheme = uri.get_scheme();
                    if (scheme === 'resource') {
                        css_provider.load_from_resource(uri.get_path());
                    }
                    else if (scheme === 'file') {
                        css_provider.load_from_path(uri.get_path());
                    }
                    else {
                        throw new Error(`Unsupported URI scheme for ${widget_class.name}. Supported schemes: 'resource', 'file'. Got: ${scheme}`);
                    }
                }
                catch (error) {
                    if (!(error instanceof GLib.UriError))
                        throw new Error(`Unexpected error while loading styling for ${widget_class.name}: ${error.message}`, { cause: error });
                    css_provider.load_from_string(styling);
                }
                finally {
                    css_provider.disconnect(error_hid);
                }
                if (parsing_error_buffer.size > 0) {
                    parsing_error_buffer.forEach((value, key) => {
                        const [source, line, ...columns] = key.split(':');
                        const identifier = `${widget_class.name}::[${priority}]::${source}`;
                        if (all_parsing_errors.has(identifier)) {
                            all_parsing_errors.set(identifier, `${all_parsing_errors.get(identifier)}\n – ${line}:${columns} ${value}`);
                        }
                        else {
                            all_parsing_errors.set(identifier, ` – ${line}:${columns} ${value}`);
                        }
                    });
                }
                Gtk.StyleContext.add_provider_for_display(display, css_provider, priority);
            });
        }
        finally {
            // Consume styling metadata - prevents reapplication and frees memory
            delete widget_class[STYLING_REGISTRY_COLLECTOR_KEY];
        }
    }
}
/** Applies collected styling metadata to the specified display without consuming metadata.
 *
 * Same as {@link Styling.apply} but preserves styling metadata after application,
 * allowing multiple applications to different displays or reapplication after
 * display changes.
 *
 * **Use rarely** - typically only needed for:
 * - Multi-display applications
 * - Dynamic display switching
 * - Development/testing scenarios
 *
 * @param display - The Gdk.Display to apply styles to
 * @param widget_classes - Widget classes decorated with @Styling
 *
 * @throws {CSSParseError} If CSS parsing fails during style application
 *
 * @example Multi-display usage
 * ~~~typescript
 * const primaryDisplay = Gdk.Display.get_default();
 * const secondaryDisplay = getSecondaryDisplay();
 *
 * // Apply to both displays, preserving metadata
 * Styling.applyPreserve(primaryDisplay, MyWidget);
 * Styling.applyPreserve(secondaryDisplay, MyWidget);
 * ~~~
 *
 * @see {@link Styling.apply} Standard method that consumes metadata */
// Styling.applyPreserve = function (display: Gdk.Display, ...widget_classes: WidgetConstructor[]) {
//     apply_for_classes(display, true, ...widget_classes);
// };
// function apply_for_classes(display: Gdk.Display, preserve: boolean, ...widget_classes: WidgetConstructor[]) {
//     const all_parsing_errors = new Map<string, string>();
//     widget_classes.forEach((widget_class) => {
//         apply_for_class(display, preserve, widget_class, all_parsing_errors);
//     });
//     if (all_parsing_errors.size > 0) {
//         const message = [] as string[];
//         message.push('CSS parsing errors found in widget styling:');
//         all_parsing_errors.forEach((value, key) => {
//             message.push(`${key}:`);
//             message.push(value);
//         });
//         throw new CSSParseError(message.join('\n'));
//     }
// }
// function apply_for_class(display: Gdk.Display, preserve: boolean, widget_class: WidgetConstructor, all_parsing_errors: Map<string, string>) {
//     if (STYLING_REGISTRY_COLLECTOR_KEY in widget_class) {
//         try {
//             const collector = ensure_styling_registry(widget_class);
//             collector.forEach((styling, priority) => {
//                 const css_provider = Gtk.CssProvider.new();
//                 const parsing_error_buffer = new Map<string, string>();
//                 const error_hid = css_provider.connect('parsing-error',
//                     function (_source: Gtk.CssProvider, css_section: Gtk.CssSection, gerror: GLib.Error) {
//                         parsing_error_buffer.set(css_section.to_string(), gerror.message);
//                     });
//                 // String interpretation behavior is consistent with GTK Template handling
//                 // in org/gnome/gjs/modules/core/overrides/Gtk.js
//                 // WARNING: Be prepared for CSS parsing errors with messages like
//                 // "<data>:1:10-12: Unknown pseudoclass" if the string resembles a URI
//                 // but is not a valid URI (e.g., contains colons in CSS selectors).
//                 try {
//                     const uri = GLib.Uri.parse(styling, GLib.UriFlags.NONE);
//                     const scheme = uri.get_scheme();
//                     if (scheme === 'resource') {
//                         css_provider.load_from_resource(uri.get_path());
//                     } else if (scheme === 'file') {
//                         css_provider.load_from_path(uri.get_path());
//                     } else {
//                         throw new Error(`Unsupported URI scheme for ${widget_class.name}. Supported schemes: 'resource', 'file'. Got: ${scheme}`);
//                     }
//                 } catch (error) {
//                     if (!(error instanceof GLib.UriError))
//                         throw new Error(`Unexpected error while loading styling for ${widget_class.name}: ${(error as Error).message}`, { cause: error });
//                     css_provider.load_from_string(styling);
//                 }
//                 finally {
//                     css_provider.disconnect(error_hid);
//                 }
//                 if (parsing_error_buffer.size > 0) {
//                     parsing_error_buffer.forEach((value, key) => {
//                         const [source, line, ...columns] = key.split(':');
//                         const identifier = `${widget_class.name}::[${priority}]::${source}`;
//                         if (all_parsing_errors.has(identifier)) {
//                             all_parsing_errors.set(identifier, `${all_parsing_errors.get(identifier)}\n ▪ ${line}:${columns} ${value}`);
//                         }
//                         else {
//                             all_parsing_errors.set(identifier, ` ▪ ${line}:${columns} ${value}`);
//                         }
//                     });
//                 }
//                 Gtk.StyleContext.add_provider_for_display(display, css_provider, priority);
//             });
//         } finally {
//             // Consume styling metadata - prevents reapplication and frees memory
//             // Subsequent calls to apply() with this class will have no effect
//             if (!preserve) delete widget_class[STYLING_REGISTRY_COLLECTOR_KEY];
//         }
//     }
// }
export { Styling, CSSParseError };
