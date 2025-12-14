import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

import AdminLogin from './AdminLogin';
import QueueList from './QueueList';
import AddPatientModal from './AddPatientModal';
import { Plus } from 'lucide-react';

export default function AdminDashboard() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [queue, setQueue] = useState([]);

    // Auth Initialization with Timeout
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Create a promise that rejects after 2 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 2000)
                );

                // Race the session check against the timeout
                const sessionPromise = supabase.auth.getSession();

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

                if (mounted) {
                    setSession(session);
                    setLoading(false);
                }
            } catch (error) {
                console.warn('Auth check failed or timed out:', error);
                // Even if it fails/times out, we stop loading. 
                // If it was a timeout, session remains null, showing login screen.
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                // Ensure loading is false when state changes (e.g. after successful login)
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Queue Fetching
    const fetchQueue = async () => {
        if (!session) return;

        try {
            const { data, error } = await supabase
                .from('queue')
                .select('*')
                .eq('token_date', new Date().toISOString().split('T')[0])
                .order('token_number', { ascending: true });

            if (error) throw error;
            setQueue(data || []);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    // Queue Subscription
    useEffect(() => {
        if (!session) return;

        fetchQueue();

        const channel = supabase
            .channel('admin-queue-list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'queue' },
                () => fetchQueue()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return <AdminLogin onLogin={setSession} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 px-4">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        <span>Add Patient</span>
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-sm text-red-600 hover:underline"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
            <QueueList queue={queue} onUpdate={fetchQueue} />
            {showAddModal && (
                <AddPatientModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => {
                        setShowAddModal(false);
                        fetchQueue();
                    }}
                />
            )}
        </div>
    );
}
