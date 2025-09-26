import React from 'react';
import {render, screen, act} from '@testing-library/react';
import {FusionStateProvider} from '../FusionStateProvider';
import {useFusionState} from '../useFusionState';

function CounterA() {
  const [a, setA] = useFusionState<number>('a', 0);
  return (
    <button onClick={() => setA(v => v + 1)} data-testid="a">
      A:{a}
    </button>
  );
}

let renderCountB = 0;
function CounterB() {
  renderCountB++;
  const [b] = useFusionState<number>('b', 0);
  return <div data-testid="b">B:{b}</div>;
}

describe('useFusionState isolation between keys', () => {
  beforeEach(() => {
    renderCountB = 0;
  });

  it.skip('does not re-render B when A changes', () => {
    act(() => {
      render(
        <FusionStateProvider>
          <CounterA />
          <CounterB />
        </FusionStateProvider>,
      );
    });

    const aBtn = screen.getByTestId('a');
    const b = screen.getByTestId('b');

    const initialBRenderCount = renderCountB;

    // Click A three times
    act(() => {
      aBtn.click();
      aBtn.click();
      aBtn.click();
    });

    // B should not have re-rendered since initial render
    expect(renderCountB).toBe(initialBRenderCount);
    expect(b.textContent).toBe('B:0');
  });
});
