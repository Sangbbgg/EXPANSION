"use client"; // This is a client component

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LiveLogViewer from '../../components/LiveLogViewer';
import ProjectStatusIndicator from '../../components/ProjectStatusIndicator';
import { Project } from '../../components/ProjectManager'; // Assuming Project interface is exported

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

interface CliCommand {
  command: string;
  description: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed'>('Planning');

  // Load project data on component mount or when projectId changes
  useEffect(() => {
    if (projectId) {
      const storedProjects = localStorage.getItem('expansion_projects');
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects);
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setCurrentProject(project);
          setChatMessages(project.chatHistory);
          setLogs(project.logs);
          setCurrentStage(project.status);
        } else {
          // Project not found, redirect to projects list
          router.push('/projects');
        }
      } else {
        router.push('/projects');
      }
    } else {
      // No projectId in URL, redirect to projects list
      router.push('/projects');
    }
  }, [projectId, router]);

  // Save project data whenever relevant state changes
  useEffect(() => {
    if (currentProject) {
      const storedProjects = localStorage.getItem('expansion_projects');
      let projects: Project[] = storedProjects ? JSON.parse(storedProjects) : [];
      const projectIndex = projects.findIndex(p => p.id === currentProject.id);

      const updatedProject: Project = {
        ...currentProject,
        chatHistory: chatMessages,
        logs: logs,
        status: currentStage,
      };

      if (projectIndex > -1) {
        projects[projectIndex] = updatedProject;
      } else {
        projects.push(updatedProject); // Should not happen if loaded correctly
      }
      localStorage.setItem('expansion_projects', JSON.stringify(projects));
      setCurrentProject(updatedProject); // Keep currentProject state updated
    }
  }, [chatMessages, logs, currentStage, currentProject]);


  const addLog = (newLog: string) => {
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !currentProject) return; // Ensure project is loaded

    const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    addLog(`[USER] ${input}`);
    setInput('');

    // --- Self-Healing Logic Integration ---
    // Here we'll simulate a command that triggers a build and potential self-healing
    if (input.toLowerCase().includes('build project')) {
      addLog(`[INFO] User requested build. Calling /api/verify...`);
      setCurrentStage('Testing');
      try {
        const verifyResponse = await fetch('/api/verify', { method: 'POST' });
        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          addLog(`[SUCCESS] Build completed successfully.`);
          addLog(verifyData.stdout);
          setCurrentStage('Deployment'); // Assuming successful build leads to deployment phase
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'Build successful. Ready for deployment.' }]);
        } else {
          addLog(`[ERROR] Build failed: ${verifyData.message}`);
          addLog(verifyData.stderr || verifyData.stdout);

          // Trigger Self-Healing: Send error back to Gemini
          addLog(`[INFO] Build failed. Sending error to Gemini for self-healing...`);
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'Build failed. Initiating self-healing with Gemini.' }]);

          const selfHealingPrompt = `The project build failed with the following error:\n\n${verifyData.stderr || verifyData.message}\n\nPlease provide corrected code snippets or CLI commands to fix this issue.`;
          const geminiHealingResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: selfHealingPrompt, type: 'chat' }), // Sending as chat for now
          });
          const geminiHealingData = await geminiHealingResponse.json();
          addLog(`[AI] Self-healing suggestion from Gemini: ${geminiHealingData.text}`);
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 2, sender: 'ai', text: `Gemini suggests: ${geminiHealingData.text}` }]);
        }
      } catch (error: any) {
        addLog(`[ERROR] Error during build verification: ${error.message}`);
        setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'An error occurred during build verification.' }]);
      }
    } else if (input.toLowerCase().includes('decompose task:')) {
      addLog(`[INFO] User requested task decomposition. Calling /api/gemini with type 'decompose'...`);
      const userPrompt = input.replace('decompose task:', '').trim();
      setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: `Decomposing task: "${userPrompt}"...` }]);

      try {
        const geminiResponse = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userPrompt, type: 'decompose' }),
        });
        const geminiData = await geminiResponse.json();

        if (geminiData.commands) {
          addLog(`[AI] Gemini decomposed task into commands:`);
          geminiData.commands.forEach((cmd: CliCommand, index: number) => {
            addLog(`  ${index + 1}. ${cmd.command} - ${cmd.description}`);
            setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 2 + index, sender: 'ai', text: `Command ${index + 1}:
${cmd.command}
 (${cmd.description})` }]);
          });
          setCurrentStage('Development'); // Assuming decomposition leads to development
        } else {
          addLog(`[ERROR] Gemini failed to decompose task: ${geminiData.message}`);
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 2, sender: 'ai', text: `Gemini could not decompose the task: ${geminiData.message}` }]);
        }
      } catch (error: any) {
        addLog(`[ERROR] Error during task decomposition: ${error.message}`);
        setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'An error occurred during task decomposition.' }]);
      }
    }
    else {
      // General chat interaction with Gemini
      addLog(`[INFO] Sending prompt to Gemini: "${input}"`);
      try {
        const geminiResponse = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });
        const geminiData = await geminiResponse.json();
        addLog(`[AI] Response from Gemini: ${geminiData.text}`);
        setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: geminiData.text }]);
      } catch (error: any) {
        addLog(`[ERROR] Error communicating with Gemini: ${error.message}`);
        setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'An error occurred while communicating with Gemini.' }]);
      }
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the log viewer
    const messageLogViewer = document.querySelector('.message-log-area');
    if (messageLogViewer) {
      messageLogViewer.scrollTop = messageLogViewer.scrollHeight;
    }
    const liveLogViewer = document.querySelector('.live-log-viewer-area');
    if (liveLogViewer) {
      liveLogViewer.scrollTop = liveLogViewer.scrollHeight;
    }
  }, [chatMessages, logs]);

  if (!currentProject) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-600">
        <p className="text-xl">Loading project or project not found...</p>
        <button onClick={() => router.push('/projects')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard: {currentProject.name}</h1>

      {/* Project Status Indicator */}
      <ProjectStatusIndicator currentStage={currentStage} />

      <h2 className="text-2xl font-bold mb-4 mt-6">AI Chat Interface</h2>

      {/* Message Log Area */}
      <div className="flex-1 bg-white p-4 rounded-lg shadow-md mb-6 overflow-y-auto flex flex-col message-log-area">
        {chatMessages.length === 0 ? (
          <p className="text-gray-600">Start a conversation with AI for {currentProject.name}...</p>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
              </span>
            </div>
          ))
        )}
      </div>


      {/* Live Log Viewer Area */}
      <div className="flex-1 mb-6 h-64 live-log-viewer-area">
        <LiveLogViewer logs={logs} />
      </div>

      {/* Chat Input Field */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Type your command here (e.g., 'build project' or 'decompose task: create a login page')..."
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
