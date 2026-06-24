import { ref, reactive } from 'vue';
import { GitHubAPI } from '../api/github';

export function useEditor() {
  const meta = ref(null);
  const metaSha = ref(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref(null);
  
  const githubConfig = reactive({
    token: '',
    owner: '',
    repo: ''
  });

  let github = null;

  const initEditor = (project) => {
    githubConfig.token = project.token;
    
    // Split userRepo "owner/repo"
    const parts = project.userRepo.split('/');
    githubConfig.owner = parts[0] || '';
    githubConfig.repo = parts[1] || '';
    
    github = new GitHubAPI(githubConfig.token, githubConfig.owner, githubConfig.repo);
  };

  const loadMeta = async () => {
    if (!github) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await github.getFile('meta.json');
      meta.value = JSON.parse(data.content);
      metaSha.value = data.sha;
      return meta.value;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Accurately count characters (Chinese, English, numbers, symbols, excluding whitespace)
  const countWords = (text) => {
    if (!text) return 0;
    return text.replace(/\s+/g, '').length;
  };

  // Chapter state management
  const chaptersData = reactive({}); // { '001': { content, sha, dirty } }

  const loadChapter = async (chapterId) => {
    if (!github) return;
    if (chaptersData[chapterId]?.content !== undefined) return; // Already loaded

    loading.value = true;
    try {
      // 1. Try local cache first
      const localCache = localStorage.getItem(`ncb_draft_${githubConfig.repo}_${chapterId}`);
      if (localCache) {
        const parsed = JSON.parse(localCache);
        chaptersData[chapterId] = parsed;
      }

      // 2. Fetch from Github
      const data = await github.getFile(`chapters/${chapterId}.txt`);
      
      if (!chaptersData[chapterId] || !chaptersData[chapterId].dirty) {
         chaptersData[chapterId] = {
           content: data.content,
           sha: data.sha,
           dirty: false
         };
      } else {
         // Local cache is dirty, just update sha
         chaptersData[chapterId].sha = data.sha;
      }
    } catch (err) {
      // If 404, it might be a new chapter
      if (err.message.includes('404')) {
         if (!chaptersData[chapterId]) {
           chaptersData[chapterId] = { content: '', sha: null, dirty: false };
         }
      } else {
         error.value = `Failed to load chapter ${chapterId}: ${err.message}`;
      }
    } finally {
      loading.value = false;
    }
  };

  let localSaveTimer = null;
  const updateChapterContent = (chapterId, content) => {
    if (!chaptersData[chapterId]) {
      chaptersData[chapterId] = { content: '', sha: null, dirty: false };
    }
    chaptersData[chapterId].content = content;
    chaptersData[chapterId].dirty = true;
    
    // Update local word count in meta immediately for UI
    const chapterMeta = meta.value?.chapters?.find(c => c.id === chapterId);
    if (chapterMeta) {
      chapterMeta.current_words = countWords(content);
    }

    // High frequency local cache
    clearTimeout(localSaveTimer);
    localSaveTimer = setTimeout(() => {
      localStorage.setItem(`ncb_draft_${githubConfig.repo}_${chapterId}`, JSON.stringify(chaptersData[chapterId]));
    }, 1000);
    
    resetAutoSave();
  };

  const updateChapterSynopsis = (chapterId, synopsis) => {
    const chapterMeta = meta.value?.chapters?.find(c => c.id === chapterId);
    if (chapterMeta) {
      chapterMeta.synopsis = synopsis;
    }
    
    if (!chaptersData[chapterId]) {
      chaptersData[chapterId] = { content: undefined, sha: null, dirty: false };
    }
    chaptersData[chapterId].dirty = true;
    
    resetAutoSave();
  };

  // Auto save logic (5 minutes)
  let autoSaveTimer = null;
  const resetAutoSave = () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveAll();
    }, 300000);
  };

  const saveAll = async () => {
    if (!github || !meta.value || saving.value) return;
    const dirtyChapters = Object.keys(chaptersData).filter(id => chaptersData[id].dirty);
    if (dirtyChapters.length === 0) return;

    saving.value = true;
    error.value = null;
    try {
      // 1. Fetch latest meta sha to prevent conflicts
      let currentMetaSha = metaSha.value;
      try {
        const latestMeta = await github.getFile('meta.json');
        currentMetaSha = latestMeta.sha;
      } catch(e) { console.warn('Could not fetch latest meta sha', e); }

      for (const id of dirtyChapters) {
        const chapter = chaptersData[id];
        
        // Recalculate word count precisely before saving
        const chapterMeta = meta.value?.chapters?.find(c => c.id === id);
        if (chapterMeta) {
          chapterMeta.current_words = countWords(chapter.content);
        }
        let currentSha = chapter.sha;
        try {
           const latestChapter = await github.getFile(`chapters/${id}.txt`);
           currentSha = latestChapter.sha;
        } catch(e) { /* ignore 404 */ }

        // Update chapter file
        const updateRes = await github.updateFile(
          `chapters/${id}.txt`, 
          chapter.content, 
          `Update chapter ${id}`, 
          currentSha
        );
        chapter.sha = updateRes.content.sha;
        chapter.dirty = false;
        
        // Clear local cache
        localStorage.removeItem(`ncb_draft_${githubConfig.repo}_${id}`);
      }

      // 2. Update meta.json with new word counts
      const metaUpdateRes = await github.updateFile(
        'meta.json',
        JSON.stringify(meta.value, null, 2),
        'Update word counts',
        currentMetaSha
      );
      metaSha.value = metaUpdateRes.content.sha;

    } catch (err) {
      error.value = err.message;
    } finally {
      saving.value = false;
    }
  };

  const saveChapter = async (chapterId) => {
    if (!github || !meta.value || saving.value) return;
    const chapter = chaptersData[chapterId];
    if (!chapter || !chapter.dirty) return;

    saving.value = true;
    error.value = null;
    try {
      // Fetch latest meta sha to prevent conflicts
      let currentMetaSha = metaSha.value;
      try {
        const latestMeta = await github.getFile('meta.json');
        currentMetaSha = latestMeta.sha;
      } catch(e) { console.warn('Could not fetch latest meta sha', e); }

      // Recalculate word count
      const chapterMeta = meta.value?.chapters?.find(c => c.id === chapterId);
      if (chapterMeta) {
        chapterMeta.current_words = countWords(chapter.content);
      }

      let currentSha = chapter.sha;
      try {
          const latestChapter = await github.getFile(`chapters/${chapterId}.txt`);
          currentSha = latestChapter.sha;
      } catch(e) { /* ignore 404 */ }

      // Update chapter file
      const updateRes = await github.updateFile(
        `chapters/${chapterId}.txt`, 
        chapter.content, 
        `Update chapter ${chapterId}`, 
        currentSha
      );
      chapter.sha = updateRes.content.sha;
      chapter.dirty = false;
      
      // Clear local cache
      localStorage.removeItem(`ncb_draft_${githubConfig.repo}_${chapterId}`);

      // Update meta.json with new word counts
      const metaUpdateRes = await github.updateFile(
        'meta.json',
        JSON.stringify(meta.value, null, 2),
        'Update word counts',
        currentMetaSha
      );
      metaSha.value = metaUpdateRes.content.sha;

    } catch (err) {
      error.value = err.message;
    } finally {
      saving.value = false;
    }
  };

  const exportNovel = async () => {
    if (!github || !meta.value) return;
    loading.value = true;
    error.value = null;
    try {
      let fullText = meta.value.title + '\n\n';
      
      for (const chapterMeta of meta.value.chapters) {
        const chapterId = chapterMeta.id;
        let content = '';
        
        // Use memory if loaded
        if (chaptersData[chapterId] && chaptersData[chapterId].content !== undefined) {
          content = chaptersData[chapterId].content;
        } else {
          // Fetch from Github
          try {
            const data = await github.getFile(`chapters/${chapterId}.txt`);
            content = data.content;
            chaptersData[chapterId] = { content: data.content, sha: data.sha, dirty: false };
          } catch(e) {
            content = '[未找到章节内容]';
          }
        }
        
        fullText += `### ${chapterMeta.id} ${chapterMeta.title}\n\n${content}\n\n`;
      }
      
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.value.title || 'novel_export'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      error.value = `Export failed: ${err.message}`;
    } finally {
      loading.value = false;
    }
  };

  const refreshAll = async () => {
    if (!github || saving.value || loading.value) return;
    
    // Clear in-memory dirty drafts if any (user should be warned before calling this)
    for (const id in chaptersData) {
      if (chaptersData[id]) {
        chaptersData[id].content = undefined;
        chaptersData[id].dirty = false;
      }
    }
    
    await loadMeta();
    // Chapters will be re-fetched when ChapterCard emits 'load' event since their content is now undefined
  };

  return {
    meta,
    loading,
    saving,
    error,
    githubConfig,
    chaptersData,
    initEditor,
    loadMeta,
    loadChapter,
    updateChapterContent,
    updateChapterSynopsis,
    saveAll,
    saveChapter,
    exportNovel,
    refreshAll,
    countWords
  };
}
