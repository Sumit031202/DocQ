import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PatientForm({ onJoin }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        reason: ''
    });

    const [errorMsg, setErrorMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            // 1. Connection Check (Fail fast in 2s)
            const connCheckPromise = supabase.from('queue').select('id').limit(1).maybeSingle();
            const connTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database unreachable. Check connection.')), 2000)
            );

            // Just check if we can reach the DB, don't care about result
            await Promise.race([connCheckPromise, connTimeoutPromise]);

            // 2. Main Operation Timeout (5s)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out. Please try again.')), 5000)
            );

            // 3. ACTUAL WORK: Check duplicates AND Insert
            const workPromise = (async () => {
                // Check for existing active token for today
                const { data: existing, error: checkError } = await supabase
                    .from('queue')
                    .select('*')
                    .eq('phone', formData.phone)
                    .eq('token_date', new Date().toISOString().split('T')[0])
                    .neq('status', 'cancelled')
                    .maybeSingle();

                if (checkError) throw checkError;

                if (existing) {
                    return existing;
                }

                const { data, error } = await supabase.rpc('insert_queue_item', {
                    p_name: formData.name,
                    p_phone: formData.phone,
                    p_email: null,
                    p_reason: formData.reason
                });

                if (error) throw error;
                return data;
            })();

            // Race!
            const result = await Promise.race([workPromise, timeoutPromise]);
            console.log('PatientForm: Submission result:', result);
            if (!result) throw new Error('No data returned from server');
            onJoin(result);

        } catch (error) {
            console.error('Error joining queue:', error);
            setErrorMsg(error.message || 'Failed to join queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join the Queue</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                    type="tel"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm mb-4">
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
                {loading ? 'Joining...' : 'Get Token'}
            </button>
        </form>
    );
}
