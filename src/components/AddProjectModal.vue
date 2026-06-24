<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-md p-6 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-color)] relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
        <XIcon class="w-5 h-5" />
      </button>
      
      <h2 class="text-xl font-bold mb-4">添加小说项目</h2>
      <p class="text-sm text-[var(--text-secondary)] mb-6">
        请输入您的 GitHub PAT 和 仓库路径（例如 username/repo）。您的凭据将仅保存在本地。
      </p>
      
      <form @submit.prevent="save">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">GitHub PAT (Token)</label>
            <input v-model="form.token" type="password" required class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:border-[var(--accent-color)]" placeholder="ghp_xxxxxxxxxxxx">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">仓库名 (User/Repo)</label>
            <input v-model="form.userRepo" type="text" required class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:border-[var(--accent-color)]" placeholder="e.g., HiyajoKurisu/MyNovel">
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            取消
          </button>
          <button type="submit" class="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium hover:opacity-90 transition-opacity" style="background: var(--accent-gradient)">
            保存并添加
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { X } from 'lucide-vue-next';

const XIcon = X;

const emit = defineEmits(['save', 'close']);

const form = reactive({
  token: '',
  userRepo: ''
});

const save = () => {
  emit('save', form.token, form.userRepo);
};
</script>
