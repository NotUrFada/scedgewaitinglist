
import React, { useEffect, useState } from 'react';
import { X, Download, Trash2, Database, Copy, Loader2 } from 'lucide-react';
import { getEmails, clearEmails, WaitlistEntry } from '../services/storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const emails = await getEmails();
      setEntries(emails);
    } catch (error) {
      console.error('Failed to load emails:', error);
      const message = error instanceof Error ? error.message : 'Failed to load emails';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
      // Refresh every 5 seconds to see new emails in real-time
      const interval = setInterval(loadEmails, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Timestamp\n"
      + entries.map(e => `${e.email},${new Date(e.timestamp).toISOString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scedge_waitlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear the database? This cannot be undone.')) {
      setRefreshing(true);
      try {
        await clearEmails();
        setEntries([]);
      } catch (error) {
        console.error('Failed to clear emails:', error);
        alert('Failed to clear emails. Please try again.');
      } finally {
        setRefreshing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white tracking-wide">Waitlist Database</h2>
              <p className="text-xs text-neutral-500 uppercase tracking-widest">{entries.length} Entries</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-neutral-600 font-light flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading emails...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 font-light mb-2">{error}</div>
              <button
                onClick={loadEmails}
                className="mt-4 px-4 py-2 text-xs text-white border border-white/20 hover:bg-white/10 rounded transition-colors uppercase tracking-wider"
              >
                Retry
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-neutral-600 font-light">
              No entries yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-neutral-500 sticky top-0">
                <tr>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry) => (
                  <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-neutral-300 font-mono text-sm select-all">
                      {entry.email}
                    </td>
                    <td className="p-4 text-neutral-600 text-xs text-right font-mono">
                      {new Date(entry.timestamp).toLocaleDateString()} <span className="opacity-50">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#050505] flex justify-between items-center">
          <button
            onClick={handleClear}
            disabled={refreshing || entries.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            Clear Data
          </button>
          <button
            onClick={handleDownload}
            disabled={entries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
