import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Mail, Users, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const contactCount = await prisma.contact.count();
  const campaignCount = await prisma.emailCampaign.count();
  const professions = await prisma.contact.groupBy({
    by: ['profession'],
    _count: {
      profession: true,
    },
  });

  // Normalize Data for Stats
  const normalizedMap = new Map<string, number>();
  professions.forEach((p: { profession: string | null; _count: { profession: number } }) => {
    if (!p.profession) return;
    const normalized = p.profession.charAt(0).toUpperCase() + p.profession.slice(1).toLowerCase();
    const currentCount = normalizedMap.get(normalized) || 0;
    normalizedMap.set(normalized, currentCount + p._count.profession);
  });
  const normalizedProfessions = Array.from(normalizedMap.entries()).map(([profession, count]) => ({
    profession,
    count
  })).sort((a, b) => b.count - a.count);

  const recentContacts = await prisma.contact.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  return { contactCount, campaignCount, professions: normalizedProfessions, recentContacts };
}

export default async function Dashboard() {
  const { contactCount, campaignCount, professions, recentContacts } = await getStats();

  return (
    <div className="p-4 lg:p-12 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Overview</h2>
          <p className="text-gray-500 mt-1 text-sm font-medium">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-50 text-[#006633] rounded-full text-xs font-bold uppercase tracking-wider border border-green-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006633] animate-pulse"></span>
            System Operational
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Total Contacts */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
            <Users className="w-32 h-32 text-[#006633]" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-[#006633]" />
            </div>
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-1">Total Audience</h3>
            <p className="text-5xl font-bold text-gray-900">{contactCount}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#006633]">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Campaigns */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
            <Mail className="w-32 h-32 text-[#EF3A05]" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-[#EF3A05]" />
            </div>
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-1">Campaigns Sent</h3>
            <p className="text-5xl font-bold text-gray-900">{campaignCount}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#EF3A05]">
              <CheckCircle className="w-4 h-4" />
              <span>All systems go</span>
            </div>
          </div>
        </div>

        {/* Card 3: New Campaign CTA */}
        <div className="bg-gradient-to-br from-[#051a10] to-[#006633] p-8 rounded-3xl shadow-xl shadow-green-900/20 relative overflow-hidden flex flex-col justify-between group">
          <div className="relative z-10">
            <h3 className="text-white/60 font-medium text-xs uppercase tracking-widest mb-2">Quick Action</h3>
            <p className="text-2xl font-bold text-white mb-6 font-serif">Ready to inspire?</p>
            <Link
              href="/compose"
              className="bg-white text-[#006633] px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors"
              style={{ width: 'fit-content' }}
            >
              Start New Campaign <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Decorative */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500" />
        </div>
      </div>

      {/* Recent Contacts Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Registrations</h3>
            <p className="text-gray-400 text-sm mt-1">Latest members joining the details</p>
          </div>
          <Link href="/contacts" className="text-[#006633] text-sm font-bold hover:underline">View All Contacts</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Member</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Profession</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentContacts.map((contact: { id: number, name: string, email: string, profession: string | null, createdAt: Date }) => (
                <tr key={contact.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#006633] flex-shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-500">{contact.email}</td>
                  <td className="px-4 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                      {contact.profession ? (contact.profession.charAt(0).toUpperCase() + contact.profession.slice(1).toLowerCase()) : 'Unspecified'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
