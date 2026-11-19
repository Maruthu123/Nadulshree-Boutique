import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, inr } from '../../api';

export default function AdminCustomers() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { api.get('/admin/customers').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, []);

  if (error) return <p className="warn">{error}</p>;
  if (!rows) return <div className="skeleton tall" />;

  const shown = rows.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="toolbar">
        <input className="search-in" placeholder="Search name / email / phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="muted">{rows.length} verified customers</span>
      </div>
      {shown.length === 0 ? <div className="empty"><span>👥</span><h3>No customers yet</h3></div> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Spent</th><th>Joined</th></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td><td>{c.email}</td>
                  <td>{c.phone ? <a className="link" href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer">{c.phone}</a> : '-'}</td>
                  <td>{c.orders}</td><td>{inr(c.spent)}</td><td>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
