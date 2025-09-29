'use client';

import { usePathname } from 'next/navigation';
import { BreadcrumbsV2, type BreadcrumbItemV2 } from './breadcrumbs';
import { 
  Home, 
  MessageSquare, 
  Search, 
  LayoutDashboard, 
  User, 
  Settings,
  FileText,
  Shield,
  Info,
  Lock
} from 'lucide-react';

// Map routes to icons and labels
const routeConfig: Record<string, { label: string; icon?: any }> = {
  'home': { label: 'Início', icon: Home },
  'chat': { label: 'Chat', icon: MessageSquare },
  'dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  'investigacoes': { label: 'Investigações', icon: Search },
  'perfil': { label: 'Perfil', icon: User },
  'configuracoes': { label: 'Configurações', icon: Settings },
  'settings': { label: 'Configurações', icon: Settings },
  'profile': { label: 'Perfil', icon: User },
  'about': { label: 'Sobre', icon: Info },
  'agents': { label: 'Agentes', icon: Shield },
  'manifesto': { label: 'Manifesto', icon: FileText },
  'privacy': { label: 'Privacidade', icon: Lock }
};

interface SmartBreadcrumbsProps {
  customItems?: BreadcrumbItemV2[];
  showHome?: boolean;
  className?: string;
}

export function SmartBreadcrumbs({ 
  customItems,
  showHome = true,
  className
}: SmartBreadcrumbsProps) {
  const pathname = usePathname();

  // If custom items are provided, use them but mark the last one as current
  if (customItems) {
    const itemsWithCurrent = customItems.map((item, index) => ({
      ...item,
      current: index === customItems.length - 1
    }));
    return <BreadcrumbsV2 items={itemsWithCurrent} showHome={showHome} className={className} />;
  }

  // Otherwise, auto-generate breadcrumbs from the current path
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Skip language segment (pt/en)
  const segments = pathSegments.slice(1);
  
  const items: BreadcrumbItemV2[] = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const route = routeConfig[segment] || { label: segment };
    
    // Build the href by joining previous segments
    const href = isLast ? undefined : `/${pathSegments[0]}/${segments.slice(0, index + 1).join('/')}`;
    
    return {
      label: route.label,
      href,
      icon: route.icon,
      current: isLast
    };
  });

  // If we're on the home page, just show it as current
  if (segments.length === 0 || segments[0] === 'home') {
    return (
      <BreadcrumbsV2 
        items={[{ label: 'Início', icon: Home, current: true }]} 
        showHome={false}
        className={className}
      />
    );
  }

  return <BreadcrumbsV2 items={items} showHome={showHome} className={className} />;
}