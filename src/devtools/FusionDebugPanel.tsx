import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useFusionStateLog} from '../useFusionStateLog';
import {useGlobalState} from '../FusionStateProvider';

export interface FusionDebugPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Callback when visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}

interface StateEditor {
  key: string;
  expanded: boolean;
  jsonValue: string;
  hasError: boolean;
}

const getPanelStyles = (
  position: {x: number; y: number},
  size: {width: number; height: number},
): React.CSSProperties => ({
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

const getHeaderStyles = (isDragging: boolean): React.CSSProperties => ({
  backgroundColor: '#2d2d2d',
  padding: '12px 16px',
  borderBottom: '1px solid #333',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none',
});

const TITLE_STYLES: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#ffffff',
};

const BUTTON_STYLES: React.CSSProperties = {
  backgroundColor: '#404040',
  border: 'none',
  color: '#ffffff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
  marginLeft: '8px',
};

const BUTTON_HOVER_STYLES: React.CSSProperties = {
  ...BUTTON_STYLES,
  backgroundColor: '#505050',
};

const CONTENT_STYLES: React.CSSProperties = {
  padding: '16px',
  overflowY: 'auto',
  flex: 1,
};

const STATE_ITEM_STYLES: React.CSSProperties = {
  marginBottom: '12px',
  border: '1px solid #333',
  borderRadius: '4px',
  backgroundColor: '#222',
};

const STATE_HEADER_STYLES: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#2a2a2a',
  borderBottom: '1px solid #333',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
};

const STATE_KEY_STYLES: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#4fc3f7',
};

const TEXTAREA_STYLES: React.CSSProperties = {
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

const ERROR_TEXTAREA_STYLES: React.CSSProperties = {
  ...TEXTAREA_STYLES,
  borderColor: '#f44336',
};

const ACTION_BUTTONS_STYLES: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
};

const SET_BUTTON_STYLES: React.CSSProperties = {
  ...BUTTON_STYLES,
  backgroundColor: '#4caf50',
};

const RESET_BUTTON_STYLES: React.CSSProperties = {
  ...BUTTON_STYLES,
  backgroundColor: '#f44336',
};

const HIDDEN_INPUT_STYLES: React.CSSProperties = {
  display: 'none',
};

const RESIZE_HANDLE_STYLES: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '20px',
  height: '20px',
  cursor: 'nw-resize',
  backgroundColor: 'transparent',
  zIndex: 10,
};

const RESIZE_INDICATOR_STYLES: React.CSSProperties = {
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  width: '16px',
  height: '16px',
  opacity: 0.3,
  pointerEvents: 'none',
};

