import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiSave, FiTrash2 } from 'react-icons/fi';
import ImageUploader from '../../components/ImageUploader';
import api, { errMsg, imgSrc } from '../../api';

/** One hero photo: change the photo, the words, the linked shirt, hide it, move it, delete it. */
function Row({ s, products, first, last, onSaved, onMove, onDelete }) {
  const [d, setD] = useState({ image_url: s.image_url, title: s.title || '', subtitle: s.subtitle || '', product_id: s.product_id || '', link: s.link || '', is_active: s.is_active });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k, v) => { setD((x) => ({ ...x, [k]: v })); setMsg(''); };
  const save = async () => {
    setBusy(true); setMsg('');
    try { const { data } = await api.put(`/admin/hero/${s.id}`, d); onSaved(data); setMsg('Saved'); }
    catch (e) { setMsg(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="card hero-adm-row">
      <div className="hero-adm-img">
        <img src={imgSrc(d.image_url)} alt="" />
        <ImageUploader multiple={false} limit={1} label="Change photo" onUploaded={(u) => set('image_url', u[0])} />
      </div>
      <div className="hero-adm-form">
        <label>Name shown under the shirt<input value={d.title} onChange={(e) => set('title', e.target.value)} maxLength={120} placeholder="e.g. Navy Linen Shirt" /></label>
        <label>Small line (optional)<input value={d.subtitle} onChange={(e) => set('subtitle', e.target.value)} maxLength={200} placeholder="e.g. New arrival" /></label>
        <label>Link to a shirt (price, sizes and Add to cart come from it)
          <select value={d.product_id} onChange={(e) => set('product_id', e.target.value)}>
            <option value="">No shirt (just a photo)</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {!d.product_id && <label>Or a page link (optional)<input value={d.link} onChange={(e) => set('link', e.target.value)} maxLength={300} placeholder="/menswear/shop?category=linen-shirts" /></label>}
        <div className="hero-adm-bar">
          <label className="check"><input type="checkbox" className="switch" checked={d.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Show on website</label>
          <span className="hero-adm-btns">
            <button type="button" className="icon-btn" disabled={first} onClick={onMove(-1)} aria-label="Move up"><FiArrowUp /></button>
            <button type="button" className="icon-btn" disabled={last} onClick={onMove(1)} aria-label="Move down"><FiArrowDown /></button>
            <button type="button" className="icon-btn danger" onClick={onDelete} aria-label="Delete"><FiTrash2 /></button>
            <button type="button" className="btn btn-dark btn-sm" disabled={busy} onClick={save}><FiSave /> {busy ? 'Saving...' : 'Save'}</button>
          </span>
        </div>
        {msg && <p className={msg === 'Saved' ? 'hero-adm-ok' : 'warn'}>{msg}</p>}
      </div>
    </div>
  );
}

export default function AdminHero() {
  const [rows, setRows] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/hero').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
    api.get('/admin/products', { params: { store: 'menswear' } }).then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const add = async (urls) => {
    setError('');
    try { for (const image_url of urls) await api.post('/admin/hero', { image_url }); await load(); }
    catch (e) { setError(errMsg(e)); }
  };
  const move = (id, dir) => () => api.post(`/admin/hero/${id}/move`, { dir }).then(load).catch((e) => setError(errMsg(e)));
  const remove = (id) => async () => {
    if (!window.confirm('Delete this hero photo?')) return;
    try { await api.delete(`/admin/hero/${id}`); setRows((r) => r.filter((x) => x.id !== id)); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className="hero-adm">
      <div className="card hero-adm-intro">
        <h3>Home page hero photos</h3>
        <p className="hero-adm-help">These photos hang on the rail at the top of the Nexora Menswear home page, in this order. Add a shirt photo, link it to a shirt so customers can pick a size and Add to cart right there, then press Save. When there are no photos here, your featured shirts hang on the rail instead.</p>
        <ImageUploader onUploaded={add} limit={6} label="Add hero photos from phone / computer" />
      </div>
      {error && <p className="warn">{error}</p>}
      {!rows ? <div className="skeleton tall" /> : rows.length === 0 ? (
        <div className="empty"><span>👕</span><h3>No hero photos yet</h3><p>Your featured shirts are shown on the rail until you add photos here.</p></div>
      ) : rows.map((s, i) => (
        <Row key={s.id} s={s} products={products} first={i === 0} last={i === rows.length - 1}
          onSaved={(n) => setRows((r) => r.map((x) => (x.id === n.id ? n : x)))} onMove={(dir) => move(s.id, dir)} onDelete={remove(s.id)} />
      ))}
    </div>
  );
}
