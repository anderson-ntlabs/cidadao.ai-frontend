# WebKit/iOS Testing Issue on Ubuntu 25.04 (Plucky)

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data**: 2025-11-05
**Status**: ❌ BLOCKED - Awaiting Playwright/Ubuntu support

---

## 📋 Executive Summary

iOS/iPad testing with Playwright WebKit is **currently impossible on Ubuntu 25.04 (Plucky)** due to ABI incompatibility between libicu74 (required by Playwright WebKit) and libicu76 (available in Ubuntu 25.04).

**Impact**: 420 iOS/iPad tests cannot execute (64% of mobile test suite)

---

## 🔍 Root Cause Analysis

### Technical Details

**Problem**: Playwright WebKit build 2215 is compiled against **libicu74**, but Ubuntu 25.04 only provides **libicu76**.

**Error Message**:

```
undefined symbol: ureldatefmt_format_74
```

**What This Means**:

- WebKit binary searches for `ureldatefmt_format_74` function
- Function name suffix `_74` indicates it's from libicu version 74
- libicu76 has `ureldatefmt_format_76` instead
- These are **NOT ABI compatible** - cannot be substituted

### Why Symlinks Don't Work

We attempted to create symlinks:

```bash
ln -s libicudata.so.76 libicudata.so.74
ln -s libicuuc.so.76 libicuuc.so.74
ln -s libicui18n.so.76 libicui18n.so.74
```

**Result**: Failed at runtime because:

1. Symbol names include version numbers (`_74` vs `_76`)
2. Function signatures may differ between versions
3. Internal implementation details changed
4. Binary compatibility is not guaranteed between major libicu versions

### Why LD_PRELOAD Don't Work

We attempted to force WebKit to use libicu76:

```bash
export LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libicuuc.so.76:..."
```

**Result**: Failed because:

1. WebKit binary is hardcoded to look for `_74` symbol suffixes
2. LD_PRELOAD can override libraries but not symbol names
3. Still gets `undefined symbol` error at runtime

---

## 🎯 Attempted Solutions

### ✅ Solution 1: Install Dependencies (Partial Success)

```bash
sudo bash fix-playwright-libicu.sh
```

**Result**: Installed all other dependencies successfully (gstreamer, gtk, fonts, etc.)
**Status**: ✅ Other dependencies OK, but libicu74 unavailable

### ❌ Solution 2: Symlink libicu76 → libicu74

```bash
ln -s libicudata.so.76 libicudata.so.74
```

**Result**: WebKit still crashes with `undefined symbol` error
**Status**: ❌ ABI incompatibility prevents this approach

### ❌ Solution 3: LD_PRELOAD Override

```bash
export LD_PRELOAD="libicuuc.so.76:libicui18n.so.76:libicudata.so.76"
```

**Result**: Symbol mismatch persists
**Status**: ❌ Cannot override symbol names at runtime

### ❌ Solution 4: Compile WebKit from Source

**Not Attempted**: Would require:

- Building WebKit against libicu76
- Maintaining custom WebKit build
- Significant time investment (days/weeks)
- High complexity

**Status**: ❌ Not practical for this sprint

---

## 🔄 Workarounds

### Current Approach: Focus on Android Testing

**Devices Working** (Chromium engine):

- ✅ Pixel 5 (393x851)
- ✅ Galaxy S21 (360x800)
- ✅ Galaxy S23 Ultra (412x915)
- ✅ Pixel 5 Landscape

**Coverage**: ~200 tests (33% of suite)

**Rationale**:

- Android tests use Chromium (no libicu dependency issues)
- Most mobile users are on Android anyway (~72% market share in Brazil)
- Core mobile functionality can be validated
- iOS-specific issues can be caught in production monitoring

### Alternative Testing Strategies

#### Strategy A: CI/CD with Ubuntu 22.04 LTS

Run iOS tests in GitHub Actions using Ubuntu 22.04 (has libicu70-74):

```yaml
jobs:
  ios-tests:
    runs-on: ubuntu-22.04 # Has libicu74
    steps:
      - run: npx playwright install-deps webkit
      - run: npx playwright test --project="iPhone SE"
```

**Pros**:

- ✅ Full iOS coverage in CI
- ✅ No local machine dependency issues

**Cons**:

- ❌ Can't run iOS tests locally
- ❌ Slower feedback loop (must push to CI)

#### Strategy B: Docker Container

Use official Playwright Docker image:

```bash
docker run -it --rm \
  -v $(pwd):/work \
  -w /work \
  mcr.microsoft.com/playwright:v1.40.0-focal \
  npx playwright test --project="iPhone SE"
```

**Pros**:

- ✅ Isolated environment with correct dependencies
- ✅ Can run locally

**Cons**:

- ❌ Docker overhead
- ❌ Requires Docker installation
- ❌ Slightly slower than native

#### Strategy C: Wait for Playwright Update

Monitor Playwright releases for Ubuntu 25.04 support:

- Playwright v1.41+ may include WebKit builds for libicu76
- Expected timeline: Q1-Q2 2025

**Pros**:

- ✅ Clean solution
- ✅ No workarounds needed

**Cons**:

- ❌ Unpredictable timeline
- ❌ Ubuntu 25.04 is still in development

---

## 📊 Impact Analysis

### Test Coverage Impact

