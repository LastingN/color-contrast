import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ColorPalette from '@/components/Palette.vue'
import PaintContrast from '@/components/PaintContrast.vue'
import Toning from '@/components/Toning.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/palette',
    name: 'palette',
    component: ColorPalette,
  },
  {
    path: '/toning',
    name: 'toning',
    component: Toning,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/paint-contrast',
    name: 'PaintContrast',
    component: PaintContrast,
    meta: { noLayout: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 添加全局导航守卫来处理 404 问题
router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    next('/'); // 如果路由不匹配，重定向到首页
  } else {
    next();
  }
});

export default router
