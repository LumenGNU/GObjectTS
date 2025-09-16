/** @file: src/Ljs/GObjectTS/Decorator.Styling.ts */
/** @fileoverview Styling decorator for GJS+Gtk TypeScript applications */
/** @license: https://www.gnu.org/licenses/gpl.txt */
/** @version: 1.0.0 */
/**
 * @changelog
 *
 * # 1.0.0 - Первый вариант
 */
import type Gdk from 'gi://Gdk?version=4.0';
import type { WidgetClassDecorator, WidgetConstructor } from './_Private.js';
/**
 * IMPORTANT NOTES FOR DEVELOPERS:
 *
 * 1. **CSS Comments in Examples**:
 *    Examples in this file use `//` comments for readability in TypeScript context.
 *    In actual CSS code, you MUST use `/\u002A \u002A/` comments instead:
 *
 *    WRONG (documentation only):
 *    ~~~css
 *    button {
 *      // This won't work in real CSS
 *      color: red;
 *    }
 *    ~~~
 *
 *    CORRECT (real CSS):
 *    ~~~css
 *    button {
 *      /\u002A This is proper CSS comment \u002A/
 *      color: red;
 *    }
 *    ~~~
 *
 * 2. **IDE Syntax Highlighting**:
 *    For better development experience with CSS-in-JS template literals,
 *    install IDE plugins such as:
 *
 *    - **VS Code**: "es6-string-html" by Tobermory
 *    - **WebStorm**: Built-in language injection support
 *    - **Vim/Neovim**: vim-javascript with template literal support
 *
 *    These plugins will provide CSS syntax highlighting and validation inside
 *    template strings tagged with /\u002Acss\u002A/`...` or within @Styling decorator strings.
 *
 *    @example VS Code with es6-string-html
 *    ~~~typescript
 *    @Styling({
 *      [StylePriority.WIDGET]: /\u002Acss\u002A/`
 *        my-widget {
 *          background: #f0f0f0; // Highlighted as CSS
 *          border-radius: 4px;
 *        }
 *      `
 *    })
 *    class MyWidget extends Gtk.Widget {}
 *    ~~~
 */
/** Configuration object for the `@Styling` decorator.
 *
 * @interface StylingConfig
 * @property CssName Optional CSS name to set for the widget class.
 *   Sets semantic name used as CSS type selector.
 *   Allows complete visual redefinition of the widget.
 *
 * @property CSS styles mapped to priority levels.
 *   Keys must be numbers (preferably {@link StylePriority `StylePriority`} enum values).
 *   Values can be CSS strings, file:// URLs, or resource:// URLs.
 *
 * @example
 * ~~~typescript
 * const config: StylingConfig = {
 *   CssName: 'custom-button',
 *   [StylePriority.WIDGET + 10]: '.custom-button { color: blue; }',
 *   [StylePriority.APPLICATION]: 'file:///path/to/styles.css',
 *   [600]: 'resource:///app/theme.css'
 * };
 * ~~~
 *
 * @example CssName usage
 * ~~~typescript
 * @Styling({
 *   CssName: 'my-btn',
 *   [StylePriority.WIDGET]: `
 *     my-btn {
 *       background: linear-gradient(to bottom, #ff6b6b, #ee5a52);
 *       border-radius: 50%;
 *       color: white;
 *       // Completely redefines appearance - doesn't look like original widget
 *     }
 *   `
 * })
 * class MyCustomButton extends Gtk.Label {} // Can make Label look like Button
 * ~~~
 *
 * @example Semantic naming
 * ~~~typescript
 * @Styling({
 *   CssName: 'button',  // Makes widget styleable as 'button'
 *   [StylePriority.WIDGET]: `
 *     button {
 *       // This widget will inherit all button styling
 *       padding: 8px 16px;
 *       border: 1px solid #ccc;
 *     }
 *   `
 * })
 * class ButtonLikeWidget extends Gtk.Widget {} // Looks like button
 * ~~~ */
type StylingConfig = {
    CssName?: string;
    CssDependencies?: WidgetConstructor[];
} & Record<number, string>;
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
declare class CSSParseError extends Error {
    readonly name = "CSSParseError";
}
/** CSS style provider priority levels for GTK StyleContext.
 *
 * Defines the order of CSS rule application. Higher numeric values are applied later
 * and are more likely to override previous rules with lower priority.
 *
 * Corresponds to GTK constants from GTK_STYLE_PROVIDER_PRIORITY_USER
 * to GTK_STYLE_PROVIDER_PRIORITY_FALLBACK:
 * - USER: 800        - User CSS files (highest)
 * - APPLICATION: 600 - Application-wide styles
 * - WIDGET: 500      - Widget-specific styles
 * - SETTINGS: 400    - User settings overrides
 * - THEME: 200       - Theme-provided styles
 * - FALLBACK: 1      - Default fallback styles
 * - DEFINITIONS: 0   - Internal definitions
 *
 * @example Basic usage
 * ~~~typescript
 * @Styling({
 *   // Lower priority - applied first
 *   [StylePriority.THEME]: 'button { background: gray; }',
 *
 *   // Higher priority - overrides theme
 *   [StylePriority.APPLICATION]: 'button { background: blue; }'
 *
 *   // Widget-specific behavior
 *   [StylePriority.WIDGET]: `
 *     .my-btn:hover {
 *       background: #f0f0f0;
 *     }
 *     .my-btn:active {
 *       background: #e0e0e0;
 *     }
 *   `,
 * })
 * class MyButton extends Gtk.Button {}
 * ~~~
 *
 * @see {@link https://docs.gtk.org/gtk4/type_func.StyleContext.add_provider_for_display.html Gtk.StyleContext.add_provider_for_display}
 * */
