import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';

export default function AddPatientModal({ onClose, onAdded }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        reason: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.rpc('insert_queue_item', {
                p_name: formData.name,
                p_phone: formData.phone || null, // Allow empty phone for walk-ins
                p_email: null,
                p_reason: formData.reason
            });

            if (error) throw error;

            if (onAdded) onAdded(data);
            onClose();
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Failed to add patient: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Add Patient</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Leave empty for walk-ins"
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

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
