<template>
  <div class="new-post-page">
    <h2>Buat Postingan Baru</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="title">Judul Postingan:</label>
        <input type="text" id="title" v-model="title" required>
      </div>
      <div>
        <label for="content">Isi Postingan:</label>
        <textarea id="content" v-model="content" rows="10" placeholder="Tulis opini Anda di sini..." required></textarea>
      </div>
      <div>
        <label for="category">Kategori:</label>
        <select id="category" v-model="category" required>
          <option value="">Pilih Kategori</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div>
        <label for="image">Upload Gambar (Opsional):</label>
        <input type="file" id="image" @change="handleImageUpload" accept="image/*">
        <p v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">Mengunggah: {{ uploadProgress.toFixed(0) }}%</p>
        <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
      </div>

      <button type="submit" :disabled="loading || (uploadProgress > 0 && uploadProgress < 100)">
        <span v-if="loading">Memposting...</span>
        <span v-else>Posting Sekarang</span>
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/init';

export default {
  name: 'NewPost',
  setup() {
    const title = ref('');
    const content = ref('');
    const category = ref('');
    const categories = ref(['Pengumuman', 'Acara', 'Diskusi Umum', 'Jual Beli', 'Lain-lain']);
    const error = ref(null);
    const loading = ref(false);
    const imageFile = ref(null);
    const uploadProgress = ref(0);
    const uploadError = ref(null);

    const router = useRouter();

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          uploadError.value = 'File harus berupa gambar.';
          imageFile.value = null;
          return;
        }
        if (file.size > 2 * 1024 * 1024) { // Max 2MB
            uploadError.value = 'Ukuran gambar maksimal 2MB.';
            imageFile.value = null;
            return;
        }
        imageFile.value = file;
        uploadError.value = null;
      } else {
        imageFile.value = null;
        uploadError.value = null;
      }
    };


    const handleSubmit = async () => {
      error.value = null;
      loading.value = true;
      let imageUrl = null;

      try {
        // 1. Upload Gambar (jika ada)
        if (imageFile.value) {
          uploadProgress.value = 0;
          const storageReference = storageRef(storage, `post_images/${imageFile.value.name}-${Date.now()}`);
          const uploadTask = uploadBytesResumable(storageReference, imageFile.value);

          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              },
              (err) => {
                uploadError.value = 'Gagal mengunggah gambar: ' + err.message;
                reject(err);
              },
              async () => {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                uploadProgress.value = 100;
                resolve();
              }
            );
          });
        }

        // 2. Buat Postingan di Firestore
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Anda harus login untuk membuat postingan.');
        }

        const newPost = {
          title: title.value,
          content: content.value,
          category: category.value,
          authorId: user.uid,
          authorName: user.displayName || user.email.split('@')[0],
          createdAt: serverTimestamp(),
          imageUrl: imageUrl || null
        };

        await addDoc(collection(db, 'posts'), newPost);

        // Reset form dan redirect
        title.value = '';
        content.value = '';
        category.value = '';
        imageFile.value = null;
        uploadProgress.value = 0;
        alert('Postingan berhasil ditambahkan!');
        router.push('/');
      } catch (err) {
        console.error('Error creating post:', err);
        error.value = err.message || 'Gagal membuat postingan.';
      } finally {
        loading.value = false;
      }
    };

    return {
      title,
      content,
      category,
      categories,
      error,
      loading,
      imageFile,
      uploadProgress,
      uploadError,
      handleImageUpload,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.new-post-page {
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background-color: var(--background-card);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
}

/* Mobile adjustments for new-post-page */
@media (max-width: 768px) {
  .new-post-page {
    margin: 20px 15px;
    padding: 25px;
  }
  .new-post-page h2 {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
}
@media (max-width: 480px) {
  .new-post-page {
    margin: 15px 10px;
    padding: 18px;
  }
  .new-post-page h2 {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
}

.upload-progress {
  font-size: 0.9em;
  color: var(--primary-color);
  margin-top: 5px;
}
</style>