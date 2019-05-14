import { useSpace } from '@caasi/hooks'

function SpaceTime({ children }) {
  const [cs] = useSpace(children)
  return cs === undefined ? null : cs
}

export default SpaceTime;
