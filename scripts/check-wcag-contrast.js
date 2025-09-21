/**
 * WCAG AA Contrast Checker for Cidadão.AI Design System
 * Verifies that all color combinations meet WCAG AA standards
 * 
 * WCAG AA Requirements:
 * - Normal text: 4.5:1 minimum contrast ratio
 * - Large text (18px+ or 14px+ bold): 3:1 minimum contrast ratio
 */

// Design system colors
const colors = {
  // Brand colors
  'brand-green-500': '#22c55e',
  'brand-green-600': '#16a34a',
  'brand-green-700': '#15803d',
  'brand-blue-500': '#3b82f6',
  'brand-blue-600': '#2563eb',
  'brand-blue-700': '#1d4ed8',
  'brand-yellow-500': '#eab308',
  'brand-yellow-600': '#ca8a04',
  'brand-red-500': '#ef4444',
  'brand-red-600': '#dc2626',
  'brand-purple-600': '#9333ea',
  
  // Neutral colors
  'white': '#ffffff',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  'black': '#000000'
};

// Calculate relative luminance
function getLuminance(hex) {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(c => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
function meetsWCAG_AA(ratio, isLargeText = false) {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Test common color combinations
console.log('🎨 WCAG AA Contrast Check for Cidadão.AI Design System\n');
console.log('================================================\n');

// Test cases for the design system
const testCases = [
  // Primary button
  { fg: 'white', bg: 'brand-green-600', context: 'Primary button' },
  { fg: 'white', bg: 'brand-green-700', context: 'Primary button (hover)' },
  
  // Secondary button
  { fg: 'brand-green-600', bg: 'white', context: 'Secondary button' },
  { fg: 'brand-green-700', bg: 'gray-50', context: 'Secondary button (hover)' },
  
  // Text on backgrounds
  { fg: 'gray-900', bg: 'white', context: 'Body text' },
  { fg: 'gray-700', bg: 'white', context: 'Secondary text' },
  { fg: 'gray-600', bg: 'white', context: 'Muted text' },
  { fg: 'gray-100', bg: 'gray-900', context: 'Dark mode text' },
  { fg: 'gray-300', bg: 'gray-900', context: 'Dark mode secondary' },
  
  // Links
  { fg: 'brand-blue-600', bg: 'white', context: 'Links' },
  { fg: 'brand-blue-700', bg: 'white', context: 'Links (hover)' },
  { fg: 'brand-blue-500', bg: 'gray-900', context: 'Dark mode links' },
  
  // Alerts and badges
  { fg: 'white', bg: 'brand-red-600', context: 'Error/Alert' },
  { fg: 'brand-yellow-600', bg: 'white', context: 'Warning text' },
  { fg: 'white', bg: 'brand-yellow-600', context: 'Warning badge', isLarge: true },
  
  // Active states
  { fg: 'brand-green-600', bg: 'gray-50', context: 'Active nav item' },
  { fg: 'brand-green-600', bg: 'white', context: 'Active indicator' }
];

// Run tests
let passCount = 0;
let failCount = 0;

testCases.forEach(({ fg, bg, context, isLarge }) => {
  const fgColor = colors[fg];
  const bgColor = colors[bg];
  const ratio = getContrastRatio(fgColor, bgColor);
  const passes = meetsWCAG_AA(ratio, isLarge);
  
  console.log(`${passes ? '✅' : '❌'} ${context}`);
  console.log(`   ${fg} on ${bg}`);
  console.log(`   Ratio: ${ratio.toFixed(2)}:1 (${passes ? 'PASS' : 'FAIL'})`);
  console.log('');
  
  if (passes) passCount++;
  else failCount++;
});

// Summary
console.log('================================================\n');
console.log(`📊 Summary: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
  console.log('🎉 All color combinations meet WCAG AA standards!');
} else {
  console.log('⚠️  Some color combinations need adjustment.');
  console.log('   Consider darkening text or lightening backgrounds.');
}

// Additional recommendations
console.log('\n📝 Recommendations:');
console.log('- Always test with real content and context');
console.log('- Consider WCAG AAA (7:1) for critical text');
console.log('- Use tools like Chrome DevTools for live testing');
console.log('- Test with color blindness simulators');