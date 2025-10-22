# Performance Optimization Tips

Your laptop is heating up because the project runs multiple heavy processes simultaneously. Here are solutions:

## 🔥 Immediate Solutions

### 1. Run Only What You Need

Instead of running both frontend and backend:

**Frontend Only** (if backend is not needed):
```bash
npm run dev:frontend-only
```

**Backend Only** (for testing APIs):
```bash
npm run dev:backend-only
```

**Both** (when you need full integration):
```bash
npm run dev
```

### 2. Close Unnecessary Applications
- Close browser tabs you're not using
- Close other IDEs or heavy applications
- Keep only 1-2 browser windows open for testing

### 3. Use Production Build for Testing
If you're just testing functionality (not developing):
```bash
npm run build
npm run preview  # Much lighter than dev mode
```

## ⚙️ Configuration Changes (Already Applied)

I've optimized your `vite.config.ts`:
- ✅ Disabled error overlay (reduces CPU)
- ✅ Reduced file watching (ignores node_modules, dist, .git)
- ✅ Removed React Scan (was consuming resources)

## 🛠️ Additional Optimizations

### 1. Disable Hot Module Replacement (if not needed)
If you don't need instant updates while coding, restart the dev server less frequently.

### 2. Use Browser DevTools Efficiently
- Don't keep DevTools open when not debugging
- Disable React DevTools extension when not needed
- Clear browser cache periodically

### 3. VSCode Optimizations
Add to `.vscode/settings.json`:
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 4. Reduce TypeScript Checking
During active development, you can disable type checking in dev mode:

Edit `vite.config.ts` and modify the React plugin:
```typescript
react({
  jsxRuntime: 'automatic',
  // Disable babel in dev for faster builds
  babel: mode === 'development' ? undefined : {},
})
```

## 📊 Monitor Resource Usage

Check what's using resources:
```bash
# macOS
Activity Monitor → Sort by CPU

# Check node processes
ps aux | grep node
```

## 🎯 Recommended Workflow

### For UI Development (Lowest CPU):
1. Start only frontend: `npm run dev:frontend-only`
2. Use mock data or static API responses
3. No backend needed

### For API Development:
1. Start only backend: `npm run dev:backend-only`
2. Test with Postman or curl
3. No frontend needed

### For Full Integration:
1. Only when you need both systems
2. Use `npm run dev`
3. Close other applications

## 🚀 Long-term Solutions

1. **Upgrade Hardware**
   - 16GB+ RAM recommended
   - SSD storage (if not already)
   - Better cooling

2. **Use Production Mode More**
   - Build once: `npm run build`
   - Run built version: `npm run preview`
   - Only rebuild when needed

3. **Split Your Work**
   - Work on frontend one day
   - Work on backend another day
   - Don't run both unless testing integration

## ⚡ Quick Commands Reference

```bash
# Lightest - Frontend only
npm run dev:frontend-only

# Light - Backend only
npm run dev:backend-only

# Heavy - Both (full dev mode)
npm run dev

# Lightest - Built version (no hot reload)
npm run build && npm run preview
```

## 🔍 Troubleshooting

If still heating up:

1. **Kill all node processes**
   ```bash
   killall node
   ```

2. **Clear caches**
   ```bash
   npm run clean
   npm run install:all
   ```

3. **Check for orphaned processes**
   ```bash
   lsof -i :5173  # Frontend port
   lsof -i :3002  # Backend port
   ```

4. **Restart your laptop**
   - Sometimes processes hang
   - Fresh start can help

---

**Most Important**: Use `npm run dev:frontend-only` for UI work - this uses the least resources!
