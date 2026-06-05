export default [
  {
    path: '/',
    redirect: '/landing',
  },
  {
    path: '/landing',
    component: '@/pages/landing/index',
  },
  {
    path: '/login',
    component: '@/pages/Login',
  },
  {
    path: '/register',
    component: '@/pages/Register',
  },
  {
    path: '/dashboard',
    component: '@/components/ProtectedRoute',
    routes: [
      {
        path: '',
        component: '@/layouts/UserLayout',
        routes: [
          {
            path: '',
            component: '@/pages/Dashboard',
          },
        ],
      },
    ],
  },
  {
    path: '/flashcards',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/flashcards', component: '@/pages/flashcards/index' },
      { path: '/flashcards/create', component: '@/pages/flashcards/create' },
      { path: '/flashcards/:id/study', component: '@/pages/flashcards/study' },
    ],
  },
  {
    path: '/quiz',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/quiz', component: '@/pages/quiz/index' },
      { path: '/quiz/create', component: '@/pages/quiz/create' },
      { path: '/quiz/:id/play', component: '@/pages/quiz/play' },
      { path: '/quiz/:id/result', component: '@/pages/quiz/result' },
    ],
  },
  {
    path: '/courses',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/courses', component: '@/pages/courses/index' },
      { path: '/courses/:id', component: '@/pages/courses/[id]' },
      { path: '/courses/:id/lessons/:lessonId', component: '@/pages/courses/lesson' },
    ],
  },
  {
    path: '/chatbot',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/chatbot', component: '@/pages/chatbot/index' },
    ],
  },
  {
    path: '/games',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/games', component: '@/pages/games/index' },
      { path: '/games/memory', component: '@/pages/games/memory' },
      { path: '/games/matching', component: '@/pages/games/matching' },
      { path: '/games/drag', component: '@/pages/games/drag' },
    ],
  },
  {
    path: '/typewords',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/typewords', component: '@/pages/typewords/index' },
    ],
  },
  {
    path: '/dictionary',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/dictionary', component: '@/pages/dictionary/index' },
    ],
  },
  {
    path: '/pricing',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/pricing', component: '@/pages/pricing/index' },
    ],
  },
  {
    path: '/checkout',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/checkout', component: '@/pages/checkout' },
    ],
  },
  {
    path: '/settings',
    component: '@/layouts/UserLayout',
    routes: [
      { path: '/settings', component: '@/pages/settings/billing' },
      { path: '/settings/billing', component: '@/pages/settings/billing' },
    ],
  },
  {
    path: '/admin',
    component: '@/layouts/AdminLayout',
    wrappers: ['@/components/AdminRoute'],
    routes: [
      { path: '',                  component: '@/pages/Admin/index',            exact: true },
      { path: 'users',             component: '@/pages/Admin/users/index' },
      { path: 'vocabulary',        component: '@/pages/Admin/vocabulary/index' },
      { path: 'courses',           component: '@/pages/Admin/courses/index' },
      { path: 'quizzes',           component: '@/pages/Admin/quizzes/index' },
      { path: 'payments',          component: '@/pages/Admin/payments/index' },
      { path: 'analytics',         component: '@/pages/Admin/analytics/index' },
      { path: 'settings',          component: '@/pages/Admin/settings/index' },
    ],
  },
];