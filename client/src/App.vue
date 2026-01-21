<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles from Next.js project */
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #1e293b;
  --background: #f8fafc;
  --surface: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --error: #ef4444;
  --border: #e2e8f0;
  --radius: 0.75rem;
  --radius-lg: 1.5rem;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-main);
  background-color: var(--background);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button, input, select, textarea {
  font-family: inherit;
}

.icon {
  display: inline-block;
  vertical-align: middle;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
