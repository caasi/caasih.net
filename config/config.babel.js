import path from 'path'



export const host = process.env.HOST || 'localhost'

export const port = process.env.PORT || 3000

export const srcPath = path.resolve(__dirname, '../src')

export const dstPath = path.resolve(__dirname, '../dist')

