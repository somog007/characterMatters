import ReactGA from 'react-ga4';
import mixpanel from 'mixpanel-browser';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

export const initAnalytics = () => {
  if (measurementId) {
    ReactGA.initialize(measurementId);
  }

  if (mixpanelToken) {
    mixpanel.init(mixpanelToken, { track_pageview: false, persistence: 'localStorage' });
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (mixpanelToken) {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  }
};

export const trackPageView = (path: string) => {
  if (measurementId) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }

  if (mixpanelToken) {
    mixpanel.track('Page View', { path });
  }
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
  properties?: Record<string, any>
) => {
  if (measurementId) {
    ReactGA.event({ category, action, label, value });
  }

  if (mixpanelToken) {
    mixpanel.track(`${category}: ${action}`, {
      label,
      value,
      ...properties,
    });
  }
};
