import {useGlobalState} from './FusionStateProvider';
import {useEffect, useState, useRef} from 'react';
import isEqual from 'lodash.isequal';

type StateKey = string;
type SelectedState = Record<string, unknown>;

export const useFusionStateLog = (keys?: StateKey[]): SelectedState => {
  const {state} = useGlobalState();
  const [selectedState, setSelectedState] = useState<SelectedState>({});

  const previousKeys = useRef<StateKey[] | undefined>(undefined);

  useEffect(() => {
    if (!keys || isEqual(keys, previousKeys.current)) {
      setSelectedState(state);
    } else {
      const result: SelectedState = {};
      keys.forEach(key => {
        if (state.hasOwnProperty(key)) {
          result[key] = state[key];
        }
      });
      setSelectedState(result);
    }
    previousKeys.current = keys;
  }, [state]);

  return selectedState;
};
