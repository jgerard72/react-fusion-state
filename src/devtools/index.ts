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

export {FusionDebugPanel} from './FusionDebugPanel';
export type {FusionDebugPanelProps} from './FusionDebugPanel';

// Re-export the component as default for convenience
export {FusionDebugPanel as default} from './FusionDebugPanel';
