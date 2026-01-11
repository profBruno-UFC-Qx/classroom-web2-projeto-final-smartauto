<script setup lang="ts">
</script>

<template>
  <div class="auth-layout">
    <div class="auth-background">
      <div class="auth-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-background {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.auth-content {
  width: 100%;
  max-width: 500px;
}

@media (max-width: 768px) {
  .auth-layout {
    background: #f5f5f5;
  }

  .auth-background {
    background: white;
  }
}
</style>
