import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNodeDetails } from '../hooks/useWorkflowQueries';
import { updateNode, setSelectedNode, setPropertiesPanelDirty } from '../store/workflowSlice';
import { Settings, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const PropertiesPanel = () => {
    const dispatch = useDispatch();
    const selectedNodeId = useSelector((state) => state.workflow.selectedNodeId);
    const nodes = useSelector((state) => state.workflow.nodes);

    // Find the actual node object
    const selectedNode = nodes.find(node => node.id === selectedNodeId);
    const nodeName = selectedNode?.data?.nodeName;

    // Fetch schema details
    const { data: nodeDetails, isLoading, error } = useNodeDetails(nodeName);

    // Local state for form values
    const [formValues, setFormValues] = useState({});

    // Sync local state when node or nodeDetails change
    useEffect(() => {
        if (selectedNode?.data?.params) {
            setFormValues(selectedNode.data.params);
        } else {
            setFormValues({});
        }
        dispatch(setPropertiesPanelDirty(false));
    }, [selectedNodeId, selectedNode?.data?.params, dispatch]);

    // Handle Closing the panel
    const handleClose = () => {
        dispatch(setPropertiesPanelDirty(false));
        dispatch(setSelectedNode(null));
    };

    // Handle Input Change
    const handleInputChange = (key, value) => {
        setFormValues(prev => ({
            ...prev,
            [key]: value
        }));
        dispatch(setPropertiesPanelDirty(true));
    };

    // Save Changes to Redux
    const handleSave = () => {
        if (!selectedNode) return;

        const updatedNode = {
            id: selectedNode.id,
            data: {
                ...selectedNode.data,
                params: {
                    ...selectedNode.data.params,
                    ...formValues
                }
            }
        };

        dispatch(updateNode(updatedNode));
        dispatch(setPropertiesPanelDirty(false));
    };

    if (!selectedNodeId || !selectedNode) {
        return (
            <div className="w-80 border-l bg-gradient-to-b from-gray-50 to-white p-6 hidden lg:block">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-900">Properties</h2>
                </div>
                <div className="text-sm text-gray-500 text-center mt-12">
                    Select a node to view its properties
                </div>
            </div>
        );
    }

    const getNodeTypeColor = (type) => {
        switch (type) {
            case 'trigger':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'activity':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'controller':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const renderParamField = (paramName, paramConfig) => {
        const { type, hint, isRequired, allowedValues } = paramConfig;
        let value = formValues[paramName];
        if (value === undefined || value === null) value = '';

        const handleJsonChange = (val) => {
            try {
                const parsed = JSON.parse(val);
                handleInputChange(paramName, parsed);
            } catch (e) {
                // If invalid JSON, treat as string or ignore (could verify later)
                // For now, we update the state with string to allow typing, 
                // but validation needs to handle it. 
                // Ideally we separate 'displayValue' from 'storedValue'.
                // For this quick impl, we'll just parse on blur or assume valid json input
            }
        };

        return (
            <div key={paramName} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {paramName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                    <span className="ml-2 text-xs font-normal text-gray-400 border rounded px-1.5">{type}</span>
                </label>

                {type === 'text' && (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(paramName, e.target.value)}
                        placeholder={hint || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                )}

                {type === 'url' && (
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => handleInputChange(paramName, e.target.value)}
                        placeholder={hint || 'Enter URL'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                )}

                {type === 'dropdown' && (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(paramName, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                        <option value="">Select an option</option>
                        {allowedValues?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )}

                {/* Read-only Edge types */}
                {(type === 'edge_input' || type === 'edge_output') && (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 italic">
                        {hint} (System Managed)
                    </div>
                )}

                {/* Fallback for complex types (list, query_filter, etc.) -> JSON Textarea */}
                {!['text', 'url', 'dropdown', 'edge_input', 'edge_output'].includes(type) && (
                    <div>
                        <textarea
                            defaultValue={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                            onBlur={(e) => handleJsonChange(e.target.value)}
                            placeholder={hint || 'Enter JSON configuration'}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Enter valid JSON for this complex parameter.</p>
                    </div>
                )}

                {hint && type !== 'edge_input' && type !== 'edge_output' && (
                    <p className="text-xs text-gray-500 mt-1">{hint}</p>
                )}
            </div>
        );
    };

    return (
        <div className="w-80 border-l bg-gradient-to-b from-gray-50 to-white flex flex-col h-full shadow-xl z-10">
            {/* Header */}
            <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Properties</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Node Type Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getNodeTypeColor(selectedNode.type)}`}>
                    {selectedNode.type}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Node Name */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Node Name</h3>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-800 break-words">
                        {nodeName}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-sm text-gray-500 text-center py-8">
                        Loading node details...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-red-800 mb-1">Error Loading Details</h4>
                                <p className="text-xs text-red-600">{error.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Node Details */}
                {nodeDetails && !isLoading && (
                    <div>
                        {/* Parameters Section */}
                        {nodeDetails.params && Object.keys(nodeDetails.params).length > 0 ? (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Parameters
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(nodeDetails.params).map(([paramName, paramConfig]) =>
                                        renderParamField(paramName, paramConfig)
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">No Parameters</h4>
                                        <p className="text-xs text-blue-600">
                                            This node doesn't require any parameters.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message from API */}
                        {nodeDetails.error && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-yellow-800 mb-1">Warning</h4>
                                        <p className="text-xs text-yellow-600">{nodeDetails.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {selectedNode && (
                <div className="p-4 border-t bg-white">
                    <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertiesPanel;
