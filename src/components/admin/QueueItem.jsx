import React from 'react';
import { supabase } from '../../lib/supabase';

export default function QueueItem({ item, onUpdate }) {
    const updateStatus = async (newStatus) => {
        try {
            const updates = { status: newStatus, updated_at: new Date() };
            if (newStatus === 'done') {
                updates.served_at = new Date();
            }

            const { error } = await supabase
                .from('queue')
                .update(updates)
                .eq('id', item.id);

            if (error) throw error;

            // If done, we should also insert into service_metrics
            if (newStatus === 'done' && item.status === 'called') {
                await supabase.from('service_metrics').insert({
                    served_at: new Date(),
                    service_duration_seconds: 600 // Placeholder
                });
            }

            if (onUpdate) onUpdate();

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (s) => {
        const colors = {
            waiting: 'bg-yellow-100 text-yellow-800',
            called: 'bg-green-100 text-green-800',
            done: 'bg-gray-100 text-gray-800',
            skipped: 'bg-red-100 text-red-800',
        };
        return `px-2 py-1 rounded-full text-xs font-bold uppercase ${colors[s] || 'bg-gray-100'}`;
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b hover:bg-gray-50">
            <div className="flex items-center space-x-4">
                <div className="text-xl font-bold text-gray-900 w-12">{item.token_number}</div>
                <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.phone}</div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <span className={getStatusBadge(item.status)}>{item.status}</span>

                <div className="flex space-x-2">
                    {item.status === 'waiting' && (
                        <>
                            <button onClick={() => updateStatus('called')} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Call</button>
                            <button onClick={() => updateStatus('skipped')} className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">Skip</button>
                        </>
                    )}
                    {item.status === 'called' && (
                        <button onClick={() => updateStatus('done')} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Done</button>
                    )}
                </div>
            </div>
        </div>
    );
}
