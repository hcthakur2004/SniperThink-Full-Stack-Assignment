import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInterestForm } from "../../hooks/useInterestForm";
import "./InterestModal.css";

export default function InterestModal({ isOpen, onClose, stepTitle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { submit, loading, status, message } = useInterestForm();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submit({ name, email, step: stepTitle });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button className="modal__close" onClick={onClose} aria-label="Close">
              x
            </button>

            <div className="modal__icon">Target</div>
            <h2 id="modal-title" className="modal__title">
              I'm Interested in <span className="modal__step">{stepTitle}</span>
            </h2>
            <p className="modal__subtitle">
              Tell us who you are and we'll reach out with more details.
            </p>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  className="modal__feedback modal__feedback--success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="modal__feedback-icon">OK</span>
                  <p>{message}</p>
                  <button className="modal__btn modal__btn--outline" onClick={onClose}>
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="modal__form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="modal__field">
                    <label htmlFor="interest-name">Your Name</label>
                    <input
                      id="interest-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="modal__field">
                    <label htmlFor="interest-email">Email Address</label>
                    <input
                      id="interest-email"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  {status === "error" ? (
                    <motion.div
                      className="modal__feedback modal__feedback--error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Error: {message}
                    </motion.div>
                  ) : null}

                  <button
                    type="submit"
                    className="modal__btn modal__btn--primary"
                    disabled={loading}
                  >
                    {loading ? <span className="modal__spinner" /> : "Send My Interest ->"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
