import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './workflowSlice';

export const store = configureStore({
    reducer: {
        workflow: workflowReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state for serialization checks
                ignoredPaths: ['workflow.nodes', 'workflow.edges'],
            },
        }),
});

// Export typed hooks for better TypeScript support (optional for JS)
export const useAppDispatch = () => store.dispatch;
export const useAppSelector = (selector) => {
    const { useSelector } = require('react-redux');
    return useSelector(selector);
};
