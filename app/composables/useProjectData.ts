import type { Project } from '~~/shared/types/project';

export const useProjectData = () => {

  const fetchProject = async (id: string): Promise<Project | undefined> => {
    return await $fetch<Project>(`/api/projects/${id}`);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    return await $fetch<Project[]>('/api/projects');
  };

  const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
    return await $fetch<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: data
    });
  };

  const deleteProject = async (id: string): Promise<void> => {
    await $fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  };

  return { fetchProject, fetchProjects, updateProject, deleteProject };
};

