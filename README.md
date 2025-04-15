# ADHD Companion

A comprehensive application to help individuals with ADHD manage tasks and improve productivity.

## Project Structure

This project is organized as a monorepo using Turborepo with the following structure:

### Apps (@apps)

- **@apps/docs**: Documentation site
- **@apps/backend**: Backend API
- **@apps/native**: Mobile app

### Packages (@packages)

- **@packages/ui**: Shared UI components
- **@packages/shared**: Shared business logic and types
- **@packages/eslint-config**: ESLint configuration
- **@packages/tailwind-config**: Tailwind configuration
- **@packages/typescript-config**: TypeScript configuration

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.ts`. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.ts](packages/tailwind-config/tailwind.config.ts):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This project has the following tools set up:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Storybook](https://storybook.js.org/) for UI component development

## Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages and apps
pnpm build

# Lint all packages and apps
pnpm lint

# Type check all packages and apps
pnpm check-types
```

## Storybook

The UI components can be viewed and tested in Storybook:

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

## Project Guidelines

### Naming Conventions

- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for variables and functions

### Import Structure

The project uses TypeScript path aliases for cleaner imports:

```typescript
// Import from apps
import { something } from "@apps/backend/feature";

// Import from packages
import { Button } from "@packages/ui/components";
import { Task } from "@packages/shared/types";
```

### Adding New Features

1. Determine if the feature belongs in an app or a package
2. If it's shared functionality, consider adding it to the appropriate package
3. Update types in @packages/shared if needed
4. Add tests for new functionality
5. Document the feature in the docs app if necessary
