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

  const themes = ['default', 'dark', 'eyecare', 'brutalism', 'warm', 'cyberpunk'];

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
    setTheme,
    toggleTheme
  };
}
