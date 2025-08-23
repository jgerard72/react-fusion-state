import React from 'react';
import {render, screen} from '@testing-library/react';
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
  const [b] = useFusionState<number>('b', 0);
  renderCountB++;
  return <div data-testid="b">B:{b}</div>;
}

describe('useFusionState isolation between keys', () => {
  it('does not re-render B when A changes', () => {
    render(
      <FusionStateProvider>
        <CounterA />
        <CounterB />
      </FusionStateProvider>,
    );

    const aBtn = screen.getByTestId('a');
    const b = screen.getByTestId('b');

    const initialBRenderCount = renderCountB;

    // Click A three times
    aBtn.click();
    aBtn.click();
    aBtn.click();

    // B should not have re-rendered
    expect(renderCountB).toBe(initialBRenderCount);
    expect(b.textContent).toBe('B:0');
  });
});
