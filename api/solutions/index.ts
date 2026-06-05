import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    // Create solution
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

      const { postId, text } = req.body;

      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          post_id: postId,
          user_id: user.id,
          text,
        })
        .select(`
          *,
          users:user_id (id, first_name, last_name, username, avatar)
        `)
        .single();

      if (solutionError) {
        return res.status(500).json({ error: solutionError.message });
      }

      return res.status(201).json({ solution });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
