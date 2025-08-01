# Navigation Troubleshooting Guide

## Overview

This guide provides solutions for common navigation issues in the Cellular Sleep Voyage application. Issues are organized by category with step-by-step resolution procedures.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

### ✅ System Requirements Check
- [ ] Browser supports WebGL 2.0 (check at [webglreport.com](https://webglreport.com))
- [ ] JavaScript is enabled
- [ ] Hardware acceleration is enabled
- [ ] Sufficient RAM available (4GB minimum, 8GB recommended)
- [ ] Updated graphics drivers

### ✅ Application State Check
- [ ] Page fully loaded (no loading indicators)
- [ ] Console shows no critical errors (F12 → Console)
- [ ] 3D scene is visible (not just UI panels)
- [ ] Camera controls respond to input

### ✅ Input Device Check
- [ ] Keyboard keys respond in other applications
- [ ] Mouse/trackpad functions normally
- [ ] Touch screen (if applicable) responds to gestures
- [ ] No conflicting browser extensions

## Camera Control Issues

### Issue: Camera Not Responding to Controls

**Symptoms:**
- Camera doesn't move when using controls
- View remains static despite input
- Controls appear active but no visual change

**Diagnosis Steps:**
1. Check browser console for errors:
   ```javascript
   // Open browser console (F12) and look for:
   // - "Camera controller not initialized"
   // - "Three.js camera errors"
   // - "React Three Fiber errors"
   ```

2. Verify camera mode:
   ```javascript
   // In console, check current camera mode:
   console.log(window.__GAME_STORE__?.getState?.()?.cameraMode);
   // Should return 'free', 'guided', or 'locked'
   ```

**Solutions:**

**Solution 1: Reset Camera Mode**
```javascript
// In browser console:
window.__GAME_STORE__?.getState?.()?.setCameraMode?.('free');
```

**Solution 2: Refresh Camera Controller**
1. Press `Ctrl+Shift+R` (hard refresh)
2. Wait for complete page load
3. Try camera controls again

**Solution 3: Check for Conflicting Extensions**
1. Open browser in incognito/private mode
2. Test camera controls
3. If working, disable extensions one by one to identify conflict

**Solution 4: Reset to Default View**
1. Look for "Reset View" button in camera controls
2. Or press `R` key to reset vessel position
3. Or use the layout controls to reset HUD positions

### Issue: Camera Movement Too Slow/Fast

**Symptoms:**
- Camera moves too slowly or too quickly
- Difficult to control precise movements
- Inconsistent movement speed

**Solutions:**

**Solution 1: Adjust Sensitivity Settings**
```javascript
// In browser console, adjust camera sensitivity:
const gameStore = window.__GAME_STORE__?.getState?.();
if (gameStore) {
  // Increase sensitivity (1.0 = normal, 2.0 = double speed)
  gameStore.setCameraSensitivity?.(1.5);
}
```

**Solution 2: Check Performance Issues**
1. Open browser console (F12)
2. Go to Performance tab
3. Record for 10 seconds while moving camera
4. Look for frame rate drops or long tasks

**Solution 3: Reduce Graphics Quality**
```javascript
// Reduce particle count and effects:
const settings = {
  particleCount: 100, // Reduce from default 300
  enableShadows: false,
  enablePostProcessing: false
};
```

### Issue: Camera Gets Stuck or Jumps

**Symptoms:**
- Camera suddenly jumps to unexpected positions
- Camera gets stuck and won't move
- Erratic camera behavior

**Solutions:**

**Solution 1: Clear Camera State**
```javascript
// Reset camera state in console:
const gameStore = window.__GAME_STORE__?.getState?.();
if (gameStore) {
  gameStore.setSelectedOrganelle?.(null);
  gameStore.setCameraMode?.('free');
}
```

**Solution 2: Check for NaN Values**
```javascript
// Check for invalid camera positions:
const camera = window.__THREE_CAMERA__;
if (camera) {
  console.log('Camera position:', camera.position);
  console.log('Camera rotation:', camera.rotation);
  // Look for NaN or Infinity values
}
```

**Solution 3: Restart Camera System**
1. Switch to a different chapter and back
2. Or refresh the page completely
3. Check if issue persists

## Vessel Navigation Issues

### Issue: Vessel Not Responding to WASD Keys

**Symptoms:**
- WASD keys don't move the vessel
- Vessel remains stationary
- Other keys (like H for help) may work

**Diagnosis Steps:**
1. Check if vessel is enabled:
   ```javascript
   // In console:
   console.log('Vessel enabled:', window.__GAME_STORE__?.getState?.()?.vesselEnabled);
   console.log('Interaction mode:', window.__GAME_STORE__?.getState?.()?.interactionMode);
   ```

2. Verify keyboard focus:
   - Click on the 3D scene area
   - Ensure no input fields are focused
   - Try pressing keys again

**Solutions:**

**Solution 1: Enable Vessel Mode**
```javascript
// Enable vessel navigation:
const gameStore = window.__GAME_STORE__?.getState?.();
if (gameStore) {
  gameStore.setInteractionMode?.('explore');
  gameStore.setCameraMode?.('free');
}
```

**Solution 2: Reset Vessel Position**
1. Press `R` key to reset vessel position
2. Or use console:
   ```javascript
   // Reset vessel to starting position:
   window.__VESSEL_CONTROLLER__?.resetPosition?.();
   ```

**Solution 3: Check Keyboard Event Listeners**
```javascript
// Test if keyboard events are being captured:
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, e.code);
});
// Press WASD keys and check console output
```

### Issue: Vessel Moves Too Fast/Slow

**Symptoms:**
- Vessel speed is uncomfortable for navigation
- Difficult to control precise movements
- Speed inconsistent across different areas

**Solutions:**

**Solution 1: Adjust Vessel Speed**
```javascript
// Modify vessel speed settings:
const vesselSettings = {
  moveSpeed: 3.0,      // Default: 5.0
  rotationSpeed: 1.5,  // Default: 2.0
  acceleration: 0.8    // Default: 1.0
};
```

**Solution 2: Check Frame Rate Impact**
1. Monitor FPS in browser dev tools
2. If FPS is low, reduce graphics quality
3. Close other browser tabs/applications

**Solution 3: Calibrate for Device**
```javascript
// Device-specific speed adjustments:
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const speedMultiplier = isMobile ? 0.7 : 1.0;
```

### Issue: Vessel Passes Through Boundaries

**Symptoms:**
- Vessel can move outside the cell membrane
- No boundary warnings appear
- Vessel gets lost in empty space

**Solutions:**

**Solution 1: Reset Boundary System**
```javascript
// Reinitialize boundaries:
const chapterId = window.__GAME_STORE__?.getState?.()?.currentChapter || 1;
const boundaries = getCellularBoundaries(chapterId);
console.log('Current boundaries:', boundaries);
```

**Solution 2: Manual Position Reset**
```javascript
// Force vessel back to safe position:
window.__VESSEL_CONTROLLER__?.setPosition?.(new THREE.Vector3(0, 0, 8));
```

**Solution 3: Check Boundary Collision Detection**
```javascript
// Test boundary detection:
function testBoundaries() {
  const position = new THREE.Vector3(20, 0, 0); // Outside boundary
  const isValid = isWithinBoundaries(position, boundaries);
  console.log('Position valid:', isValid);
}
```

## Touch Control Issues

### Issue: Touch Controls Not Responding

**Symptoms:**
- Touch joystick doesn't appear
- Touch gestures don't work
- Mobile interface missing

**Solutions:**

**Solution 1: Force Touch Mode**
```javascript
// Enable touch interface:
const isTouchDevice = true;
// Refresh page to apply touch interface
```

**Solution 2: Check Touch Event Support**
```javascript
// Test touch support:
console.log('Touch support:', 'ontouchstart' in window);
console.log('Max touch points:', navigator.maxTouchPoints);
```

**Solution 3: Clear Touch Event Conflicts**
1. Disable browser zoom gestures
2. Add to viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
   ```

### Issue: Touch Gestures Interfere with Navigation

**Symptoms:**
- Pinch-to-zoom conflicts with camera controls
- Scroll gestures interfere with vessel movement
- Accidental touch inputs

**Solutions:**

**Solution 1: Prevent Default Touch Behaviors**
```javascript
// Disable conflicting touch behaviors:
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('.cellular-environment')) {
    e.preventDefault();
  }
}, { passive: false });
```

**Solution 2: Adjust Touch Sensitivity**
```javascript
// Modify touch sensitivity:
const touchSettings = {
  joystickDeadzone: 0.2,    // Increase to reduce sensitivity
  gestureThreshold: 10,     // Minimum movement for gesture
  tapTimeout: 300          // Maximum time for tap gesture
};
```

## Performance Issues

### Issue: Low Frame Rate During Navigation

**Symptoms:**
- Choppy camera movement
- Delayed response to input
- Stuttering animations

**Diagnosis:**
1. Check current FPS:
   ```javascript
   // Monitor performance:
   const stats = new Stats();
   document.body.appendChild(stats.dom);
   ```

2. Check memory usage:
   ```javascript
   console.log('Memory usage:', performance.memory);
   ```

**Solutions:**

**Solution 1: Reduce Graphics Quality**
```javascript
// Lower quality settings:
const performanceSettings = {
  particleCount: 50,        // Reduce from 300
  shadowMapSize: 1024,      // Reduce from 2048
  enablePostProcessing: false,
  enableAntialiasing: false
};
```

**Solution 2: Enable Performance Mode**
```javascript
// Activate performance optimizations:
const renderer = window.__THREE_RENDERER__;
if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = false;
}
```

**Solution 3: Clear Browser Cache**
1. Clear browser cache and cookies
2. Restart browser
3. Reload application

### Issue: Memory Leaks During Extended Use

**Symptoms:**
- Performance degrades over time
- Browser becomes unresponsive
- Memory usage continuously increases

**Solutions:**

**Solution 1: Monitor Memory Usage**
```javascript
// Track memory leaks:
setInterval(() => {
  if (performance.memory) {
    console.log('Memory:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
    });
  }
}, 5000);
```

**Solution 2: Force Garbage Collection**
```javascript
// Trigger cleanup (Chrome DevTools):
// 1. Open DevTools (F12)
// 2. Go to Memory tab
// 3. Click "Collect garbage" button
```

**Solution 3: Restart Application**
1. Refresh the page every 30-60 minutes of use
2. Close and reopen browser tab
3. Clear browser cache if issue persists

## UI and HUD Issues

### Issue: Draggable HUD Panels Not Displaying Correctly

**Symptoms:**
- HUD panels cut off or truncated
- Content not fully visible when expanded
- Panels overlap or position incorrectly

**Solutions:**

**Solution 1: Reset HUD Layout**
```javascript
// Reset HUD positions:
localStorage.removeItem('hud-positions');
localStorage.removeItem('hud-collapsed-states');
// Refresh page
```

**Solution 2: Adjust Viewport Constraints**
```javascript
// Fix viewport calculations:
const viewport = {
  width: window.innerWidth,
  height: window.innerHeight
};
console.log('Viewport:', viewport);
```

**Solution 3: Clear CSS Conflicts**
1. Check for CSS max-width constraints
2. Verify overflow settings
3. Test in different browser window sizes

### Issue: Notifications Not Appearing

**Symptoms:**
- No feedback for user actions
- Missing boundary warnings
- Help messages don't show

**Solutions:**

**Solution 1: Check Notification System**
```javascript
// Test notification system:
const uiStore = window.__UI_STORE__?.getState?.();
if (uiStore) {
  uiStore.addNotification?.({
    type: 'info',
    title: 'Test',
    message: 'Notification system working',
    duration: 3000
  });
}
```

**Solution 2: Verify Z-Index Stacking**
```css
/* Check notification z-index in DevTools */
.notification-system {
  z-index: 9999 !important;
}
```

## Browser-Specific Issues

### Chrome Issues

**Issue: WebGL Context Lost**
```javascript
// Handle context loss:
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.warn('WebGL context lost - attempting recovery');
  setTimeout(() => location.reload(), 1000);
});
```

**Solution:**
1. Disable hardware acceleration temporarily
2. Update Chrome to latest version
3. Clear browser data and restart

### Firefox Issues

**Issue: Performance Degradation**
```javascript
// Firefox-specific optimizations:
const isFirefox = navigator.userAgent.includes('Firefox');
if (isFirefox) {
  // Reduce particle count
  // Disable certain effects
  // Lower texture resolution
}
```

### Safari Issues

**Issue: Touch Events Not Working**
```javascript
// Safari touch event fixes:
document.addEventListener('touchstart', () => {}, { passive: false });
document.addEventListener('touchmove', () => {}, { passive: false });
```

## Advanced Debugging

### Enable Debug Mode
```javascript
// Enable comprehensive debugging:
window.__DEBUG_MODE__ = true;
window.__VERBOSE_LOGGING__ = true;

