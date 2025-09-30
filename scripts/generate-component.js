#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Get component name from arguments
const componentName = process.argv[2];
const componentType = process.argv[3] || 'ui'; // ui, feature, or shared

if (!componentName) {
  console.error(`${colors.red}Error: Please provide a component name${colors.reset}`);
  console.log(`Usage: npm run generate:component ComponentName [type]`);
  console.log(`Types: ui (default), feature, shared`);
  process.exit(1);
}

// Validate component name (PascalCase)
if (!/^[A-Z][a-zA-Z]*$/.test(componentName)) {
  console.error(`${colors.red}Error: Component name must be in PascalCase (e.g., MyComponent)${colors.reset}`);
  process.exit(1);
}

// Convert PascalCase to kebab-case
const kebabCase = componentName
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase();

// Define paths
const baseDir = path.join(process.cwd(), 'components', componentType);
const componentDir = path.join(baseDir, kebabCase);

// Check if component already exists
if (fs.existsSync(componentDir)) {
  console.error(`${colors.red}Error: Component ${componentName} already exists${colors.reset}`);
  process.exit(1);
}

// Create component directory
fs.mkdirSync(componentDir, { recursive: true });

// Component template
const componentTemplate = `import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ${componentName}Props {
  /** Optional CSS class name */
  className?: string
  /** Child elements */
  children?: React.ReactNode
}

/**
 * ${componentName} - Brief description of the component
 * 
 * @component
 * @example
 * \`\`\`tsx
 * <${componentName}>
 *   Content goes here
 * </${componentName}>
 * \`\`\`
 */
export const ${componentName} = forwardRef<HTMLDivElement, ${componentName}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Add base classes here
          '',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

${componentName}.displayName = '${componentName}'
`;

// Test template
const testTemplate = `import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ${componentName} } from './${kebabCase}'

describe('${componentName}', () => {
  it('renders children correctly', () => {
    render(
      <${componentName}>
        <span>Test content</span>
      </${componentName}>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <${componentName} className="custom-class">
        Content
      </${componentName}>
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(
      <${componentName} ref={ref}>
        Content
      </${componentName}>
    )
    
    expect(ref).toHaveBeenCalled()
  })
})
`;

// Story template
const storyTemplate = `import type { Meta, StoryObj } from '@storybook/react'
import { ${componentName} } from '@/components/${componentType}/${kebabCase}'

/**
 * ${componentName} component documentation
 */
const meta = {
  title: '${componentType === 'ui' ? 'UI' : componentType === 'feature' ? 'Features' : 'Shared'}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of ${componentName} component',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ${componentName}>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default ${componentName} example
 */
export const Default: Story = {
  args: {
    children: 'Default ${componentName} content',
  },
}

/**
 * ${componentName} with custom styling
 */
export const Styled: Story = {
  args: {
    children: 'Styled ${componentName} content',
    className: 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg',
  },
}
`;

// Index file template
const indexTemplate = `export { ${componentName} } from './${kebabCase}'
export type { ${componentName}Props } from './${kebabCase}'
`;

// Write files
try {
  // Component file
  fs.writeFileSync(
    path.join(componentDir, `${kebabCase}.tsx`),
    componentTemplate
  );

  // Test file
  fs.writeFileSync(
    path.join(componentDir, `${kebabCase}.test.tsx`),
    testTemplate
  );

  // Index file
  fs.writeFileSync(
    path.join(componentDir, 'index.ts'),
    indexTemplate
  );

  // Story file (in stories directory)
  const storyPath = path.join(process.cwd(), 'stories', `${componentName}.stories.tsx`);
  fs.writeFileSync(storyPath, storyTemplate);

  console.log(`${colors.green}✅ Component ${componentName} created successfully!${colors.reset}`);
  console.log(`${colors.blue}📁 Location: ${componentDir}${colors.reset}`);
  console.log(`${colors.yellow}📝 Files created:${colors.reset}`);
  console.log(`   - ${kebabCase}.tsx (component)`);
  console.log(`   - ${kebabCase}.test.tsx (tests)`);
  console.log(`   - index.ts (exports)`);
  console.log(`   - ${componentName}.stories.tsx (storybook)`);
  console.log('');
  console.log(`${colors.green}Next steps:${colors.reset}`);
  console.log(`1. Implement your component logic`);
  console.log(`2. Add specific tests`);
  console.log(`3. Update the Storybook story`);
  console.log(`4. Run: npm test ${kebabCase}`);

} catch (error) {
  console.error(`${colors.red}Error creating component:${colors.reset}`, error.message);
  // Clean up on error
  if (fs.existsSync(componentDir)) {
    fs.rmSync(componentDir, { recursive: true });
  }
  process.exit(1);
}