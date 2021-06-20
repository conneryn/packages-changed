import * as core from '@actions/core'
import {matchChanges} from './changes'
import {getRecentChanges} from './git'
import {getPackages} from './packages'

async function run(): Promise<void> {
  try {
    const from = core.getInput('from') || 'HEAD^1'
    const to = core.getInput('to') || 'HEAD'
    const basePath = core.getInput('path') || process.cwd()

    // eslint-disable-next-line no-console
    console.log(from, to, basePath)

    const files = await getRecentChanges(basePath, from, to)
    core.debug(`Found ${files.length} file changes ...`)

    const packages = await getPackages(basePath)
    core.debug(`Project has ${packages.length} packages ...`)

    const changed = matchChanges(files, packages)
    core.debug(`Detected ${changed.length} packages with changes ...`)

    core.setOutput('pkgs', changed)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
