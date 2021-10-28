import * as glob from '@actions/glob'
import * as path from 'path'
import {loadJsonFile} from './files'

export type Package = {
  name: string
  dir: string
  paths: string[]
  dependencies: string[]
}

export async function getPackages(basePath: string): Promise<Package[]> {
  const globPatterns = [
    path.join(basePath, '**', 'package.json'),
    '!**/node_modules/**'
  ]

  const globber = await glob.create(globPatterns.join('\n'))

  const tasks: Promise<Package>[] = []
  for await (const pkg of globber.globGenerator()) {
    tasks.push(getPackage(pkg))
  }
  return await Promise.all(tasks)
}

async function getPackage(pkgJsonFile: string): Promise<Package> {
  const pkgJson = await loadJsonFile<PkgJson>(pkgJsonFile)
  if (pkgJson === null) throw new Error(`Failed to load ${pkgJsonFile}`)

  const dir = path.dirname(pkgJsonFile)
  const tsConfig = await loadJsonFile<TsConfig>(dir, 'tsconfig.json')

  const dependencies = Object.assign(
    {},
    pkgJson.dependencies || {},
    pkgJson.devDependencies || {},
    pkgJson.optionalDependencies || {}
  )

  return {
    name: pkgJson.name,
    dir,
    dependencies: Object.keys(dependencies),
    paths: paths(dir, pkgJson, tsConfig)
  }
}

type StringOrArray = string[] | string | undefined

export type PkgJson = null | {
  name: string
  files?: StringOrArray
  directories?: StringOrArray

  dependencies?: {[key: string]: string}
  devDependencies?: {[key: string]: string}
  optionalDependencies?: {[key: string]: string}
}

export type TsConfig = null | {
  compilerOptions?: {
    rootDir?: StringOrArray
  }
  include?: StringOrArray
}

function paths(
  packageRoot: string,
  pkgJson: PkgJson,
  tsConfig: TsConfig
): string[] {
  const results: string[] = []
  const add = (items: StringOrArray): void => {
    if (!items) return
    if (Array.isArray(items))
      results.push(...items.map(item => path.resolve(packageRoot, item)))
    else if (typeof items === 'string')
      results.push(path.resolve(packageRoot, items))
    else if (typeof items === 'object') add(Object.values(items))
  }

  if (tsConfig) {
    add('package.json')
    add('tsconfig.json')
    add(tsConfig.compilerOptions?.rootDir)
    add(tsConfig.include)

    add(pkgJson?.files)
    add(pkgJson?.directories)
  }

  if (!results.length) add('./')

  return results
}
