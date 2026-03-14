import { usePageScrollProgress } from "../../hooks/useScrollProgress";
import "./ScrollProgressBar.css";

export default function ScrollProgressBar() {
  const progress = usePageScrollProgress();

  return (
    <div className="scroll-progress-track">
      <div
        className="scroll-progress-fill"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
