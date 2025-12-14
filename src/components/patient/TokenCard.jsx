import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, User } from 'lucide-react';

export default function TokenCard({ tokenData, onCancel }) {
    const [status, setStatus] = useState(tokenData.status);
    const [peopleAhead, setPeopleAhead] = useState(0);

    const handleLeaveQueue = async () => {
        if (!window.confirm('Are you sure you want to leave the queue?')) return;

        try {
            const { error } = await supabase
                .from('queue')
                .update({ status: 'cancelled' })
                .eq('id', tokenData.id);

            if (error) throw error;
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Error leaving queue:', error);
            alert('Failed to leave queue');
        }
    };

    const fetchPeopleAhead = async () => {
        if (status !== 'waiting') {
            setPeopleAhead(0);
            return;
        }

        const { count, error } = await supabase
            .from('queue')
            .select('*', { count: 'exact', head: true })
            .eq('token_date', new Date().toISOString().split('T')[0])
            .eq('status', 'waiting')
            .lt('token_number', tokenData.token_number);

        if (!error) {
            setPeopleAhead(count || 0);
        }
    };

    useEffect(() => {
        fetchPeopleAhead();

        // Subscribe to ANY change in the queue to update "people ahead"
        const channel = supabase
            .channel(`queue-updates-${tokenData.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'queue' },
                (payload) => {
                    // If my status changed, update it
                    if (payload.new && payload.new.id === tokenData.id) {
                        setStatus(payload.new.status);
                    }
                    // Always re-fetch people ahead on any queue change
                    fetchPeopleAhead();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tokenData.id, tokenData.token_number]);

    const getStatusColor = (s) => {
        switch (s) {
            case 'waiting': return 'bg-yellow-100 text-yellow-800';
            case 'called': return 'bg-green-100 text-green-800 animate-pulse';
            case 'done': return 'bg-gray-100 text-gray-800';
            case 'skipped': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl text-center border-t-4 border-blue-500">
            <h3 className="text-gray-500 uppercase tracking-wider text-sm font-semibold">Your Token Number</h3>
            <div className="text-6xl font-bold text-gray-900 my-4">
                {tokenData.token_number}
            </div>

            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase mb-6 ${getStatusColor(status)}`}>
                {status}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="flex flex-col items-center">
                    <Users className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-500">People Ahead</span>
                    <span className="font-bold text-lg">{status === 'waiting' ? peopleAhead : '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                    <User className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-500">Token ID</span>
                    <span className="font-bold text-lg">{tokenData.full_token}</span>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <div className="text-xs text-gray-400">
                    Please stay on this page to see status updates.
                </div>
                {status === 'waiting' && (
                    <button
                        onClick={handleLeaveQueue}
                        className="text-sm text-red-500 hover:text-red-700 underline"
                    >
                        Leave Queue
                    </button>
                )}
            </div>
        </div>
    );
}
