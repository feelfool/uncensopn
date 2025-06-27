<template>
  <nav>
    <div class="nav-main">
      <router-link to="/" class="logo" @click="closeMobileMenu">
        <span class="logo-icon">💬</span> UncensoredOpinion
      </router-link>

      <div class="nav-links desktop-only">
         <router-link to="/forum" class="nav-item">Forum</router-link>
        <router-link v-if="user" to="/post/new" class="nav-item">Buat Postingan</router-link>
        <router-link v-if="user" to="/my-posts" class="nav-item">Postingan Saya</router-link>
      </div>

      <div class="nav-right desktop-only">
        <div v-if="username" class="user-info-chip">
          Hello, <span class="username-highlight">{{ username }}</span>!
        </div>
        <div v-else-if="user" class="user-info-chip">
          Hello, <span class="email-highlight">{{ user.email }}</span>!
        </div>

        <button v-if="!user" @click="goToLogin" class="btn btn-login">Login</button>
        <button v-if="!user" @click="goToRegister" class="btn btn-register">Daftar</button>
        <button v-if="user" @click="handleLogout" class="btn btn-logout">Logout</button>
      </div>

      <button class="hamburger-menu" @click="toggleMobileMenu" aria-label="Toggle navigation">
        <div class="bar" :class="{ 'open': isMobileMenuOpen }"></div>
        <div class="bar" :class="{ 'open': isMobileMenuOpen }"></div>
        <div class="bar" :class="{ 'open': isMobileMenuOpen }"></div>
      </button>
    </div>

    <transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay">
        <div class="mobile-menu-content">
          <div v-if="user" class="mobile-user-info">
            <span v-if="username">Hello, {{ username }}!</span>
            <span v-else>Hello, {{ user.email }}!</span>
          </div>

          <router-link to="/forum" class="mobile-nav-item" @click="closeMobileMenu">Forum</router-link>
         <router-link v-if="user" to="/post/new" class="nav-item" @click="closeMobileMenu">Buat Postingan</router-link>
        <router-link v-if="user" to="/my-posts" class="nav-item" @click="closeMobileMenu">Postingan Saya</router-link>
          <div class="mobile-auth-buttons">
            <button v-if="!user" @click="goToLogin" class="btn btn-login">Login</button>
            <button v-if="!user" @click="goToRegister" class="btn btn-register">Daftar</button>
            <button v-if="user" @click="handleLogout" class="btn btn-logout">Logout</button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
import { ref } from 'vue';
import { auth, db } from '../firebase/init';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const user = ref(null);
    const username = ref(null);
    const router = useRouter();
    const isMobileMenuOpen = ref(false);

    onAuthStateChanged(auth, async (_user) => {
      user.value = _user;
      if (_user) {
        try {
          const userDocRef = doc(db, 'users', _user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            username.value = userDocSnap.data().username;
          } else {
            username.value = null;
          }
        } catch (error) {
          console.error("Error mengambil dokumen pengguna dari Firestore:", error);
          username.value = null;
        }
      } else {
        username.value = null;
      }
    });

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      document.body.style.overflow = '';
    };

    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
        closeMobileMenu();
      } catch (err) {
        console.error('Error saat logout:', err.message);
      }
    };

    const goToLogin = () => {
      router.push('/login');
      closeMobileMenu();
    };

    const goToRegister = () => {
      router.push('/register');
      closeMobileMenu();
    };

    return {
      user,
      username,
      handleLogout,
      goToLogin,
      goToRegister,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu
    };
  }
};
</script>

<style scoped>
.nav-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

nav {
  background-color: var(--navbar-bg, #2c3e50);
  color: var(--text-color, #ecf0f1);
  padding: 15px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logo {
  font-size: 26px;
  font-weight: bold;
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
}
.logo-icon {
  font-size: 30px;
  margin-right: 8px;
}

.nav-links {
  display: flex;
  gap: 30px;
  margin-left: 40px;
}
.nav-item {
  color: inherit;
  text-decoration: none;
  font-size: 17px;
  position: relative;
}
.nav-item:hover {
  color: var(--highlight-color, #3498db);
}
.nav-item::after {
  content: '';
  position: absolute;
  width: 0%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--highlight-color, #3498db);
  transition: width 0.3s ease-in-out;
}
.nav-item:hover::after {
  width: 100%;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info-chip {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 15px;
}

.username-highlight {
  font-weight: bold;
  color: var(--highlight-color, #3498db);
}
.email-highlight {
  font-weight: bold;
  color: #f1c40f;
}

.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 1002;
  position: relative;
}
.hamburger-menu .bar {
  height: 3px;
  background-color: var(--text-color, #ecf0f1);
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}
.hamburger-menu .bar:nth-child(1).open {
  transform: translateY(11px) rotate(45deg);
}
.hamburger-menu .bar:nth-child(2).open {
  opacity: 0;
}
.hamburger-menu .bar:nth-child(3).open {
  transform: translateY(-11px) rotate(-45deg);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(44, 62, 80, 0.95);
  backdrop-filter: blur(5px);
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 60px;
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 80%;
  max-width: 300px;
  text-align: center;
}

.mobile-user-info {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.mobile-user-info span {
  color: var(--highlight-color, #3498db);
}

.mobile-nav-item {
  color: var(--text-color, #ecf0f1);
  font-size: 20px;
  text-decoration: none;
  padding: 15px 0;
  display: block;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.mobile-nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.mobile-auth-buttons .btn {
  width: 100%;
}

.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}
.btn-login {
  background-color: var(--button-login-bg, #27ae60);
}
.btn-register {
  background-color: var(--button-register-bg, #8e44ad);
}
.btn-logout {
  background-color: var(--button-logout-bg, #e74c3c);
}

@media (max-width: 992px) {
  .nav-links,
  .nav-right {
    display: none;
  }
  .hamburger-menu {
    display: flex;
  }
  nav {
    padding: 15px 20px;
  }
}
</style>
