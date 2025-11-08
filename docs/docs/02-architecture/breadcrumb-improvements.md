# Breadcrumb Active Page Indicator Improvements

---

**Documento**: Melhorias no Indicador de Página Ativa do Breadcrumb
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-29 09:54:26 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Documentation / UI Components
**Última Atualização**: 2025-10-04

---

This document describes the improvements made to the breadcrumb component to better indicate the active/current page.

## Changes Made

### 1. Visual Enhancements for Active Pages

The breadcrumb component now clearly indicates the active page with:

- **Background**: Gradient background with subtle borders
- **Typography**: Semibold font weight for better emphasis
- **Icons**: Brand green color for icons on active items
- **Indicator**: Small green dot below the active item
- **Animations**: Smooth hover effects with scale transforms

### 2. Automatic Current Page Detection

In `AuthLayoutV2`, breadcrumbs now automatically detect and mark the current page:

```typescript
breadcrumbItems.push({
  label: navItem?.name || formatSegmentLabel(segment),
  href: i === segments.length - 1 ? undefined : path,
  icon: navItem?.icon,
  current: i === segments.length - 1, // Automatically mark last item as current
})
```

### 3. Accessibility Improvements

- Proper `aria-current="page"` attribute on active items
- Screen reader-friendly implementation
- Keyboard navigation support with focus indicators

## Usage

### With AuthLayoutV2 (Automatic)

When using `AuthLayoutV2` with the feature flag enabled, breadcrumbs are automatically generated from the current route:

```typescript
// In app/pt/(authenticated)/layout.tsx
<AuthLayoutV2 locale="pt">
  {children}
</AuthLayoutV2>
```

### Manual Implementation

For pages not using AuthLayoutV2, you can manually specify breadcrumbs:

```typescript
<BreadcrumbsV2
  items={[
    { label: 'Home', href: '/pt/home' },
    { label: 'Dashboard', href: '/pt/dashboard' },
    { label: 'Current Page', current: true }  // Mark as current
  ]}
/>
```

## Demo Page

Visit `/pt/breadcrumb-demo` to see various examples of the improved breadcrumb component in action.

## Feature Flag

The new breadcrumb design is activated when:

```
NEXT_PUBLIC_USE_NEW_DESIGN=true
```

## Styling Classes

The active page receives these styles:

- `font-semibold` - Bold text
- `bg-gradient-to-r from-gray-100 to-gray-50` - Gradient background
- `border border-gray-200` - Subtle border
- `shadow-sm` - Light shadow
- Green indicator dot positioned below

## Future Considerations

1. Consider adding breadcrumb animations when navigating
2. Add support for breadcrumb overflow on mobile
3. Consider breadcrumb templates for common page hierarchies
