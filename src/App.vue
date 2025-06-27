<template>
  <div id="app">
    <Navbar />
    <main class="container">
      <router-view />
    </main>
    <footer>
      <p>Dibuat oleh <a href="https://github.com/yusrantabrani" target="_blank" rel="noopener noreferrer">Yusran Tabrani</a> &amp; Gemini AI</p>
    </footer>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
  },
};
</script>

<style>
/* Basic Global Styles - Updated for modern look and animations */
:root {
  --primary-color: #3498db; /* Biru cerah */
  --secondary-color: #2c3e50; /* Biru gelap keabu-abuan */
  --accent-color: #e74c3c; /* Merah untuk aksi negatif/penting */
  --text-color-dark: #333;
  --text-color-light: #f8f8f8;
  --background-light: #f8f8f8;
  --background-card: #ffffff;
  --border-color: #e0e0e0;
  --shadow-light: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 6px 16px rgba(0, 0, 0, 0.12);
  --border-radius-base: 8px;
  --transition-speed: 0.3s ease;
  --transition-fast: 0.2s ease; /* Transisi lebih cepat untuk interaksi kecil */
}

body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  background-color: var(--background-light);
  color: var(--text-color-dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px; /* Base font size untuk PC */
}

/* Mobile adjustments for body font size */
@media (max-width: 768px) {
  body {
    font-size: 15px; /* Sedikit lebih kecil di tablet/mobile */
  }
}
@media (max-width: 480px) {
  body {
    font-size: 14px; /* Lebih kecil lagi untuk layar sangat kecil */
  }
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 25px;
  flex-grow: 1;
}

/* Mobile adjustments for container padding */
@media (max-width: 768px) {
  .container {
    margin: 20px auto;
    padding: 0 15px; /* Mengurangi padding di layar kecil */
  }
}

/* Basic Form Styles - Updated dengan Animasi Global */
form {
  background-color: var(--background-card);
  padding: 30px;
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
}

/* Mobile adjustments for form padding */
@media (max-width: 480px) {
  form {
    padding: 20px;
  }
}

form div {
  margin-bottom: 20px;
}

form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--secondary-color);
}

form input[type="text"],
form input[type="email"],
form input[type="password"],
form textarea,
form select {
  width: calc(100% - 24px); /* Sesuaikan padding */
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  /* Animasi Global untuk input focus */
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

form input[type="text"]:focus,
form input[type="email"]:focus,
form input[type="password"]:focus,
form textarea:focus,
form select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); /* Efek fokus */
  outline: none;
}

form button {
  background-color: var(--primary-color);
  color: var(--text-color-light);
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
  /* Animasi Global untuk tombol */
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

form button:hover {
  background-color: #2980b9; /* Sedikit lebih gelap dari primary */
  transform: translateY(-2px); /* Efek angkat saat hover */
}

form button:active { /* Animasi saat diklik */
  transform: translateY(0);
  background-color: #2574a9; /* Warna lebih gelap saat diklik */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); /* Efek cekung */
}

form button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: var(--accent-color);
  margin-top: 10px;
  font-size: 0.9em;
  font-weight: 500;
}

/* Footer Styles dengan Animasi Global */
footer {
  background-color: var(--secondary-color);
  color: var(--text-color-light);
  text-align: center;
  padding: 20px;
  font-size: 0.9em;
  margin-top: 40px;
}

footer a {
  color: var(--primary-color);
  text-decoration: none;
  /* Animasi Global untuk link footer */
  transition: color var(--transition-fast);
}

footer a:hover {
  text-decoration: underline;
  color: #61dafb; /* Warna lebih terang saat hover */
}
</style>