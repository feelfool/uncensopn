<template>
  <div class="home-page">
    <h1>Postingan Terbaru</h1>

    <div class="filters">
      <select v-model="selectedCategory" @change="fetchPosts">
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input type="text" v-model="searchQuery" @input="fetchPosts" placeholder="Cari postingan...">
    </div>

    <p v-if="loading" class="loading-message">Memuat postingan...</p>
    <p v-else-if="!posts.length && !loading" class="no-posts-message">Belum ada postingan. Ayo buat yang pertama!</p>

    <div v-else class="posts-grid">
      <PostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/init';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'Home',
  components: {
    PostCard,
  },
  setup() {
    const posts = ref([]);
    const loading = ref(true);
    const selectedCategory = ref('');
    const searchQuery = ref('');
    const categories = ref(['Pengumuman', 'Acara', 'Diskusi Umum', 'Jual Beli', 'Lain-lain']);

    const fetchPosts = () => {
      loading.value = true;
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

      if (selectedCategory.value) {
        q = query(q, where('category', '==', selectedCategory.value));
      }

      onSnapshot(q, (snapshot) => {
        const fetchedPosts = [];
        snapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() });
        });
        posts.value = fetchedPosts;
        loading.value = false;
      }, (error) => {
        console.error("Error fetching posts:", error);
        loading.value = false;
      });
    };

    onMounted(() => {
      fetchPosts();
    });

    const filteredPosts = computed(() => {
      if (!searchQuery.value) {
        return posts.value;
      }
      const searchLower = searchQuery.value.toLowerCase();
      return posts.value.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    });

    return {
      posts,
      loading,
      selectedCategory,
      searchQuery,
      categories,
      fetchPosts,
      filteredPosts
    };
  },
};
</script>

<style scoped>
.home-page {
  padding: 30px 0;
}

.home-page h1 {
  text-align: center;
  color: var(--secondary-color);
  margin-bottom: 40px;
  font-size: 2.5rem;
  font-weight: 700;
}

/* Mobile adjustments for h1 */
@media (max-width: 768px) {
  .home-page h1 {
    font-size: 2rem;
    margin-bottom: 30px;
  }
}
@media (max-width: 480px) {
  .home-page h1 {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap; /* Mengizinkan wrapping di mobile */
}

.filters select,
.filters input {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  flex: 1;
  min-width: 200px;
}

/* Mobile adjustments for filters */
@media (max-width: 600px) {
  .filters {
    flex-direction: column; /* Stack vertically */
    align-items: stretch; /* Stretch to full width */
    gap: 15px; /* Reduce gap */
  }
  .filters select,
  .filters input {
    min-width: unset; /* Remove min-width restriction */
    width: 100%; /* Take full width */
  }
}

.filters select:focus,
.filters input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.loading-message, .no-posts-message {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 50px;
  font-size: 1.1rem;
}

/* Mobile adjustments for messages */
@media (max-width: 480px) {
  .loading-message, .no-posts-message {
    font-size: 1em;
    margin-top: 30px;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Layout grid adaptif */
  gap: 20px;
}

/* Mobile adjustments for PostGrid */
@media (max-width: 600px) {
  .posts-grid {
    grid-template-columns: 1fr; /* Satu kolom di layar kecil */
    gap: 15px; /* Kurangi jarak antar kartu */
  }
}
</style>