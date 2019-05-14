import { useState, useEffect } from 'react';

function useSpace(state) {
  const [states, setStates] = useState();

  useEffect(() => {
    if (state === undefined) {
      setStates();
      return;
    }

    setStates((ss = []) => [...ss, state]);
  }, [state]);

  return [states, setStates];
}

export default useSpace;
