import * as path from 'path'
import * as files from '../src/files'
import {PkgJson} from '../src/packages'

const pkgJsonFile = path.join(__dirname, '../package.json')

test('exists returns true for files found', async () => {
  expect(await files.exists(pkgJsonFile)).toBeTruthy()
})

test('exists returns false for giberish found', async () => {
  expect(await files.exists(`${pkgJsonFile}.doesnotexist`)).toBeFalsy()
})

test('loadJsonFile loads package.json', async () => {
  const pkgJson = require('../package.json')

  const json = await files.loadJsonFile<PkgJson>(pkgJsonFile)
  expect(json).toBeTruthy()
  expect(json?.name).toBe(pkgJson.name)
})
