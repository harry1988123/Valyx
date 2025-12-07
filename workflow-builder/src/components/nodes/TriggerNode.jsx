import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

const TriggerNode = ({ data, selected }) => {
    return (
        <div className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-gradient-to-br from-emerald-50 to-white min-w-[200px] transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-emerald-300'
            }`}>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Trigger</div>
                    <div className="text-sm font-bold text-gray-900 truncate">{data.label}</div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white shadow-md"
            />
        </div>
    );
};

export default memo(TriggerNode);
