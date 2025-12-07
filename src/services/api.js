const API_BASE_URL = 'https://rubik.valyx.com';

// Utility to convert between camelCase and snake_case
export const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

export const toSnakeCase = (str) => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const convertKeyCase = (obj, converter) => {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeyCase(item, converter));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const newKey = converter(key);
            acc[newKey] = convertKeyCase(obj[key], converter);
            return acc;
        }, {});
    }
    return obj;
};

// API functions
export const fetchNodes = async (nodeType = null) => {
    const url = nodeType
        ? `${API_BASE_URL}/nodes?node_type=${nodeType}`
        : `${API_BASE_URL}/nodes`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch nodes: ${response.statusText}`);
    }

    const data = await response.json();
    return convertKeyCase(data, toCamelCase);
};

export const fetchNodeDetails = async (nodeName) => {
    const response = await fetch(`${API_BASE_URL}/nodeDetails/${nodeName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch node details: ${response.statusText}`);
    }

    const data = await response.json();
    return convertKeyCase(data, toCamelCase);
};

export const fetchWorkflow = async (workflowId) => {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }

    const data = await response.json();
    return convertKeyCase(data, toCamelCase);
};

export const fetchAllNodeTypes = async () => {
    try {
        const [triggers, activities, controllers] = await Promise.all([
            fetchNodes('triggers'),
            fetchNodes('activities'),
            fetchNodes('controllers'),
        ]);

        return {
            triggers,
            activities,
            controllers,
        };
    } catch (error) {
        throw new Error(`Failed to fetch all node types: ${error.message}`);
    }
};

export const updateWorkflow = async (workflowId, definition) => {
    // API expects camelCase body (backend handles conversion)
    const response = await fetch(`${API_BASE_URL}/workflow/update/${workflowId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        throw new Error(`Failed to update workflow: ${response.statusText}`);
    }

    const data = await response.json();
    return convertKeyCase(data, toCamelCase);
};
