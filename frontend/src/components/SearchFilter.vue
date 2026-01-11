<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const localQuery = ref(props.modelValue || '')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function debounceSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('update:modelValue', localQuery.value)
    emit('search', localQuery.value)
  }, 300)
}

function resetSearch() {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<template>
  <div class="search-filter-container">
    <div class="search-wrapper">
      <input
        v-model="localQuery"
        type="text"
        placeholder="Buscar por modelo ou marca..."
        class="search-input"
        @input="debounceSearch"
        aria-label="Buscar"
      />
      <button @click="resetSearch" class="reset-btn" title="Limpar busca">✕</button>
    </div>

    <slot name="filters"></slot>
  </div>
</template>

<style scoped>
.search-filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrapper {
  display: flex;
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.reset-btn {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem 0.5rem;
  transition: color 0.3s;
}

.reset-btn:hover {
  color: #666;
}

@media (max-width: 768px) {
  .search-filter-container {
    flex-direction: column;
  }

  .search-wrapper {
    width: 100%;
    min-width: unset;
  }
}
</style>
