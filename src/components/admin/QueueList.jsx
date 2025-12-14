import React from 'react';
import QueueItem from './QueueItem';

export default function QueueList({ queue, onUpdate }) {
    const waiting = queue.filter(i => i.status === 'waiting');
    const called = queue.filter(i => i.status === 'called');
    const history = queue.filter(i => ['done', 'skipped', 'cancelled'].includes(i.status));

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Active Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <h3 className="text-lg font-bold text-blue-800">Currently Serving</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {called.length === 0 && <div className="p-6 text-center text-gray-500">No one is currently being served.</div>}
                    {called.map(item => <QueueItem key={item.id} item={item} onUpdate={onUpdate} />)}
                </div>
            </div>

            {/* Waiting Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                    <h3 className="text-lg font-bold text-yellow-800">Waiting List ({waiting.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {waiting.length === 0 && <div className="p-6 text-center text-gray-500">Queue is empty!</div>}
                    {waiting.map(item => <QueueItem key={item.id} item={item} onUpdate={onUpdate} />)}
                </div>
            </div>

            {/* History Section (Collapsible or just list) */}
            <div className="bg-white rounded-lg shadow overflow-hidden opacity-75">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700">Completed Today</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {history.map(item => <QueueItem key={item.id} item={item} onUpdate={onUpdate} />)}
                </div>
            </div>
        </div>
    );
}
