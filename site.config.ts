import { SiteConfig } from './types/config';

const config: SiteConfig = {
  "theme": {
    "fonts": {
      "body": "Merriweather",
      "heading": "Inter"
    },
    "colors": {
      "accent": "#81B29A",
      "primary": "#E07A5F",
      "secondary": "#3D405B"
    },
    "cardStyle": "shadow",
    "borderRadius": "md"
  },
  "author": {
    "bio": "",
    "name": "joe"
  },
  "integrations": {
    "ads": {
      "adsenseClientId": ""
    },
    "analytics": {
      "googleAnalyticsId": ""
    },
    "pinterest": {
      "username": ""
    },
    "newsletter": {
      "apiKey": "",
      "provider": ""
    }
  }
};

export default config;
