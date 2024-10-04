import {Browser} from 'src/types/browser';
import {browsers} from 'src/util/browsers';
import {UAParser} from 'ua-parser-js';

export function useBrowser(userAgent?: string): Browser {
  const {browser} = UAParser(userAgent);

  if (userAgent && userAgent.toLowerCase().includes('postman')) {
    return 'postman';
  }

  for (const browserType of Object.keys(browsers)) {
    const {browserNames} = browsers[browserType as Browser];
    if (browser.name && browserNames.includes(browser.name)) {
      return browserType as Browser;
    }
  }

  return 'unknown';
}
