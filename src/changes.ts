import { Package } from './packages'

enum Status {
    Unknown,
    Pending,
    Changed,
    Unchanged,
}

type Lookup = {
    status: Status,
    package: Package,
}

export function matchChanges(files: string[], packages: Package[]) {
    const lookup = new Map<string, Lookup>(packages.map(p => [
        p.name,
        {
            status: Status.Unknown,
            package: p
        }
    ]))

    const checkLookupItem = (item: Lookup) => {
        switch(item.status) {
            case Status.Changed:
                return true
            case Status.Pending:
                throw new Error("Circular dependency detected")
            case Status.Unchanged:
                return false
            case Status.Unknown:
                // Start lookup
                item.status = Status.Pending
                // Store lookup response
                item.status = checkPackage(item.package)
                return item.status === Status.Changed
            default:
                throw new Error(`Unknown status type: ${item.status}`)
        }
    }

    const checkPackage = (pkg: Package) => {
        // check dependencies for changes!
        const dependencies = pkg.dependencies?.map(lookup.get.bind(lookup)) || []

        // First check if any dependency have changed (only need one)
        if (dependencies.find(d => d && checkLookupItem(d)))
            return Status.Changed
        
        // Check if this package paths have any changes
        return pkg.paths?.find(p => files.find(f => f.startsWith(p))) ?
            Status.Changed : Status.Unchanged
    }

    lookup.forEach(checkLookupItem)

    // Return all changed packages
    return Array.from(lookup.values())
        .filter(p => p.status === Status.Changed)
        .map(p => p.package.name)
}