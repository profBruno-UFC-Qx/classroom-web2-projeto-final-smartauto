<script setup lang="ts">
defineOptions({
  name: 'PaginationNav'
})

import { ref, computed, watch } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  limit: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'change-page': [page: number]
}>()

const inputPage = ref(props.currentPage)

const startItem = computed(() => (props.currentPage - 1) * props.limit + 1)
const endItem = computed(() => Math.min(props.currentPage * props.limit, props.total))

watch(() => props.currentPage, (newPage) => {
  inputPage.value = newPage
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    inputPage.value = page
    emit('change-page', page)
  }
}
</script>

<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <nav class="pagination" aria-label="Paginação">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <div class="pagination-info">
        <span>
          Página
          <input
            v-model.number="inputPage"
            type="number"
            :min="1"
            :max="totalPages"
            class="page-input"
            @change="goToPage(inputPage)"
          />
          de {{ totalPages }}
        </span>
        <span class="items-info">({{ startItem }}-{{ endItem }} de {{ total }})</span>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        aria-label="Próxima página"
      >
        Próxima →
      </button>
    </nav>
  </div>
</template>

<style scoped>
.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.95rem;
}

.page-input {
  width: 3rem;
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.items-info {
  color: #666;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .pagination {
    gap: 0.5rem;
  }

  .pagination-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .page-input {
    width: 2.5rem;
  }

  .pagination-info {
    gap: 0.5rem;
    font-size: 0.85rem;
  }
}
</style>
