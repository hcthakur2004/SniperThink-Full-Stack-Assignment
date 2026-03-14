import "./StepProgressIndicator.css";

export default function StepProgressIndicator({ steps, activeIndex }) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div key={step.id} className="step-indicator__item">
          <div
            className={`step-indicator__dot ${i <= activeIndex ? "active" : ""} ${i === activeIndex ? "current" : ""}`}
            style={{ "--step-color": step.color }}
          >
            <span className="step-indicator__num">{i + 1}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`step-indicator__line ${i < activeIndex ? "filled" : ""}`}
              style={{ "--step-color": step.color }}
            />
          )}
          <span className="step-indicator__label">{step.title}</span>
        </div>
      ))}
    </div>
  );
}
