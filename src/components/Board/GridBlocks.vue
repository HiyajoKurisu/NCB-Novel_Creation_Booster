<template>
  <div class="w-full">
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(1.5rem, 1fr)); gap: 1px;">
      <div 
        v-for="chapter in chapters" 
        :key="chapter.id"
        class="aspect-square relative overflow-hidden group cursor-pointer"
        style="background-color: var(--progress-bg); border: 1px solid var(--border-color);"
        @click="$emit('scrollTo', chapter.id)"
      >
        <div 
          class="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out"
          :style="{
            height: `${Math.min(100, ((chapter.current_words || 0) / (chapter.target_words || 1)) * 100)}%`,
            background: 'var(--accent-gradient)'
          }"
        ></div>
        <!-- Tooltip -->
        <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-max bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none shadow">
          {{ chapter.id }} - {{ chapter.current_words || 0 }} / {{ chapter.target_words }}
        </div>
      </div>
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
defineEmits(['scrollTo']);
</script>
