export function isMobile(): boolean {
    if (typeof navigator === 'undefined') return false; // 如果没有 navigator（如在 SSR 中），返回 false
  
    const userAgent = navigator.userAgent || navigator.vendor;
  
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }
  