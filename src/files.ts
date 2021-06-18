import * as fs from 'fs'
import * as path from 'path'

export const {
  lstat,
  readdir,
  readFile,
  stat,
} = fs.promises

export const IS_WINDOWS = process.platform === 'win32'

export async function exists(fsPath: string): Promise<boolean> {
  try {
    await stat(fsPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw err
  }

  return true
}

export async function loadJsonFile(...fileSegments: string[]) {
    const filePath = path.join(...fileSegments)
    if (await exists(filePath)) {
        const result = await readFile(filePath)
        return JSON.parse(result.toString())
    }
    return null
}