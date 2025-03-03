import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
} from 'react';

export type GlobalState = Record<string, unknown>;

interface GlobalFusionStateContextType {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  initializingKeys: Set<string>;
}

const GlobalStateContext = createContext<
  GlobalFusionStateContextType | undefined
>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);

  if (!context) {
    throw new Error(
      'ReactFusionState Error: useFusionState must be used within a FusionStateProvider',
    );
  }

  return context;
};

export const FusionStateProvider = ({children}: {children: ReactNode}) => {
  const [state, setState] = useState<GlobalState>({});
  const initializingKeys = useRef<Set<string>>(new Set());

  const value = {
    state,
    setState,
    initializingKeys: initializingKeys.current,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};
