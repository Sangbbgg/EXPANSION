"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed';
  chatHistory: { id: number, sender: 'user' | 'ai', text: string }[];
  logs: string[];
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const router = useRouter();

  // Fetch projects from the API on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (newProjectName.trim() === '') return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      const newProject: Project = await response.json();

      setProjects((prevProjects) => [...prevProjects, newProject]);
      setNewProjectName('');
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleSelectProject = (projectId: string) => {
    router.push(`/dashboard?projectId=${projectId}`);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black">Project Management</h1>

      {/* Create New Project */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Create New Project</h2>
        <div className="flex flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Enter project name"
            className="flex-1 p-3 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0 text-black"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProject();
              }
            }}
          />
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleCreateProject}
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-800">No projects created yet. Create one above!</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-3 rounded-lg mb-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectProject(project.id)}
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-lg text-black">{project.name}</p>
                  <p className={`text-sm ${
                    project.status === 'Completed' ? 'text-green-600' :
                    project.status === 'Development' ? 'text-blue-600' :
                    'text-gray-700'
                  }`}>
                    Status: {project.status}
                  </p>
                </div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none w-full sm:w-auto"
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
