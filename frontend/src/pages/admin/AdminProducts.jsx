import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import ImageUploader from '../../components/ImageUploader';
import ProductImage from '../../components/ProductImage';
import api, { errMsg, inr } from '../../api';

const EMPTY = { name: '', category_id: '', price: '', mrp: '', stock: '', sizes: '', colors: '', description: '', images: [], is_active: true, is_featured: false };
const SIZE_HINTS = { standard: 'S, M, L, XL, XXL', free: 'Free Size' };

export default function AdminProducts({ store = 'all' }) {
  const [list, setList] = useState(null);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null); // null = closed
  const [editId, setEditId] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => api.get('/admin/products', { params: { store } }).then((r) => setList(r.data)).catch((e) => setMsg(errMsg(e)));
  useEffect(() => { setList(null); load(); }, [store]);
  useEffect(() => { api.get('/admin/categories').then((r) => setCats(r.data)); }, []);
  const shownCats = cats.filter((c) => store === 'all' || c.store === store);

  const openNew = () => { setForm({ ...EMPTY, category_id: shownCats[0]?.id || '' }); setEditId(null); setError(''); };
  const openEdit = (p) => {
    setForm({ ...p, category_id: p.category_id || '', mrp: p.mrp ?? '', sizes: p.sizes.join(', '), colors: p.colors.join(', ') });
    setEditId(p.id); setError('');
  };
  const close = () => { setForm(null); setImgUrl(''); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addImageUrl = () => {
    const u = imgUrl.trim();
    if (!/^https?:\/\//i.test(u)) return setError('Image link must start with http:// or https://');
    if (form.images.length >= 6) return setError('Maximum 6 photos');
    setError(''); set('images', [...form.images, u]); setImgUrl('');
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (editId) await api.put(`/admin/products/${editId}`, form);
      else await api.post('/admin/products', form);
      setMsg(editId ? 'Product updated' : 'Product added');
      close(); await load();
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/admin/products/${p.id}`); setMsg('Product deleted'); await load(); }
    catch (err) { setMsg(errMsg(err)); }
  };

  const toggle = async (p, key) => {
    try { await api.put(`/admin/products/${p.id}`, { ...p, [key]: !p[key] }); await load(); }
    catch (err) { setMsg(errMsg(err)); }
  };

  const shown = (list || []).filter((p) => `${p.name} ${p.category_name}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="toolbar">
        <input className="search-in" placeholder="Search products..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="btn btn-orange" onClick={openNew}><FiPlus /> Add product</button>
      </div>
      {msg && <p className="notice" onClick={() => setMsg('')}>{msg}</p>}

      {list === null ? <div className="skeleton tall" /> : shown.length === 0 ? (
        <div className="empty"><span>📦</span><h3>No products</h3><p>{store === 'menswear' ? 'Tap “Add product” to add your first shirt.' : 'Tap “Add product” to add your first saree, kurti set, top, legging or pant.'}</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Show</th><th>Featured</th><th /></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td><div className="cell-prod"><div className="mini-img"><ProductImage src={p.images[0]} alt={p.name} /></div><b>{p.name}</b></div></td>
                  <td>{p.category_name || '-'}{store === 'all' && p.store === 'menswear' && <em className="store-tag">Nexora</em>}</td>
                  <td>{inr(p.price)}{p.mrp > p.price && <s className="muted"> {inr(p.mrp)}</s>}</td>
                  <td><span className={p.stock <= 3 ? 'low' : ''}>{p.stock}</span></td>
                  <td><input type="checkbox" className="switch" checked={p.is_active} onChange={() => toggle(p, 'is_active')} aria-label="Visible" /></td>
                  <td><input type="checkbox" className="switch" checked={p.is_featured} onChange={() => toggle(p, 'is_featured')} aria-label="Featured" /></td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => openEdit(p)} aria-label="Edit"><FiEdit2 /></button>
                    <button className="icon-btn danger" onClick={() => remove(p)} aria-label="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {form && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form className="modal" onSubmit={save} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <div className="modal-head"><h3>{editId ? 'Edit product' : 'Add product'}</h3><button type="button" className="icon-btn" onClick={close} aria-label="Close"><FiX /></button></div>

              <div className="form-grid">
                <label className="span2">Product name<input value={form.name} onChange={(e) => set('name', e.target.value)} required /></label>
                <label>Category
                  <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} required>
                    {shownCats.map((c) => <option key={c.id} value={c.id}>{store === 'all' ? `${c.store === 'menswear' ? 'Nexora' : 'Nadulshree'} - ${c.name}` : c.name}</option>)}
                  </select>
                </label>
                <label>Stock (pieces)<input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} required /></label>
                <label>Selling price (₹)<input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} required /></label>
                <label>MRP (₹) — optional, for discount<input type="number" min="0" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} /></label>
                <label className="span2">Sizes (comma separated)
                  <input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder={SIZE_HINTS.standard} />
                  <span className="hint-row">
                    <button type="button" className="link-btn" onClick={() => set('sizes', SIZE_HINTS.standard)}>S–XXL</button>
                    <button type="button" className="link-btn" onClick={() => set('sizes', SIZE_HINTS.free)}>Free Size</button>
                  </span>
                </label>
                <label className="span2">Colours (comma separated)<input value={form.colors} onChange={(e) => set('colors', e.target.value)} placeholder="Maroon, Green, Navy" /></label>
                <label className="span2">Description<textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>

                <div className="span2">
                  <span className="lbl">Photos (first photo is the main one, max 6)</span>
                  <div className="img-edit">
                    {form.images.map((src, i) => (
                      <div key={src + i} className={i === 0 ? 'img-chip main' : 'img-chip'}>
                        <ProductImage src={src} alt="" />
                        {i === 0 && <em>Main</em>}
                        <button type="button" onClick={() => set('images', form.images.filter((_, k) => k !== i))} aria-label="Remove photo"><FiX /></button>
                      </div>
                    ))}
                  </div>
                  {form.images.length < 6 && (
                    <ImageUploader limit={6 - form.images.length} onUploaded={(urls) => set('images', [...form.images, ...urls].slice(0, 6))} />
                  )}
                  <details className="link-opt">
                    <summary>Or paste an image link</summary>
                    <div className="img-add">
                      <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." />
                      <button type="button" className="btn btn-ghost-dark btn-sm" onClick={addImageUrl}>Add link</button>
                    </div>
                  </details>
                </div>

                <label className="check"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Show on website</label>
                <label className="check"><input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured on home page</label>
              </div>

              {error && <p className="warn">{error}</p>}
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost-dark" onClick={close}>Cancel</button>
                <button className="btn btn-orange" disabled={busy}>{busy ? 'Please wait...' : editId ? 'Save changes' : 'Add product'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
