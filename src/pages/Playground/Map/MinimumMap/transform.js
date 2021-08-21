/* @flow */

/*::
import type { Box, PartialBox, Point } from './geometry'
*/

export const makeTransformers
/*: (Box, Box) => { toScreen: PartialBox => Box, toGlobal: PartialBox => Box } */
  = (screen, viewport) => ({
    toScreen: ({ x = 0, y = 0, width = 0, height = 0 }) => {
      const scaleX = screen.width / viewport.width
      const scaleY = screen.height / viewport.height
      return {
        x: (x - viewport.x) * scaleX,
        y: (y - viewport.y) * scaleY,
        width: width * scaleX,
        height: height * scaleY,
      }
    },
    toGlobal: ({ x = 0, y = 0, width = 0, height = 0 }) => {
      const scaleX = viewport.width / screen.width
      const scaleY = viewport.height / screen.height
      return {
        x: x * scaleX + viewport.x,
        y: y * scaleY + viewport.y,
        width: width * scaleX,
        height: height * scaleY,
      }
    },
  })
