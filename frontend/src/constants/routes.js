export const ROUTES = {
  HOME: '/',
  VOTER: '/voter',
  ELECTION: (id) => `/election/${id}`,
  RESULTS: '/results',
  RESULTS_ID: (id) => `/results/${id}`,
  ADMIN: {
    DASHBOARD: '/admin',
    ELECTIONS: '/admin/elections',
    NEW_ELECTION: '/admin/elections/new',
    EDIT_ELECTION: (id) => `/admin/elections/${id}/edit`,
    CANDIDATES: (id) => `/admin/elections/${id}/candidates`,
    VOTERS: '/admin/voters',
    STATISTICS: '/admin/statistics'
  },
  SUPERADMIN: {
    DASHBOARD: '/superadmin',
    ORGANIZATIONS: '/superadmin/organizations',
    ADMINS: '/superadmin/admins',
    ACTIVITIES: '/superadmin/activities'
  },
  LOGIN: '/login',
  ABOUT: '/about',
  VERIFY: (txHash) => `/verify/${txHash}`
}