declare const enum StylePriority {
    /** User styles priority from `$XDG_CONFIG_HOME/gtk-4.0/gtk.css`.
     *
     * **Highest recommended priority.** Do not use priorities higher than this
     * to give users the final word in styling their applications.
     *
     * **Important:** This priority should be reserved for user-provided styles,
     * not application-defined styles.
     *
     * @example User customization (typically in user's gtk.css)
     * ~~~css
     * // In user's ~/.config/gtk-4.0/gtk.css
     * .my-app-widget {
     *   // User's personal preference - highest priority
     *   font-family: "Comic Sans MS";
     *   background: pink;
     * }
     * ~~~
     *
     * @example Application respecting user priority
     * ~~~typescript
     * // DON'T: Override user styles
     * [850]: 'widget { background: blue !important; }' // Bad!
     *
     * // DO: Use APPLICATION priority instead
     * [StylePriority.APPLICATION]: 'widget { background: blue; }' // Good!
     * ~~~ */
    USER = 800,
    /** Application-specific styling priority.
     *
     * Used for adding application-wide style providers and overrides.
     * Higher priority than WIDGET to allow application-level customization.
     *
     * @example Application-wide styling
     * ~~~typescript
     * [StylePriority.APPLICATION]: `
     *   // Application brand colors
     *   .primary {
     *     background: #1976D2;
     *     color: white;
     *   }
     *
     *   .secondary {
     *     background: #424242;
     *     color: white;
     *   }
     *
     *   // Application-specific spacing
     *   .app-container {
     *     padding: 24px;
     *     gap: 16px;
     *   }
     * `
     * ~~~
     *
     * @example External application stylesheet
     * ~~~typescript
     * [StylePriority.APPLICATION]: 'file:///path/to/app-styles.css'
     * ~~~ */
    APPLICATION = 600,
    /** Widget-specific styling priority.
     *
     * Lower priority than APPLICATION to allow top-level window styles to override.
     * Good for widget-specific behavior and states that are intrinsic to the widget.
     *
     * @example Widget-specific behavior
     * ~~~typescript
     * [StylePriority.WIDGET]: `
     *   my-toggle {
     *     transition: background-color 0.3s ease;
     *   }
     *
     *   my-toggle:checked {
     *     background-color: #4CAF50;
     *   }
     *
     *   my-toggle:disabled {
     *     opacity: 0.5;
     *     cursor: not-allowed;
     *   }
     * `
     * ~~~ */
    WIDGET = 500,
    /** Settings-provided styling priority (via GtkSettings).
     *
     * Higher priority than THEME to allow user settings to override theme defaults.
     * Typically used for user preferences that should take precedence over themes.
     *
     * @example Settings-based overrides
     * ~~~typescript
     * [StylePriority.SETTINGS]: `
     *   * {
     *     // User preference: larger font sizes
     *     font-size: 1.2em;
     *   }
     * `
     * ~~~ */
    SETTINGS = 400,
    /** Theme-provided styling information priority.
     *
     * Used for theme-level styling that provides the base visual appearance.
     * Good for establishing the fundamental look and feel of widgets.
     *
     * @example Theme-level styling
     * ~~~typescript
     * [StylePriority.THEME]: `
     *   my-button {
     *     border-radius: 6px;
     *     padding: 8px 16px;
     *     font-weight: 500;
     *     transition: all 0.2s ease;
     *   }
     * `
     * ~~~
     *
     * @example Overriding theme from resource
     * ~~~typescript
     * [StylePriority.THEME + 10]: 'resource:///my/app/themes/default.css'
     * ~~~ */
    THEME = 200,
    /** Fallback styles priority for when no theme is available.
     *
     * Provides basic styling when themes are unavailable or incomplete.
     * Not very useful for custom widget classes as themes can override
     * these styles with universal rules like `* { ... }`.
     *
     * **Recommendation:** Avoid using this priority for custom widgets.
     *
     * @example Fallback usage (discouraged)
     * ~~~typescript
     * [StylePriority.FALLBACK]: `
     *   my-widget {
     *     // Basic fallback - themes will likely override this
     *     background: white;
     *     color: black;
     *   }
     * `
     * ~~~ */
    FALLBACK = 1,
    /**
     * Internal style definitions priority.
     *
     * Used for defining the styling "contract" of custom widgets. Provides empty or minimal
     * style definitions that document which selectors, states, and style classes are available
     * for customization. Serves as documentation and foundation for higher-priority styles.
     *
     * When creating custom widgets, use this priority to define:
     * - Available CSS selectors and their purpose
     * - Supported widget states (:hover, :active, :disabled, etc.)
     * - Available style classes (.primary, .secondary, etc.)
     * - Customizable visual elements
     *
     * @example Custom widget styling contract
     * ~~~typescript
     * [StylePriority.DEFINITIONS]: `
     *   // Custom toggle switch component
     *   my-toggle {
     *     // Base toggle container - customize size, positioning
     *   }
     *
     *   my-toggle:hover {
     *     // Hover state - customize hover effects
     *   }
     *
     *   my-toggle:active {
     *     // Active/pressed state
     *   }
     *
     *   my-toggle:disabled {
     *     // Disabled state - customize disabled appearance
     *   }
     *
     *   my-toggle:checked {
     *     // Checked/on state - customize active toggle
     *   }
     *
     *   my-toggle .track {
     *     // Toggle track/background - customize track styling
     *   }
     *
     *   my-toggle .thumb {
     *     // Toggle thumb/handle - customize thumb appearance
     *   }
     *
     *   my-toggle.small {
     *     // Small size variant - customize compact version
     *   }
     *
     *   my-toggle.large {
     *     // Large size variant - customize expanded version
     *   }
     * `
     * ~~~
     *
     * @example Documentation-focused definitions
     * ~~~typescript
     * [StylePriority.DEFINITIONS]: `
     *   // Card component - customizable container
     *   my-card {
     *     // Main card container
     *   }
     *
     *   my-card .header {
     *     // Card header area
     *   }
     *
     *   my-card .content {
     *     // Main content area
     *   }
     *
     *   my-card .footer {
     *     // Card footer/actions area
     *   }
     *
     *   my-card.elevated {
     *     // Card with shadow/elevation
     *   }
     *
     *   my-card.outlined {
     *     // Card with border outline
     *   }
     * `
     * ~~~
     *
     * @example Component with color definitions
     * ~~~typescript
     * [StylePriority.DEFINITIONS]: `
     *   // Define component color palette
     *   @define-color my-button-bg-color @sidebar_bg_color;
     *   @define-color my-button-text-color mix(@theme_fg_color, @theme_bg_color, 0.8);
     *   @define-color my-button-hover-color alpha(mix(@my-button-bg-color, @accent_color, 0.35), 0.15);
     *   @define-color my-button-active-color mix(@my-button-bg-color, @theme_fg_color, 0.1);
     *   @define-color my-button-disabled-color alpha(@my-button-bg-color, 0.5);
     *
     *   // Component structure definitions
     *   my-button {
     *     // Base button - uses @my-button-bg-color, @my-button-text-color
     *   }
     *
     *   my-button:hover {
     *     // Hover state - uses @my-button-hover-color
     *   }
     *
     *   my-button:active {
     *     // Active state - uses @my-button-active-color
     *   }
     *
     *   my-button:disabled {
     *     // Disabled state - uses @my-button-disabled-color
     *   }
     *
     *   my-button.primary {
     *     // Primary variant - may override colors
     *   }
     *
     *   my-button.secondary {
     *     // Secondary variant - may override colors
     *   }
     * `
     * ~~~
     *
     * Users can then override colors at higher priorities:
     * ~~~typescript
     * [StylePriority.APPLICATION]: `
     *   // Override component colors for consistency or theming
     *   @define-color my-button-bg-color @headerbar_bg_color;
     *   @define-color my-button-text-color @headerbar_fg_color;
     *   @define-color my-button-hover-color alpha(@accent_color, 0.2);
     * `
     * ~~~
     *
     * @example Framework internal usage
     * ~~~typescript
     * // Used internally by the framework for core definitions
     * [StylePriority.DEFINITIONS]: `
     *   widget {
     *     box-sizing: border-box;
     *     position: relative;
     *   }
     * `
     * ~~~
     *
     * **Best Practices:**
     * - Use empty or minimal rules to document available selectors
     * - Add comments explaining each selector's purpose
     * - Define all supported states and style classes
     * - Establish custom property contracts for theming
     * - Keep actual styling minimal - let higher priorities provide appearance
     */
    DEFINITIONS = 0
}
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
declare const Styling: {
    (config: StylingConfig): WidgetClassDecorator;
    apply(display: Gdk.Display, ...widget_classes: WidgetConstructor[]): void;
};
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
export { StylingConfig, StylePriority, Styling, CSSParseError };
