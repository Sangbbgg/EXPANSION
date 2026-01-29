import { NextResponse } from 'next/server';
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
    // If the file doesn't exist or is empty, return an empty array
    return [];
  }
}

// Helper function to write projects to the file
async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8');
}

// GET handler to retrieve all projects
export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading projects' }, { status: 500 });
  }
}

// POST handler to create a new project
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    const projects = await getProjects();

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name,
      status: 'Planning',
      chatHistory: [],
      logs: [],
    };

    projects.push(newProject);
    await saveProjects(projects);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating project' }, { status: 500 });
  }
}
