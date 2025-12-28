'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/types';
import {
  Plus,
  Send,
  Users,
  Mail,
  Eye,
  X,
  Search,
  LayoutDashboard,
  ChevronRight,
  UserCircle,
  Sparkles,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Filter,
} from 'lucide-react';

type UploadedImage = {
  name: string;
  url: string;
};

const templatePresets = [
  {
    name: 'Product spotlight',
    subject: 'A new drop built just for you',
    body: `
      <div style="font-family:Inter, Arial, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px; border-radius:16px;">
        <p style="color:#34d399; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin:0 0 12px 0;">Exclusive Mail</p>
        <h1 style="font-size:24px; margin:0 0 12px 0;">Meet the release everyone asked for</h1>
        <p style="margin:0 0 16px 0;">We streamlined the experience, added visual polish, and built in smarter defaults so you can move fast.</p>
        <a href="#" style="display:inline-block; padding:12px 18px; background:#34d399; color:#0b1727; border-radius:12px; text-decoration:none; font-weight:700;">See what changed</a>
      </div>
    `,
  },
  {
    name: 'Event invite',
    subject: 'You are on the list: Private session',
    body: `
      <div style="font-family:Inter, Arial, sans-serif; background:#0b1727; color:#e2e8f0; padding:24px; border-radius:16px;">
        <p style="color:#a5b4fc; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin:0 0 12px 0;">Limited Seats</p>
        <h1 style="font-size:24px; margin:0 0 12px 0;">Join our closed-door walkthrough</h1>
        <p style="margin:0 0 16px 0;">A 30-minute live demo with the team, followed by Q&A. Bring a friend from your org.</p>
        <div style="display:flex; gap:12px; align-items:center;">
          <span style="padding:8px 12px; background:#111827; border:1px solid #1f2937; border-radius:10px;">Thursday - 10 AM PST</span>
          <a href="#" style="padding:12px 18px; background:#22d3ee; color:#0b1727; border-radius:12px; text-decoration:none; font-weight:700;">Reserve my spot</a>
        </div>
      </div>
    `,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'email'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<UploadedImage | null>(null);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
  });

  // Email State
  const [selectedProfession, setSelectedProfession] = useState<string>('All');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Contact')
      .select('*')
      .order('createdAt', { ascending: false });

    if (data) setContacts(data);
    if (error) console.error('Error fetching contacts:', error);
    setLoading(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('Contact').insert([newContact]).select();

    if (data) {
      setContacts([data[0], ...contacts]);
      setShowAddModal(false);
      setNewContact({ name: '', email: '', phone: '', profession: '' });
    }
    if (error) {
      alert('Error adding contact: ' + error.message);
    }
  };

  const getRecipients = () => {
    if (selectedProfession === 'All') return contacts;
    return contacts.filter((c) => c.profession?.toLowerCase() === selectedProfession.toLowerCase());
  };

  const uploadCampaignImage = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filePath = `campaigns/${fileName}.${fileExt}`;

    const { error } = await supabase.storage
      .from('email-assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from('email-assets').getPublicUrl(filePath);

    if (publicData?.publicUrl) {
      setAttachedImage({
        name: file.name,
        url: publicData.publicUrl,
      });
    }

    setUploading(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await uploadCampaignImage(file);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadCampaignImage(file);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    const recipients = getRecipients();
    const emails = recipients.map((r) => r.email).filter((e) => e);

    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Add a subject and some content before sending.');
      setSending(false);
      return;
    }

    if (emails.length === 0) {
      alert('No recipients found for this selection.');
      setSending(false);
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emails,
          subject: emailSubject.trim(),
          html: emailBody,
          attachments: attachedImage
            ? [
                {
                  filename: attachedImage.name,
                  path: attachedImage.url,
                },
              ]
            : [],
        }),
      });

      if (response.ok) {
        alert(`Email sent to ${emails.length} recipients!`);
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending email.');
    } finally {
      setSending(false);
    }
  };

  const professionStats = contacts.reduce((acc, contact) => {
    const prof = contact.profession || 'Unspecified';
    acc[prof] = (acc[prof] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const professions = Object.keys(professionStats);

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.profession.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [contacts, searchTerm]
  );

  const topProfession =
    professions.length > 0
      ? professions.reduce((prev, curr) => (professionStats[curr] > professionStats[prev] ? curr : prev))
      : 'N/A';

  const recipients = getRecipients();
  const sendDisabled = sending || !emailSubject.trim() || !emailBody.trim();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.08),transparent_25%)]" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image src="/logo.png" alt="Exclusive Mail Logo" fill className="object-contain" />
              </div>
              <div>
                <p className="text-sm text-emerald-200 uppercase tracking-[0.2em]">ExclusiveMail</p>
                <p className="text-lg font-semibold">Relationship HQ</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Curate contacts, drop an image into Supabase, and launch a campaign without leaving this screen.
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activeTab === 'contacts'
                  ? 'bg-emerald-500/10 text-white ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Users size={18} />
              <span className="font-medium">Contacts</span>
              {activeTab === 'contacts' && <ChevronRight size={14} className="ml-auto" />}
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activeTab === 'email'
                  ? 'bg-emerald-500/10 text-white ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Send size={18} />
              <span className="font-medium">Campaigns</span>
              {activeTab === 'email' && <ChevronRight size={14} className="ml-auto" />}
            </button>
          </nav>

          <div className="p-6 border-t border-white/5">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
                <UserCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-300">Signed in as</p>
                <p className="font-medium text-white">Admin User</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-6 p-6 lg:p-10">
          <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Campaign studio</p>
                <h1 className="text-3xl font-bold text-white">Exclusive Mail Control Center</h1>
                <p className="text-sm text-slate-300">
                  Segment contacts, preview HTML, and attach Supabase-hosted imagery before you hit send.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Sparkles size={16} className="text-emerald-300" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total contacts</span>
                  <Users size={16} className="text-emerald-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{contacts.length}</p>
                <p className="mt-1 text-xs text-emerald-200">Live from Supabase</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Top profession</span>
                  <LayoutDashboard size={16} className="text-amber-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{topProfession}</p>
                <p className="mt-1 text-xs text-amber-200">{professions.length} categories</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Ready recipients</span>
                  <Mail size={16} className="text-cyan-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{recipients.length}</p>
                <p className="mt-1 text-xs text-cyan-200">
                  {selectedProfession === 'All' ? 'All contacts' : selectedProfession}
                </p>
              </div>
            </div>
          </header>

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Filter size={16} />
                    <span>Search & segment quickly</span>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
                  >
                    <Plus size={16} /> Add contact
                  </button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search name, email, or profession"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none ring-emerald-500/40 focus:ring"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    {professions.slice(0, 4).map((prof) => (
                      <span
                        key={prof}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2"
                      >{`${prof} · ${professionStats[prof]}`}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5 text-sm">
                    <thead className="bg-white/5 text-left text-slate-300">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold">Profession</th>
                        <th className="px-6 py-4 font-semibold">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                            Loading contacts...
                          </td>
                        </tr>
                      ) : filteredContacts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                            No contacts found. Add one to get started.
                          </td>
                        </tr>
                      ) : (
                        filteredContacts.map((contact) => (
                          <tr key={contact.id} className="transition hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-slate-950">
                                  {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{contact.name}</p>
                                  <p className="text-xs text-slate-400">ID #{contact.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white">{contact.email}</div>
                              <div className="text-xs text-slate-400">{contact.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-100">
                                <LayoutDashboard size={12} />
                                {contact.profession}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Send size={16} />
                    <span>Compose a campaign</span>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        Target audience
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-4 pr-10 text-sm text-white outline-none ring-emerald-500/40 focus:ring"
                          value={selectedProfession}
                          onChange={(e) => setSelectedProfession(e.target.value)}
                        >
                          <option value="All">All Contacts ({contacts.length} recipients)</option>
                          {professions.map((prof) => (
                            <option key={prof} value={prof}>
                              {prof} ({professionStats[prof]} recipients)
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder:text-slate-500 outline-none ring-emerald-500/40 focus:ring"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="e.g. Exclusive invitation for our best builders"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Recipients
                        </label>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm">
                          <div>
                            <p className="font-semibold text-white">{recipients.length}</p>
                            <p className="text-xs text-slate-400">will receive this drop</p>
                          </div>
                          <Users size={18} className="text-emerald-300" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        Email HTML
                      </label>
                      <textarea
                        className="h-64 w-full rounded-xl border border-white/10 bg-slate-900/60 p-4 font-mono text-sm text-white placeholder:text-slate-500 outline-none ring-emerald-500/40 focus:ring"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="<h1>Welcome</h1><p>Drop your HTML here.</p>"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-500/5 p-4">
                        <label
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center"
                        >
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          <UploadCloud className="text-emerald-300" />
                          <div className="text-sm text-slate-200">
                            {attachedImage ? 'Replace campaign image' : 'Drag & drop or browse an image'}
                          </div>
                          <p className="text-xs text-slate-400">
                            Stored in Supabase Storage (bucket: email-assets)
                          </p>
                        </label>
                        {uploading && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-200">
                            <Loader2 className="animate-spin" size={14} />
                            Uploading image...
                          </div>
                        )}
                        {uploadError && <p className="mt-2 text-xs text-rose-200">{uploadError}</p>}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-emerald-300" />
                          <span>Attached asset</span>
                        </div>
                        {attachedImage ? (
                          <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span className="truncate">{attachedImage.name}</span>
                              <button
                                className="text-emerald-200 hover:text-emerald-100"
                                onClick={() => setAttachedImage(null)}
                                type="button"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
                              {/* Use native img to avoid remote domain config for Supabase URLs */}
                              <img src={attachedImage.url} alt="Email asset" className="h-32 w-full object-cover" />
                            </div>
                            <p className="text-xs text-slate-400 break-all">{attachedImage.url}</p>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-400">
                            Optional. Upload to let nodemailer attach it automatically.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-emerald-300/40 hover:bg-emerald-500/10"
                      >
                        <Eye size={16} /> {previewMode ? 'Hide live preview' : 'Show live preview'}
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={sendDisabled}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        {sending ? 'Sending...' : 'Send campaign'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-300" />
                      <span>Templates & snippets</span>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                      HTML ready
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {templatePresets.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => {
                          setEmailSubject(template.subject);
                          setEmailBody(template.body);
                          setPreviewMode(true);
                        }}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-300/40 hover:bg-emerald-500/10"
                      >
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{template.subject}</p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-emerald-300"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Eye size={16} />
                    <span>Live preview</span>
                  </div>
                  <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    {previewMode ? (
                      <div className="max-h-[540px] overflow-auto text-white">
                        <div
                          className="prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: emailBody }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-60 flex-col items-center justify-center gap-3 text-slate-500">
                        <Eye size={24} />
                        <p className="text-sm">Toggle preview to see your HTML.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Send checklist</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-slate-300">
                    <li>✓ Subject and HTML are filled</li>
                    <li>✓ {recipients.length} recipients selected</li>
                    <li>✓ Optional Supabase image attached</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">New contact</p>
                <h3 className="text-lg font-semibold text-white">Add to Supabase</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-emerald-200">Full name</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 focus:ring"
                  placeholder="John Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-emerald-200">Email address</label>
                <input
                  required
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 focus:ring"
                  placeholder="john@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-emerald-200">Phone number</label>
                <input
                  required
                  type="tel"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 focus:ring"
                  placeholder="1 (555) 000-0000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-emerald-200">Profession</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 focus:ring"
                  placeholder="e.g. Software Engineer"
                  value={newContact.profession}
                  onChange={(e) => setNewContact({ ...newContact, profession: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
              >
                <Plus size={16} /> Save contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
