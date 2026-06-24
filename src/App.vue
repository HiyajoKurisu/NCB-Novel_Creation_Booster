<template>
  <div v-if="!selectedProject" class="min-h-screen bg-[var(--bg-primary)]">
    <ProjectList 
      :projects="projects"
      @add="onAddProject"
      @remove="removeProject"
      @select="onSelectProject"
      @toggleTheme="toggleTheme"
    />
  </div>
  <div v-else class="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <Workspace 
      v-if="meta"
      :meta="meta" 
      :chaptersData="chaptersData"
      :saving="saving"
      :error="error"
      @loadChapter="loadChapter"
      @updateContent="updateChapterContent"
      @updateSynopsis="updateChapterSynopsis"
      @save="onManualSave"
      @saveChapter="saveChapter"
      @export="exportNovel"
      @toggleTheme="toggleTheme"
      @back="onBackToProjects"
      @refresh="onRefresh"
    />
    <div v-else-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="animate-pulse text-xl font-medium text-[var(--text-secondary)]">正在加载小说信息...</div>
    </div>
    <div v-else-if="error" class="min-h-screen flex items-center justify-center flex-col gap-4">
      <div class="text-red-500 font-bold mb-4">错误: {{ error }}</div>
      <button @click="onBackToProjects" class="px-4 py-2 text-white rounded shadow-sm" style="background: var(--accent-gradient)">返回项目列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import ProjectList from './components/ProjectList.vue';
import Workspace from './components/Layout/Workspace.vue';
import { useEditor } from './composables/useEditor';
import { useTheme } from './composables/useTheme';
import { useProjects } from './composables/useProjects';

const { projects, addProject, removeProject, updateProjectTitle } = useProjects();
const selectedProject = ref(null);

const { 
  meta, loading, saving, error, chaptersData, 
  initEditor, loadMeta, loadChapter, updateChapterContent, updateChapterSynopsis, saveAll,
  saveChapter, exportNovel, refreshAll
} = useEditor();

const { toggleTheme } = useTheme();

const onAddProject = (token, userRepo) => {
  addProject(token, userRepo);
};

const onSelectProject = async (project) => {
  selectedProject.value = project;
  initEditor(project);
  const loadedMeta = await loadMeta();
  if (loadedMeta?.title) {
    updateProjectTitle(project.id, loadedMeta.title);
  }
};

const onBackToProjects = () => {
  selectedProject.value = null;
  meta.value = null; // Clear workspace state
};

const onRefresh = () => {
  refreshAll();
};

const onManualSave = () => {
  saveAll();
};

// Global Ctrl+S override
// Global Ctrl+S override
const handleKeyDown = (e) => {
  if (selectedProject.value && (e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    onManualSave();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
