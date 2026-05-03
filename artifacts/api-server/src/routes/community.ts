import { Router } from "express";
import { db, communityPostsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListCommunityPostsQueryParams, CreateCommunityPostBody } from "@workspace/api-zod";

const router = Router();

async function formatPost(post: typeof communityPostsTable.$inferSelect) {
  const authors = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
  const author = authors[0];
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category as "announcement" | "wellness" | "trending",
    imageUrl: post.imageUrl ?? undefined,
    authorId: post.authorId,
    authorName: author?.name ?? "Anonymous",
    authorAvatarUrl: author?.avatarUrl ?? undefined,
    likes: post.likes ?? 0,
    createdAt: post.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const parsed = ListCommunityPostsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { category, limit = 20, offset = 0 } = params;

  let posts = await db.select().from(communityPostsTable).orderBy(desc(communityPostsTable.createdAt));
  if (category) posts = posts.filter(p => p.category === category);

  const total = posts.length;
  const paginated = posts.slice(Number(offset), Number(offset) + Number(limit));
  const formatted = await Promise.all(paginated.map(formatPost));
  res.json({ posts: formatted, total });
});

router.post("/", async (req, res) => {
  const parsed = CreateCommunityPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error });
    return;
  }
  const authHeader = req.headers.authorization;
  let authorId = 1;
  if (authHeader?.startsWith("Bearer mock_jwt_")) {
    try {
      const payload = JSON.parse(Buffer.from(authHeader.replace("Bearer mock_jwt_", ""), "base64").toString());
      authorId = payload.userId;
    } catch { /* use default */ }
  }
  const [post] = await db.insert(communityPostsTable).values({
    ...parsed.data,
    authorId,
    likes: 0,
  }).returning();
  res.status(201).json(await formatPost(post));
});

export default router;
