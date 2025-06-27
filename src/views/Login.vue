<template>
  <div class="auth-page">
    <h2>Login ke UncensoredOpinion</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" placeholder="Masukkan email" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" placeholder="Masukkan password" required>
      </div>
      <button type="submit" :disabled="loading">
        <span v-if="loading">Memproses...</span>
        <span v-else>Login</span>
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <p class="auth-link">Belum punya akun? <router-link to="/register">Daftar di sini</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/init';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref(null);
    const loading = ref(false);
    const router = useRouter();

    const handleLogin = async () => {
      error.value = null;
      loading.value = true;
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/');
      }
      catch (err) {
        console.error(err.message);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          error.value = 'Email atau password salah. Silakan coba lagi.';
        } else if (err.code === 'auth/invalid-email') {
          error.value = 'Format email tidak valid.';
        } else {
          error.value = 'Terjadi kesalahan saat login: ' + err.message;
        }
      } finally {
        loading.value = false;
      }
    };

    return { email, password, error, loading, handleLogin };
  },
};
</script>

<style scoped>
.auth-page {
  max-width: 450px;
  margin: 60px auto;
  padding: 40px;
  background-color: var(--background-card);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
  text-align: center;
}

/* Mobile adjustments for auth-page */
@media (max-width: 600px) {
  .auth-page {
    margin: 30px 15px; /* Mengurangi margin dan menambahkan padding samping */
    padding: 30px;
  }
  .auth-page h2 {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
}
@media (max-width: 400px) {
  .auth-page {
    margin: 20px 10px;
    padding: 20px;
  }
  .auth-page h2 {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
}

.auth-page .auth-link {
  margin-top: 25px;
  font-size: 1em;
}

.auth-page .auth-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast), text-decoration var(--transition-fast); /* Animasi Global */
}

.auth-page .auth-link a:hover {
  text-decoration: underline;
}
</style>