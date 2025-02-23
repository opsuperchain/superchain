# Superchain Development Tools

This monorepo contains development tools for building applications on the Superchain.

## Packages

- [@superchain/js](./superchain-js/README.md) - A TypeScript library for deploying and managing smart contracts across multiple EVM chains
- [@superchain/async](./superchain-async/) - Async utilities for Superchain development
- [@superchain/relay](./superchain-relay/) - Relay utilities for Superchain development

## Development

First, install [just](https://github.com/casey/just) and [foundry](https://book.getfoundry.sh/getting-started/installation).

```bash
# Install dependencies
just install

# Run tests
just test

# Build packages
just build

# Clean node_modules
just clean
```

## Documentation

- For @superchain/js documentation, see [superchain-js/README.md](./superchain-js/README.md)
- For @superchain/async documentation, see [superchain-async/README.md](./superchain-async/README.md)
- For @superchain/relay documentation, see [superchain-relay/README.md](./superchain-relay/README.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
