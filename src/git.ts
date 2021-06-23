import {exec, ExecOptions} from '@actions/exec'
import {error} from '@actions/core'
import * as path from 'path'

export async function getRecentChanges(
  basePath: string,
  from: string,
  to: string
): Promise<string[]> {
  const paths = await getFilesChanged(basePath, from, to)

  const submodules = await getSubmodules(basePath)
  for (const submodule of submodules) {
    if (!paths.includes(submodule)) continue

    // Add paths from submodule changes!
    const subPaths = await getSubmoduleChanges(basePath, submodule)
    paths.push(...subPaths)
  }

  return paths
}

async function execCmd(
  cmd: string,
  args: string[],
  options?: ExecOptions
): Promise<string[]> {
  const lines: string[] = []
  options = options || {}
  options.listeners = options.listeners || {}
  options.listeners.stdline = (line: string) => lines.push(line)
  options.listeners.errline = (line: string) => error(line)
  options.silent = true

  await exec(cmd, args, options)

  return lines
}

async function getFilesChanged(
  basePath: string,
  from: string,
  to: string
): Promise<string[]> {
  const paths = await execCmd('git', ['diff', '--name-only', from, to], {
    cwd: basePath
  })
  return paths.map(p => path.resolve(basePath, p))
}

async function getSubmodules(basePath: string): Promise<string[]> {
  const submodules = await execCmd(
    'git',
    ['config', '--file', '.gitmodules', '--get-regexp', 'path'],
    {cwd: basePath, ignoreReturnCode: true}
  )

  return submodules
    .map(s => s.slice(s.indexOf(' ')))
    .map(s => path.resolve(basePath, s))
}

async function getSubmoduleChanges(
  basePath: string,
  submodule: string
): Promise<string[]> {
  const diff = await execCmd('git', ['diff', submodule], {cwd: basePath})
  if (!diff.length) return []

  const to = diff.pop()?.split(' ').pop()
  const from = diff.pop()?.split(' ').pop()

  if (!from || !to) return []

  return await getRecentChanges(submodule, from, to)
}
