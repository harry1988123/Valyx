import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    workflowId: 'twflow_7c671147ef',
    hasUnsavedChanges: false,
    propertiesPanelDirty: false,
};

const workflowSlice = createSlice({
    name: 'workflow',
    initialState,
    reducers: {
        setNodes: (state, action) => {
            state.nodes = action.payload;
            state.hasUnsavedChanges = true;
        },
        setEdges: (state, action) => {
            state.edges = action.payload;
            state.hasUnsavedChanges = true;
        },
        addNode: (state, action) => {
            state.nodes.push(action.payload);
            state.hasUnsavedChanges = true;
        },
        updateNode: (state, action) => {
            const index = state.nodes.findIndex(node => node.id === action.payload.id);
            if (index !== -1) {
                state.nodes[index] = { ...state.nodes[index], ...action.payload };
                state.hasUnsavedChanges = true;
            }
        },
        deleteNode: (state, action) => {
            state.nodes = state.nodes.filter(node => node.id !== action.payload);
            state.edges = state.edges.filter(
                edge => edge.source !== action.payload && edge.target !== action.payload
            );
            if (state.selectedNodeId === action.payload) {
                state.selectedNodeId = null;
            }
            state.hasUnsavedChanges = true;
        },
        addEdge: (state, action) => {
            state.edges.push(action.payload);
            state.hasUnsavedChanges = true;
        },
        deleteEdge: (state, action) => {
            state.edges = state.edges.filter(edge => edge.id !== action.payload);
            state.hasUnsavedChanges = true;
        },
        setSelectedNode: (state, action) => {
            state.selectedNodeId = action.payload;
        },
        loadWorkflowData: (state, action) => {
            const { nodes, edges } = action.payload;
            state.nodes = nodes;
            state.edges = edges;
            state.hasUnsavedChanges = false;
        },
        markAsSaved: (state) => {
            state.hasUnsavedChanges = false;
        },
        setPropertiesPanelDirty: (state, action) => {
            state.propertiesPanelDirty = action.payload;
        },
    },
});

export const {
    setNodes,
    setEdges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    setSelectedNode,
    loadWorkflowData,
    markAsSaved,
    setPropertiesPanelDirty,
} = workflowSlice.actions;

export default workflowSlice.reducer;
