import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
} from 'react';

export type GlobalState = {
  [key: string]: any;
};

type GlobalFusionStateContextType = {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  initializingKeys: Set<string>;
};

const GlobalStateContext = createContext<
  GlobalFusionStateContextType | undefined
>(undefined);

export const useGlobalState = (): GlobalFusionStateContextType => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error(
      'ReactFusionState Error : useFusionState must be used within a FusionStateProvider',
    );
  }
  return context;
};

export const FusionStateProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [state, setState] = useState<GlobalState>({});
  const initializingKeys = useRef<Set<string>>(new Set());

  return (
    <GlobalStateContext.Provider
      value={{state, setState, initializingKeys: initializingKeys.current}}>
      {children}
    </GlobalStateContext.Provider>
  );
};
