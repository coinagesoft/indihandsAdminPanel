
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./feedback.module.css";

function FeedbackContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { id: 1, icon: "😡" },
    { id: 2, icon: "🙁" },
    { id: 3, icon: "😐" },
    { id: 4, icon: "🙂" },
    { id: 5, icon: "😍" },
  ];

  const submitFeedback = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/feedback/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          rating,
          comments,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!submitted ? (
          <>
            <img
              src="/materialize/assets/img/favicon/favicon.png"
              className={styles.logo}
              alt="IndiHands"
            />

            <h3>We'd Love Your Feedback</h3>

            <p className={styles.subtitle}>
              Please rate your overall experience.
            </p>

            <div className={styles.emojiRow}>
              {emojis.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.emojiBtn} ${
                    rating === item.id ? styles.active : ""
                  }`}
                  onClick={() => setRating(item.id)}
                >
                  {item.icon}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              placeholder="Share your feedback..."
              className={styles.textarea}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <button
              type="button"
              className={styles.submitBtn}
              disabled={loading}
              onClick={submitFeedback}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </>
        ) : (
          <>
            <div className={styles.successEmoji}>😊</div>

            <h2>Thank You!</h2>

            <p className={styles.subtitle}>
              Your feedback has been submitted successfully.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function InvoiceFeedbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackContent />
    </Suspense>
  );
}
