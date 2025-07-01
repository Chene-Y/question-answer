import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import SelectExam from '@/views/SelectExam.vue'
import Exam from '@/views/Exam.vue'
import Ranking from '@/views/Ranking.vue'
import ImportQuestions from '@/views/ImportQuestions.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/questions',
      name: 'Questions',
      component: () => import('@/views/Questions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/questions/create',
      name: 'CreateQuestion',
      component: () => import('@/views/CreateQuestion.vue'),
      meta: { requiresAuth: true, requiresTeacher: true }
    },
    {
      path: '/questions/:id',
      name: 'QuestionDetail',
      component: () => import('@/views/QuestionDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/answers',
      name: 'MyAnswers',
      component: () => import('@/views/MyAnswers.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'Stats',
      component: () => import('@/views/Stats.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/select',
      name: 'SelectExam',
      component: SelectExam,
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/exam',
      name: 'Exam',
      component: Exam,
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/ranking',
      name: 'Ranking',
      component: Ranking,
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/import',
      name: 'ImportQuestions',
      component: ImportQuestions,
      meta: { requiresAuth: true, role: 'teacher' }
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // Initialize auth state
  if (!userStore.isLoggedIn) {
    userStore.initAuth()
  }
  
  // Guest-only routes (login, register)
  if (to.meta.requiresGuest && userStore.isLoggedIn) {
    next('/dashboard')
    return
  }
  
  // Auth-required routes
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // Teacher-only routes
  if (to.meta.requiresTeacher && !userStore.isTeacher) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router 