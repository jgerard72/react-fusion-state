'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.useFusionStateLog = void 0;
const FusionStateProvider_1 = require('./FusionStateProvider');
const react_1 = require('react');
const useFusionStateLog = keys => {
  const {state} = (0, FusionStateProvider_1.useGlobalState)();
  const [selectedState, setSelectedState] = (0, react_1.useState)({});
  (0, react_1.useEffect)(() => {
    if (!keys) {
      setSelectedState(state);
    } else {
      const result = {};
      keys.forEach(key => {
        if (state.hasOwnProperty(key)) {
          result[key] = state[key];
        }
      });
      setSelectedState(result);
    }
  }, [keys === null || keys === void 0 ? void 0 : keys.toString(), state]);
  return selectedState;
};
exports.useFusionStateLog = useFusionStateLog;
