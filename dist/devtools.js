"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevToolsActions = exports.useDevTools = exports.getDevTools = exports.createDevTools = void 0;
class FusionStateDevTools {
    constructor(config = {}) {
        var _a, _b;
        this.devtools = null;
        this.isEnabled = false;
        this.actionCounter = 0;
        this.config = {
            name: config.name || 'FusionState',
            trace: (_a = config.trace) !== null && _a !== void 0 ? _a : true,
            maxAge: config.maxAge || 50,
            devOnly: (_b = config.devOnly) !== null && _b !== void 0 ? _b : true,
        };
        this.initialize();
    }
    initialize() {
        if (this.config.devOnly && process.env.NODE_ENV === 'production') {
            return;
        }
        if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
            try {
                this.devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
                    name: this.config.name,
                    trace: this.config.trace,
                    maxAge: this.config.maxAge,
                    features: {
                        pause: true,
                        lock: true,
                        persist: true,
                        export: true,
                        import: 'custom',
                        jump: true,
                        skip: true,
                        reorder: true,
                        dispatch: true,
                        test: true,
                    },
                });
                this.isEnabled = true;
                this.devtools.subscribe((message) => {
                    this.handleDevToolsMessage(message);
                });
            }
            catch (error) {
                console.warn('[FusionState DevTools] Failed to connect:', error);
            }
        }
    }
    handleDevToolsMessage(message) {
        var _a, _b;
        switch (message.type) {
            case 'DISPATCH':
                switch ((_a = message.payload) === null || _a === void 0 ? void 0 : _a.type) {
                    case 'JUMP_TO_ACTION':
                    case 'JUMP_TO_STATE':
                        (_b = this.onTimeTravel) === null || _b === void 0 ? void 0 : _b.call(this, message.payload);
                        break;
                }
                break;
        }
    }
    init(state) {
        if (!this.isEnabled || !this.devtools)
            return;
        try {
            this.devtools.init(state);
        }
        catch (error) {
            console.warn('[FusionState DevTools] Init failed:', error);
        }
    }
    send(actionType, state, key, payload) {
        if (!this.isEnabled || !this.devtools)
            return;
        try {
            const action = {
                type: `${actionType}${key ? ` (${key})` : ''}`,
                key,
                payload,
                timestamp: Date.now(),
            };
            this.devtools.send(action, state);
            this.actionCounter++;
        }
        catch (error) {
            console.warn('[FusionState DevTools] Send failed:', error);
        }
    }
    /** Vérifier si les DevTools sont actives */
    get enabled() {
        return this.isEnabled;
    }
    /** Obtenir les statistiques */
    get stats() {
        return {
            enabled: this.isEnabled,
            actionCount: this.actionCounter,
            config: this.config,
        };
    }
}
/** Instance globale des DevTools (singleton) */
let devToolsInstance = null;
/**
 * Créer ou obtenir l'instance des DevTools
 * ✅ PERFORMANCE: Singleton pattern pour éviter les instances multiples
 */
function createDevTools(config) {
    if (!devToolsInstance) {
        devToolsInstance = new FusionStateDevTools(config);
    }
    return devToolsInstance;
}
exports.createDevTools = createDevTools;
/** Obtenir l'instance actuelle des DevTools */
function getDevTools() {
    return devToolsInstance;
}
exports.getDevTools = getDevTools;
/**
 * Hook React pour utiliser les DevTools dans les composants
 * ✅ PERFORMANCE: Ne fait rien en production si devOnly=true
 */
function useDevTools() {
    var _a, _b, _c;
    const devtools = getDevTools();
    return {
        enabled: (_a = devtools === null || devtools === void 0 ? void 0 : devtools.enabled) !== null && _a !== void 0 ? _a : false,
        stats: (_b = devtools === null || devtools === void 0 ? void 0 : devtools.stats) !== null && _b !== void 0 ? _b : null,
        send: (_c = devtools === null || devtools === void 0 ? void 0 : devtools.send.bind(devtools)) !== null && _c !== void 0 ? _c : (() => { }),
    };
}
exports.useDevTools = useDevTools;
/**
 * Types d'actions pour les DevTools
 * Aide à standardiser les messages
 */
exports.DevToolsActions = {
    INIT: 'INIT',
    SET_STATE: 'SET_STATE',
    UPDATE_KEY: 'UPDATE_KEY',
    PERSIST_LOAD: 'PERSIST_LOAD',
    PERSIST_SAVE: 'PERSIST_SAVE',
    ERROR: 'ERROR',
};
/**
 * 🎯 EXEMPLE D'UTILISATION
 *
 * // Dans votre app
 * const devtools = createDevTools({
 *   name: 'My App State',
 *   trace: true,
 *   maxAge: 100,
 * });
 *
 * // Dans un composant
 * const { enabled, stats } = useDevTools();
 * if (enabled) {
 *   console.log('DevTools actives:', stats);
 * }
 */
//# sourceMappingURL=devtools.js.map