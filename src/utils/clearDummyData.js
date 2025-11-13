/**
 * Utility to clear dummy/old localStorage data
 * Run this in browser console if you need to reset: clearDummyData()
 */

export const clearDummyData = () => {
  const keysToCheck = [
    'smartpath_forms',
    'smartpath_folders',
    'smartpath_responses_demo',
    'smartpath_form_demo'
  ];

  let cleared = 0;
  
  keysToCheck.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleared++;
      console.log(`✅ Cleared: ${key}`);
    }
  });

  // Clear all temp preview forms
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('smartpath_form_temp_preview_')) {
      localStorage.removeItem(key);
      cleared++;
      console.log(`✅ Cleared temp preview: ${key}`);
    }
  });

  if (cleared > 0) {
    console.log(`✨ Cleared ${cleared} localStorage items. Refresh the page to load fresh data from API.`);
    return true;
  } else {
    console.log('ℹ️ No dummy data found in localStorage.');
    return false;
  }
};

// Auto-expose to window for easy console access
if (typeof window !== 'undefined') {
  window.clearDummyData = clearDummyData;
}

export default clearDummyData;
