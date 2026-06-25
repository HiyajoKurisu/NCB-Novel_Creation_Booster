<template>
  <div class="min-h-screen flex flex-col md:grid md:grid-cols-[250px_1fr_250px] gap-8 p-4 md:p-8 max-w-[1600px] mx-auto relative">
    
    <!-- Left Column: Navigation -->
    <aside :class="['fixed inset-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-md transition-transform transform md:relative md:transform-none md:block md:bg-transparent md:backdrop-blur-none md:z-auto p-4 md:p-0', isMobileNavOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="sticky top-8 overflow-y-auto h-full md:max-h-[calc(100vh-4rem)] pr-4 custom-scrollbar">
        <div class="flex items-center gap-4 mb-8 md:hidden">
          <button @click="isMobileNavOpen = false" class="p-2 bg-[var(--bg-secondary)] rounded-md hover:bg-[var(--border-color)] transition-colors">
            <XIcon class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-black m-0">章节导航</h1>
        </div>
        <div class="hidden md:flex items-center mb-8">
          <h1 class="text-2xl font-black m-0">{{ meta?.title || 'Novel Creation Booster' }}</h1>
        </div>
        <nav class="space-y-2">
          <a 
            v-for="chapter in meta?.chapters" 
            :key="chapter.id"
            :href="`#chapter-${chapter.id}`"
            class="block px-3 py-2 rounded-md transition-colors text-sm hover:bg-[var(--bg-secondary)]"
            @click.prevent="scrollTo(chapter.id); isMobileNavOpen = false"
          >
            <span class="text-[var(--text-secondary)] mr-2">#{{ chapter.id }}</span>
            <span class="truncate">{{ chapter.title }}</span>
          </a>
        </nav>
      </div>
    </aside>

    <!-- Middle Column: Main Editor Waterfall -->
    <main class="w-full max-w-3xl mx-auto relative">
      <!-- Mobile header fallback -->
      <h1 class="md:hidden text-2xl font-black mb-6">{{ meta?.title || 'Novel Creation Booster' }}</h1>

      <!-- The Waterfall -->
      <div v-if="meta?.chapters">
        <ChapterCard 
          v-for="chapter in meta.chapters" 
          :key="chapter.id"
          :chapterMeta="chapter"
          :localData="chaptersData[chapter.id]"
          :isLoading="loadingChapters[chapter.id]"
          @load="onLoadChapter"
          @updateContent="onUpdateContent"
          @updateSynopsis="onUpdateSynopsis"
          @save="onSaveChapter"
        />
      </div>
    </main>

    <!-- Right Column: Progress Board (PC) / Top (Mobile) -->
    <aside class="w-full md:w-auto order-first md:order-last z-40 sticky top-0 md:static">
      <div class="pt-2 pb-4 md:sticky md:top-8 border-b md:border-none border-[var(--border-color)] shadow-sm md:shadow-none mb-4 md:mb-0" style="background-color: var(--header-bg); backdrop-filter: blur(8px);" ref="progressBoardRef">
        <div class="flex items-center justify-between mb-4">
          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileNavOpen = true" 
            class="md:hidden p-1.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)]"
            title="展开菜单"
          >
            <MenuIcon class="w-5 h-5" />
          </button>
          
          <!-- Spacer for PC to keep buttons right-aligned -->
          <div class="hidden md:block"></div>
          <div class="flex items-center gap-2">
            <span v-if="saving" class="text-xs text-[var(--text-secondary)] animate-pulse">Saving...</span>
            <span v-if="error" class="text-xs text-red-500" :title="error">Error</span>
            <button @click="$emit('back')" class="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)] shadow-sm" title="返回项目列表">
              <ArrowLeftIcon class="w-4 h-4" />
            </button>
            <button @click="$emit('refresh')" :disabled="saving" class="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)] shadow-sm" title="刷新仓库最新状态">
              <RefreshCwIcon class="w-4 h-4" />
            </button>
            <button @click="onExport" :disabled="saving" class="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)] shadow-sm" title="导出全文">
              <DownloadIcon class="w-4 h-4" />
            </button>
            <button @click="onSave" :disabled="saving" class="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)] shadow-sm" title="保存所有">
              <SaveIcon class="w-4 h-4" />
            </button>
            <div class="relative">
              <button @click="showThemeMenu = !showThemeMenu" class="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-transparent hover:border-[var(--border-color)] shadow-sm" title="切换主题">
                <PaletteIcon class="w-4 h-4" />
              </button>
              <div v-if="showThemeMenu" class="absolute right-0 top-full mt-2 w-32 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg overflow-hidden z-50">
                <button 
                  v-for="(name, val) in themeOptions" 
                  :key="val"
                  @click="$emit('setTheme', val); showThemeMenu = false"
                  class="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                  :class="{ 'font-bold text-[var(--accent-color)]': theme === val, 'text-[var(--text-primary)]': theme !== val }"
                >
                  {{ name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <SegmentedProgressBar :chapters="meta?.chapters || []" class="mb-2" />
        <div class="text-xs text-[var(--text-secondary)] text-center mb-4 font-medium">
          {{ overallPercentage.toFixed(1) }}%
        </div>
        
        <!-- Grid Blocks (fades out on mobile scroll down) -->
        <div :class="['transition-all duration-500 origin-top', isScrolledOnMobile ? 'opacity-0 scale-y-0 h-0' : 'opacity-100 scale-y-100']" class="md:!opacity-100 md:!scale-y-100 md:!h-auto">
          <GridBlocks :chapters="meta?.chapters || []" @scrollTo="scrollTo" />
        </div>
      </div>
    </aside>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Save, Palette, Download, Menu, X, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-vue-next';
import ChapterCard from '../Editor/ChapterCard.vue';
import SegmentedProgressBar from '../Board/SegmentedProgressBar.vue';
import GridBlocks from '../Board/GridBlocks.vue';

const SaveIcon = Save;
const PaletteIcon = Palette;
const DownloadIcon = Download;
const MenuIcon = Menu;
const XIcon = X;
const ArrowLeftIcon = ArrowLeft;
const RefreshCwIcon = RefreshCw;

const isMobileNavOpen = ref(false);
const showThemeMenu = ref(false);

const props = defineProps({
  meta: Object,
  chaptersData: Object,
  saving: Boolean,
  error: String,
  theme: String,
  themeOptions: Object
});

const emit = defineEmits(['loadChapter', 'updateContent', 'updateSynopsis', 'save', 'saveChapter', 'export', 'setTheme', 'back', 'refresh']);

const totalCurrentWords = computed(() => {
  return (props.meta?.chapters || []).reduce((sum, ch) => sum + (ch.current_words || 0), 0);
});

const totalTargetWords = computed(() => {
  return (props.meta?.chapters || []).reduce((sum, ch) => sum + (ch.target_words || 0), 0);
});

const completedChaptersCount = computed(() => {
  return (props.meta?.chapters || []).filter(c => c.current_words >= (c.target_words || 1)).length;
});

const totalChaptersCount = computed(() => {
  return (props.meta?.chapters || []).length;
});

const overallPercentage = computed(() => {
  if (totalTargetWords.value === 0) return 0;
  return Math.min(100, (totalCurrentWords.value / totalTargetWords.value) * 100);
});

const loadingChapters = ref({});

const onLoadChapter = async (id) => {
  loadingChapters.value[id] = true;
  await emit('loadChapter', id);
  loadingChapters.value[id] = false;
};

const onUpdateContent = (id, content) => {
  emit('updateContent', id, content);
};

const onUpdateSynopsis = (id, synopsis) => {
  emit('updateSynopsis', id, synopsis);
};

const onSaveChapter = (id) => {
  emit('saveChapter', id);
};

const onSave = () => {
  emit('save');
};

const onExport = () => {
  emit('export');
};

const scrollTo = (id) => {
  const el = document.getElementById(`chapter-${id}`);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// Mobile scroll effect for progress board
const isScrolledOnMobile = ref(false);
const handleScroll = () => {
  if (window.innerWidth < 768) { // md breakpoint in tailwind
    isScrolledOnMobile.value = window.scrollY > 50;
  } else {
    isScrolledOnMobile.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleScroll);
});
</script>
