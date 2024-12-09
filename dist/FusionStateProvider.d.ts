import React, { ReactNode } from 'react';
export type GlobalState = Record<string, unknown>;
interface GlobalFusionStateContextType {
    state: GlobalState;
    setState: React.Dispatch<React.SetStateAction<GlobalState>>;
    initializingKeys: Set<string>;
}
export declare const useGlobalState: () => GlobalFusionStateContextType;
export declare const FusionStateProvider: ({ children }: {
    children: ReactNode;
}) => React.JSX.Element;
export {};
