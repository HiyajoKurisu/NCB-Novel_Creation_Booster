<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-md p-6 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-color)]">
      <h2 class="text-xl font-bold mb-4">初始配置 (Settings)</h2>
      <p class="text-sm text-[var(--text-secondary)] mb-6">
        请配置您的 GitHub 仓库以开启直连同步。您的 Personal Access Token (PAT) 将仅保存在本地浏览器的 localStorage 中。
      </p>
      
      <form @submit.prevent="save">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">GitHub PAT</label>
            <input v-model="form.token" type="password" required class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:border-[var(--accent-color)]" placeholder="ghp_xxxxxxxxxxxx">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Repository Owner</label>
            <input v-model="form.owner" type="text" required class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:border-[var(--accent-color)]" placeholder="e.g., your-username">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Repository Name</label>
            <input v-model="form.repo" type="text" required class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:border-[var(--accent-color)]" placeholder="e.g., my-novel">
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button type="submit" class="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium hover:opacity-90 transition-opacity" style="background: var(--accent-gradient)">
            保存并连接
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  initialConfig: Object
});
const emit = defineEmits(['save']);

const form = reactive({
  token: props.initialConfig?.token || '',
  owner: props.initialConfig?.owner || '',
  repo: props.initialConfig?.repo || ''
});

const save = () => {
  emit('save', form.token, form.owner, form.repo);
};
</script>
