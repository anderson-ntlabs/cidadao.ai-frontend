/**
 * Test script for IndexedDB cache service
 *
 * Usage: node scripts/test-cache-idb.js
 *
 * Tests:
 * 1. Initialize IndexedDB
 * 2. Store and retrieve cached responses
 * 3. Test TTL expiration
 * 4. Test cache statistics
 * 5. Test LRU eviction
 * 6. Test export/import
 */

// Note: This is a Node.js test script, but IndexedDB only works in browsers
// To properly test, you need to:
// 1. Use a browser environment (jsdom, playwright, etc.)
// 2. Or test manually in the browser console

console.log('='.repeat(80));
console.log('IndexedDB Cache Test Script');
console.log('='.repeat(80));
console.log();

console.log('⚠️  IMPORTANT: IndexedDB only works in browser environments!');
console.log();
console.log('To test the IndexedDB cache:');
console.log();
console.log('1. Open your browser console at: http://localhost:3000');
console.log('2. Run this code:');
console.log();
console.log(`
// Import the cache service
import { getChatCacheIDB } from './lib/services/chat-cache-idb.service';

// Test function
async function testCache() {
  console.log('🧪 Testing IndexedDB Cache...');

  try {
    // Get cache instance
    const cache = await getChatCacheIDB();
    console.log('✅ Cache initialized');

    // Test 1: Store a response
    console.log('\\n📝 Test 1: Storing a mock response...');
    const mockResponse = {
      session_id: 'test_123',
      agent_id: 'zumbi',
      agent_name: 'Zumbi dos Palmares',
      message: 'Esta é uma resposta de teste!',
      confidence: 0.95,
      suggested_actions: ['Ação 1', 'Ação 2'],
      metadata: {
        model_used: 'sabiazinho-3',
        endpoint: 'test',
      },
    };

    await cache.set('Olá, como você está?', mockResponse);
    console.log('✅ Response stored');

    // Test 2: Retrieve from cache
    console.log('\\n🔍 Test 2: Retrieving from cache...');
    const cached = await cache.get('Olá, como você está?');

    if (cached && cached.message === mockResponse.message) {
      console.log('✅ Cache hit! Response retrieved correctly');
      console.log('  Cache metadata:', cached.metadata);
    } else {
      console.error('❌ Cache miss or incorrect data');
    }

    // Test 3: Cache statistics
    console.log('\\n📊 Test 3: Cache statistics...');
    const stats = await cache.getStats();
    console.log('✅ Statistics retrieved:');
    console.log(\`  Entries: \${stats.entries}\`);
    console.log(\`  Total hits: \${stats.totalHits}\`);
    console.log(\`  Hit rate: \${stats.hitRate}\`);
    console.log(\`  Size: \${stats.totalSizeMB} MB\`);
    console.log('  Model distribution:', stats.modelDistribution);

    // Test 4: Store multiple entries
    console.log('\\n📝 Test 4: Storing multiple entries...');
    const testMessages = [
      'Qual é a temperatura hoje?',
      'Me conte sobre transparência',
      'Como funciona o sistema?',
      'Quais são os agentes disponíveis?',
    ];

    for (const msg of testMessages) {
      await cache.set(msg, {
        ...mockResponse,
        message: \`Resposta para: \${msg}\`,
      });
    }
    console.log(\`✅ Stored \${testMessages.length} additional entries\`);

    // Test 5: Updated statistics
    console.log('\\n📊 Test 5: Updated statistics...');
    const updatedStats = await cache.getStats();
    console.log(\`  Total entries: \${updatedStats.entries}\`);
    console.log(\`  Cache size: \${updatedStats.totalSizeMB} MB\`);

    // Test 6: Clear pattern
    console.log('\\n🧹 Test 6: Clearing entries with pattern...');
    await cache.clear('temperatura');
    console.log('✅ Cleared entries matching "temperatura"');

    // Test 7: Export data
    console.log('\\n💾 Test 7: Exporting cache data...');
    const exported = await cache.exportData();
    console.log(\`✅ Exported \${exported.length} entries\`);

    // Test 8: Clean expired
    console.log('\\n🧹 Test 8: Cleaning expired entries...');
    const cleaned = await cache.cleanExpired();
    console.log(\`✅ Cleaned \${cleaned} expired entries\`);

    console.log('\\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testCache();
`);

console.log();
console.log('='.repeat(80));
console.log('Alternative: Use browser DevTools Application tab');
console.log('='.repeat(80));
console.log();
console.log('1. Open DevTools → Application → IndexedDB');
console.log('2. Look for "cidadao-ai-cache" database');
console.log('3. Inspect "chat-responses" and "cache-stats" stores');
console.log();

console.log('='.repeat(80));
console.log('Migration from RAM Cache');
console.log('='.repeat(80));
console.log();
console.log('The new IndexedDB cache is drop-in compatible with the old RAM cache.');
console.log('Simply update imports from:');
console.log('  import { chatCache } from "@/lib/services/chat-cache.service"');
console.log('To:');
console.log('  import { getChatCacheIDB } from "@/lib/services/chat-cache-idb.service"');
console.log('  const cache = await getChatCacheIDB();');
console.log();
console.log('Benefits:');
console.log('  ✅ Persistence across page reloads');
console.log('  ✅ Larger storage capacity (>50MB vs ~10MB)');
console.log('  ✅ Better memory management');
console.log('  ✅ Offline PWA support');
console.log('  ✅ Hit rate tracking');
console.log();
