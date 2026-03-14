import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import InterestModal from "../InterestModal/InterestModal";
import "./StrategyStep.css";

const slideLeftVariants = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerScaleVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerChildVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 14 },
  },
};

const typewriterVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function useTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(event.clientX - rect.left - rect.width / 2);
      y.set(event.clientY - rect.top - rect.height / 2);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

function StepContent({ step, onInterest }) {
  return (
    <div className="strategy-step__inner">
      <div className="strategy-step__number" style={{ color: step.color }}>
        0{step.id}
      </div>
      <div className="strategy-step__icon-wrap" style={{ background: step.gradient }}>
        <span className="strategy-step__icon">{step.icon}</span>
      </div>
      <div className="strategy-step__text">
        <p className="strategy-step__subtitle" style={{ color: step.color }}>
          {step.subtitle}
        </p>
        <h3 className="strategy-step__title">{step.title}</h3>
        <p className="strategy-step__desc">{step.description}</p>

        <div className="strategy-step__stats">
          {step.stats.map((stat) => (
            <div key={stat.label} className="strategy-step__stat">
              <strong style={{ color: step.color }}>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <button
          className="strategy-step__cta"
          style={{ "--step-color": step.color, "--step-gradient": step.gradient }}
          onClick={onInterest}
        >
          {step.cta}
        </button>
      </div>
    </div>
  );
}

function ScrollRevealStep({ step, stepIndex, onVisible }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.25 });
  const progress = useScrollProgress(ref);
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      onVisible?.(stepIndex);
    }
  }, [isVisible, onVisible, stepIndex]);

  const opacity = Math.min(progress * 2, 1);
  const scale = 0.8 + progress * 0.2;
  const translateY = (1 - progress) * 60;

  return (
    <>
      <div ref={ref} className="strategy-step" id={`step-${step.id}`}>
        <motion.div
          className="strategy-step__card"
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ opacity, scale, y: translateY }}
          transition={{ duration: 0 }}
        >
          <StepContent step={step} onInterest={() => setModalOpen(true)} />
          <div
            className="strategy-step__scroll-reveal-bar"
            style={{ background: step.gradient, transform: `scaleX(${progress})` }}
          />
        </motion.div>
        <div className="strategy-step__scroll-hint">
          <span style={{ opacity: progress < 0.5 ? 1 - progress * 1.5 : 0 }}>
            Scroll to reveal
          </span>
        </div>
      </div>

      {modalOpen ? (
        <InterestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          stepTitle={step.title}
        />
      ) : null}
    </>
  );
}

export default function StrategyStep({ step, stepIndex, onVisible }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.25 });
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      onVisible?.(stepIndex);
    }
  }, [isVisible, onVisible, stepIndex]);

  if (step.animationType === "scrollReveal") {
    return <ScrollRevealStep step={step} stepIndex={stepIndex} onVisible={onVisible} />;
  }

  const getVariants = () => {
    switch (step.animationType) {
      case "staggerScale":
        return staggerScaleVariants;
      case "typewriter":
        return typewriterVariants;
      default:
        return slideLeftVariants;
    }
  };

  return (
    <>
      <div ref={ref} className="strategy-step" id={`step-${step.id}`}>
        <motion.div
          className="strategy-step__card"
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          variants={getVariants()}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {step.animationType === "staggerScale" ? (
            <motion.div
              className="strategy-step__inner"
              variants={staggerScaleVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              <motion.div
                variants={staggerChildVariant}
                className="strategy-step__number"
                style={{ color: step.color }}
              >
                0{step.id}
              </motion.div>
              <motion.div
                variants={staggerChildVariant}
                className="strategy-step__icon-wrap"
                style={{ background: step.gradient }}
              >
                <span className="strategy-step__icon">{step.icon}</span>
              </motion.div>
              <motion.div variants={staggerChildVariant} className="strategy-step__text">
                <p className="strategy-step__subtitle" style={{ color: step.color }}>
                  {step.subtitle}
                </p>
                <h3 className="strategy-step__title">{step.title}</h3>
                <p className="strategy-step__desc">{step.description}</p>
                <div className="strategy-step__stats">
                  {step.stats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={staggerChildVariant}
                      className="strategy-step__stat"
                    >
                      <strong style={{ color: step.color }}>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  variants={staggerChildVariant}
                  className="strategy-step__cta"
                  style={{ "--step-color": step.color, "--step-gradient": step.gradient }}
                  onClick={() => setModalOpen(true)}
                >
                  {step.cta}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : step.animationType === "typewriter" ? (
            <div className={`strategy-step__inner ${isVisible ? "typewriter-reveal" : ""}`}>
              <StepContent step={step} onInterest={() => setModalOpen(true)} />
            </div>
          ) : (
            <StepContent step={step} onInterest={() => setModalOpen(true)} />
          )}
        </motion.div>
      </div>

      {modalOpen ? (
        <InterestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          stepTitle={step.title}
        />
      ) : null}
    </>
  );
}
