import * as fs from 'fs'
import * as path from 'path'
import {parse} from 'json5'

export const {readdir, readFile} = fs.promises

export async function loadJsonFile<T>(
  ...fileSegments: string[]
): Promise<T | null> {
  const data = await loadFile(...fileSegments)
  if (data) {
    return parse<T>(data)
  }
  return null
}

export async function loadFile(
  ...fileSegments: string[]
): Promise<string | null> {
  try {
    const filePath = path.join(...fileSegments)
    const result = await readFile(filePath)
    return result.toString('utf-8')
  } catch (error: unknown) {
    if ((error as {code: string}).code === 'ENOENT') {
      return null
    }
    throw error
  }
}
