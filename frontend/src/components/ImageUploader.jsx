import { useRef, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import api, { errMsg } from '../api';
import { compressImage } from '../utils/imageCompress';

/**
 * "Choose photos" button. On a phone it opens the gallery / camera.
 * Each photo is shrunk, uploaded to our own server (saved in Neon) and onUploaded(urls) is called.
 */
export default function ImageUploader({ onUploaded, multiple = true, limit = 6, label = 'Choose photos from phone / computer', className = '' }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, limit);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setError('');
    const urls = [];
    try {
      for (const f of files) {
        const dataUrl = await compressImage(f);
        const { data } = await api.post('/uploads', { dataUrl });
        urls.push(data.url);
      }
    } catch (err) {
      setError(err.response ? errMsg(err) : err.message);
    } finally {
      setBusy(false);
      if (urls.length) onUploaded(urls);
    }
  };

  return (
    <div className={className}>
      <button type="button" className="btn btn-dark btn-sm" disabled={busy} onClick={() => input.current?.click()}>
        <FiUploadCloud /> {busy ? 'Uploading...' : label}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
      {error && <p className="warn mt-s">{error}</p>}
    </div>
  );
}
