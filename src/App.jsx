import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWorkflow } from './hooks/useWorkflowQueries';
import { loadWorkflowData } from './store/workflowSlice';
import { apiToReactFlow } from './utils/dataTransform';
import Header from './components/Header';
import NodePalette from './components/NodePalette';
import WorkflowCanvas from './components/WorkflowCanvas';
import PropertiesPanel from './components/PropertiesPanel';

function App() {
  const dispatch = useDispatch();
  const workflowId = useSelector((state) => state.workflow.workflowId);
  const { data: workflowData, isLoading, error } = useWorkflow(workflowId);

  // Load workflow data when fetched
  useEffect(() => {
    if (workflowData) {
      const { nodes, edges } = apiToReactFlow(workflowData);
      dispatch(loadWorkflowData({ nodes, edges }));
    }
  }, [workflowData, dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading workflow: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <NodePalette />
        <WorkflowCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