export const FusionDebugPanel: React.FC<FusionDebugPanelProps> = ({
  visible,
  onVisibilityChange,
}) => {
  const globalSnapshot = useFusionStateLog();
  const {setState} = useGlobalState();
  const [stateEditors, setStateEditors] = useState<Record<string, StateEditor>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({x: 0, y: 0});
  const [size, setSize] = useState({width: 400, height: 600});
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Initialize position on first render
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      setPosition({
        x: Math.max(0, window.innerWidth - size.width - 20), // Start at bottom-right
        y: Math.max(0, window.innerHeight - size.height - 20),
      });
    }
  }, [position.x, position.y, size.width, size.height]);

  // Initialize state editors when global snapshot changes
  useEffect(() => {
    const newEditors: Record<string, StateEditor> = {};

    Object.keys(globalSnapshot).forEach(key => {
      const existing = stateEditors[key];
      newEditors[key] = {
        key,
        expanded: existing?.expanded ?? false,
        jsonValue:
          existing?.jsonValue ?? JSON.stringify(globalSnapshot[key], null, 2),
        hasError: existing?.hasError ?? false,
      };
    });

    // Remove editors for keys that no longer exist
    setStateEditors(newEditors);
  }, [globalSnapshot]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key === '`') {
        event.preventDefault();
        const newVisible = !visible;
        onVisibilityChange?.(newVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onVisibilityChange]);

  // Handle drag & drop
  const handleDragStart = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0 || isResizing) return; // Only left click and not during resize

      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
      event.preventDefault();
    },
    [isResizing],
  );

  // Handle resize
  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0) return; // Only left click

      setIsResizing(true);
      setResizeStart({
        x: event.clientX,
        y: event.clientY,
        width: size.width,
        height: size.height,
      });
      event.preventDefault();
      event.stopPropagation();
    },
    [size],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
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
      } else if (isResizing && !isDragging) {
        // Resize logic
        const deltaX = event.clientX - resizeStart.x;
        const deltaY = event.clientY - resizeStart.y;

        const newWidth = Math.max(
          300,
          Math.min(window.innerWidth - position.x, resizeStart.width + deltaX),
        );
        const newHeight = Math.max(
          200,
          Math.min(
            window.innerHeight - position.y,
            resizeStart.height + deltaY,
          ),
        );

        setSize({
          width: newWidth,
          height: newHeight,
        });
      }
    },
    [isDragging, isResizing, dragStart, resizeStart, size, position],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const toggleExpanded = useCallback((key: string) => {
    setStateEditors(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        expanded: !prev[key].expanded,
      },
    }));
  }, []);

  const updateJsonValue = useCallback((key: string, value: string) => {
    let hasError = false;
    try {
      JSON.parse(value);
    } catch {
      hasError = true;
    }

    setStateEditors(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        jsonValue: value,
        hasError,
      },
    }));
  }, []);

  const applyJsonValue = useCallback(
    (key: string) => {
      const editor = stateEditors[key];
      if (!editor || editor.hasError) return;

      try {
        const parsedValue = JSON.parse(editor.jsonValue);
        setState(prev => ({
          ...prev,
          [key]: parsedValue,
        }));
      } catch (error) {
        console.error('Failed to apply JSON value:', error);
      }
    },
    [stateEditors, setState],
  );

  const resetStateValue = useCallback(
    (key: string) => {
      setState(prev => ({
        ...prev,
        [key]: null,
      }));

      // Update editor to reflect the reset
      setStateEditors(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          jsonValue: 'null',
          hasError: false,
        },
      }));
    },
    [setState],
  );

  const exportSnapshot = useCallback(() => {
    const dataStr = JSON.stringify(globalSnapshot, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fusion-state-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, [globalSnapshot]);

  const importSnapshot = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedState = JSON.parse(e.target?.result as string);
          setState(prev => ({
            ...prev,
            ...importedState,
          }));
        } catch (error) {
          console.error('Failed to import snapshot:', error);
          alert('Failed to import snapshot. Please check the file format.');
        }
      };
      reader.readAsText(file);

      // Reset the input
      event.target.value = '';
    },
    [setState],
  );

  // Don't render anything when not visible
  if (!visible) {
    return null;
  }

  return (
    <div ref={panelRef} style={getPanelStyles(position, size)}>
      {/* Header */}
      <div style={getHeaderStyles(isDragging)} onMouseDown={handleDragStart}>
        <h3 style={TITLE_STYLES}>Fusion State Debugger</h3>
        <div>
          <button
            style={BUTTON_STYLES}
            onMouseEnter={e =>
              Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES)
            }
            onMouseLeave={e =>
              Object.assign(e.currentTarget.style, BUTTON_STYLES)
            }
            onClick={exportSnapshot}
            title="Export current state snapshot">
            Export
          </button>
          <button
            style={BUTTON_STYLES}
            onMouseEnter={e =>
              Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES)
            }
            onMouseLeave={e =>
              Object.assign(e.currentTarget.style, BUTTON_STYLES)
            }
            onClick={importSnapshot}
            title="Import state snapshot from file">
            Import
          </button>
          <button
            style={BUTTON_STYLES}
            onMouseEnter={e =>
              Object.assign(e.currentTarget.style, BUTTON_HOVER_STYLES)
            }
            onMouseLeave={e =>
              Object.assign(e.currentTarget.style, BUTTON_STYLES)
            }
            onClick={() => onVisibilityChange?.(false)}
            title="Close panel (Ctrl+` or Cmd+`)">
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={CONTENT_STYLES}>
        {Object.keys(globalSnapshot).length === 0 ? (
          <div style={{color: '#888', textAlign: 'center', padding: '20px'}}>
            No state keys found
          </div>
        ) : (
          Object.keys(globalSnapshot)
            .sort()
            .map(key => {
              const editor = stateEditors[key];
              if (!editor) return null;

              return (
                <div key={key} style={STATE_ITEM_STYLES}>
                  {/* State key header */}
                  <div
                    style={STATE_HEADER_STYLES}
                    onClick={() => toggleExpanded(key)}>
                    <span style={STATE_KEY_STYLES}>
                      {editor.expanded ? '▼' : '▶'} {key}
                    </span>
                    <span style={{color: '#888', fontSize: '10px'}}>
                      {typeof globalSnapshot[key]}
                      {globalSnapshot[key] === null ? ' (null)' : ''}
                    </span>
                  </div>

                  {/* Expanded editor */}
                  {editor.expanded && (
                    <div style={{padding: '12px'}}>
                      <textarea
                        style={
                          editor.hasError
                            ? ERROR_TEXTAREA_STYLES
                            : TEXTAREA_STYLES
                        }
                        value={editor.jsonValue}
                        onChange={e => updateJsonValue(key, e.target.value)}
                        placeholder="Enter valid JSON..."
                      />
                      <div style={ACTION_BUTTONS_STYLES}>
                        <button
                          style={SET_BUTTON_STYLES}
                          disabled={editor.hasError}
                          onClick={() => applyJsonValue(key)}
                          title="Apply the JSON value to state">
                          Set
                        </button>
                        <button
                          style={RESET_BUTTON_STYLES}
                          onClick={() => resetStateValue(key)}
                          title="Reset this state key to null">
                          Reset
                        </button>
                      </div>
                      {editor.hasError && (
                        <div
                          style={{
                            color: '#f44336',
                            fontSize: '10px',
                            marginTop: '4px',
                          }}>
                          Invalid JSON format
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={HIDDEN_INPUT_STYLES}
        onChange={handleFileImport}
      />

      {/* Resize handle */}
      <div style={RESIZE_HANDLE_STYLES} onMouseDown={handleResizeStart}>
        <svg
          style={RESIZE_INDICATOR_STYLES}
          viewBox="0 0 16 16"
          fill="currentColor">
          <path d="M16 0v16h-16l16-16z" opacity="0.3" />
          <path
            d="M6 10l4-4m-2 2l4-4m-2 2l4-4"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
};

export default FusionDebugPanel;
