"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
require("@testing-library/jest-dom");
const FusionStateProvider_1 = require("../../FusionStateProvider");
const useFusionState_1 = require("../../useFusionState");
const FusionDebugPanel_1 = require("../FusionDebugPanel");
// Test component that uses fusion state
const TestComponent = () => {
    const [count, setCount] = (0, useFusionState_1.useFusionState)('count', 0);
    const [user, setUser] = (0, useFusionState_1.useFusionState)('user', { name: 'John', age: 30 });
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { "data-testid": "count" },
            "Count: ",
            String(count)),
        react_1.default.createElement("div", { "data-testid": "user" },
            "User: ",
            JSON.stringify(user)),
        react_1.default.createElement("button", { onClick: () => setCount(typeof count === 'number' ? count + 1 : 1) }, "Increment"),
        react_1.default.createElement("button", { onClick: () => setUser(typeof user === 'object' && user !== null
                ? Object.assign(Object.assign({}, user), { age: user.age + 1 }) : { name: 'John', age: 30 }) }, "Age Up")));
};
// Test app with debug panel
const TestApp = ({ debugVisible = true }) => {
    const [visible, setVisible] = react_1.default.useState(debugVisible);
    return (react_1.default.createElement(FusionStateProvider_1.FusionStateProvider, null,
        react_1.default.createElement(TestComponent, null),
        react_1.default.createElement(FusionDebugPanel_1.FusionDebugPanel, { visible: visible, onVisibilityChange: setVisible })));
};
describe('FusionDebugPanel', () => {
    beforeEach(() => {
        // Mock URL.createObjectURL and URL.revokeObjectURL for export functionality
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('renders when visible is true', () => {
        (0, react_2.render)(react_1.default.createElement(TestApp, { debugVisible: true }));
        expect(react_2.screen.getByText('Fusion State Debugger')).toBeInTheDocument();
        expect(react_2.screen.getByText('Export')).toBeInTheDocument();
        expect(react_2.screen.getByText('Import')).toBeInTheDocument();
    });
    it('does not render when visible is false', () => {
        (0, react_2.render)(react_1.default.createElement(TestApp, { debugVisible: false }));
        expect(react_2.screen.queryByText('Fusion State Debugger')).not.toBeInTheDocument();
    });
    it('displays state keys from useFusionStateLog', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Wait for state to be initialized
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/count/)).toBeInTheDocument();
            expect(react_2.screen.getByText(/user/)).toBeInTheDocument();
        });
    }));
    it('can expand and collapse state editors', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Wait for state to be initialized
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/count/)).toBeInTheDocument();
        });
        // Find and click on count state key to expand
        const countHeader = react_2.screen.getByText(/▶ count/);
        react_2.fireEvent.click(countHeader);
        // Should now show expanded state (▼) and textarea
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/▼ count/)).toBeInTheDocument();
            expect(react_2.screen.getByDisplayValue('0')).toBeInTheDocument();
        });
        // Click again to collapse
        const expandedCountHeader = react_2.screen.getByText(/▼ count/);
        react_2.fireEvent.click(expandedCountHeader);
        // Should be collapsed again
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/▶ count/)).toBeInTheDocument();
            expect(react_2.screen.queryByDisplayValue('0')).not.toBeInTheDocument();
        });
    }));
    it('can edit and apply JSON values', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Wait for state to be initialized and expand count
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/count/)).toBeInTheDocument();
        });
        const countHeader = react_2.screen.getByText(/▶ count/);
        react_2.fireEvent.click(countHeader);
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByDisplayValue('0')).toBeInTheDocument();
        });
        // Edit the JSON value
        const textarea = react_2.screen.getByDisplayValue('0');
        react_2.fireEvent.change(textarea, { target: { value: '42' } });
        // Click Set button to apply
        const setButton = react_2.screen.getByText('Set');
        react_2.fireEvent.click(setButton);
        // Verify the state was updated in the test component
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByTestId('count')).toHaveTextContent('Count: 42');
        });
    }));
    it('can reset state values to null', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Wait for state to be initialized and expand count
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/count/)).toBeInTheDocument();
        });
        const countHeader = react_2.screen.getByText(/▶ count/);
        react_2.fireEvent.click(countHeader);
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByDisplayValue('0')).toBeInTheDocument();
        });
        // Click Reset button
        const resetButton = react_2.screen.getByText('Reset');
        react_2.fireEvent.click(resetButton);
        // Verify the state was reset to null
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByTestId('count')).toHaveTextContent('Count: null');
        });
    }));
    it('shows error for invalid JSON', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Wait for state to be initialized and expand count
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText(/count/)).toBeInTheDocument();
        });
        const countHeader = react_2.screen.getByText(/▶ count/);
        react_2.fireEvent.click(countHeader);
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByDisplayValue('0')).toBeInTheDocument();
        });
        // Enter invalid JSON
        const textarea = react_2.screen.getByDisplayValue('0');
        react_2.fireEvent.change(textarea, { target: { value: 'invalid json' } });
        // Should show error message and disable Set button
        yield (0, react_2.waitFor)(() => {
            expect(react_2.screen.getByText('Invalid JSON format')).toBeInTheDocument();
            expect(react_2.screen.getByText('Set')).toBeDisabled();
        });
    }));
    it('has export functionality', () => {
        (0, react_2.render)(react_1.default.createElement(TestApp, null));
        // Just verify the export button exists and can be clicked
        const exportButton = react_2.screen.getByText('Export');
        expect(exportButton).toBeInTheDocument();
        expect(exportButton).toHaveAttribute('title', 'Export current state snapshot');
        // The actual export functionality is tested in integration
        react_2.fireEvent.click(exportButton);
        // No error should be thrown
    });
    it('can close the panel', () => {
        const onVisibilityChange = jest.fn();
        (0, react_2.render)(react_1.default.createElement(FusionStateProvider_1.FusionStateProvider, null,
            react_1.default.createElement(TestComponent, null),
            react_1.default.createElement(FusionDebugPanel_1.FusionDebugPanel, { visible: true, onVisibilityChange: onVisibilityChange })));
        // Click close button (×)
        const closeButton = react_2.screen.getByText('×');
        react_2.fireEvent.click(closeButton);
        expect(onVisibilityChange).toHaveBeenCalledWith(false);
    });
});
//# sourceMappingURL=FusionDebugPanel.test.js.map