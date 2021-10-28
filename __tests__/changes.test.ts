import {matchChanges} from '../src/changes'
import {Package} from '../src/packages'

const pkg = (
  name: string,
  dependencies: string[] | string = [],
  path: string[] | string = ''
): Package => {
  const paths = Array.isArray(path) ? path : [path || name.toLowerCase()]
  const dir = paths[0]

  return {
    name,
    dir,
    paths: Array.isArray(paths) ? paths : [paths],
    dependencies: Array.isArray(dependencies) ? dependencies : [dependencies]
  }
}

test.each`
  files           | pkgs                         | expected
  ${['a']}        | ${[pkg('A'), pkg('B')]}      | ${['A']}
  ${['b']}        | ${[pkg('A'), pkg('B')]}      | ${['B']}
  ${['c']}        | ${[pkg('A'), pkg('B')]}      | ${[]}
  ${['a']}        | ${[pkg('A'), pkg('B')]}      | ${['A']}
  ${['b']}        | ${[pkg('A', 'B'), pkg('B')]} | ${['A', 'B']}
  ${['c']}        | ${[pkg('A', 'B'), pkg('B')]} | ${[]}
  ${['a/test']}   | ${[pkg('A')]}                | ${['A']}
  ${['a.backup']} | ${[pkg('A')]}                | ${[]}
`('With $files changes, should find $expected', ({files, pkgs, expected}) => {
  const matches = matchChanges(files, pkgs)
  expect(matches.length).toBe(expected.length)

  const pkgNames = matches.map(m => m.name)
  expected.forEach(expect(pkgNames).toContain)
})

test('detects dependency loops', () => {
  const pkgs = [pkg('A', 'B'), pkg('B', 'A')]
  expect(() => matchChanges(['ignore'], pkgs)).toThrow()
})
