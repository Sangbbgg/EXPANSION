import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Adjust path as needed

// GET handler to retrieve a single project by ID from Supabase
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // Changed type from { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single(); // Expect a single row

    if (error) {
      if (error.code === 'PGRST116') { // Supabase error code for 'no rows found'
        return NextResponse.json({ message: 'Project not found' }, { status: 404 });
      }
      console.error('Supabase GET error:', error, error.stack);
      return NextResponse.json({ message: 'Error fetching project from Supabase', error: error.message }, { status: 500 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('API GET error:', error, error.stack);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// PUT handler to update a project by ID in Supabase
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } } // Changed type from { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const updatedProjectData = await request.json();

    const { data, error } = await supabase
      .from('projects')
      .update(updatedProjectData)
      .eq('id', id)
      .select(); // Return the updated data

    if (error) {
      console.error('Supabase PUT error:', error);
      return NextResponse.json({ message: 'Error updating project in Supabase', error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'Project not found for update' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('API PUT error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// DELETE handler to delete a project by ID from Supabase
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // Changed type from { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const { error, count } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase DELETE error:', error);
      return NextResponse.json({ message: 'Error deleting project from Supabase', error: error.message }, { status: 500 });
    }

    // Supabase delete doesn't return data, but we can check if a row was affected
    // For .delete(), 'count' indicates number of rows deleted.
    if (count === 0) {
        return NextResponse.json({ message: 'Project not found for deletion' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
