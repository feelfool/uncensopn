// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init'; // Import instance auth

// Import komponen halaman
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import NewPost from '../views/NewPost.vue';
import PostDetail from '../views/PostDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { title: 'Beranda' } },
  { path: '/login', name: 'Login', component: Login, meta: { title: 'Login' } },
  { path: '/register', name: 'Register', component: Register, meta: { title: 'Daftar Akun' } },
  {
    path: '/post/new',
    name: 'NewPost',
    component: NewPost,
    meta: { requiresAuth: true, title: 'Buat Postingan Baru' }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true,
    meta: { title: 'Detail Postingan' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard untuk memeriksa status otentikasi
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // Pastikan auth status sudah dimuat sebelum memutuskan navigasi
  const currentUser = await new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && currentUser) {
    next('/');
  } else {
    next();
  }

  // Update judul halaman
  document.title = to.meta.title ? `${to.meta.title} | UncensoredOpinion` : 'UncensoredOpinion';
});

export default router;