import { getRecentChanges } from '../src/git'

test('getRecentChanges does not throw', () => {
    expect(async () => await getRecentChanges("../")).not.toThrow()
})