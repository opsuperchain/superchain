# justfile

# Install command: installs dependencies for all packages
install:
    @echo "Installing dependencies for superchain-js..."
    cd packages/superchain-js && npm install

# Build command: builds the superchain-js package
build:
    @echo "Building superchain-js..."
    cd packages/superchain-js && npm run build

# Test command: runs tests for the superchain-js package
test:
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