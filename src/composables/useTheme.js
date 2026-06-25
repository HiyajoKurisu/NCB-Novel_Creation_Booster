import { ref, onMounted } from 'vue';

export function useTheme() {
  const theme = ref('default');

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    localStorage.setItem('ncb_theme', newTheme);
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const themeOptions = {
    'default': '默认主题',
    'dark': '夜间模式',
    'eyecare': '护眼模式',
    'brutalism': '新粗野主义',
    'warm': '暖黄复古',
    'cyberpunk': '赛博朋克'
  };

  const themes = Object.keys(themeOptions);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('ncb_theme') || 'default';
    setTheme(savedTheme);
  });

  return {
    theme,
    themeOptions,
    setTheme,
    toggleTheme
  };
}
