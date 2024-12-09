type SetStateAction<T> = T | ((prevState: T) => T);
type StateUpdater<T> = (value: SetStateAction<T>) => void;
export declare function useFusionState<T>(key: string, initialValue?: T): [T, StateUpdater<T>];
export {};
