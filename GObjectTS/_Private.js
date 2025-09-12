const SIGNALS_COLLECTOR_KEY = Symbol('gobject:collector:signals');
function delete_signals_collector(target) {
    if (!(SIGNALS_COLLECTOR_KEY in target)) {
        return;
    }
    delete target[SIGNALS_COLLECTOR_KEY];
}
function get_signals_collector(target) {
    if ((SIGNALS_COLLECTOR_KEY in target)) {
        return target[SIGNALS_COLLECTOR_KEY];
    }
    return undefined;
}
export { get_signals_collector, delete_signals_collector, SIGNALS_COLLECTOR_KEY };
const property_collector = Symbol('gobject:collector:property-specs');
function delete_property_collector(target) {
    if (!(property_collector in target)) {
        return;
    }
    delete target[property_collector];
}
function get_property_collector(target) {
    if ((property_collector in target)) {
        return target[property_collector].property_specs_map;
    }
    return undefined;
}
export { get_property_collector, delete_property_collector, property_collector };
// template
const template_collector = Symbol('widget:collector:template');
function delete_template_collector(target) {
    if (!(template_collector in target)) {
        return;
    }
    delete target[template_collector];
}
function check_template_collector(target) {
    if ((template_collector in target)) {
        return true;
    }
    return false;
}
export { check_template_collector, delete_template_collector, template_collector, };
// template
const child_collector = Symbol('widget:collector:child');
function delete_child_collector(target) {
    if (!(child_collector in target)) {
        return;
    }
    delete target[child_collector];
}
function check_child_collector(target) {
    if ((child_collector in target)) {
        return true;
    }
    return false;
}
// const internal_child_collector = Symbol('widget:collector:internal-child');
// function delete_internal_child_collector(target: Function): void {
//     if (!(internal_child_collector in target)) {
//         return;
//     }
//     delete target[internal_child_collector];
// }
// function check_internal_child_collector(target: Function): boolean {
//     if ((internal_child_collector in target)) {
//         return true;
//     }
//     return false;
// }
export { check_child_collector, delete_child_collector, child_collector,
// check_internal_child_collector,
// delete_internal_child_collector,
// internal_child_collector,
 };
// actions
const bind_actions_collector = Symbol('widget:collector:bind-actions');
function delete_bind_actions_collector(target) {
    if (!(bind_actions_collector in target)) {
        return;
    }
    delete target[bind_actions_collector];
}
function check_actions_collector(target) {
    return (bind_actions_collector in target) ? true : false;
}
const handler_actions_collector = Symbol('widget:collector:handler-actions');
function delete_handler_actions_collector(target) {
    if (!(handler_actions_collector in target)) {
        return;
    }
    delete target[handler_actions_collector];
}
function check_handler_actions_collector(target) {
    return (handler_actions_collector in target) ? true : false;
}
export { check_actions_collector, delete_bind_actions_collector, bind_actions_collector, delete_handler_actions_collector, check_handler_actions_collector, handler_actions_collector };
// Decorator.Styling
const css_name_collector = Symbol('widget:collector:css-name');
const styling_registry_collector = Symbol('widget:collector:styling-registry');
export { css_name_collector, styling_registry_collector };
