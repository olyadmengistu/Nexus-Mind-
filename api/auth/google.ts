import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  try {
    // Sign in with Google OAuth token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: accessToken,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Check if user profile exists, create if not
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (!existingUser) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: data.user?.email,
          first_name: data.user?.user_metadata?.given_name || '',
          last_name: data.user?.user_metadata?.family_name || '',
          username: data.user?.user_metadata?.name?.replace(/\s+/g, '').toLowerCase() || '',
          avatar: data.user?.user_metadata?.avatar_url || 'https://via.placeholder.com/40',
          reputation: 0,
        });

      if (profileError) {
        return res.status(500).json({ error: 'Failed to create user profile' });
      }
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
