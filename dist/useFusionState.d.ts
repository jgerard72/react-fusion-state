/// <reference types="react" />
type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;
export declare const useFusionState: <T>(
  key: string,
  initialValue?: T | undefined,
) => [T, SetValue<T>];
export {};
