import * as core from '@actions/core'
import { matchChanges } from './changes'
import { getRecentChanges } from './git'
import { getPackages } from './packages'

async function run(): Promise<void> {
  try {
    const basePath = process.cwd()

    const files = await getRecentChanges(basePath)
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
