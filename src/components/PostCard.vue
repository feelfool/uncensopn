<template>
  <div class="post-card">
    <router-link :to="`/post/${post.id}`" class="post-title-link">
      <h3>{{ post.title }}</h3>
    </router-link>
    <p class="post-meta">
      Diposting oleh {{ post.authorName || 'Anonim' }} pada {{ formattedDate }}
      <span v-if="post.category" class="post-category">[{{ post.category }}]</span>
    </p>
    <p class="post-content">{{ truncatedContent }}</p>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formattedDate = computed(() => {
      if (props.post.createdAt && props.post.createdAt.toDate) {
        return props.post.createdAt.toDate().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return 'Tanggal tidak tersedia';
    });

    const truncatedContent = computed(() => {
      const maxLength = 150;
      return props.post.content.length > maxLength
        ? props.post.content.substring(0, maxLength) + '...'
        : props.post.content;
    });

    return { formattedDate, truncatedContent };
  },
};
</script>

<style scoped>
.post-card {
  background-color: var(--background-card);
  padding: 25px;
  margin-bottom: 20px;
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);
  /* Animasi Global untuk kartu postingan */
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
}

.post-card:hover {
  transform: translateY(-5px); /* Efek angkat saat hover */
  box-shadow: var(--shadow-hover);
}

.post-title-link {
  text-decoration: none;
  color: var(--primary-color);
  /* Animasi Global untuk judul link */
  transition: color var(--transition-fast);
}

.post-title-link h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--secondary-color);
  font-size: 1.5rem;
  font-weight: 700;
}

.post-title-link:hover h3 {
  color: var(--primary-color);
}

.post-meta {
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 15px;
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

.post-content {
  line-height: 1.7;
  color: #555;
}

/* Mobile adjustments for PostCard */
@media (max-width: 600px) {
  .post-card {
    padding: 20px; /* Reduce padding */
  }
  .post-title-link h3 {
    font-size: 1.3rem; /* Smaller title */
  }
  .post-meta {
    font-size: 0.85em; /* Smaller meta info */
  }
  .post-content {
    font-size: 0.95em; /* Smaller content */
  }
}
</style>