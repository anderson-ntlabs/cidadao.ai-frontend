# Component Documentation Template

---

**Documento**: Template de Documentação de Componentes
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-30 11:41:40 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Template / Documentation
**Última Atualização**: 2025-10-04

---

## JSDoc Template for React Components

```tsx
/**
 * ComponentName - Brief description of what the component does
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="value"
 *   prop2={123}
 *   onAction={(data) => console.log(data)}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.prop1 - Description of prop1
 * @param {number} [props.prop2=defaultValue] - Optional prop with default
 * @param {(data: any) => void} props.onAction - Callback function description
 * 
 * @returns {JSX.Element} Rendered component
 * 
 * @see {@link https://example.com/docs} - External documentation
 * @since 1.0.0
 * 
 * @todo Add feature X
 * @deprecated Use NewComponent instead (will be removed in v2.0.0)
 */
```

## Props Interface Documentation

```tsx
/**
 * Props for ComponentName
 * 
 * @interface ComponentNameProps
 * @extends {BaseComponentProps}
 */
interface ComponentNameProps {
  /**
   * Primary content to display
   * @required
   */
  content: string;
  
  /**
   * Visual variant of the component
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * Size of the component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Callback fired when action is triggered
   * @param {string} value - The current value
   * @returns {void}
   */
  onAction?: (value: string) => void;
  
  /**
   * Additional CSS classes
   * @deprecated Use `className` prop instead
   */
  customClass?: string;
}
```

## Hook Documentation

```tsx
/**
 * useHookName - Brief description of what the hook does
 * 
 * @hook
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useHookName({
 *   initialValue: 'test',
 *   autoFetch: true
 * });
 * ```
 * 
 * @param {Object} options - Hook configuration
 * @param {string} options.initialValue - Initial value
 * @param {boolean} [options.autoFetch=false] - Whether to fetch automatically
 * 
 * @returns {Object} Hook state and methods
 * @returns {any} returns.data - The fetched data
 * @returns {boolean} returns.loading - Loading state
 * @returns {Error|null} returns.error - Error state
 * @returns {Function} returns.refetch - Function to refetch data
 * 
 * @throws {Error} Throws when used outside of Provider
 * 
 * @since 1.0.0
 */
```

## Utility Function Documentation

```tsx
/**
 * Formats a value according to specified rules
 * 
 * @function formatValue
 * @param {string|number} value - The value to format
 * @param {Object} [options={}] - Formatting options
 * @param {number} [options.decimals=2] - Number of decimal places
 * @param {string} [options.prefix=''] - Prefix to add
 * @param {string} [options.suffix=''] - Suffix to add
 * 
 * @returns {string} Formatted value
 * 
 * @example
 * formatValue(1234.567, { decimals: 2, prefix: '$' }); // Returns: "$1,234.57"
 * 
 * @example
 * formatValue('hello', { prefix: '👋 ', suffix: '!' }); // Returns: "👋 hello!"
 */
```

## Best Practices

1. **Be Descriptive**: Write clear, concise descriptions
2. **Include Examples**: Always provide usage examples
3. **Document All Props**: Even optional ones
4. **Type Everything**: Use TypeScript types in JSDoc
5. **Version Info**: Include @since tags
6. **Deprecation Warnings**: Use @deprecated with migration path
7. **Link Related**: Use @see to reference related components
8. **TODO Items**: Track future improvements with @todo