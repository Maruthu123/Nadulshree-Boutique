import { useEffect, useState } from 'react';
import { FiCheck, FiEyeOff, FiTrash2, FiStar, FiX } from 'react-icons/fi';
import ImageUploader from '../../components/ImageUploader';
import api, { errMsg, fmtDate, imgSrc } from '../../api';

export default function AdminReviews({ store = 'all' }) {
  const [rows, setRows] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', city: '', rating: 5, message: '', image_url: '' });

  const load = () => api.get('/admin/testimonials', { params: { store } }).then((r) => setRows(r.data)).catch((e) => setMsg(errMsg(e)));
  useEffect(() => { setRows(null); load(); }, [store]);

  const approve = async (r, value) => { try { await api.patch(`/admin/testimonials/${r.id}`, { is_approved: value }); await load(); } catch (e) { setMsg(errMsg(e)); } };
  const remove = async (r) => { if (window.confirm('Delete this review?')) { try { await api.delete(`/admin/testimonials/${r.id}`); await load(); } catch (e) { setMsg(errMsg(e)); } } };
  const add = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/testimonials', { ...form, store: store === 'menswear' ? 'menswear' : 'boutique' }); setForm({ name: '', city: '', rating: 5, message: '', image_url: '' }); setMsg('Review added'); await load(); }
    catch (err) { setMsg(errMsg(err)); }
  };

  return (
    <>
      <p className="muted">Reviews written by customers after delivery wait here for your approval. Only approved reviews show on the website.</p>
      {msg && <p className="notice" onClick={() => setMsg('')}>{msg}</p>}

      <div className="admin-two">
        <div>
          {rows === null ? <div className="skeleton tall" /> : rows.length === 0 ? <div className="empty"><span>⭐</span><h3>No reviews yet</h3></div> : rows.map((r) => (
            <div key={r.id} className="card msg">
              <div className="msg-head">
                <div><b>{r.name}</b>{store === 'all' && r.store === 'menswear' && <em className="store-tag">Nexora</em>}{r.city && <small> · {r.city}</small>}<small>{fmtDate(r.created_at)}</small></div>
                <span className={r.is_approved ? 'status s-delivered' : 'status s-placed'}>{r.is_approved ? 'Visible' : 'Waiting'}</span>
              </div>
              <div className="stars">{[...Array(r.rating)].map((_, k) => <FiStar key={k} />)}</div>
              {r.image_url && <img className="rev-thumb" src={imgSrc(r.image_url)} alt="Customer feedback" />}
              {r.message && <p>{r.message}</p>}
              <div className="actions">
                {r.is_approved
                  ? <button className="btn btn-ghost-dark btn-sm" onClick={() => approve(r, false)}><FiEyeOff /> Hide</button>
                  : <button className="btn btn-orange btn-sm" onClick={() => approve(r, true)}><FiCheck /> Approve</button>}
                <button className="icon-btn danger" onClick={() => remove(r)} aria-label="Delete"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>

        <form className="card" onSubmit={add}>
          <h3>Add a real customer review{store === 'all' ? ' (Nadulshree)' : ''}</h3>
          <small className="muted">Use this only for genuine feedback you received (Instagram DM, WhatsApp...) with the customer's permission.</small>
          <div className="form-grid">
            <label>Customer name<input value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label>Rating
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
            </label>
            <label className="span2">Review text (optional if you add a photo)<textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <div className="span2">
              <span className="lbl">Feedback photo / WhatsApp or Instagram screenshot</span>
              {form.image_url ? (
                <div className="img-chip big">
                  <img src={imgSrc(form.image_url)} alt="Feedback" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: '' })} aria-label="Remove photo"><FiX /></button>
                </div>
              ) : (
                <ImageUploader multiple={false} limit={1} label="Choose photo from phone / computer" onUploaded={(urls) => setForm((f) => ({ ...f, image_url: urls[0] }))} />
              )}
            </div>
          </div>
          <button className="btn btn-orange btn-sm" disabled={!form.message.trim() && !form.image_url}>Add review</button>
        </form>
      </div>
    </>
  );
}
