import { useEffect, useState } from 'react';

// Runs an async loader and tracks { data, error, loading }. Re-runs when deps change;
// results from an outdated run are ignored.
export function useApi(load, deps = []) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState({ data: undefined, error, loading: false }),
    );
    return () => { active = false; };
  }, deps);

  return state;
}
