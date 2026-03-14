import { motion } from "framer-motion";
import ScrollProgressBar from "./components/ScrollProgressBar/ScrollProgressBar";
import StrategySection from "./components/StrategySection/StrategySection";
import "./index.css";

export default function App() {
  return (
    <>
      <ScrollProgressBar />

      <nav className="navbar">
        <a href="#home" className="navbar__logo">
          Sniper<span>Think</span>
        </a>
        <ul className="navbar__links">
          <li>
            <a href="#strategy">Strategy</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>

      <section className="hero" id="home">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero__badge">Precision Intelligence Platform</div>
          <h1 className="hero__title">
            Think Sharper.
            <br />
            <span>Win Bigger.</span>
          </h1>
          <p className="hero__subtitle">
            SniperThink transforms raw market intelligence into decisive
            competitive advantage faster than competitors can react.
          </p>
          <a href="#strategy" className="hero__cta">
            Explore How It Works {"->"}
          </a>
        </motion.div>

        <div className="hero__scroll-hint">Scroll</div>
      </section>

      <div id="strategy">
        <StrategySection />
      </div>

      <section className="contact-section" id="contact">
        <motion.div
          className="contact-section__card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="contact-section__eyebrow">Next Step</p>
          <h2>Bring the strategy flow into a real engagement.</h2>
          <p className="contact-section__body">
            Use the step-level interest forms or reach out directly to discuss
            rollout, analytics integrations, and distributed processing needs.
          </p>
          <a className="contact-section__link" href="mailto:hello@sniperthink.com">
            hello@sniperthink.com
          </a>
        </motion.div>
      </section>
    </>
  );
}