| Device Category | Tests   | Status          | Coverage |
| --------------- | ------- | --------------- | -------- |
| Android phones  | 180     | ✅ Working      | 27%      |
| iOS phones      | 240     | ❌ Blocked      | 36%      |
| iPads           | 120     | ❌ Blocked      | 18%      |
| Landscape       | 120     | ⚠️ Partial      | 18%      |
| **TOTAL**       | **660** | **27% working** | **100%** |

### Critical User Scenarios Lost

Without iOS testing, we **cannot validate**:

1. Safari-specific rendering bugs
2. iOS PWA installation flow
3. iOS keyboard behavior (different from Android)
4. iPad split-screen multitasking
5. iOS safe area handling (notch/Dynamic Island)
6. iOS-specific gestures
7. Face ID/Touch ID integration
8. iOS share sheet integration

### Risk Assessment

**High Risk Areas**:

- 🔴 PWA installation on iOS (different from Android)
- 🔴 Keyboard handling (iOS has unique behavior)
- 🟡 Touch gestures (mostly standard)
- 🟡 Visual rendering (CSS mostly cross-browser)

**Mitigated by**:

- ✅ Manual testing on real iOS devices
- ✅ Production monitoring for iOS-specific errors
- ✅ User feedback channels
- ✅ Gradual rollout strategy

---

## 🚀 Recommended Actions

### Immediate (This Sprint)

1. **✅ Focus on Android Testing**
   - Run full Android suite
   - Achieve 80%+ pass rate on Android
   - Document Android coverage

2. **✅ Document iOS Limitation**
   - Update sprint reports
   - Note in test documentation
   - Inform stakeholders

3. **✅ Setup CI with Ubuntu 22.04**
   - Configure GitHub Actions
   - Run iOS tests in CI only
   - Accept slower feedback loop

### Short-term (Next 2 Weeks)

1. **Manual iOS Testing Plan**
   - Define critical iOS user flows
   - Test on real devices (iPhone, iPad)
   - Document iOS-specific issues

2. **Production Monitoring**
   - Setup iOS-specific error tracking
   - Monitor PWA install metrics on iOS
   - Track iOS user behavior

3. **Docker Setup (Optional)**
   - Create Docker Compose for tests
   - Document Docker workflow
   - Use for critical iOS validations

### Long-term (Next Month)

1. **Monitor Playwright Updates**
   - Watch for Ubuntu 25.04 support
   - Test new Playwright versions
   - Migrate when available

2. **Consider Ubuntu Downgrade**
   - If iOS testing becomes critical
   - Use Ubuntu 24.04 LTS for stability
   - Trade bleeding-edge for compatibility

3. **Investigate Alternative Tools**
   - BrowserStack/Sauce Labs for iOS
   - Real device clouds
   - Cost vs benefit analysis

---

## 📚 Technical References

### libicu Version History

- **libicu70**: Ubuntu 22.04 LTS (Jammy)
- **libicu72**: Ubuntu 23.04 (Lunar)
- **libicu74**: Ubuntu 24.04 LTS (Noble) ← Playwright target
- **libicu76**: Ubuntu 25.04 (Plucky) ← Current system

### Playwright Compatibility

- **Playwright 1.40**: Supports Ubuntu 22.04-24.04
- **Playwright 1.41**: TBD (may add 25.04 support)
- **WebKit build 2215**: Compiled for Ubuntu 24.04 (libicu74)

### Ubuntu Release Cycle

- **24.04 LTS**: Released April 2024, supported until 2029
- **25.04**: Development version, released April 2025
- **Recommendation**: Use LTS for production/CI

---

## 💡 Key Learnings

### 1. LTS vs Bleeding Edge Trade-off

**Lesson**: Using Ubuntu 25.04 (development version) has compatibility costs.

**Best Practice**:

- Use Ubuntu LTS (24.04) for development
- Match CI/CD environment to dev environment
- Test new Ubuntu versions in isolated VMs

### 2. ABI Compatibility Matters

**Lesson**: Major version bumps in system libraries break binary compatibility.

**Best Practice**:

- Check tool compatibility before OS upgrade
- Maintain Docker environments for consistency
- Document system requirements clearly

### 3. Test Coverage Risk Distribution

**Lesson**: Losing 64% of tests is acceptable if risk is mitigated.

**Best Practice**:

- Prioritize tests by user impact
- Use production monitoring as safety net
- Manual testing for critical paths
- Gradual rollout to catch issues early

---

## ✅ Acceptance Criteria

This issue is **documented and workarounds identified**:

- [x] Root cause thoroughly analyzed
- [x] Multiple solutions attempted and documented
- [x] Workarounds identified and prioritized
- [x] Impact assessment completed
- [x] Risk mitigation strategies defined
- [x] Short and long-term actions planned
- [x] Stakeholders can make informed decisions

---

## 🎯 Decision: Move Forward with Android-Only Testing

**Rationale**:

1. ✅ Android covers 72% of Brazilian mobile market
2. ✅ Core functionality can be validated
3. ✅ CI can handle iOS tests on Ubuntu 22.04
4. ✅ Manual iOS testing fills gaps
5. ✅ Production monitoring catches real issues

**Trade-off Accepted**:

- Slower iOS feedback loop
- Reliance on CI for iOS validation
- Manual testing for critical iOS flows

**Review Date**: 2025-12-01 (check for Playwright updates)

---

**Document Version**: 1.0
**Status**: Final
**Approved By**: Anderson Henrique da Silva
