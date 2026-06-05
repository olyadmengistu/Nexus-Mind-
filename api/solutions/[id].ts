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
    // Update solution (vote)
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

      const { upvotes, helpful } = req.body;

      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .update({
          upvotes: upvotes,
          helpful: helpful,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (solutionError) {
        return res.status(500).json({ error: solutionError.message });
      }

      return res.status(200).json({ solution });
    }

    // Delete solution
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
        .from('solutions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Solution deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
