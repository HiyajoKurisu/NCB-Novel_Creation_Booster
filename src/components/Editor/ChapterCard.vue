<template>
  <div :id="`chapter-${chapterMeta.id}`" class="mb-8 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-color)] overflow-hidden transition-all duration-300" style="background-color: var(--card-bg);">
    <!-- Header (Always visible) -->
    <div 
      class="px-6 py-4 cursor-pointer flex justify-between items-start select-none hover:bg-[var(--bg-secondary)] transition-colors"
      @click="toggleExpand"
    >
      <div class="flex-1 pr-4">
        <h3 class="text-xl font-bold flex items-center gap-3">
          <span class="text-[var(--text-secondary)] text-lg">#{{ chapterMeta.id }}</span>
          {{ chapterMeta.title }}
          <span v-if="localData?.dirty" class="ml-2 px-2 py-0.5 text-xs font-normal rounded text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 animate-pulse">
            有更改
          </span>
        </h3>
        <p v-show="!isExpanded && chapterMeta.synopsis" class="mt-2 text-[var(--text-secondary)] text-sm leading-relaxed truncate">
          {{ chapterMeta.synopsis }}
        </p>
      </div>
      <div class="flex items-center shrink-0">
        <div class="flex items-center gap-3">
          <button 
            v-if="localData?.dirty && isExpanded" 
            @click.stop="$emit('save', chapterMeta.id)"
            class="px-2 py-1 bg-[var(--accent-color)] text-white text-xs rounded hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1"
            title="保存本章"
          >
            <SaveIcon class="w-3 h-3" /> 保存
          </button>
          
          <div class="flex items-center gap-2">
            <!-- 呼吸灯状态 -->
            <span 
              class="w-2 h-2 rounded-full shadow-[0_0_6px]"
              :class="{
                'bg-yellow-500 shadow-yellow-500 animate-pulse': localData?.dirty,
                'bg-green-500 shadow-green-500 animate-pulse': !localData?.dirty && isCompleted,
                'bg-blue-500 shadow-blue-500 animate-pulse': !localData?.dirty && !isCompleted && (chapterMeta.current_words > 0),
                'bg-gray-300 shadow-none': !localData?.dirty && (!chapterMeta.current_words)
              }"
              :title="localData?.dirty ? '未保存' : (isCompleted ? '已完成' : '进行中')"
            ></span>
            <div class="text-sm font-medium" :style="{ color: isCompleted ? 'var(--accent-color)' : 'var(--text-primary)' }">
              {{ chapterMeta.current_words || 0 }} / {{ chapterMeta.target_words }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Body (Visible when expanded) -->
    <div v-show="isExpanded" class="border-t border-[var(--border-color)] relative">
      <div v-if="isLoading" class="absolute inset-0 bg-[var(--card-bg)]/80 backdrop-blur-sm flex items-center justify-center z-10">
        <span class="animate-pulse font-medium text-lg text-[var(--accent-color)]">读取中...</span>
      </div>
      
      <!-- Synopsis Editor -->
      <div class="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
        <label class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">大纲</label>
        <textarea
          v-model="synopsisContent"
          class="w-full min-h-[40px] bg-transparent border-none focus:outline-none resize-none text-sm text-[var(--text-secondary)] custom-scrollbar disabled:opacity-50"
          placeholder="在此输入本章大纲或备忘录..."
          @input="handleSynopsisInput"
          :disabled="isLoading"
        ></textarea>
      </div>

      <!-- Body Text Editor -->
      <div class="px-6 py-4">
        <label class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">正文</label>
        <textarea
          ref="textareaRef"
          v-model="content"
          class="w-full min-h-[300px] bg-transparent border-none focus:outline-none resize-none leading-loose text-lg disabled:opacity-50"
          placeholder="开始创作..."
          @input="handleInput"
          :disabled="isLoading"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { Save as SaveIcon } from 'lucide-vue-next';

const props = defineProps({
  chapterMeta: {
    type: Object,
    required: true
  },
  localData: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['load', 'updateContent', 'updateSynopsis', 'save']);

const isExpanded = ref(false);
const content = ref('');
const synopsisContent = ref(props.chapterMeta.synopsis || '');
const textareaRef = ref(null);

const isCompleted = computed(() => {
  return (props.chapterMeta.current_words || 0) >= (props.chapterMeta.target_words || 1);
});

watch(() => props.localData?.content, (newContent) => {
  if (newContent !== undefined && newContent !== content.value) {
    content.value = newContent;
    adjustHeight();
  }
});

const adjustHeight = async () => {
  await nextTick();
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

const handleInput = () => {
  adjustHeight();
  emit('updateContent', props.chapterMeta.id, content.value);
};

const handleSynopsisInput = () => {
  emit('updateSynopsis', props.chapterMeta.id, synopsisContent.value);
};

const toggleExpand = async () => {
  if (!isExpanded.value) {
    emit('load', props.chapterMeta.id);
  }
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    await adjustHeight();
  }
};
</script>
