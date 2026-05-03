import { Router } from "express";
import { db, feedbackTable } from "@workspace/db";
import { SubmitFeedbackBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error });
    return;
  }
  const [feedback] = await db.insert(feedbackTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    rating: parsed.data.rating ?? null,
  }).returning();
  res.status(201).json({
    id: feedback.id,
    name: feedback.name,
    email: feedback.email,
    subject: feedback.subject,
    message: feedback.message,
    rating: feedback.rating ?? undefined,
    createdAt: feedback.createdAt.toISOString(),
  });
});

export default router;
