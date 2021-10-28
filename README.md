<p align="center">
  <a href="https://github.com/conneryn/packages-changed/actions"><img alt="packages-changed status" src="https://github.com/conneryn/packages-changed/workflows/build-test/badge.svg"></a>
</p>

# GitHub action to detect which packages have changed

Use this GitHub action to determine which of a projects packages changed.

This allows you to control which jobs are run or skipped based on where the code has changed.

## Options

| Parameter | Description
| --------- | -----------
| from      | commit reference to check for changes from.  Default: `HEAD~1`.
| to        | commit reference to check for changes to. Default: `HEAD`.
| path      | starting path to look for changes.  Default: the current working directory.

## Outputs

| Parameter | Type      | Description
| --------- | --------- | -----------
| pkgs      | string[]  | Array of package names (ex: `["@conneryn/pkg1","@conneryn/pkg2"]`)
| dirs      | string[]  | Array of root directories for each package that has changed (ex: `["packages/pk1/","packages/pkg2"])

## Usage Examples

### Scope lerna tests

```yaml
jobs:
  tests:
    name: Run tests for projects with changes
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
      with:
        fetch-depth: 0
    - name: Check packages
      id: changes
      uses: conneryn/packages-changed@v1
    - name: Run tests
      run: |
        lerna test --scope '${{ join(steps.changes.outputs.pkgs, ',') }}'
```

### Control Jobs by package

```yaml
jobs:
  check:
    name: Checking changes
    outputs:
      pkgs: ${{ steps.changes.outputs.pkgs }}
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
      with:
        fetch-depth: 2
    - name: Check packages
      id: changes
      uses: conneryn/packages-changed@v1

  pkgAjob:
    name: Run test/deployments for @myorg/pkg-a
    needs: check
    if: ${{ contains(needs.check.output.pkgs, '@myorg/pkg-a') }}
    steps:
      # ...

  pkgBjob:
    name: Run test/deployments for @myorg/pkg-b
    needs: check
    if: ${{ contains(needs.check.output.pkgs, '@myorg/pkg-b') }}
    steps:
      # ...
```
