import { useMemo } from 'react';
import { useEnvironment } from '../context/EnvironmentContext.jsx';
import { buildVariableMap } from '../utils/interpolate.js';

export function useVariableMap() {
  const { environments, activeId } = useEnvironment();
  return useMemo(
    () => buildVariableMap(environments, activeId || localStorage.getItem('activeEnvironmentId')),
    [environments, activeId]
  );
}
