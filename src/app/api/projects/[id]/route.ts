import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define the path to the JSON file
const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');

// Define the Project type, consistent with the frontend
interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed';
  chatHistory: { id: number, sender: 'user' | 'ai', text: string }[];
  logs: string[];
}

// Helper function to read projects from the file
async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(projectsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write projects to the file
async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8');
}

// GET handler to retrieve a single project by ID
export async function GET(
  request: NextRequest,
  context: any
) {
  const { id } = await context.params;
  try {
    const projects = await getProjects();
    const project = projects.find(p => p.id === id);

    if (project) {
      return NextResponse.json(project);
    } else {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error reading project' }, { status: 500 });
  }
}

// PUT handler to update a project by ID
export async function PUT(
  request: NextRequest,
  context: any
) {
  const { id } = await context.params;
  try {
    const projects = await getProjects();
    const projectIndex = projects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const updatedProjectData = await request.json();
    projects[projectIndex] = { ...projects[projectIndex], ...updatedProjectData };
    
    await saveProjects(projects);

    return NextResponse.json(projects[projectIndex]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating project' }, { status: 500 });
  }
}
