"use strict";
/**
 * React Fusion State DevTools
 *
 * Optional development tools for debugging and inspecting React Fusion State.
 * This module provides components for in-app debugging and state inspection.
 *
 * @example
 * ```tsx
 * import { FusionDebugPanel } from 'react-fusion-state/devtools';
 *
 * function App() {
 *   const [debugVisible, setDebugVisible] = useState(false);
 *
 *   return (
 *     <div>
 *       <YourApp />
 *       <FusionDebugPanel
 *         visible={debugVisible}
 *         onVisibilityChange={setDebugVisible}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.FusionDebugPanel = void 0;
var FusionDebugPanel_1 = require("./FusionDebugPanel");
Object.defineProperty(exports, "FusionDebugPanel", { enumerable: true, get: function () { return FusionDebugPanel_1.FusionDebugPanel; } });
// Re-export the component as default for convenience
var FusionDebugPanel_2 = require("./FusionDebugPanel");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return FusionDebugPanel_2.FusionDebugPanel; } });
//# sourceMappingURL=index.js.map