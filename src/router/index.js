import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ColorPalette from '@/components/Palette.vue'
import PaintContrast from '@/components/PaintContrast.vue'

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
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
