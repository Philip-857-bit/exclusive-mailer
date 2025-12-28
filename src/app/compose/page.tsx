'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { motion } from 'framer-motion';
import { RefreshCw, Send, Image as ImageIcon, Users, Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function ComposePage() {
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [filterProfession, setFilterProfession] = useState<string>('');
  const [professions, setProfessions] = useState<{ profession: string; count: number }[]>([]);
  const [targetType, setTargetType] = useState<'all' | 'profession'>('all');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.professions && Array.isArray(data.professions)) {
            setProfessions(data.professions);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your inspiring message here...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-[400px] max-w-none text-gray-700',
      },
    },
    content: `
      <h2>Hello there,</h2>
      <p>We have some exciting updates for you from DeEXCLUSIVES Music Organization.</p>
    `,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          editor.chain().focus().setImage({ src: event.target.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getBrandedPreview = () => {
    if (!editor) return '';
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
            body { font-family: 'Montserrat', sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
            .container { max-width: 100%; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #006633; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
            .footer { background-color: #1a1a1a; color: #888888; padding: 30px; text-align: center; font-size: 12px; }
            img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <img src="/logo.png" alt="DeEXCLUSIVES" style="height: 40px; margin: 0 auto;" />
            </div>
            <div class="content">
                ${editor.getHTML()}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} DeExclusives Music Organization.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  };

  const handleTestSend = async () => {
    if (!testEmail || !editor) return alert('Enter a test email address.');

    setIsSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `[TEST] ${subject || 'No Subject'}`,
          html: editor.getHTML(),
          to: testEmail,
        }),
      });

      if (res.ok) alert('Test email sent successfully!');
      else alert('Failed to send test email.');
    } catch (e) {
      alert('Error sending test email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    if (!editor || !subject) return alert('Please add a subject and message.');

    setIsSending(true);
    const html = editor.getHTML();

    const payload = {
      subject,
      html,
      to: targetType === 'all' ? 'all' : `profession:${filterProfession}`,
    };

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send');

      alert(result.message || 'Emails sent successfully!');
      setSubject('');
      editor.commands.setContent('');
    } catch (error) {
      alert(`Error sending emails: ${(error as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="p-8 lg:p-12 font-sans max-w-7xl mx-auto min-h-screen">

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">New Campaign</h1>
          <p className="text-gray-500 mt-1">Compose and distribute branded communications.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 justify-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={clsx("flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'editor' ? "bg-gray-100 text-black" : "text-gray-500")}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={clsx("flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'preview' ? "bg-gray-100 text-black" : "text-gray-500")}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={isSending}
            className="bg-[#000000] hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-bold shadow-xl shadow-gray-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
          >
            {isSending ? <RefreshCw className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            {isSending ? 'Sending...' : 'Send Campaign'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Campaign Subject"
              className="w-full text-2xl font-bold placeholder-gray-300 border-none focus:ring-0 px-0 text-gray-900 font-serif"
            />
          </div>

          {activeTab === 'editor' ? (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-3 flex items-center gap-2 z-10 px-6">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={clsx("p-2 rounded hover:bg-gray-100 font-bold w-8 h-8 flex items-center justify-center transition-colors", editor.isActive('bold') && "bg-gray-100 text-[#006633]")}>B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx("p-2 rounded hover:bg-gray-100 italic w-8 h-8 flex items-center justify-center transition-colors", editor.isActive('italic') && "bg-gray-100 text-[#006633]")}>I</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx("p-2 rounded hover:bg-gray-100 font-bold w-8 h-8 flex items-center justify-center transition-colors", editor.isActive('heading', { level: 2 }) && "bg-gray-100 text-[#006633]")}>H2</button>

                <div className="w-px h-6 bg-gray-200 mx-2" />

                <label className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-500 hover:text-[#006633] transition-colors" title="Upload Image">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <EditorContent editor={editor} className="p-8 lg:p-10 min-h-[500px]" />

              <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100 uppercase tracking-widest">
                DeExclusives Branding Applied Automatically (See Preview)
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl p-4 min-h-[600px] flex justify-center items-start overflow-hidden border border-gray-200">
              <div className="bg-white w-full max-w-[600px] shadow-2xl h-full overflow-hidden rounded-lg">
                <iframe
                  srcDoc={getBrandedPreview()}
                  className="w-full h-[600px] border-none"
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Test Send Card */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Send Test Email</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 focus:outline-none focus:border-[#006633]"
              />
              <button
                onClick={handleTestSend}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold text-xs transition-colors"
              >
                Test
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Users className="w-4 h-4" /> Target Audience
            </h3>

            <div className="space-y-4">
              <div
                className={clsx(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3",
                  targetType === 'all' ? "border-[#006633] bg-green-50/30" : "border-gray-100 hover:border-gray-200"
                )}
                onClick={() => setTargetType('all')}
              >
                <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", targetType === 'all' ? "border-[#006633]" : "border-gray-300")}>
                  {targetType === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-[#006633]" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">All Contacts</p>
                  <p className="text-xs text-gray-500">Send to entire database</p>
                </div>
              </div>

              <div
                className={clsx(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3",
                  targetType === 'profession' ? "border-[#006633] bg-green-50/30" : "border-gray-100 hover:border-gray-200"
                )}
                onClick={() => setTargetType('profession')}
              >
                <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", targetType === 'profession' ? "border-[#006633]" : "border-gray-300")}>
                  {targetType === 'profession' && <div className="w-2.5 h-2.5 rounded-full bg-[#006633]" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Filter by Profession</p>
                  <p className="text-xs text-gray-500">Target specific groups</p>
                </div>
              </div>
            </div>

            {targetType === 'profession' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Profession</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {professions.map((p) => (
                    <label key={p.profession} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <div className={clsx("w-4 h-4 rounded border flex items-center justify-center transition-colors", filterProfession === p.profession ? "bg-[#006633] border-[#006633]" : "border-gray-300")}>
                        {filterProfession === p.profession && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="radio"
                        name="profession_select"
                        value={p.profession}
                        checked={filterProfession === p.profession}
                        onChange={(e) => setFilterProfession(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{p.profession}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{p.count}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-[#EF3A05] text-white p-6 rounded-2xl shadow-xl shadow-orange-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Personalized emails get 14% more open rates. Send wisely.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
