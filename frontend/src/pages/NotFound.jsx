import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

export default function NotFound() {
  return (
    <>
      <PageHero title="404" subtitle="This page could not be found" />
      <section className="section container empty">
        <span>🧵</span>
        <h3>Looks like this thread is loose</h3>
        <Link to="/" className="btn btn-orange">Back to home</Link>
      </section>
    </>
  );
}
