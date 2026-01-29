"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed';
  chatHistory: { sender: 'user' | 'ai', text: string }[];
  logs: string[];
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Load projects from localStorage on component mount
    const storedProjects = localStorage.getItem('expansion_projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  useEffect(() => {
    // Save projects to localStorage whenever the projects state changes
    localStorage.setItem('expansion_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = () => {
    if (newProjectName.trim() === '') return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      status: 'Planning',
      chatHistory: [],
      logs: [],
    };

    setProjects((prevProjects) => [...prevProjects, newProject]);
    setNewProjectName('');
    // Optionally navigate to the new project's dashboard or project detail page
    // router.push(`/dashboard?projectId=${newProject.id}`);
  };

  const handleSelectProject = (projectId: string) => {
    router.push(`/dashboard?projectId=${projectId}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Project Management</h1>

      {/* Create New Project */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter project name"
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProject();
              }
            }}
          />
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleCreateProject}
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-600">No projects created yet. Create one above!</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectProject(project.id)}
              >
                <div>
                  <p className="font-medium text-lg">{project.name}</p>
                  <p className={`text-sm ${
                    project.status === 'Completed' ? 'text-green-600' :
                    project.status === 'Development' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    Status: {project.status}
                  </p>
                </div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent li onClick from firing
                    handleSelectProject(project.id);
                  }}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
