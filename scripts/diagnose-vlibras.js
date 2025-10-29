/**
 * VLibras Diagnostic Script
 *
 * Run this in the browser console on production to diagnose VLibras issues
 */

console.log('🔍 VLibras Diagnostic Starting...\n');

// 1. Check environment variable
console.log('1️⃣ Environment Variable Check:');
console.log('NEXT_PUBLIC_ENABLE_VLIBRAS:', process.env.NEXT_PUBLIC_ENABLE_VLIBRAS);
if (process.env.NEXT_PUBLIC_ENABLE_VLIBRAS === 'true') {
  console.log('✅ Environment variable is set correctly\n');
} else {
  console.log('❌ Environment variable is NOT set or is false\n');
}

// 2. Check if VLibras DOM elements exist
console.log('2️⃣ DOM Element Check:');
const vwElement = document.querySelector('[vw]');
const vlibraContainer = document.querySelector('.vlibras-widget-container');
console.log('VLibras main element [vw]:', vwElement ? '✅ Found' : '❌ Not found');
console.log('VLibras container:', vlibraContainer ? '✅ Found' : '❌ Not found');
console.log('');

// 3. Check localStorage preferences
console.log('3️⃣ LocalStorage Check:');
const vlibrasEnabled = localStorage.getItem('vlibras-enabled');
console.log('vlibras-enabled:', vlibrasEnabled || 'not set (defaults to true)');
if (vlibrasEnabled === 'false') {
  console.log('⚠️  User has disabled VLibras in localStorage\n');
} else {
  console.log('✅ VLibras is enabled in localStorage\n');
}

// 4. Check current page locale
console.log('4️⃣ Page Locale Check:');
const currentPath = window.location.pathname;
console.log('Current path:', currentPath);
if (currentPath.startsWith('/pt')) {
  console.log('✅ On Portuguese page (VLibras should load)\n');
} else if (currentPath.startsWith('/en')) {
  console.log('❌ On English page (VLibras does NOT load on EN pages)\n');
} else {
  console.log('⚠️  Unknown locale\n');
}

// 5. Check for VLibras scripts loaded
console.log('5️⃣ Script Loading Check:');
const vlibrasScripts = Array.from(document.scripts).filter(script =>
  script.src.includes('vlibras')
);
console.log('VLibras scripts found:', vlibrasScripts.length);
vlibrasScripts.forEach((script, i) => {
  console.log(`  ${i + 1}. ${script.src}`);
});
if (vlibrasScripts.length > 0) {
  console.log('✅ VLibras scripts are loaded\n');
} else {
  console.log('❌ No VLibras scripts found\n');
}

// 6. Check CSP violations
console.log('6️⃣ CSP Violations Check:');
console.log('Check above for any CSP errors mentioning "vlibras.gov.br" or "cdn.jsdelivr.net"');
console.log('If you see CSP violations, the scripts are being blocked\n');

// 7. Network check
console.log('7️⃣ Network Check:');
console.log('Open DevTools → Network tab → Filter by "vlibras"');
console.log('Look for failed requests (red) or blocked requests\n');

// 8. Check if window.VLibras exists
console.log('8️⃣ VLibras Object Check:');
if (typeof window.VLibras !== 'undefined') {
  console.log('✅ window.VLibras object exists');
  console.log('VLibras version:', window.VLibras.version || 'unknown');
} else {
  console.log('❌ window.VLibras object NOT found (widget not initialized)');
}
console.log('');

// 9. Summary
console.log('📋 SUMMARY:');
console.log('─────────────────────────────────────');

let issues = [];

if (process.env.NEXT_PUBLIC_ENABLE_VLIBRAS !== 'true') {
  issues.push('Environment variable not set correctly');
}

if (!vwElement && !vlibraContainer) {
  issues.push('VLibras DOM elements not rendered');
}

if (vlibrasEnabled === 'false') {
  issues.push('User disabled VLibras in localStorage');
}

if (!currentPath.startsWith('/pt')) {
  issues.push('Not on Portuguese page');
}

if (vlibrasScripts.length === 0) {
  issues.push('VLibras scripts not loaded');
}

if (issues.length === 0) {
  console.log('✅ No obvious issues detected!');
  console.log('If VLibras still not showing, check:');
  console.log('  1. Browser ad blockers');
  console.log('  2. Privacy extensions');
  console.log('  3. Corporate firewall');
  console.log('  4. Network connectivity to vlibras.gov.br');
} else {
  console.log('❌ Issues found:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

console.log('─────────────────────────────────────');
console.log('');
console.log('💡 Quick Fixes:');
console.log('  • Clear browser cache: Ctrl+Shift+Del');
console.log('  • Disable ad blockers temporarily');
console.log('  • Try incognito/private mode');
console.log('  • Check if localStorage.setItem("vlibras-enabled", "true")');
console.log('');
console.log('🔍 Diagnostic Complete!');
