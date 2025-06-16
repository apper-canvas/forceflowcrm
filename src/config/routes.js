import Dashboard from '@/components/pages/Dashboard';
import Contacts from '@/components/pages/Contacts';
import Companies from '@/components/pages/Companies';
import Deals from '@/components/pages/Deals';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
  companies: {
    id: 'companies',
    label: 'Companies',
    path: '/companies',
    icon: 'Building2',
    component: Companies
  },
  deals: {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: 'TrendingUp',
    component: Deals
  }
};

export const routeArray = Object.values(routes);
export default routes;