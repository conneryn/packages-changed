import * as core from '@actions/core'
import * as path from 'path'
import {matchChanges} from './changes'
import {getRecentChanges} from './git'
import {getPackages} from './packages'

async function run(): Promise<void> {
  try {
    const from = core.getInput('from') || 'HEAD~1'
    const to = core.getInput('to') || 'HEAD'
    const basePath = path.resolve(process.cwd(), core.getInput('path'))

    const files = await getRecentChanges(basePath, from, to)
    core.info(`Found ${files.length} file changes ...`)

    const packages = await getPackages(basePath)
    core.info(`Project has ${packages.length} packages ...`)

    const changed = matchChanges(files, packages)
    core.info(`Detected ${changed.length} packages with changes ...`)

    core.setOutput('pkgs', changed)
  } catch (error) {
    core.setFailed(error.message)

    throw error
  }
}

run()
