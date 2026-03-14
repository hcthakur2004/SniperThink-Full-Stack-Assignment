import { saveInterestSubmission } from "../services/interestStorageService.js";

export async function submitInterest(req, res) {
  const { name, email, step } = req.body;

  if (!name?.trim() || !email?.trim() || !step?.trim()) {
    return res.status(400).json({
      error: "name, email, and step are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const result = await saveInterestSubmission({
      name: name.trim(),
      email: normalizedEmail,
      step: step.trim(),
    });

    return res.json({
      success: true,
      message:
        result.storage === "database"
          ? "Interest recorded successfully."
          : "Interest recorded successfully. Stored locally because the database is currently unavailable.",
    });
  } catch (error) {
    console.error("Interest submission error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
