"use client"; // This is a client component

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LiveLogViewer from '../../components/LiveLogViewer';
import ProjectStatusIndicator from '../../components/ProjectStatusIndicator';
import CheckpointModal from '../../components/CheckpointModal';
import { Project } from '../../components/ProjectManager';
import { debounce } from 'lodash';

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
  const [isCheckpointOpen, setCheckpointOpen] = useState(false);

  // Load project data on component mount or when projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const project: Project = await response.json();
            setCurrentProject(project);
            setChatMessages(project.chatHistory);
            setLogs(project.logs);
            setCurrentStage(project.status);
          } else {
            router.push('/projects');
          }
        } catch (error) {
          console.error("Failed to fetch project:", error);
          router.push('/projects');
        }
      } else {
        router.push('/projects');
      }
    };
    fetchProject();
  }, [projectId, router]);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (projectToSave: Project) => {
      if (!projectToSave) return;
      try {
        await fetch(`/api/projects/${projectToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectToSave),
        });
      } catch (error) {
        console.error("Failed to save project:", error);
      }
    }, 1000),
    []
  );

  // Save project data whenever relevant state changes
  useEffect(() => {
    if (currentProject) {
      const updatedProject: Project = {
        ...currentProject,
        chatHistory: chatMessages,
        logs: logs,
        status: currentStage,
      };
      debouncedSave(updatedProject);
    }
  }, [chatMessages, logs, currentStage, currentProject, debouncedSave]);


  const addLog = (newLog: string) => {
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !currentProject) return;

    const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    addLog(`[USER] ${input}`);
    setInput('');

    // --- Checkpoint Trigger Simulation ---
    if (input.toLowerCase().includes('major change')) {
      setCheckpointOpen(true);
      addLog(`[AI] A major change was proposed. Awaiting administrator approval...`);
      setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'This action requires your approval. Please review the checkpoint.' }]);
      return;
    }

    // --- Self-Healing Logic Integration ---
    if (input.toLowerCase().includes('build project')) {
      addLog(`[INFO] User requested build. Calling /api/verify...`);
      setCurrentStage('Testing');
      try {
        const verifyResponse = await fetch('/api/verify', { method: 'POST' });
        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          addLog(`[SUCCESS] Build completed successfully.`);
          addLog(verifyData.stdout);
          setCurrentStage('Deployment');
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'Build successful. Ready for deployment.' }]);
        } else {
          addLog(`[ERROR] Build failed: ${verifyData.message}`);
          addLog(verifyData.stderr || verifyData.stdout);

          addLog(`[INFO] Build failed. Sending error to Gemini for self-healing...`);
          setChatMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, sender: 'ai', text: 'Build failed. Initiating self-healing with Gemini.' }]);

          const selfHealingPrompt = `The project build failed with the following error:\n\n${verifyData.stderr || verifyData.message}\n\nPlease provide corrected code snippets or CLI commands to fix this issue.`;
          const geminiHealingResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: selfHealingPrompt, type: 'chat' }),
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
          setCurrentStage('Development');
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
      <div className="flex flex-col h-full items-center justify-center text-gray-800">
        <p className="text-xl">Loading project or project not found...</p>
        <button onClick={() => router.push('/projects')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <CheckpointModal
        isOpen={isCheckpointOpen}
        onApprove={() => {
          addLog('[USER] Checkpoint approved. Proceeding with the action.');
          setCheckpointOpen(false);
          setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text: 'Action approved. Continuing...' }]);
        }}
        onDeny={() => {
          addLog('[USER] Checkpoint denied. Aborting the action.');
          setCheckpointOpen(false);
          setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text: 'Action denied. Awaiting new instructions.' }]);
        }}
        title="Administrator Approval Required"
      >
        <p>A critical action has been proposed by the AI that requires your approval to proceed.</p>
        <p className="mt-2 font-semibold">Action: Refactor the entire authentication system.</p>
      </CheckpointModal>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-black">Dashboard: {currentProject.name}</h1>
        <button onClick={() => setCheckpointOpen(true)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mb-4 md:mb-0">
          Simulate Checkpoint
        </button>
      </div>


      <ProjectStatusIndicator currentStage={currentStage} />

      <div className="flex flex-col md:flex-row gap-6 mt-6 flex-grow">
        {/* Left Column: Chat Interface */}
        <div className="flex flex-col md:w-1/2 h-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-black">AI Chat Interface</h2>
          <div className="flex-grow bg-white p-4 rounded-lg shadow-md mb-6 overflow-y-auto flex flex-col message-log-area">
            {chatMessages.length === 0 ? (
              <p className="text-gray-800">Start a conversation with AI for {currentProject.name}...</p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type 'major change' to trigger a checkpoint..."
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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

        {/* Right Column: Live Log Viewer */}
        <div className="flex flex-col md:w-1/2 h-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-black">Live Logs</h2>
          <div className="flex-grow h-64 live-log-viewer-area">
            <LiveLogViewer logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}