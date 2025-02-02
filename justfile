# justfile

# Check if foundry is installed
_check-foundry:
    #!/usr/bin/env bash
    if ! command -v forge &> /dev/null; then
        echo "Error: Foundry is not installed. Please install foundry first: https://book.getfoundry.sh/getting-started/installation"
        exit 1
    fi
    echo "Foundry is installed"

# Install dependencies (requires foundry)
install: _check-foundry
    @echo "Installing dependencies for superchain-js..."
    cd packages/superchain-js && npm install

# Build command: builds the superchain-js package
build:
    @echo "Building superchain-js..."
    cd packages/superchain-js && npm run build

# Test command: runs tests for the superchain-js package
test: _check-foundry
    @echo "Running tests for superchain-js..."
    cd packages/superchain-js && npm test

# Lint command: lints the superchain-js package
lint:
    @echo "Linting superchain-js..."
    cd packages/superchain-js && npm run lint

# Clean command: removes node_modules from all packages
clean:
    @echo "Cleaning node_modules in packages..."
    rm -rf packages/*/node_modules 

# Release command: publishes the superchain-js package to npm
release: build
    #!/usr/bin/env bash
    cd packages/superchain-js
    if [ -z "$NPM_TOKEN" ]; then
        echo "Error: NPM_TOKEN environment variable is not set"
        exit 1
    fi
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    echo "Publishing superchain-js..."
    npm publish --access public
    rm -f .npmrc 