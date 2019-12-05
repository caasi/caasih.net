import { useState, useEffect } from 'react';
import useFold from './use-fold';

const concat = (acc = [], x) => [...acc, x];

function useSpace(state) {
  return useFold(state, concat, []);
}

export default useSpace;
