import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {FusionStateProvider} from '../../FusionStateProvider';
import {useFusionState} from '../../useFusionState';
import {FusionDebugPanel} from '../FusionDebugPanel';

// Test component that uses fusion state
const TestComponent: React.FC = () => {
  const [count, setCount] = useFusionState('count', 0);
  const [user, setUser] = useFusionState('user', {name: 'John', age: 30});

  return (
    <div>
      <div data-testid="count">Count: {String(count)}</div>
      <div data-testid="user">User: {JSON.stringify(user)}</div>
      <button
        onClick={() => setCount(typeof count === 'number' ? count + 1 : 1)}>
        Increment
      </button>
      <button
        onClick={() =>
          setUser(
            typeof user === 'object' && user !== null
              ? {...user, age: user.age + 1}
              : {name: 'John', age: 30},
          )
        }>
        Age Up
      </button>
    </div>
  );
};

// Test app with debug panel
const TestApp: React.FC<{debugVisible?: boolean}> = ({debugVisible = true}) => {
  const [visible, setVisible] = React.useState(debugVisible);

  return (
    <FusionStateProvider>
      <TestComponent />
      <FusionDebugPanel visible={visible} onVisibilityChange={setVisible} />
    </FusionStateProvider>
  );
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
    render(<TestApp debugVisible={true} />);

    expect(screen.getByText('Fusion State Debugger')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    render(<TestApp debugVisible={false} />);

    expect(screen.queryByText('Fusion State Debugger')).not.toBeInTheDocument();
  });

  it('displays state keys from useFusionStateLog', async () => {
    render(<TestApp />);

    // Wait for state to be initialized
    await waitFor(() => {
      expect(screen.getByText(/count/)).toBeInTheDocument();
      expect(screen.getByText(/user/)).toBeInTheDocument();
    });
  });

  it('can expand and collapse state editors', async () => {
    render(<TestApp />);

    // Wait for state to be initialized
    await waitFor(() => {
      expect(screen.getByText(/count/)).toBeInTheDocument();
    });

    // Find and click on count state key to expand
    const countHeader = screen.getByText(/▶ count/);
    fireEvent.click(countHeader);

    // Should now show expanded state (▼) and textarea
    await waitFor(() => {
      expect(screen.getByText(/▼ count/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    // Click again to collapse
    const expandedCountHeader = screen.getByText(/▼ count/);
    fireEvent.click(expandedCountHeader);

    // Should be collapsed again
    await waitFor(() => {
      expect(screen.getByText(/▶ count/)).toBeInTheDocument();
      expect(screen.queryByDisplayValue('0')).not.toBeInTheDocument();
    });
  });

  it('can edit and apply JSON values', async () => {
    render(<TestApp />);

    // Wait for state to be initialized and expand count
    await waitFor(() => {
      expect(screen.getByText(/count/)).toBeInTheDocument();
    });

    const countHeader = screen.getByText(/▶ count/);
    fireEvent.click(countHeader);

    await waitFor(() => {
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    // Edit the JSON value
    const textarea = screen.getByDisplayValue('0');
    fireEvent.change(textarea, {target: {value: '42'}});

    // Click Set button to apply
    const setButton = screen.getByText('Set');
    fireEvent.click(setButton);

    // Verify the state was updated in the test component
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 42');
    });
  });

  it('can reset state values to null', async () => {
    render(<TestApp />);

    // Wait for state to be initialized and expand count
    await waitFor(() => {
      expect(screen.getByText(/count/)).toBeInTheDocument();
    });

    const countHeader = screen.getByText(/▶ count/);
    fireEvent.click(countHeader);

    await waitFor(() => {
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    // Click Reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Verify the state was reset to null
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Count: null');
    });
  });

  it('shows error for invalid JSON', async () => {
    render(<TestApp />);

    // Wait for state to be initialized and expand count
    await waitFor(() => {
      expect(screen.getByText(/count/)).toBeInTheDocument();
    });

    const countHeader = screen.getByText(/▶ count/);
    fireEvent.click(countHeader);

    await waitFor(() => {
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    // Enter invalid JSON
    const textarea = screen.getByDisplayValue('0');
    fireEvent.change(textarea, {target: {value: 'invalid json'}});

    // Should show error message and disable Set button
    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
      expect(screen.getByText('Set')).toBeDisabled();
    });
  });

  it('has export functionality', () => {
    render(<TestApp />);

    // Just verify the export button exists and can be clicked
    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).toHaveAttribute(
      'title',
      'Export current state snapshot',
    );

    // The actual export functionality is tested in integration
    fireEvent.click(exportButton);
    // No error should be thrown
  });

  it('can close the panel', () => {
    const onVisibilityChange = jest.fn();

    render(
      <FusionStateProvider>
        <TestComponent />
        <FusionDebugPanel
          visible={true}
          onVisibilityChange={onVisibilityChange}
        />
      </FusionStateProvider>,
    );

    // Click close button (×)
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onVisibilityChange).toHaveBeenCalledWith(false);
  });
});
