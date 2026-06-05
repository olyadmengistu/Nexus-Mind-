import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { id } = req.query;

  try {
    // Get single post
    if (method === 'GET') {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (id, first_name, last_name, username, avatar),
          solutions (
            id, user_id, text, upvotes, helpful, created_at,
            users:user_id (id, first_name, last_name, username, avatar),
            solution_replies (
              id, user_id, text, created_at,
              users:user_id (id, first_name, last_name, username, avatar)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(200).json({ post });
    }

    // Update post
    if (method === 'PUT') {
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

      const { category, title, content, imageUrl, isSolved, emoji, location } = req.body;

      const { data: post, error: postError } = await supabase
        .from('posts')
        .update({
          category,
          title,
          content,
          image_url: imageUrl,
          is_solved: isSolved,
          emoji,
          location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (postError) {
        return res.status(500).json({ error: postError.message });
      }

      return res.status(200).json({ post });
    }

    // Delete post
    if (method === 'DELETE') {
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

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Post deleted successfully' });
    }

    // Vote on post
    if (method === 'PATCH') {
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

      const { vote } = req.body;

      const { data: post, error: postError } = await supabase
        .from('posts')
        .update({ votes: vote })
        .eq('id', id)
        .select()
        .single();

      if (postError) {
        return res.status(500).json({ error: postError.message });
      }

      return res.status(200).json({ post });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
