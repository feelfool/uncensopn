<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading-message">Memuat postingan...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="post">
      <h1 class="post-detail-title">{{ post.title }}</h1>
      <p class="post-meta">
        Diposting oleh {{ post.authorName || 'Anonim' }} pada {{ formattedPostDate }}
        <span v-if="post.category" class="post-category">[{{ post.category }}]</span>
      </p>
      <div v-if="post.imageUrl" class="post-image-container">
        <img :src="post.imageUrl" :alt="post.title" class="post-image">
      </div>
      <p class="post-content">{{ post.content }}</p>

      <button v-if="user && user.uid === post.authorId" @click="confirmDeletePost" class="btn-delete-post">
        Hapus Postingan
      </button>

      <hr class="section-divider">

      <div class="comments-section">
        <h3>Komentar ({{ comments.length }})</h3>
        <div v-if="!comments.length && !commentsLoading" class="no-comments-message">Belum ada komentar. Jadilah yang pertama!</div>
        <div v-if="commentsLoading" class="loading-message">Memuat komentar...</div>

        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <p class="comment-author">{{ comment.authorName || 'Anonim' }}</p>
          <p class="comment-content">{{ comment.content }}</p>
          <p class="comment-meta">{{ formattedCommentDate(comment) }}</p>
          <button v-if="user && user.uid === comment.authorId" @click="deleteComment(comment.id)" class="btn-delete-comment">Hapus</button>
        </div>

        <form v-if="user" @submit.prevent="addComment" class="comment-form">
          <h4>Tambahkan Komentar Baru</h4>
          <div>
            <textarea v-model="newComment" rows="4" placeholder="Tulis komentar Anda..." required></textarea>
          </div>
          <button type="submit" :disabled="commentLoadingState">
            <span v-if="commentLoadingState">Mengirim...</span>
            <span v-else>Kirim Komentar</span>
          </button>
          <p v-if="commentError" class="error-message">{{ commentError }}</p>
        </form>
        <p v-else class="login-to-comment">Silakan <router-link to="/login">login</router-link> untuk meninggalkan komentar.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase/init';
import { onAuthStateChanged } from 'firebase/auth';


export default {
  name: 'PostDetail',
  props: ['id'], // Mengambil ID dari URL
  setup(props) {
    const post = ref(null);
    const comments = ref([]);
    const loading = ref(true);
    const commentsLoading = ref(true);
    const error = ref(null);
    const newComment = ref('');
    const commentError = ref(null);
    const commentLoadingState = ref(false); // Untuk status loading komentar baru
    const user = ref(null); // Untuk menyimpan status user saat ini

    const route = useRoute();
    const router = useRouter();

    // Memuat status otentikasi user saat komponen dimuat
    onMounted(() => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
      });
    });

    const fetchPost = async () => {
      loading.value = true;
      try {
        const postDocRef = doc(db, 'posts', props.id);
        const postSnap = await getDoc(postDocRef);

        if (postSnap.exists()) {
          post.value = { id: postSnap.id, ...postSnap.data() };
        } else {
          error.value = 'Postingan tidak ditemukan.';
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        error.value = 'Gagal memuat postingan.';
      } finally {
        loading.value = false;
      }
    };

    const fetchComments = () => {
      commentsLoading.value = true;
      const commentsColRef = collection(db, 'posts', props.id, 'comments');
      const q = query(commentsColRef, orderBy('createdAt', 'asc')); // Urutkan komentar dari yang terlama

      onSnapshot(q, (snapshot) => {
        const fetchedComments = [];
        snapshot.forEach((doc) => {
          fetchedComments.push({ id: doc.id, ...doc.data() });
        });
        comments.value = fetchedComments;
        commentsLoading.value = false;
      }, (err) => {
        console.error('Error fetching comments:', err);
        commentError.value = 'Gagal memuat komentar.';
        commentsLoading.value = false;
      });
    };

    const addComment = async () => {
      commentError.value = null;
      commentLoadingState.value = true;
      if (!newComment.value.trim()) {
        commentError.value = 'Komentar tidak boleh kosong.';
        commentLoadingState.value = false;
        return;
      }
      if (!user.value) {
        commentError.value = 'Anda harus login untuk berkomentar.';
        commentLoadingState.value = false;
        return;
      }

      try {
        const commentsColRef = collection(db, 'posts', props.id, 'comments');
        await addDoc(commentsColRef, {
          content: newComment.value,
          authorId: user.value.uid,
          authorName: user.value.displayName || user.value.email.split('@')[0],
          createdAt: serverTimestamp(),
        });
        newComment.value = ''; // Bersihkan input setelah berhasil
      } catch (err) {
        console.error('Error adding comment:', err);
        commentError.value = 'Gagal menambahkan komentar.';
      } finally {
        commentLoadingState.value = false;
      }
    };

    const deleteComment = async (commentId) => {
      if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
        return;
      }
      try {
        const commentDocRef = doc(db, 'posts', props.id, 'comments', commentId);
        await deleteDoc(commentDocRef);
        alert('Komentar berhasil dihapus!');
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Gagal menghapus komentar: ' + err.message);
      }
    };

    const confirmDeletePost = async () => {
      if (confirm('Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.')) {
        await deletePost();
      }
    };

    const deletePost = async () => {
        try {
            // Hapus gambar dari Storage (jika ada)
            if (post.value.imageUrl) {
                const imageRef = storageRef(storage, post.value.imageUrl);
                await deleteObject(imageRef);
                console.log('Gambar berhasil dihapus dari Storage.');
            }

            // Hapus semua komentar terlebih dahulu
            const commentsCollectionRef = collection(db, 'posts', props.id, 'comments');
            const commentsSnapshot = await getDocs(commentsCollectionRef); // Menggunakan getDocs
            const commentsToDelete = [];
            commentsSnapshot.forEach(doc => {
                commentsToDelete.push(deleteDoc(doc.ref));
            });
            await Promise.all(commentsToDelete);
            console.log('Semua komentar berhasil dihapus.');


            // Hapus postingan itu sendiri
            const postDocRef = doc(db, 'posts', props.id);
            await deleteDoc(postDocRef);

            alert('Postingan dan semua komentar berhasil dihapus!');
            router.push('/'); // Redirect ke halaman utama setelah penghapusan
        } catch (err) {
            console.error('Error deleting post or comments:', err);
            alert('Gagal menghapus postingan: ' + err.message);
        }
    };

    const formattedPostDate = computed(() => {
      if (post.value && post.value.createdAt && post.value.createdAt.toDate) {
        return post.value.createdAt.toDate().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return 'Tanggal tidak tersedia';
    });

    const formattedCommentDate = (comment) => {
      if (comment.createdAt && comment.createdAt.toDate) {
        return comment.createdAt.toDate().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return 'Tanggal tidak tersedia';
    };

    onMounted(() => {
      fetchPost();
      fetchComments();
    });

    return {
      post,
      comments,
      loading,
      commentsLoading,
      error,
      newComment,
      commentError,
      commentLoadingState,
      user,
      formattedPostDate,
      formattedCommentDate,
      addComment,
      deleteComment,
      confirmDeletePost,
    };
  },
};
</script>

