import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNodes, fetchAllNodeTypes, fetchNodeDetails, fetchWorkflow, updateWorkflow } from '../services/api';

// Query hook for fetching all nodes
export const useNodes = (nodeType = null) => {
    return useQuery({
        queryKey: ['nodes', nodeType],
        queryFn: () => nodeType ? fetchNodes(nodeType) : fetchAllNodeTypes(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Query hook for fetching node details
export const useNodeDetails = (nodeName) => {
    return useQuery({
        queryKey: ['nodeDetails', nodeName],
        queryFn: () => fetchNodeDetails(nodeName),
        enabled: !!nodeName,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Query hook for fetching workflow
export const useWorkflow = (workflowId) => {
    return useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: () => fetchWorkflow(workflowId),
        enabled: !!workflowId,
    });
};

// Mutation hook for updating workflow
export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workflowId, definition }) => updateWorkflow(workflowId, definition),
        onSuccess: (data, variables) => {
            // Invalidate and refetch workflow query
            queryClient.invalidateQueries({ queryKey: ['workflow', variables.workflowId] });
        },
    });
};
