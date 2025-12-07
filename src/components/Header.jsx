import { useSelector } from 'react-redux';
import { useUpdateWorkflow } from '../hooks/useWorkflowQueries';
import { reactFlowToApi } from '../utils/dataTransform';
import { Save, CheckCircle, Workflow } from 'lucide-react';

const Header = () => {
    const { nodes, edges, workflowId, hasUnsavedChanges, propertiesPanelDirty } = useSelector((state) => state.workflow);
    const updateWorkflowMutation = useUpdateWorkflow();

    const handleSave = async () => {
        const definition = reactFlowToApi(nodes, edges, 'Workflow');

        try {
            await updateWorkflowMutation.mutateAsync({
                workflowId,
                definition,
            });
            alert('Workflow saved successfully!');
        } catch (error) {
            alert(`Error saving workflow: ${error.message}`);
        }
    };

    return (
        <header className="h-16 border-b bg-gradient-to-r from-slate-50 to-white px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Workflow Builder</h1>
                    <p className="text-xs text-gray-500">ID: {workflowId}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {hasUnsavedChanges && (
                    <span className="text-sm text-amber-600 flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        Unsaved changes
                    </span>
                )}

                {!hasUnsavedChanges && (
                    <span className="text-sm text-emerald-600 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        All changes saved
                    </span>
                )}

                <button
                    onClick={handleSave}
                    disabled={updateWorkflowMutation.isPending || propertiesPanelDirty}
                    title={propertiesPanelDirty ? "Please save changes in the Properties Panel first" : ""}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Save className="w-4 h-4" />
                    {updateWorkflowMutation.isPending ? 'Saving...' : 'Save Workflow'}
                </button>
            </div>
        </header>
    );
};

export default Header;
