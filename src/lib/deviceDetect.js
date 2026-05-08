export function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/android/.test(ua)) {
    return 'android';
  }
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  return 'web';
}

export function isAndroid() {
  return detectDevice() === 'android';
}

export function isIOS() {
  return detectDevice() === 'ios';
}