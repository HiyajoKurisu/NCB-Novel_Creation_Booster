<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-2xl p-6 rounded-xl shadow-[var(--card-shadow)] border border-[var(--border-color)] relative max-h-[90vh] flex flex-col">
      <button @click="$emit('close')" class="absolute top-4 right-4 p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
        <XIcon class="w-5 h-5" />
      </button>
      
      <h2 class="text-2xl font-bold mb-6 border-b border-[var(--border-color)] pb-4">使用帮助</h2>
      
      <div class="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-6">
        
        <section>
          <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><KeyIcon class="w-5 h-5 text-[var(--accent-color)]"/> 1. 如何获取 GitHub PAT (Token)</h3>
          <p class="text-sm text-[var(--text-secondary)] mb-2">
            Novel Creation Booster 使用 GitHub API 来读取和保存您的小说内容，因此需要一个访问令牌 (Personal Access Token)。
          </p>
          <ol class="list-decimal list-inside text-sm text-[var(--text-secondary)] space-y-1 ml-2">
            <li>登录您的 GitHub 账号。</li>
            <li>点击右上角头像，进入 <strong>Settings</strong> -> <strong>Developer settings</strong> -> <strong>Personal access tokens</strong> -> <strong>Tokens (classic)</strong>。</li>
            <li>点击 <strong>Generate new token (classic)</strong>。</li>
            <li>在 Note 中填入用途（如 "NCB Token"），Expiration 建议选择 "No expiration" 以免过期。</li>
            <li>在 Select scopes 中，<strong>必须勾选 `repo` 权限</strong> （Full control of private repositories）。</li>
            <li>点击最下方的 Generate token。</li>
            <li><strong>重要：</strong> 复制生成的 `ghp_...` 开头的 Token，它只显示一次。请妥善保存。</li>
          </ol>
        </section>

        <section>
          <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><FolderGit2Icon class="w-5 h-5 text-[var(--accent-color)]"/> 2. 仓库格式规范</h3>
          <p class="text-sm text-[var(--text-secondary)] mb-2">
            您必须在 GitHub 上创建一个仓库来存储小说。仓库中必须包含以下结构：
          </p>
          <div class="bg-[var(--bg-secondary)] p-3 rounded-md text-sm font-mono text-[var(--text-primary)] mb-2">
            ├── meta.json<br>
            └── chapters/<br>
            &nbsp;&nbsp;&nbsp;&nbsp;├── 001.txt<br>
            &nbsp;&nbsp;&nbsp;&nbsp;├── 002.txt<br>
            &nbsp;&nbsp;&nbsp;&nbsp;└── ...
          </div>
          <p class="text-sm text-[var(--text-secondary)]">
            其中 `chapters/` 文件夹内存放每一章的纯文本（`.txt`）文件。章节文件名必须和 `meta.json` 中配置的 `id` 保持一致（例如 `001.txt`）。
          </p>
        </section>

        <section>
          <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><FileJsonIcon class="w-5 h-5 text-[var(--accent-color)]"/> 3. meta.json 文件写法</h3>
          <p class="text-sm text-[var(--text-secondary)] mb-2">
            这是整个小说的核心配置文件，您可以在 GitHub 仓库根目录创建一个 `meta.json` 文件，并参考以下格式写入：
          </p>
          <pre class="bg-[var(--bg-secondary)] p-3 rounded-md text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
{
  "title": "我的小说标题",
  "description": "这是关于一个少年的冒险故事...",
  "chapters": [
    {
      "id": "001",
      "title": "第一章 命运的相遇",
      "synopsis": "男主在街角遇到了女主。",
      "target_words": 2000,
      "current_words": 0
    },
    {
      "id": "002",
      "title": "第二章 潜入地下城",
      "synopsis": "",
      "target_words": 3000,
      "current_words": 0
    }
  ]
}</pre>
          <p class="text-sm text-[var(--text-secondary)] mt-2">
            配置好之后，您就可以在左侧栏看到大纲。编辑器会自动计算您的实际字数并更新 `current_words`，无需您手动修改字数。如果想增加章节，只需要修改线上的 `meta.json` 即可。
          </p>
        </section>

      </div>
      
      <div class="mt-6 flex justify-end border-t border-[var(--border-color)] pt-4">
        <button @click="$emit('close')" class="px-6 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium hover:opacity-90 transition-opacity" style="background: var(--accent-gradient)">
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, Key, FolderGit2, FileJson } from 'lucide-vue-next';

const XIcon = X;
const KeyIcon = Key;
const FolderGit2Icon = FolderGit2;
const FileJsonIcon = FileJson;

const emit = defineEmits(['close']);
</script>
