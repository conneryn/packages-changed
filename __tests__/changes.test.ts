import {matchChanges} from '../src/changes'
import {Package} from '../src/packages'

const pkg = (
  name: string,
  paths: string[] | string = [],
  dependencies: string[] | string = []
): Package => {
  return {
    name,
    paths: Array.isArray(paths) ? paths : [paths],
    dependencies: Array.isArray(dependencies) ? dependencies : [dependencies]
  }
}

test.each`
  files           | pkgs                                   | expected
  ${['a']}        | ${[pkg('A', 'a'), pkg('B', 'b')]}      | ${['A']}
  ${['b']}        | ${[pkg('A', 'a'), pkg('B', 'b')]}      | ${['B']}
  ${['c']}        | ${[pkg('A', 'a'), pkg('B', 'b')]}      | ${[]}
  ${['a']}        | ${[pkg('A', 'a', 'B'), pkg('B', 'b')]} | ${['A']}
  ${['b']}        | ${[pkg('A', 'a', 'B'), pkg('B', 'b')]} | ${['A', 'B']}
  ${['c']}        | ${[pkg('A', 'a', 'B'), pkg('B', 'b')]} | ${[]}
  ${['a/test']}   | ${[pkg('A', 'a')]}                     | ${['A']}
  ${['a.backup']} | ${[pkg('A', 'a')]}                     | ${[]}
`('With $files changes, should find $expected', ({files, pkgs, expected}) => {
  const matches = matchChanges(files, pkgs)
  expect(matches.length).toBe(expected.length)

  expected.forEach(expect(matches).toContain)
})

test('detects dependency loops', () => {
  const pkgs = [pkg('A', [], ['B']), pkg('B', [], ['A'])]
  expect(() => matchChanges(['ignore'], pkgs)).toThrow()
})
