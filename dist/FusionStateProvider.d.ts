import React, {ReactNode} from 'react';
export type GlobalState = {
  [key: string]: any;
};
type GlobalFusionStateContextType = {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  initializingKeys: Set<string>;
};
export declare const useGlobalState: () => GlobalFusionStateContextType;
export declare const FusionStateProvider: React.FC<{
  children: ReactNode;
}>;
export {};
