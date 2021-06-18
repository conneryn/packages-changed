import { exec } from '@actions/exec'
import * as path from 'path'

export async function getRecentChanges(basePath: string) {
    const paths: string[] = []
    const options = {
        cwd: basePath,
        listeners: {
            stdline: paths.push
        }
    }
    
    await exec("git", [
        "diff", "--name-only", "HEAD~1", "HEAD"
    ], options)

    // TODO get submodules as well.

    // Resolve to full path
    return paths.map(p => path.resolve(basePath, p))
}