import { createRouter, createWebHistory } from 'vue-router'
import GLHomeView from '../views/GLHomeView.vue'
import BLHomeView from '../views/BLHomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import LicenseView from '../views/LicenseView.vue'
import MyListView from '../views/MyListView.vue'
import UserProfileView from '../views/UserProfileView.vue'

// Admin Views
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AddSeriesView from '../views/admin/AddSeriesView.vue'
import ManageSeriesView from '../views/admin/ManageSeriesView.vue'
import LogsView from '../views/admin/LogsView.vue'
import ProfilesView from '../views/admin/ProfilesView.vue'
import AddUsersView from '../views/admin/AddUsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // หน้าของคนดูทั่วไป
    { path: '/', name: 'gl-home', component: GLHomeView },
    { path: '/bl', name: 'bl-home', component: BLHomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/privacy', name: 'privacy', component: PrivacyView },
    { path: '/license', name: 'license', component: LicenseView },
    { path: '/my-list', name: 'my-list', component: MyListView },
    { path: '/profile', name: 'user-profile', component: UserProfileView },
    
    // หน้าของ Admin
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard },
    { path: '/admin/add-series', name: 'admin-add-series', component: AddSeriesView },
    { path: '/admin/manage-series', name: 'admin-manage-series', component: ManageSeriesView },
    { path: '/admin/logs', name: 'admin-logs', component: LogsView },
    { path: '/admin/profiles', name: 'admin-profiles', component: ProfilesView },
    { path: '/admin/add-users', name: 'admin-add-users', component: AddUsersView }
  ]
})

export default router