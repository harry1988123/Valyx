// Transform API workflow data to ReactFlow format
export const apiToReactFlow = (apiWorkflow) => {
    if (!apiWorkflow) {
        return { nodes: [], edges: [] };
    }

    const { definition } = apiWorkflow;

    if (!definition) {
        return { nodes: [], edges: [] };
    }

    // Handle case where nodes might be an object (convert to array) or already an array
    let nodesArray = [];
    if (Array.isArray(definition.nodes)) {
        nodesArray = definition.nodes;
    } else if (definition.nodes && typeof definition.nodes === 'object') {
        // Convert object to array of values
        nodesArray = Object.values(definition.nodes);
    }

    const edgesArray = Array.isArray(definition.edges) ? definition.edges : [];

    // Transform nodes with better positioning
    const nodes = nodesArray.map((node, index) => ({
        id: node.nodeId,
        type: node.nodeType?.toLowerCase() || 'default',
        position: {
            x: 200 + (index % 3) * 350,
            y: 100 + Math.floor(index / 3) * 200
        },
        data: {
            label: node.nodeName,
            nodeName: node.activityName || node.nodeName,
            nodeType: node.nodeType,
            // Handle both flat 'params' and nested 'nodeParams.params'
            params: node.nodeParams?.params || node.params || {},
        },
    }));

    // Transform edges with validation (handle both sourceNodeId and fromNodeId)
    const edges = edgesArray
        .map((edge) => {
            const source = edge.sourceNodeId || edge.fromNodeId;
            const target = edge.targetNodeId || edge.toNodeId;
            const id = edge.edgeId || edge.edgeName;

            return {
                id,
                source,
                target,
                type: edge.edgeType || 'default',
                markerEnd: {
                    type: 'arrowclosed',
                },
            };
        })
        .filter(edge => edge.id && edge.source && edge.target);

    return { nodes, edges };
};

// Transform ReactFlow data back to API format
export const reactFlowToApi = (nodes, edges, workflowName = 'Workflow') => {
    const apiNodes = nodes.map((node) => ({
        nodeId: node.id,
        nodeType: node.data.nodeType || node.type,
        nodeName: node.data.nodeName,
        params: node.data.params || {},
    }));

    const apiEdges = edges
        .filter(edge => edge.id && edge.source && edge.target)
        .map((edge) => ({
            edgeId: edge.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            edgeType: edge.type || 'default',
        }));

    return {
        workflowName,
        nodes: apiNodes,
        edges: apiEdges,
    };
};

// Generate unique ID for new nodes/edges
export const generateId = (prefix = 'node') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validate edge connection (no incoming edges to triggers)
export const isValidConnection = (connection, nodes) => {
    const targetNode = nodes.find(n => n.id === connection.target);

    // Trigger nodes cannot have incoming edges
    if (targetNode && targetNode.type === 'trigger') {
        return false;
    }

    return true;
};
