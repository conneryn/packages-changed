import {Package} from './packages'
import {sep} from 'path'

enum LookupStatus {
  Unknown,
  Pending,
  Changed,
  Unchanged
}

type Lookup = {
  status: LookupStatus
  package: Package
}

export function matchChanges(files: string[], packages: Package[]): string[] {
  const lookup = new Map<string, Lookup>(
    packages.map(p => [
      p.name,
      {
        status: LookupStatus.Unknown,
        package: p
      }
    ])
  )

  const checkLookupItem = (item: Lookup): boolean => {
    switch (item.status) {
      case LookupStatus.Changed:
        return true
      case LookupStatus.Pending:
        throw new Error('Circular dependency detected')
      case LookupStatus.Unchanged:
        return false
      case LookupStatus.Unknown:
        // Start lookup
        item.status = LookupStatus.Pending
        // Store lookup response
        item.status = checkPackage(item.package)
        return item.status === LookupStatus.Changed
      default:
        throw new Error(`Unknown status type: ${item.status}`)
    }
  }

  const checkPackage = (pkg: Package): LookupStatus => {
    // check dependencies for changes!
    const dependencies = pkg.dependencies?.map(lookup.get.bind(lookup)) || []

    // First check if any dependency have changed (only need one)
    if (dependencies.find(d => d && checkLookupItem(d)))
      return LookupStatus.Changed

    // Check if this package paths have any changes
    return pkg.paths?.find(p =>
      files.find(f => f === p || f.startsWith(`${p}${sep}`))
    )
      ? LookupStatus.Changed
      : LookupStatus.Unchanged
  }

  for (const [, v] of lookup) {
    checkLookupItem(v)
  }

  // Return all changed packages
  return Array.from(lookup.values())
    .filter(p => p.status === LookupStatus.Changed)
    .map(p => p.package.name)
}
