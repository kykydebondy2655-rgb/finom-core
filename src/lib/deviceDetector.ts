/**
 * Utility to detect device information from user agent
 */

export interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  userAgent: string;
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Mobile';
    }
  }

  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('SamsungBrowser')) {
    browser = 'Samsung Browser';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows 10/11';
  } else if (userAgent.includes('Windows NT 6.3')) {
    os = 'Windows 8.1';
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows 8';
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows 7';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android\s([0-9.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const match = userAgent.match(/OS\s([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  return {
    deviceType,
    browser,
    os,
    userAgent
  };
}

/**
 * Fetch client IP address using a free API
 */
export async function getClientIP(): Promise<string | null> {
  try {
    // Using ipify API (free, no auth required)
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
    return null;
  } catch {
    // Fallback - return null if IP detection fails
    return null;
  }
}
