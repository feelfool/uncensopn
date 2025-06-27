<template>
  <div class="register">
    <h2>Daftar Akun Baru</h2>
    <form @submit.prevent="handleSubmit">
      <label for="email">Email:</label>
      <input type="email" name="email" v-model="email" required>

      <label for="username">Username:</label>
      <input type="text" name="username" v-model="username" required>

      <label for="password">Password:</label>
      <input type="password" name="password" v-model="password" required>

      <button type="submit">Daftar</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <p>Sudah punya akun? <router-link to="/login">Login di sini</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth, db } from '../firebase/init'; // Pastikan Anda mengimpor 'db'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Untuk menyimpan data ke Firestore
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const username = ref(''); // State baru untuk username
    const password = ref('');
    const error = ref(null);
    const router = useRouter();

    const handleSubmit = async () => {
      error.value = null; // Reset error

      try {
        // 1. Daftarkan pengguna dengan Email dan Password menggunakan Firebase Auth
        const res = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = res.user;

        // 2. Simpan username ke Firestore menggunakan UID pengguna sebagai ID dokumen
        await setDoc(doc(db, 'users', user.uid), {
          username: username.value,
          email: user.email,
          createdAt: new Date(), // Contoh: Tambahkan timestamp pembuatan
          // Anda bisa tambahkan data lain di sini jika perlu
        });

        console.log('Pengguna terdaftar dan data disimpan:', user);
        router.push('/'); // Arahkan ke halaman utama atau dashboard setelah pendaftaran
      } catch (err) {
        console.error('Error pendaftaran:', err.message);
        error.value = 'Terjadi kesalahan saat pendaftaran: ' + err.message;
        // Penanganan error Firebase yang lebih spesifik bisa ditambahkan di sini
        if (err.code === 'auth/email-already-in-use') {
          error.value = 'Email sudah terdaftar. Silakan gunakan email lain.';
        } else if (err.code === 'auth/invalid-email') {
          error.value = 'Format email tidak valid.';
        } else if (err.code === 'auth/weak-password') {
          error.value = 'Password terlalu lemah (minimal 6 karakter).';
        } else if (err.code === 'auth/configuration-not-found') {
          error.value = 'Konfigurasi Firebase tidak ditemukan. Pastikan inisialisasi Firebase sudah benar.';
        }
      }
    };

    return { email, username, password, error, handleSubmit };
  }
};
</script>

<style scoped>
/* Gaya CSS Anda */
.register {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
label {
  text-align: left;
  font-weight: bold;
}
input[type="email"],
input[type="text"],
input[type="password"] {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
button {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 10px;
}
button:hover {
  background-color: #45a049;
}
.error {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}
</style>