// This will log:
// - All user interactions
// - State changes
// - Performance metrics
// - Error details
```

### Performance Profiling
```javascript
// Profile navigation performance:
function profileNavigation() {
  performance.mark('navigation-start');
  
  // Perform navigation action
  
  performance.mark('navigation-end');
  performance.measure('navigation-duration', 'navigation-start', 'navigation-end');
  
  const measures = performance.getEntriesByType('measure');
  console.log('Navigation performance:', measures);
}
```

### Memory Leak Detection
```javascript
// Detect potential memory leaks:
function checkMemoryLeaks() {
  const before = performance.memory.usedJSHeapSize;
  
  // Trigger navigation actions
  
  setTimeout(() => {
    const after = performance.memory.usedJSHeapSize;
    const diff = after - before;
    console.log('Memory change:', diff, 'bytes');
    
    if (diff > 10 * 1024 * 1024) { // 10MB threshold
      console.warn('Potential memory leak detected');
    }
  }, 1000);
}
```

## Getting Help

### Information to Collect
When reporting issues, please include:

1. **System Information:**
   ```javascript
   console.log({
     userAgent: navigator.userAgent,
     webgl: !!window.WebGLRenderingContext,
     memory: performance.memory,
     viewport: { width: window.innerWidth, height: window.innerHeight }
   });
   ```

2. **Application State:**
   ```javascript
   console.log({
     gameState: window.__GAME_STORE__?.getState?.(),
     uiState: window.__UI_STORE__?.getState?.(),
     currentChapter: window.__CURRENT_CHAPTER__
   });
   ```

3. **Console Errors:**
   - Copy all error messages from browser console
   - Include stack traces if available
   - Note when errors occur (during specific actions)

### Support Channels
- **GitHub Issues**: [Repository Issues](https://github.com/jalabulajunx/cellular-sleep-voyage/issues)
- **Documentation**: Check other docs in `/docs` folder
- **Community**: GitHub Discussions for general questions

### Creating Reproducible Bug Reports
1. **Clear Steps**: List exact steps to reproduce
2. **Expected vs Actual**: What should happen vs what does happen
3. **Environment**: Browser, OS, device type
4. **Screenshots/Videos**: Visual evidence when possible
5. **Console Logs**: Include relevant error messages

## Prevention Tips

### Best Practices for Smooth Navigation
1. **Regular Breaks**: Refresh page every 30-60 minutes
2. **Close Other Tabs**: Reduce memory pressure
3. **Update Browser**: Keep browser updated
4. **Clear Cache**: Clear cache weekly
5. **Monitor Performance**: Watch for frame rate drops

### Optimal Settings
```javascript
// Recommended settings for best experience:
const optimalSettings = {
  graphics: {
    particleCount: 200,
    shadowQuality: 'medium',
    antialiasing: true,
    postProcessing: false
  },
  navigation: {
    vesselSpeed: 3.0,
    cameraSmoothing: 2.0,
    touchSensitivity: 1.0
  },
  performance: {
    targetFPS: 60,
    memoryLimit: '512MB',
    autoCleanup: true
  }
};
```