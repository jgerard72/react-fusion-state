import React, { ReactNode } from 'react';
export type FusionGlobalState = {
    [key: string]: any;
};
type GlobalFusionStateContextType = {
    state: FusionGlobalState;
    setState: React.Dispatch<React.SetStateAction<FusionGlobalState>>;
    initializingKeys: Set<string>;
};
export declare const useGlobalState: () => GlobalFusionStateContextType;
export declare const FusionStateProvider: React.FC<{
    children: ReactNode;
}>;
export {};
