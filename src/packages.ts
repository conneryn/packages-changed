import * as glob from '@actions/glob'
import { debug } from '@actions/core'
import path, { dirname } from 'path'
import { loadJsonFile } from './files'

export type Package = {
    name: string
    paths: string[]
    dependencies: string[]
}

export async function getPackages(basePath: string): Promise<Package[]> {
    const globPattern = path.join(basePath, '**', 'package.json')
    const globber = await glob.create(globPattern)

    const tasks: Promise<Package>[] = []
    for await (const pkg of globber.globGenerator()) {
        tasks.push(getPackage(pkg))
    }
    return await Promise.all(tasks)
}

async function getPackage(path: string): Promise<Package> {
    const pkgJson = await loadJsonFile(path)

    const dir = dirname(path)
    const tsConfig = loadJsonFile(dir, "tsconfig.json")

    const dependencies = [].concat(
        pkgJson.dependencies || [],
        pkgJson.devDependencies || [],
        pkgJson.optionalDependencies || [],
    )

    return {
        name: pkgJson.name,
        dependencies,
        paths: paths(dir, pkgJson, tsConfig)
    }
}

function paths(packageRoot: string, pkgJson: any, tsConfig: any) {
    const paths: string[] = []
    const add = (items: any) => {
        if (!items) return
        if (Array.isArray(items))
            paths.push(...items.map(item => path.resolve(packageRoot, item)))
        else if (typeof items === 'string')
            paths.push(path.resolve(packageRoot, items))
        else if (typeof items === 'object')
            add(Object.values(items))
    }

    if (tsConfig) {
        add("package.json")
        add("tsconfig.json")
        add(tsConfig.compilerOptions?.rootDir)
        add(tsConfig.include)

        add(pkgJson.files)
        add(pkgJson.directories)
    }
    
    if (!paths.length)
        add("./")

    return paths
}