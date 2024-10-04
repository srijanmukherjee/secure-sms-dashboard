import {SvgProps} from 'react-native-svg';
import {Browser} from 'src/types/browser';

import UnknownBrowserIcon from '@assets/img/icons/web.svg';
import ChromeIcon from '@assets/img/icons/chrome.svg';
import FirefoxIcon from '@assets/img/icons/firefox.svg';
import SafariIcon from '@assets/img/icons/safari.svg';
import BraveIcon from '@assets/img/icons/brave.svg';
import PostmanIcon from '@assets/img/icons/postman.svg';

type BrowserDetails = {
  browserNames: string[];
  icon: React.FC<SvgProps>;
};

export const browsers: Record<Browser, BrowserDetails> = {
  unknown: {
    browserNames: [],
    icon: UnknownBrowserIcon,
  },
  chrome: {
    browserNames: ['Chrome', 'Chrome Mobile', 'Chrome Headless', 'Chrome WebView', 'Chromium'],
    icon: ChromeIcon,
  },
  firefox: {
    browserNames: ['Firefox', 'Firefox Focus', 'Firefox Mobile', 'Firefox Reality'],
    icon: FirefoxIcon,
  },
  safari: {
    browserNames: ['Safari', 'Safari Mobile'],
    icon: SafariIcon,
  },
  brave: {
    browserNames: ['Brave'],
    icon: BraveIcon,
  },
  postman: {
    browserNames: ['Postman'],
    icon: PostmanIcon,
  },
} as const;
