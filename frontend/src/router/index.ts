import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../middleware/authGuard'
import { roleGuard } from '../middleware/roleGuard'
import { Role } from '../types/Auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rotas públicas
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Auth/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth/RegisterView.vue')
    },

    // Rotas protegidas
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: authGuard
    },

    {
      path: '/veiculos',
      name: 'veiculos',
      component: () => import('../views/VeiculosView/VeiculosListView.vue'),
    },
    {
      path: '/veiculos/:id',
      name: 'veiculos-detalhes',
      component: () => import('../views/VeiculosView/VeiculoDetalhesView.vue'),
    },
    // Rotas de Veículos (todos os usuários autenticados)
    {
      path: '/veiculos/novo',
      name: 'veiculos-novo',
      component: () => import('../views/VeiculosView/VeiculoFormView.vue'),
      beforeEnter: roleGuard([Role.ADMIN, Role.LOCADOR])
    },
    {
      path: '/veiculos/:id/editar',
      name: 'veiculos-editar',
      component: () => import('../views/VeiculosView/VeiculoFormView.vue'),
      beforeEnter: roleGuard([Role.ADMIN, Role.LOCADOR])
    },

    // Rotas de Usuários (apenas admin)
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsuariosView/UsuariosListView.vue'),
      beforeEnter: roleGuard([Role.ADMIN])
    },
    {
      path: '/usuarios/novo',
      name: 'usuarios-novo',
      component: () => import('../views/UsuariosView/UsuarioFormView.vue'),
      beforeEnter: roleGuard([Role.ADMIN])
    },
    {
      path: '/usuarios/:id',
      name: 'usuarios-detalhes',
      component: () => import('../views/UsuariosView/UsuarioDetalhesView.vue'),
      beforeEnter: authGuard
    },
    {
      path: '/usuarios/:id/editar',
      name: 'usuarios-editar',
      component: () => import('../views/UsuariosView/UsuarioFormView.vue'),
      beforeEnter: roleGuard([Role.ADMIN])
    },

    // Rota 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/HomeView.vue')
    }
  ]
})

export default router
