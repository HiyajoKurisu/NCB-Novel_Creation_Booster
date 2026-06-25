<template>
  <div class="w-full flex h-4 rounded overflow-hidden" style="background-color: var(--progress-bg); border: 1px solid var(--border-color)">
    <div 
      v-for="(chapter, index) in chapters" 
      :key="chapter.id"
      class="flex-1 border-r border-white/20 last:border-r-0 h-full relative group cursor-pointer"
      :style="{ borderColor: 'var(--border-color)' }"
      :title="`${chapter.current_words || 0} / ${chapter.target_words}`"
    >
      <div 
        class="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
        :style="{
          width: `${Math.min(100, ((chapter.current_words || 0) / (chapter.target_words || 1)) * 100)}%`,
          background: 'var(--accent-gradient)'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  chapters: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>
