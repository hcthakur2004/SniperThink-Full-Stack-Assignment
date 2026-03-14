import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useInterestForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState("");

  const submit = async ({ name, email, step }) => {
    if (!name.trim() || !email.trim()) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/interest`, { name, email, step });
      setStatus("success");
      setMessage("🎉 We've received your interest! We'll be in touch soon.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err?.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStatus(null);
    setMessage("");
  };

  return { submit, loading, status, message, reset };
}
