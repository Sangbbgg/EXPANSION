import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    console.log('Executing: npm run build');
    const { stdout, stderr } = await execPromise('npm run build');

    if (stderr) {
      console.error('Build stderr:', stderr);
      return NextResponse.json({ success: false, message: 'Build failed with errors', stdout, stderr }, { status: 500 });
    }

    console.log('Build stdout:', stdout);
    return NextResponse.json({ success: true, message: 'Build completed successfully', stdout, stderr }, { status: 200 });
  } catch (error: any) {
    console.error('Error during build process:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to run build process', error: error.message },
      { status: 500 }
    );
  }
}
