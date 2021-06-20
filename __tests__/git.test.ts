import * as path from 'path'
import {getRecentChanges} from '../src/git'

const SHA1 = '8413a23fcac1305c6a0e65c530d59398bd4f00a2'
const SHA2 = 'ee624e106887288c3346deec8afa3ad7a6b426b2'
const REMOVED_FILE = 'src/dummy.test.file.ts'

const basePath = path.resolve(__dirname, '..')

test('getRecentChanges does not throw', async () => {
  await expect(
    getRecentChanges(basePath, 'HEAD~1', 'HEAD')
  ).resolves.not.toThrow()
})

test('getRecentChanges returns one file', async () => {
  await expect(getRecentChanges(basePath, SHA1, SHA2)).resolves.toHaveLength(1)
})

test('getRecentChanges to contain removed file', async () => {
  await expect(getRecentChanges(basePath, SHA1, SHA2)).resolves.toContain(
    path.resolve(basePath, REMOVED_FILE)
  )
})