<style scoped>
.post-detail-page {
  max-width: 800px;
  margin: 30px auto;
  padding: 35px;
  background-color: var(--background-card);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
}

/* Mobile adjustments for post-detail-page */
@media (max-width: 768px) {
  .post-detail-page {
    margin: 20px 15px;
    padding: 25px;
  }
  .post-detail-title {
    font-size: 2.2rem; /* Smaller title */
  }
}
@media (max-width: 480px) {
  .post-detail-page {
    margin: 15px 10px;
    padding: 20px;
  }
  .post-detail-title {
    font-size: 1.8rem; /* Even smaller title */
  }
  .post-meta {
    font-size: 0.85em;
  }
  .post-content {
    font-size: 1em; /* Smaller content font */
  }
}

.post-detail-title {
  color: var(--secondary-color);
  font-size: 2.8rem;
  margin-bottom: 10px;
  text-align: center;
  line-height: 1.2;
}

.post-meta {
  font-size: 0.95em;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 25px;
}

.post-category {
  background-color: #ecf0f1;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.85em;
  color: #555;
  margin-left: 10px;
  font-weight: 600;
}

.post-image-container {
  text-align: center;
  margin: 25px 0;
}

.post-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  margin-top: 30px;
  text-align: justify;
}

.btn-delete-post {
  background-color: var(--accent-color);
  color: var(--text-color-light);
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  /* Animasi Global untuk tombol delete */
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  margin-top: 20px;
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.btn-delete-post:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}
.btn-delete-post:active {
  transform: translateY(0);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.section-divider {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), var(--border-color), rgba(0, 0, 0, 0));
  margin: 40px 0;
}

/* Mobile adjustments for section divider */
@media (max-width: 480px) {
  .section-divider {
    margin: 30px 0;
  }
}

.comments-section h3 {
  color: var(--secondary-color);
  font-size: 1.8rem;
  margin-bottom: 25px;
  text-align: center;
}

/* Mobile adjustments for comment section heading */
@media (max-width: 480px) {
  .comments-section h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
}

.no-comments-message, .login-to-comment {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 20px;
}

.login-to-comment a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast), text-decoration var(--transition-fast); /* Animasi Global */
}

.login-to-comment a:hover {
  text-decoration: underline;
}

.comment-item {
  background-color: #f9f9f9;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  padding: 15px 20px;
  margin-bottom: 15px;
  position: relative;
  transition: box-shadow var(--transition-fast); /* Animasi Global */
}
.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* subtle shadow on hover */
}

/* Mobile adjustments for comment item */
@media (max-width: 480px) {
  .comment-item {
    padding: 12px 15px;
    margin-bottom: 10px;
  }
  .comment-author {
    font-size: 0.95em;
  }
  .comment-content {
    font-size: 0.9em;
  }
  .comment-meta {
    font-size: 0.8em;
  }
}

.comment-author {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-meta {
  font-size: 0.85em;
  color: #95a5a6;
}

.btn-delete-comment {
  background-color: var(--accent-color);
  color: var(--text-color-light);
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  position: absolute;
  top: 15px;
  right: 15px;
  /* Animasi Global untuk tombol delete komentar */
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.btn-delete-comment:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}
.btn-delete-comment:active {
  transform: translateY(0);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Mobile adjustment for delete comment button */
@media (max-width: 480px) {
  .btn-delete-comment {
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    font-size: 0.75em;
  }
}

.comment-form {
  margin-top: 30px;
  padding: 25px;
  background-color: var(--background-card);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
}

/* Mobile adjustment for comment form */
@media (max-width: 480px) {
  .comment-form {
    padding: 20px;
    margin-top: 20px;
  }
  .comment-form h4 {
    font-size: 1.2rem;
  }
}

.comment-form h4 {
  color: var(--secondary-color);
  margin-bottom: 20px;
  font-size: 1.4rem;
  text-align: center;
}
</style>