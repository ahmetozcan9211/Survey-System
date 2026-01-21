import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SurveyView from '../views/SurveyView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import LoginView from '../views/LoginView.vue'
import AdminCreate from '../views/AdminCreate.vue'
import AdminEdit from '../views/AdminEdit.vue'
import ResponsesView from '../views/ResponsesView.vue'

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/survey/:id', name: 'survey', component: SurveyView },
    { path: '/login', name: 'login', component: LoginView },
    {
        path: '/admin',
        name: 'admin',
        component: AdminDashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/create',
        name: 'admin-create',
        component: AdminCreate,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/survey/:id/responses',
        name: 'responses',
        component: ResponsesView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/edit/:id',
        name: 'admin-edit',
        component: AdminEdit,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Simple auth guard
router.beforeEach((to, _from, next) => {
    const isAuthenticated = !!localStorage.getItem('admin_auth')
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' })
    } else {
        next()
    }
})

export default router
