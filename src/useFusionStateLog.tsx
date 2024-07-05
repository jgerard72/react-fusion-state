import {useGlobalState} from './FusionStateProvider';
import {useEffect, useState} from 'react';

type StateKey = string;

export const useFusionStateLog = (keys?: StateKey[]): any => {
  const {state} = useGlobalState();
  const [selectedState, setSelectedState] = useState<any>({});

  useEffect(() => {
    if (!keys) {
      setSelectedState(state);
    } else {
      const result: any = {};
      keys.forEach(key => {
        if (state.hasOwnProperty(key)) {
          result[key] = state[key];
        }
      });
      setSelectedState(result);
    }
  }, [keys?.toString(), state]);

  return selectedState;
};
