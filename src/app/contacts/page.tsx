'use client';

import { useState, useEffect } from 'react';
import { Mail, Search, Clock, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Contact = {
    id: number;
    name: string;
    email: string;
    profession: string | null;
    phone: string | null;
    createdAt: string;
};

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profession: '',
        phone: ''
    });

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleOpenAdd = () => {
        setEditingContact(null);
        setFormData({ name: '', email: '', profession: '', phone: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            email: contact.email,
            profession: contact.profession || '',
            phone: contact.phone || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
            fetchContacts();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingContact ? 'PUT' : 'POST';
            const body = editingContact ? { id: editingContact.id, ...formData } : formData;

            const res = await fetch('/api/contacts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchContacts();
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            alert('Error saving contact');
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.profession && c.profession.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 lg:p-12 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Contacts Directory</h2>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Manage your audience database</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto bg-[#006633] text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 hover:bg-[#005229] transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add Contact
                </button>
            </header>

            {/* Search / Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#006633]"
                    />
                </div>
                <div className="flex items-center gap-2 px-2 text-sm font-bold text-gray-500">
                    {filteredContacts.length} Records
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Loading contacts...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Profession</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#006633] text-xs flex-shrink-0">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{contact.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-gray-500 font-medium">
                                            {contact.email}
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                                                {contact.profession ? (contact.profession.charAt(0).toUpperCase() + contact.profession.slice(1).toLowerCase()) : 'Unspecified'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-gray-400">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleOpenEdit(contact)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(contact.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-hidden"
                        >
                            <h3 className="text-xl font-bold font-serif mb-6 text-gray-900">
                                {editingContact ? 'Edit Contact' : 'New Contact'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Profession</label>
                                        <input
                                            value={formData.profession}
                                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                                            placeholder="Musician"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Phone</label>
                                        <input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-[#006633] text-white font-bold text-sm hover:bg-[#005229] shadow-lg shadow-green-900/20"
                                    >
                                        Save Contact
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
