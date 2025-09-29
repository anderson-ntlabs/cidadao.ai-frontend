import { useEffect } from 'react';
import { useReportUXIssue } from '@/components/hints/adaptive-hints-provider';

// WCAG contrast ratio calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  // Parse RGB values from color strings
  const rgb1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
  const rgb2 = color2.match(/\d+/g)?.map(Number) || [255, 255, 255];
  
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function useContrastCheck() {
  const { reportContrastIssue } = useReportUXIssue();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkContrast = () => {
      const elementsToCheck = [
        { selector: '.text-green-600', name: 'green-text', minRatio: 4.5 },
        { selector: '.text-red-600', name: 'red-text', minRatio: 4.5 },
        { selector: '.text-gray-500', name: 'gray-text', minRatio: 4.5 },
        { selector: '.bg-green-600', name: 'green-bg', minRatio: 3.0 },
        { selector: '.bg-red-600', name: 'red-bg', minRatio: 3.0 },
      ];
      
      elementsToCheck.forEach(({ selector, name, minRatio }) => {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const styles = getComputedStyle(element);
        const textColor = styles.color;
        const bgColor = styles.backgroundColor || 'rgb(255, 255, 255)';
        
        const ratio = getContrastRatio(textColor, bgColor);
        
        if (ratio < minRatio) {
          reportContrastIssue(name, ratio);
        }
      });
    };
    
    // Check on mount and theme changes
    checkContrast();
    
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('dark') || 
          document.documentElement.classList.contains('light')) {
        checkContrast();
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [reportContrastIssue]);
}