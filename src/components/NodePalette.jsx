import { useState } from 'react';
import { useNodes } from '../hooks/useWorkflowQueries';
import { Zap, Settings, GitBranch, ChevronDown, ChevronRight, Layers } from 'lucide-react';

const NodePalette = () => {
    const { data: nodesData, isLoading, error } = useNodes();
    const [expandedSections, setExpandedSections] = useState({
        triggers: true,
        activities: true,
        controllers: true,
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const onDragStart = (event, nodeType, nodeName) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: nodeType,
            nodeName: nodeName,
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const getIcon = (type) => {
        switch (type) {
            case 'triggers':
                return <Zap className="w-4 h-4 text-emerald-600" />;
            case 'activities':
                return <Settings className="w-4 h-4 text-blue-600" />;
            case 'controllers':
                return <GitBranch className="w-4 h-4 text-amber-600" />;
            default:
                return null;
        }
    };

    const getNodeTypeColor = (type) => {
        switch (type) {
            case 'triggers':
                return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm';
            case 'activities':
                return 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm';
            case 'controllers':
                return 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm';
            default:
                return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
        }
    };

    const renderNodeSection = (title, items, type) => {
        const isExpanded = expandedSections[type];

        return (
            <div key={type} className="mb-3">
                <button
                    onClick={() => toggleSection(type)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {getIcon(type)}
                        <span>{title}</span>
                        <span className="text-xs text-gray-400 font-normal">({items?.length || 0})</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>

                {isExpanded && (
                    <div className="mt-2 space-y-1.5 pl-1">
                        {items?.map((nodeName) => (
                            <div
                                key={nodeName}
                                draggable
                                onDragStart={(e) => {
                                    const nodeType = type === 'triggers' ? 'trigger' : type === 'activities' ? 'activity' : 'controller';
                                    onDragStart(e, nodeType, nodeName);
                                }}
                                className={`px-3 py-2.5 text-sm border rounded-lg cursor-move transition-all ${getNodeTypeColor(type)}`}
                            >
                                <div className="font-medium text-gray-900 truncate">{nodeName}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-72 border-r bg-gradient-to-b from-gray-50 to-white p-4">
                <div className="text-sm text-gray-500">Loading nodes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-72 border-r bg-gradient-to-b from-gray-50 to-white p-4">
                <div className="text-sm text-red-500">Error loading nodes</div>
            </div>
        );
    }

    return (
        <div className="w-72 border-r bg-gradient-to-b from-gray-50 to-white p-4 overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-900">Node Palette</h2>
                </div>
                <p className="text-xs text-gray-500">Drag and drop nodes onto the canvas</p>
            </div>

            {nodesData?.triggers && renderNodeSection('Triggers', nodesData.triggers.items, 'triggers')}
            {nodesData?.activities && renderNodeSection('Activities', nodesData.activities.items, 'activities')}
            {nodesData?.controllers && renderNodeSection('Controllers', nodesData.controllers.items, 'controllers')}
        </div>
    );
};

export default NodePalette;
