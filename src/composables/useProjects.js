import { ref, watch } from 'vue';

export function useProjects() {
  const projects = ref([]);
  
  // Migrate legacy single project configuration
  const legacyToken = localStorage.getItem('ncb_token');
  const legacyOwner = localStorage.getItem('ncb_owner');
  const legacyRepo = localStorage.getItem('ncb_repo');

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('ncb_projects');
      if (stored) {
        projects.value = JSON.parse(stored);
      }
    } catch (e) {
      projects.value = [];
    }

    // Migrate if needed
    if (projects.value.length === 0 && legacyToken && legacyOwner && legacyRepo) {
      projects.value.push({
        id: `${legacyOwner}/${legacyRepo}`,
        token: legacyToken,
        userRepo: `${legacyOwner}/${legacyRepo}`,
        title: `${legacyOwner}/${legacyRepo}`
      });
      saveProjects();
      
      // Cleanup legacy
      localStorage.removeItem('ncb_token');
      localStorage.removeItem('ncb_owner');
      localStorage.removeItem('ncb_repo');
    }
  };

  const saveProjects = () => {
    localStorage.setItem('ncb_projects', JSON.stringify(projects.value));
  };

  const addProject = (token, userRepo) => {
    const id = userRepo.trim();
    if (projects.value.find(p => p.id === id)) {
      // Update existing
      const p = projects.value.find(p => p.id === id);
      p.token = token.trim();
      p.userRepo = id;
    } else {
      projects.value.push({
        id,
        token: token.trim(),
        userRepo: id,
        title: id // default title until loaded
      });
    }
    saveProjects();
  };

  const removeProject = (id) => {
    projects.value = projects.value.filter(p => p.id !== id);
    saveProjects();
  };

  const updateProjectTitle = (id, title) => {
    const p = projects.value.find(p => p.id === id);
    if (p && title) {
      p.title = title;
      saveProjects();
    }
  };

  loadProjects();

  return {
    projects,
    addProject,
    removeProject,
    updateProjectTitle
  };
}
