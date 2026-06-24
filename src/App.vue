<template>
  <div v-if="!hasConfig" class="min-h-screen bg-[var(--bg-primary)]">
    <SettingsModal :initialConfig="githubConfig" @save="onSaveConfig" />
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
    />
    <div v-else-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="animate-pulse text-xl font-medium text-[var(--text-secondary)]">正在加载小说信息...</div>
    </div>
    <div v-else-if="error" class="min-h-screen flex items-center justify-center flex-col gap-4">
      <div class="text-red-500 font-bold">错误: {{ error }}</div>
      <button @click="clearConfig" class="px-4 py-2 text-white rounded shadow-sm" style="background: var(--accent-gradient)">重新配置</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import SettingsModal from './components/SettingsModal.vue';
import Workspace from './components/Layout/Workspace.vue';
import { useEditor } from './composables/useEditor';
import { useTheme } from './composables/useTheme';

const { 
  meta, loading, saving, error, githubConfig, chaptersData, 
  saveConfig, loadMeta, loadChapter, updateChapterContent, updateChapterSynopsis, saveAll,
  saveChapter, exportNovel
} = useEditor();

const { toggleTheme } = useTheme();

const hasConfig = computed(() => !!(githubConfig.token && githubConfig.owner && githubConfig.repo));

const onSaveConfig = async (token, owner, repo) => {
  saveConfig(token, owner, repo);
  await loadMeta();
};

const clearConfig = () => {
  localStorage.removeItem('ncb_token');
  localStorage.removeItem('ncb_owner');
  localStorage.removeItem('ncb_repo');
  window.location.reload();
};

const onManualSave = () => {
  saveAll();
};

// Global Ctrl+S override
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    onManualSave();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  if (hasConfig.value) {
    loadMeta();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
