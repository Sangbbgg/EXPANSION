import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; // Adjust path as needed

// Define the Project type, consistent with the frontend
interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed';
  chatHistory: { id: number, sender: 'user' | 'ai', text: string }[];
  logs: string[];
}

// GET handler to retrieve all projects from Supabase
export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects') // Assuming a 'projects' table in Supabase
      .select('*'); // Select all columns

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ message: 'Error fetching projects from Supabase', error: error.message }, { status: 500 });
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('API GET error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// POST handler to create a new project in Supabase
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    const newProjectData: Omit<Project, 'id'> = { // Supabase will generate 'id'
      name: name,
      status: 'Planning',
      chatHistory: [],
      logs: [],
    };

    const { data, error } = await supabase
      .from('projects') // Assuming a 'projects' table in Supabase
      .insert([newProjectData])
      .select(); // Return the inserted data

    if (error) {
      console.error('Supabase POST error:', error);
      return NextResponse.json({ message: 'Error creating project in Supabase', error: error.message }, { status: 500 });
    }

    // Supabase insert returns an array of inserted rows, pick the first one
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('API POST error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
