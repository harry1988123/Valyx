import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

const ControllerNode = ({ data, selected }) => {
    return (
        <div className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-gradient-to-br from-amber-50 to-white min-w-[200px] transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-100' : 'border-amber-300'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white shadow-md"
            />

            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
                    <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Controller</div>
                    <div className="text-sm font-bold text-gray-900 truncate">{data.label}</div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white shadow-md"
            />
        </div>
    );
};

export default memo(ControllerNode);
