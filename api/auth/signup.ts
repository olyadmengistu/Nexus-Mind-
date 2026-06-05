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

  const { email, password, firstName, lastName, username } = req.body;

  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username || `${firstName}${lastName}`.toLowerCase(),
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email,
        first_name: firstName,
        last_name: lastName,
        username: username || `${firstName}${lastName}`.toLowerCase(),
        avatar: 'https://via.placeholder.com/40',
        reputation: 0,
      });

    if (profileError) {
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    return res.status(201).json({
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
      },
      session: authData.session,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
