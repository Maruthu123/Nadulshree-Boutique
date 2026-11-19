import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api, { errMsg, fmtDate } from '../../api';

export default function AdminMessages() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/messages').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try { await api.delete(`/admin/messages/${id}`); setRows((r) => r.filter((m) => m.id !== id)); } catch (e) { setError(errMsg(e)); }
  };

  if (error) return <p className="warn">{error}</p>;
  if (!rows) return <div className="skeleton tall" />;
  if (rows.length === 0) return <div className="empty"><span>💬</span><h3>No messages</h3><p>Messages from the Contact page appear here.</p></div>;

  return (
    <div className="msg-list">
      {rows.map((m) => (
        <div key={m.id} className="card msg">
          <div className="msg-head">
            <div><b>{m.name}</b><small>{fmtDate(m.created_at, true)}</small></div>
            <div className="actions">
              {m.phone && <a className="icon-btn" href={`https://wa.me/91${m.phone}`} target="_blank" rel="noreferrer" aria-label="Reply on WhatsApp"><FaWhatsapp /></a>}
              <button className="icon-btn danger" onClick={() => remove(m.id)} aria-label="Delete"><FiTrash2 /></button>
            </div>
          </div>
          <p>{m.message}</p>
          <small className="muted">{[m.phone, m.email].filter(Boolean).join(' · ')}</small>
        </div>
      ))}
    </div>
  );
}
