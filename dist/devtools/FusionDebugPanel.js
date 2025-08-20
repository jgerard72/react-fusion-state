"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionDebugPanel = void 0;
const react_1 = __importStar(require("react"));
const useFusionStateLog_1 = require("../useFusionStateLog");
const FusionStateProvider_1 = require("../FusionStateProvider");
const getPanelStyles = (position, size) => ({
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    minWidth: '300px',
    minHeight: '200px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '12px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
});
const getHeaderStyles = (isDragging) => ({
    backgroundColor: '#2d2d2d',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
});
const TITLE_STYLES = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
};
const BUTTON_STYLES = {
    backgroundColor: '#404040',
    border: 'none',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    marginLeft: '8px',
};
const BUTTON_HOVER_STYLES = Object.assign(Object.assign({}, BUTTON_STYLES), { backgroundColor: '#505050' });
const CONTENT_STYLES = {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
};
const STATE_ITEM_STYLES = {
    marginBottom: '12px',
    border: '1px solid #333',
    borderRadius: '4px',
    backgroundColor: '#222',
};
const STATE_HEADER_STYLES = {
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
};
const STATE_KEY_STYLES = {
    fontWeight: 'bold',
    color: '#4fc3f7',
};
const TEXTAREA_STYLES = {
    width: '100%',
    minHeight: '80px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#ffffff',
    padding: '8px',
    fontFamily: 'inherit',
    fontSize: '11px',
    resize: 'vertical',
    outline: 'none',
};
const ERROR_TEXTAREA_STYLES = Object.assign(Object.assign({}, TEXTAREA_STYLES), { borderColor: '#f44336' });
const ACTION_BUTTONS_STYLES = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
};
const SET_BUTTON_STYLES = Object.assign(Object.assign({}, BUTTON_STYLES), { backgroundColor: '#4caf50' });
const RESET_BUTTON_STYLES = Object.assign(Object.assign({}, BUTTON_STYLES), { backgroundColor: '#f44336' });
const HIDDEN_INPUT_STYLES = {
    display: 'none',
};
const RESIZE_HANDLE_STYLES = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '20px',
    height: '20px',
    cursor: 'nw-resize',
    backgroundColor: 'transparent',
    zIndex: 10,
};
const RESIZE_INDICATOR_STYLES = {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '16px',
    height: '16px',
    opacity: 0.3,
    pointerEvents: 'none',
};
const FusionDebugPanel = ({ visible, onVisibilityChange, }) => {
    const globalSnapshot = (0, useFusionStateLog_1.useFusionStateLog)();
    const { setState } = (0, FusionStateProvider_1.useGlobalState)();
    const [stateEditors, setStateEditors] = (0, react_1.useState)({});
    const fileInputRef = (0, react_1.useRef)(null);
    const panelRef = (0, react_1.useRef)(null);
    const [position, setPosition] = (0, react_1.useState)({ x: 0, y: 0 });
    const [size, setSize] = (0, react_1.useState)({ width: 400, height: 600 });
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [isResizing, setIsResizing] = (0, react_1.useState)(false);
    const [dragStart, setDragStart] = (0, react_1.useState)({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = (0, react_1.useState)({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    // Initialize position on first render
    (0, react_1.useEffect)(() => {
        if (position.x === 0 && position.y === 0) {
            setPosition({
                x: Math.max(0, window.innerWidth - size.width - 20),
                y: Math.max(0, window.innerHeight - size.height - 20),
            });
        }
    }, [position.x, position.y, size.width, size.height]);
    // Initialize state editors when global snapshot changes
    (0, react_1.useEffect)(() => {
        const newEditors = {};
        Object.keys(globalSnapshot).forEach(key => {
            var _a, _b, _c;
            const existing = stateEditors[key];
            newEditors[key] = {
                key,
                expanded: (_a = existing === null || existing === void 0 ? void 0 : existing.expanded) !== null && _a !== void 0 ? _a : false,
                jsonValue: (_b = existing === null || existing === void 0 ? void 0 : existing.jsonValue) !== null && _b !== void 0 ? _b : JSON.stringify(globalSnapshot[key], null, 2),
                hasError: (_c = existing === null || existing === void 0 ? void 0 : existing.hasError) !== null && _c !== void 0 ? _c : false,
            };
        });
        // Remove editors for keys that no longer exist
        setStateEditors(newEditors);
    }, [globalSnapshot]);
    // Handle keyboard shortcut
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
            if (ctrlOrCmd && event.key === '`') {
                event.preventDefault();
                const newVisible = !visible;
                onVisibilityChange === null || onVisibilityChange === void 0 ? void 0 : onVisibilityChange(newVisible);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, onVisibilityChange]);
    // Handle drag & drop
    const handleDragStart = (0, react_1.useCallback)((event) => {
        var _a;
        if (event.button !== 0 || isResizing)
            return; // Only left click and not during resize
        setIsDragging(true);
        const rect = (_a = panelRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (rect) {
            setDragStart({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        }
        event.preventDefault();
    }, [isResizing]);
    // Handle resize
    const handleResizeStart = (0, react_1.useCallback)((event) => {
        if (event.button !== 0)
            return; // Only left click
        setIsResizing(true);
        setResizeStart({
            x: event.clientX,
            y: event.clientY,
            width: size.width,
            height: size.height,
        });
        event.preventDefault();
        event.stopPropagation();
    }, [size]);
    const handleMouseMove = (0, react_1.useCallback)((event) => {
        if (isDragging && !isResizing) {
            // Drag logic
            const newLeft = event.clientX - dragStart.x;
            const newTop = event.clientY - dragStart.y;
            // Constrain to window bounds
            const maxLeft = window.innerWidth - size.width;
            const maxTop = window.innerHeight - size.height;
            const constrainedLeft = Math.max(0, Math.min(maxLeft, newLeft));
            const constrainedTop = Math.max(0, Math.min(maxTop, newTop));
            setPosition({
                x: constrainedLeft,
                y: constrainedTop,
            });
        }
        else if (isResizing && !isDragging) {
            // Resize logic
            const deltaX = event.clientX - resizeStart.x;
            const deltaY = event.clientY - resizeStart.y;
            const newWidth = Math.max(300, Math.min(window.innerWidth - position.x, resizeStart.width + deltaX));
            const newHeight = Math.max(200, Math.min(window.innerHeight - position.y, resizeStart.height + deltaY));
            setSize({
                width: newWidth,
                height: newHeight,
            });
        }
    }, [isDragging, isResizing, dragStart, resizeStart, size, position]);
    const handleMouseUp = (0, react_1.useCallback)(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);
    (0, react_1.useEffect)(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
    const toggleExpanded = (0, react_1.useCallback)((key) => {
        setStateEditors(prev => (Object.assign(Object.assign({}, prev), { [key]: Object.assign(Object.assign({}, prev[key]), { expanded: !prev[key].expanded }) })));
    }, []);
    const updateJsonValue = (0, react_1.useCallback)((key, value) => {
        let hasError = false;
        try {
            JSON.parse(value);
        }
        catch (_a) {
            hasError = true;
        }
        setStateEditors(prev => (Object.assign(Object.assign({}, prev), { [key]: Object.assign(Object.assign({}, prev[key]), { jsonValue: value, hasError }) })));
    }, []);
    const applyJsonValue = (0, react_1.useCallback)((key) => {
        const editor = stateEditors[key];
        if (!editor || editor.hasError)
            return;
        try {
            const parsedValue = JSON.parse(editor.jsonValue);
            setState(prev => (Object.assign(Object.assign({}, prev), { [key]: parsedValue })));
        }
        catch (error) {
            console.error('Failed to apply JSON value:', error);
        }
    }, [stateEditors, setState]);
    const resetStateValue = (0, react_1.useCallback)((key) => {
        setState(prev => (Object.assign(Object.assign({}, prev), { [key]: null })));
        // Update editor to reflect the reset
        setStateEditors(prev => (Object.assign(Object.assign({}, prev), { [key]: Object.assign(Object.assign({}, prev[key]), { jsonValue: 'null', hasError: false }) })));
    }, [setState]);
    const exportSnapshot = (0, react_1.useCallback)(() => {
        const dataStr = JSON.stringify(globalSnapshot, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fusion-state-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [globalSnapshot]);
    const importSnapshot = (0, react_1.useCallback)(() => {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    }, []);
    const handleFileImport = (0, react_1.useCallback)((event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = e => {
            var _a;
            try {
                const importedState = JSON.parse((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
                setState(prev => (Object.assign(Object.assign({}, prev), importedState)));
            }
            catch (error) {
                console.error('Failed to import snapshot:', error);
                alert('Failed to import snapshot. Please check the file format.');
            }
        };
        reader.readAsText(file);
        // Reset the input
        event.target.value = '';
    }, [setState]);
    // Don't render anything when not visible
    if (!visible) {
        return null;
    }
    return (react_1.default.createElement("div", { ref: panelRef, style: getPanelStyles(position, size) },
        react_1.default.createElement("div", { style: getHeaderStyles(isDragging), onMouseDown: handleDragStart },
            react_1.default.createElement("h3", { style: TITLE_STYLES }, "Fusion State Debugger"),
            react_1.default.createElement("div", null,
                react_1.default.createElement("button", { style: BUTTON_STYLES, onMouseEnter: e => Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES), onMouseLeave: e => Object.assign(e.currentTarget.style, BUTTON_STYLES), onClick: exportSnapshot, title: "Export current state snapshot" }, "Export"),
                react_1.default.createElement("button", { style: BUTTON_STYLES, onMouseEnter: e => Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES), onMouseLeave: e => Object.assign(e.currentTarget.style, BUTTON_STYLES), onClick: importSnapshot, title: "Import state snapshot from file" }, "Import"),
                react_1.default.createElement("button", { style: BUTTON_STYLES, onMouseEnter: e => Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES), onMouseLeave: e => Object.assign(e.currentTarget.style, BUTTON_STYLES), onClick: () => onVisibilityChange === null || onVisibilityChange === void 0 ? void 0 : onVisibilityChange(false), title: "Close panel (Ctrl+` or Cmd+`)" }, "\u00D7"))),
        react_1.default.createElement("div", { style: CONTENT_STYLES }, Object.keys(globalSnapshot).length === 0 ? (react_1.default.createElement("div", { style: { color: '#888', textAlign: 'center', padding: '20px' } }, "No state keys found")) : (Object.keys(globalSnapshot)
            .sort()
            .map(key => {
            const editor = stateEditors[key];
            if (!editor)
                return null;
            return (react_1.default.createElement("div", { key: key, style: STATE_ITEM_STYLES },
                react_1.default.createElement("div", { style: STATE_HEADER_STYLES, onClick: () => toggleExpanded(key) },
                    react_1.default.createElement("span", { style: STATE_KEY_STYLES },
                        editor.expanded ? '▼' : '▶',
                        " ",
                        key),
                    react_1.default.createElement("span", { style: { color: '#888', fontSize: '10px' } },
                        typeof globalSnapshot[key],
                        globalSnapshot[key] === null ? ' (null)' : '')),
                editor.expanded && (react_1.default.createElement("div", { style: { padding: '12px' } },
                    react_1.default.createElement("textarea", { style: editor.hasError
                            ? ERROR_TEXTAREA_STYLES
                            : TEXTAREA_STYLES, value: editor.jsonValue, onChange: e => updateJsonValue(key, e.target.value), placeholder: "Enter valid JSON..." }),
                    react_1.default.createElement("div", { style: ACTION_BUTTONS_STYLES },
                        react_1.default.createElement("button", { style: SET_BUTTON_STYLES, disabled: editor.hasError, onClick: () => applyJsonValue(key), title: "Apply the JSON value to state" }, "Set"),
                        react_1.default.createElement("button", { style: RESET_BUTTON_STYLES, onClick: () => resetStateValue(key), title: "Reset this state key to null" }, "Reset")),
                    editor.hasError && (react_1.default.createElement("div", { style: {
                            color: '#f44336',
                            fontSize: '10px',
                            marginTop: '4px',
                        } }, "Invalid JSON format"))))));
        }))),
        react_1.default.createElement("input", { ref: fileInputRef, type: "file", accept: ".json", style: HIDDEN_INPUT_STYLES, onChange: handleFileImport }),
        react_1.default.createElement("div", { style: RESIZE_HANDLE_STYLES, onMouseDown: handleResizeStart },
            react_1.default.createElement("svg", { style: RESIZE_INDICATOR_STYLES, viewBox: "0 0 16 16", fill: "currentColor" },
                react_1.default.createElement("path", { d: "M16 0v16h-16l16-16z", opacity: "0.3" }),
                react_1.default.createElement("path", { d: "M6 10l4-4m-2 2l4-4m-2 2l4-4", stroke: "currentColor", strokeWidth: "1", fill: "none", opacity: "0.5" })))));
};
exports.FusionDebugPanel = FusionDebugPanel;
exports.default = exports.FusionDebugPanel;
//# sourceMappingURL=FusionDebugPanel.js.map