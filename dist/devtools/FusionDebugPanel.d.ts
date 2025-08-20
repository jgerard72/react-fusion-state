import React from 'react';
export interface FusionDebugPanelProps {
    /** Whether the panel is visible */
    visible: boolean;
    /** Callback when visibility changes */
    onVisibilityChange?: (visible: boolean) => void;
}
export declare const FusionDebugPanel: React.FC<FusionDebugPanelProps>;
export default FusionDebugPanel;
