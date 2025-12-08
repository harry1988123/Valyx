import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    ReactFlowProvider,
    useReactFlow,
    MarkerType, BezierEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from '../config/nodeTypes';
import { setNodes, setEdges, setSelectedNode, addNode } from '../store/workflowSlice';
import { isValidConnection, generateId } from '../utils/dataTransform';

const Flow = () => {
    const reactFlowWrapper = useRef(null);
    const dispatch = useDispatch();
    const { project } = useReactFlow();

    // Selectors
    const reduxNodes = useSelector((state) => state.workflow.nodes);
    const reduxEdges = useSelector((state) => state.workflow.edges);

    // Local state
    const [nodes, setNodesLocal] = useState(reduxNodes);
    const [edges, setEdgesLocal] = useState(reduxEdges);

    // Sync Redux state with local ReactFlow state
    useEffect(() => {
        setNodesLocal(reduxNodes);
    }, [reduxNodes]);

    useEffect(() => {
        setEdgesLocal(reduxEdges);
    }, [reduxEdges]);

    // Handle node changes
    const onNodesChange = useCallback(
        (changes) => {
            const nextNodes = applyNodeChanges(changes, nodes);
            setNodesLocal(nextNodes);

            // Only sync to Redux when drag ends or nodes are removed/added
            const shouldSync = changes.some(change =>
                change.type === 'remove' ||
                change.type === 'add' ||
                (change.type === 'position' && change.dragging === false)
            );

            if (shouldSync) {
                // Dispatch the NEW computed nodes, not the stale 'nodes' state
                requestAnimationFrame(() => {
                    dispatch(setNodes(nextNodes));
                });
            }
        },
        [nodes, dispatch]
    );

    // Handle edge changes
    const onEdgesChange = useCallback(
        (changes) => {
            const nextEdges = applyEdgeChanges(changes, edges);
            setEdgesLocal(nextEdges);

            // Only sync to Redux for structural changes (remove, add)
            // Selecting an edge shouldn't mark workflow as dirty
            const shouldSync = changes.some(change =>
                change.type === 'remove' ||
                change.type === 'add'
            );

            if (shouldSync) {
                requestAnimationFrame(() => {
                    dispatch(setEdges(nextEdges));
                });
            }
        },
        [edges, dispatch]
    );

    // Handle new connections with validation
    const onConnect = useCallback(
        (connection) => {
            if (!isValidConnection(connection, nodes)) {
                console.warn('Invalid connection: Trigger nodes cannot have incoming edges');
                return;
            }
            // Use 'addEdge' to create connection with marker
            const nextEdges = addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, edges);
            setEdgesLocal(nextEdges);
            dispatch(setEdges(nextEdges));
        },
        [nodes, edges, dispatch]
    );

    // Handle node selection
    const onNodeClick = useCallback(
        (event, node) => {
            dispatch(setSelectedNode(node.id));
        },
        [dispatch]
    );

    // Handle pane click (deselect)
    const onPaneClick = useCallback(() => {
        dispatch(setSelectedNode(null));
    }, [dispatch]);

    // -- Drag and Drop Logic --
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const data = event.dataTransfer.getData('application/reactflow');

            if (!data) return;

            const { type, nodeName } = JSON.parse(data);

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: generateId('node'),
                type: type,
                position,
                data: {
                    label: nodeName,
                    nodeName: nodeName,
                    nodeType: type,
                    params: {},
                },
            };

            dispatch(addNode(newNode));
        },
        [project, dispatch]
    );

    return (
        <div className="flex-1 w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                connectionMode="loose"
                fitView
                attributionPosition="bottom-left"
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'trigger': return '#10b981';
                            case 'activity': return '#3b82f6';
                            case 'controller': return '#f59e0b';
                            default: return '#6b7280';
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                />
            </ReactFlow>
        </div>
    );
};

const WorkflowCanvas = () => (
    <ReactFlowProvider>
        <Flow />
    </ReactFlowProvider>
);

export default WorkflowCanvas;
