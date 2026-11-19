import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiX } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import ReviewCard from '../components/ReviewCard';
import Lightbox from '../components/Lightbox';
import ImageUploader from '../components/ImageUploader';
import { useAuth } from '../context/AuthContext';
import { IMG } from '../data/images';
import api, { errMsg, imgSrc } from '../api';

export default function HappyCustomers() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(null);
  const [form, setForm] = useState({ rating: 5, city: '', message: '', image_url: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState('');

  useEffect(() => { api.get('/testimonials').then((r) => setReviews(r.data)).catch(() => setReviews([])); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setMsg('');
    try {
      const { data } = await api.post('/testimonials', form);
      setMsg(data.message);
      setForm({ rating: 5, city: '', message: '', image_url: '' });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  const withPhoto = (reviews || []).filter((r) => r.image_url);
  const textOnly = (reviews || []).filter((r) => !r.image_url);

  return (
    <>
      <PageHero title="Happy Customers" subtitle="Real feedback from the people who shop with us" image={IMG.banner.happy} />
      <section className="section container">
        {reviews === null ? <div className="skeleton tall" /> : reviews.length === 0 ? (
          <div className="empty"><span>💛</span><h3>Feedback will appear here</h3><p>Customer feedback and photos are shown here. Be the first after your order is delivered!</p></div>
        ) : (
          <>
            {withPhoto.length > 0 && (
              <>
                <Reveal><h2 className="sec-title">Feedback <span>screenshots</span></h2></Reveal>
                <div className="photo-wall">
                  {withPhoto.map((r, i) => (
                    <Reveal key={r.id} delay={(i % 4) * 0.06} y={20}>
                      <ReviewCard r={r} onOpenImage={setZoom} showDate />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
            {textOnly.length > 0 && (
              <>
                <Reveal><h2 className="sec-title mt">What they <span>say</span></h2></Reveal>
                <div className="review-grid">
                  {textOnly.map((r, i) => (
                    <Reveal key={r.id} delay={(i % 3) * 0.08}><ReviewCard r={r} showDate /></Reveal>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <section className="section section-alt">
        <div className="container narrow">
          <Reveal><h2 className="sec-title">Share your <span>experience</span></h2></Reveal>
          {!user ? (
            <p className="center muted">Please <Link to="/login" state={{ from: '/happy-customers' }} className="link">login</Link> to write a review. You can review after your order is delivered.</p>
          ) : (
            <motion.form className="card" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rate" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={n <= form.rating ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, rating: n }))} aria-label={`${n} star`}><FiStar /></button>
                ))}
              </div>
              <div className="form-grid">
                <label className="span2">Your city (optional)<input value={form.city} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></label>
                <label className="span2">Your review<textarea rows={4} value={form.message} maxLength={600} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></label>
                <div className="span2">
                  <span className="lbl">Add a photo of your outfit (optional)</span>
                  {form.image_url ? (
                    <div className="img-chip big">
                      <img src={imgSrc(form.image_url)} alt="Your photo" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))} aria-label="Remove photo"><FiX /></button>
                    </div>
                  ) : (
                    <ImageUploader multiple={false} limit={1} label="Choose a photo" onUploaded={(urls) => setForm((f) => ({ ...f, image_url: urls[0] }))} />
                  )}
                </div>
              </div>
              {msg && <p className="notice">{msg}</p>}
              {error && <p className="warn">{error}</p>}
              <button className="btn btn-orange btn-block" disabled={busy || (!form.message.trim() && !form.image_url)}>{busy ? 'Sending...' : 'Submit review'}</button>
            </motion.form>
          )}
        </div>
      </section>
      <Lightbox src={zoom} onClose={() => setZoom('')} />
    </>
  );
}
