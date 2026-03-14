import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { strategySteps } from "../../data/strategySteps";
import StrategyStep from "../StrategyStep/StrategyStep";
import StepProgressIndicator from "../StepProgressIndicator/StepProgressIndicator";
import "./StrategySection.css";

export default function StrategySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleStepVisible = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  return (
    <section className="strategy-section" aria-label="SniperThink Strategy Flow">
      <motion.div
        className="strategy-section__header"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="strategy-section__eyebrow">How It Works</span>
        <h2 className="strategy-section__heading">
          The SniperThink{" "}
          <span className="strategy-section__heading--accent">Strategy Flow</span>
        </h2>
        <p className="strategy-section__subheading">
          A battle-tested, four-phase framework that transforms raw market data
          into decisive competitive advantage.
        </p>
      </motion.div>

      <StepProgressIndicator steps={strategySteps} activeIndex={activeIndex} />

      <div className="strategy-section__steps">
        {strategySteps.map((step, index) => (
          <StrategyStep
            key={step.id}
            step={step}
            stepIndex={index}
            onVisible={handleStepVisible}
          />
        ))}
      </div>

      <motion.div
        className="strategy-section__footer"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h3>Ready to Transform Your Strategy?</h3>
        <p>Join 500+ companies already winning with SniperThink.</p>
        <a href="#contact" className="strategy-section__footer-btn">
          Get Started Today {"->"}
        </a>
      </motion.div>
    </section>
  );
}
