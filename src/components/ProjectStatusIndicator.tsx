import React from 'react';

type ProjectStage = 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed';

interface ProjectStatusIndicatorProps {
  currentStage: ProjectStage;
}

const ProjectStatusIndicator: React.FC<ProjectStatusIndicatorProps> = ({ currentStage }) => {
  const stages: ProjectStage[] = ['Planning', 'Development', 'Testing', 'Deployment', 'Completed'];

  const getStageColor = (stage: ProjectStage) => {
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) {
      return 'bg-green-500'; // Completed stages
    } else if (stageIndex === currentIndex) {
      return 'bg-blue-500'; // Current stage
    } else {
      return 'bg-gray-300'; // Future stages
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Project Status</h2>
      <div className="flex justify-between items-center relative">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getStageColor(stage)}`}>
                {index + 1}
              </div>
              <p className="mt-2 text-sm">{stage}</p>
            </div>
            {index < stages.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${getStageColor(stages[index + 1])}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusIndicator;
