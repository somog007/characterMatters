import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { trackPageView, identifyUser } from '../services/analytics';

const AnalyticsTracker = () => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    if (user) {
      identifyUser(user.id, { email: user.email, role: user.role, name: user.name });
    }
  }, [user]);

  return null;
};

export default AnalyticsTracker;
