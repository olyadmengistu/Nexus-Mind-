import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    // Get posts (with pagination)
    if (method === 'GET') {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (id, first_name, last_name, username, avatar),
          solutions (
            id, user_id, text, upvotes, helpful,
            users:user_id (id, first_name, last_name, username, avatar)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ posts });
    }

    // Create post
    if (method === 'POST') {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authorization.replace('Bearer ', '')
      );

      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const { category, title, content, imageUrl, emoji, location, taggedUsers } = req.body;

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          category,
          title,
          content,
          image_url: imageUrl,
          emoji,
          location,
        })
        .select()
        .single();

      if (postError) {
        return res.status(500).json({ error: postError.message });
      }

      // Add tagged users if provided
      if (taggedUsers && taggedUsers.length > 0) {
        const taggedUsersData = taggedUsers.map((userId: string) => ({
          post_id: post.id,
          user_id: userId,
        }));
        await supabase.from('post_tagged_users').insert(taggedUsersData);
      }

      return res.status(201).json({ post });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
