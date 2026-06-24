<template>
  <div class="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-black text-[var(--text-primary)]">我的小说库</h1>
        <div class="flex items-center gap-2">
          <button @click="$emit('toggleTheme')" class="p-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)]">
            <PaletteIcon class="w-5 h-5" />
          </button>
          <button @click="showAddModal = true" class="px-4 py-2 text-white rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2" style="background: var(--accent-gradient)">
            <PlusIcon class="w-4 h-4" />
            <span>添加项目</span>
          </button>
        </div>
      </div>

      <div v-if="projects.length === 0" class="text-center py-20 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        <BookOpenIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg">您还没有添加任何小说项目</p>
        <p class="text-sm mt-2">点击右上角添加项目以开始创作</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col relative"
          @click="$emit('select', project)"
        >
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="$emit('remove', project.id)" class="p-2 text-red-500 hover:bg-red-500/10 rounded-md" title="移除项目">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
          
          <div class="w-10 h-10 rounded-lg bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] mb-4">
            <BookIcon class="w-5 h-5" />
          </div>
          <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2" :title="project.title">{{ project.title || 'Unknown Novel' }}</h2>
          <p class="text-sm text-[var(--text-secondary)] mt-auto truncate" :title="project.userRepo">{{ project.userRepo }}</p>
        </div>
      </div>
    </div>

    <AddProjectModal 
      v-if="showAddModal" 
      @close="showAddModal = false" 
      @save="onAddProject" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, BookOpen, Book, Trash2, Palette } from 'lucide-vue-next';
import AddProjectModal from './AddProjectModal.vue';

const PlusIcon = Plus;
const BookOpenIcon = BookOpen;
const BookIcon = Book;
const TrashIcon = Trash2;
const PaletteIcon = Palette;

const props = defineProps({
  projects: Array
});

const emit = defineEmits(['select', 'add', 'remove', 'toggleTheme']);

const showAddModal = ref(false);

const onAddProject = (token, userRepo) => {
  emit('add', token, userRepo);
  showAddModal.value = false;
};
</script>
