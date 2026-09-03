import type { Project } from '~~/shared/types/project';

export const useProjectData = () => {

  const fetchProject = async (id: string): Promise<Project | undefined> => {
    return await $fetch<Project>(`/api/projects/${id}`);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    return await $fetch<Project[]>('/api/projects');
  };

  const deleteProject = async (id: string): Promise<void> => {
    await $fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  };

  return { fetchProject, fetchProjects, deleteProject };
};
