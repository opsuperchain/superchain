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
    cd superchain-js && npm install
    @echo "Installing dependencies for superchain-async..."
    cd superchain-async && npm install

# Build command: builds both packages
build:
    @echo "Building superchain-js..."
    cd superchain-js && npm run build
    @echo "Building superchain-async..."
    cd superchain-async && npm run build

# Test command: runs tests for both packages
test: _check-foundry
    @echo "Running tests for superchain-js..."
    cd superchain-js && npm test
    @echo "Checking if port 9545 is free..."
    #!/usr/bin/env bash
    while lsof -i :9545 >/dev/null 2>&1; do \
        echo "Waiting for port 9545 to be released..."; \
        sleep 1; \
    done
    echo "Port 9545 is free"
    @echo "Running tests for superchain-async (with local superchain-js)..."
    cd superchain-async && npm run test-local

# Lint command: lints the superchain-js package
lint:
    @echo "Linting superchain-js..."
    cd superchain-js && npm run lint

# Clean command: removes node_modules from all packages
clean:
    @echo "Cleaning node_modules in packages..."
    rm -rf */node_modules

# Release command: publishes the superchain-js package to npm
release: build
    #!/usr/bin/env bash
    cd superchain-js
    if [ -z "$NPM_TOKEN" ]; then
        echo "Error: NPM_TOKEN environment variable is not set"
        exit 1
    fi
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    echo "Publishing superchain-js..."
    npm publish --access public
    rm -f .npmrc 