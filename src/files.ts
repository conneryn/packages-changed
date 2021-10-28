import * as fs from 'fs'
import * as path from 'path'
import {parse} from 'json5'

export const {lstat, readdir, readFile, stat} = fs.promises

export async function exists(fsPath: string): Promise<boolean> {
  try {
    await stat(fsPath)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return false
    }

    throw err
  }

  return true
}

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
  const filePath = path.join(...fileSegments)
  if (await exists(filePath)) {
    const result = await readFile(filePath)
    return result.toString('utf-8')
  }
  return null
}
