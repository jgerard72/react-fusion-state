import React from 'react';
import {render} from '@testing-library/react';
import {useDevToolsBridge} from '../../hooks/useDevToolsBridge';
import {GlobalState} from '../../types';

function Harness({
  config,
  initialState,
  onMount,
}: {
  config: Parameters<typeof useDevToolsBridge>[0];
  initialState: GlobalState;
  onMount: (api: ReturnType<typeof useDevToolsBridge>) => void;
}) {
  const api = useDevToolsBridge(config, initialState);
  React.useEffect(() => {
    onMount(api);
  }, [api, onMount]);
  return null;
}

describe('useDevToolsBridge', () => {
  it('reports enabled=false when config is undefined / false', () => {
    let captured: ReturnType<typeof useDevToolsBridge> | null = null;

    render(
      <Harness
        config={undefined}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );
    expect(captured!.enabled).toBe(false);

    render(
      <Harness
        config={false}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );
    expect(captured!.enabled).toBe(false);
  });

  it('reports enabled=false when no Redux DevTools extension is present (jsdom default)', () => {
    let captured: ReturnType<typeof useDevToolsBridge> | null = null;

    render(
      <Harness
        config={true}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    // jsdom has no Redux DevTools extension installed → bridge stays disabled.
    expect(captured!.enabled).toBe(false);
  });

  it('send is a no-op when disabled (does not throw)', () => {
    let captured: ReturnType<typeof useDevToolsBridge> | null = null;
    render(
      <Harness
        config={undefined}
        initialState={{}}
        onMount={(api) => (captured = api)}
      />,
    );

    expect(() => captured!.send('TEST', {x: 1}, 'x', {test: true})).not.toThrow();
  });

  it('accepts both boolean and DevToolsConfig shapes without throwing', () => {
    expect(() =>
      render(
        <Harness config={true} initialState={{}} onMount={() => {}} />,
      ),
    ).not.toThrow();

    expect(() =>
      render(
        <Harness
          config={{name: 'TestApp', trace: false, maxAge: 25}}
          initialState={{}}
          onMount={() => {}}
        />,
      ),
    ).not.toThrow();
  });
});
