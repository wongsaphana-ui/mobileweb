import { createRouter, createWebHistory, createMemoryHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import TabsPage from '../views/TabsPage.vue'
import { authService } from '@/auth/auth-service';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('../views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('../views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('../views/Tab3Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: Capacitor.isNativePlatform() ? createMemoryHistory() : createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  try {
    const user = await authService.getCurrentUser();
    // หากผู้ใช้อยู่แล้ว ให้ไม่ไปหน้า login
    if (to.path === "/login" && user) {
      return "/tabs/tab1";
    }
    // ถ้าต้องการ auth แต่ยังไม่ล็อกอิน ให้ส่งไปหน้า login
    if (to.meta.requiresAuth && !user) {
      return "/login";
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // หากเช็ค auth ล้มเหลว ส่งไปหน้า login
    if (to.meta.requiresAuth) {
      return "/login";
    }
  }
  return true;
});


export default router
