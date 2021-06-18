import * as path from 'path'
import { getPackages } from '../src/packages'

test('getPackages finds this package', async () => {
    const pkgJson = require('../package.json')

    const packages = await getPackages(path.resolve(__dirname, '../'))
    expect(packages.length).toBeGreaterThan(0)
    
    const thisPkg = packages.find(p => p.name === pkgJson.name)
    expect(thisPkg).toBeTruthy()
})