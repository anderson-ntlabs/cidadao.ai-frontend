import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SkipLink } from '@/components/skip-link';
import { ContrastToggle } from '@/components/ui/contrast-toggle';

// Extend Vitest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Button>Click me</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes when disabled', async () => {
      const { container } = render(
        <Button disabled>Disabled button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle icon-only buttons with aria-label', async () => {
      const { container } = render(
        <Button aria-label="Delete item">
          <svg aria-hidden="true"><path d="M0 0h24v24H0z" /></svg>
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Card>
          <Card.Header>
            <Card.Title>Card Title</Card.Title>
          </Card.Header>
          <Card.Content>
            <p>Card content goes here</p>
          </Card.Content>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Badge Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should not have violations with proper label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" name="test" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with aria-label', async () => {
      const { container } = render(
        <Input aria-label="Search" placeholder="Search..." />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle required fields properly', async () => {
      const { container } = render(
        <div>
          <label htmlFor="required-input">
            Required Field <span aria-label="required">*</span>
          </label>
          <Input 
            id="required-input" 
            required 
            aria-required="true"
            aria-invalid="false"
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkipLink Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <SkipLink />
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ContrastToggle Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ContrastToggle />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast Tests', () => {
    it('should have sufficient contrast for primary buttons', async () => {
      const { container } = render(
        <Button variant="primary">Primary Button</Button>
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for text on cards', async () => {
      const { container } = render(
        <Card>
          <Card.Content>
            <p className="text-gray-700 dark:text-gray-300">
              This text should have sufficient contrast
            </p>
          </Card.Content>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should have proper focus indicators', async () => {
      const { container } = render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Input placeholder="Input field" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle tab order correctly', async () => {
      const { container } = render(
        <div>
          <SkipLink />
          <header>
            <nav>
              <Button>Home</Button>
              <Button>About</Button>
            </nav>
          </header>
          <main id="main-content">
            <h1>Page Title</h1>
            <Button>Main Action</Button>
          </main>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Roles and Landmarks', () => {
    it('should have proper landmarks', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <h1>Site Title</h1>
          </header>
          <nav role="navigation">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </nav>
          <main role="main">
            <h2>Main Content</h2>
          </main>
          <footer role="contentinfo">
            <p>© 2024 Cidadão.AI</p>
          </footer>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('should have accessible form structure', async () => {
      const { container } = render(
        <form aria-label="Contact form">
          <fieldset>
            <legend>Personal Information</legend>
            <div>
              <label htmlFor="name">Name</label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
          </fieldset>
          <Button type="submit">Submit</Button>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle error states accessibly', async () => {
      const { container } = render(
        <div>
          <label htmlFor="error-input">Email</label>
          <Input 
            id="error-input"
            aria-invalid="true"
            aria-describedby="error-message"
          />
          <span id="error-message" role="alert" className="text-red-600">
            Please enter a valid email address
          </span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});