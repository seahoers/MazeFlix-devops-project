<script setup lang="ts">
type Props = {
  filled?: boolean;
};

defineProps<Props>();
</script>

<template>
  <svg :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 21s-6.716-4.35-9.428-8.485C.993 9.76 1.57 6.11 4.28 4.44a5.5 5.5 0 0 1 7.72 1.06 5.5 5.5 0 0 1 7.72-1.06c2.71 1.67 3.287 5.32 1.708 8.075C18.716 16.65 12 21 12 21z"
    />
  </svg>
</template>
