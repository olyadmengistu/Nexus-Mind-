
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Loading from './pages/Loading';
import Solutions from './pages/Solutions';
import Videos from './pages/Videos';
import LiveStreams from './pages/LiveStreams';
import Marketplace from './pages/Marketplace';
import Groups from './pages/Groups';
import Collaborate from './pages/Collaborate';
import Settings from './pages/Settings';
import SavedPosts from './pages/SavedPosts';
import ActivityLog from './pages/ActivityLog';
import Help from './pages/Help';
import Feedback from './pages/Feedback';
import Search from './pages/Search';
import Reflections from './pages/Reflections';
import { User, Post } from './types';
import { INITIAL_POSTS } from './constants';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, reload } from 'firebase/auth';
import { postsApi, userApi } from './lib/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;
    let minLoadingTimeout: NodeJS.Timeout;

    // Force loading screen to stay for minimum 3 seconds
    minLoadingTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 3000);

    // Timeout to force loading screen to dismiss after 10 seconds (fallback)
    authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Firebase auth initialization timeout - forcing load complete');
        setIsLoading(false);
      }
    }, 10000);

    // Load posts from backend API (fallback to localStorage)
    const loadPosts = async () => {
      try {
        const apiPosts = await postsApi.getAllPosts({ sortBy: 'newest' });
        if (isMounted && apiPosts.length > 0) {
          setPosts(apiPosts as Post[]);
          localStorage.setItem('nexus_posts', JSON.stringify(apiPosts));
          return;
        }
      } catch (error) {
        console.warn('Backend unavailable, using local posts:', error);
      }

      try {
        const storedPosts = localStorage.getItem('nexus_posts');
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        } else {
          setPosts(INITIAL_POSTS);
          localStorage.setItem('nexus_posts', JSON.stringify(INITIAL_POSTS));
        }
      } catch (error) {
        console.error('Error loading posts from localStorage:', error);
        setPosts(INITIAL_POSTS);
      }
    };
    loadPosts();

    // Check for current user in localStorage first (for immediate signup display)
    const currentUserData = localStorage.getItem('nexus_current_user');
    if (currentUserData && isMounted) {
      try {
        const currentUser = JSON.parse(currentUserData);
        console.log('Found current user in localStorage:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Error parsing current user from localStorage:', error);
      }
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (isMounted) {
          clearTimeout(authTimeout);
          
          if (firebaseUser) {
            // Force reload to ensure we have the latest profile data
            try {
              await reload(firebaseUser);
            } catch (reloadError) {
              console.warn('Failed to reload user profile:', reloadError);
              // Continue anyway with the data we have
            }

            // Check localStorage for user data (includes avatar from signup)
            const storedUsers = JSON.parse(localStorage.getItem('nexus_users') || '[]');
            const storedUser = storedUsers.find((u: User) => u.id === firebaseUser.uid);

            // Also check for current user directly saved during signup
            const currentUserData = localStorage.getItem('nexus_current_user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

            // Prioritize storedUser from nexus_users (has correct signup data) over currentUser
            // If storedUser exists and has better data (not just email prefix as name), update nexus_current_user
            if (storedUser && storedUser.name !== firebaseUser.email?.split('@')[0]) {
              localStorage.setItem('nexus_current_user', JSON.stringify(storedUser));
            }

            const appUser: User = {
              id: firebaseUser.uid,
              name: storedUser?.name || currentUser?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              username: storedUser?.username || currentUser?.username || firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              avatar: storedUser?.avatar || currentUser?.avatar || firebaseUser.photoURL || 'https://picsum.photos/seed/default/100/100',
              reputation: storedUser?.reputation || currentUser?.reputation || 0,
            };

            // Sync profile from backend when available
            try {
              const backendUser = await userApi.getProfile(firebaseUser.uid);
              if (isMounted && backendUser) {
                Object.assign(appUser, {
                  name: backendUser.name ?? appUser.name,
                  username: backendUser.username ?? appUser.username,
                  avatar: backendUser.avatar ?? appUser.avatar,
                  reputation: backendUser.reputation ?? appUser.reputation,
                  bio: backendUser.bio,
                });
              }
            } catch {
              // Profile may not exist yet for new users
            }
            
            console.log('App user created:', appUser);
            console.log('Avatar sources - storedUser:', storedUser?.avatar, 'currentUser:', currentUser?.avatar, 'firebaseUser:', firebaseUser.photoURL, 'final:', appUser.avatar);
            setUser(appUser);
          } else {
            setUser(null);
            localStorage.removeItem('nexus_current_user');
            localStorage.removeItem('nexus_user');
          }
          // Don't set isLoading(false) here - let the minLoadingTimeout handle it
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        if (isMounted) {
          setUser(null);
          // Don't set isLoading(false) here - let the minLoadingTimeout handle it
        }
      }
    }, (error) => {
      console.error('Firebase auth state observer error:', error);
      if (isMounted) {
        setUser(null);
        // Don't set isLoading(false) here - let the minLoadingTimeout handle it
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      clearTimeout(minLoadingTimeout);
      unsubscribe();
    };
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Also save to localStorage for persistence
    localStorage.setItem('nexus_current_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  const handleAddPost = async (newPost: Post) => {
    try {
      const { id: _localId, ...postData } = newPost;
      const created = await postsApi.createPost(postData);
      const updatedPosts = [created as Post, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.warn('Failed to save post to backend, saving locally:', error);
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
    }
  };

  const handleVote = async (postId: string, delta: number) => {
    if (!user) return;
    try {
      const updated = await postsApi.votePost(postId, delta, user.id, user.avatar);
      const updatedPosts = posts.map(p =>
        p.id === postId ? { ...p, votes: updated.votes } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.warn('Failed to vote via backend, updating locally:', error);
      const updatedPosts = posts.map(p =>
        p.id === postId ? { ...p, votes: p.votes + delta } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Router>
      <div className="min-h-screen">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <main className={user ? "pt-[56px]" : ""}>
          <Routes>
            <Route 
              path="/welcome" 
              element={user ? <Navigate to="/" /> : <Welcome />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" /> : <Signup />} 
            />
            <Route 
              path="/" 
              element={user ? <Feed user={user} posts={posts} onAddPost={handleAddPost} onVote={handleVote} /> : <Navigate to="/welcome" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} posts={posts} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile/:userId" 
              element={user ? <Profile user={user} posts={posts} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/messages" 
              element={user ? <Messages user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/notifications" 
              element={user ? <Notifications user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/solutions/:postId" 
              element={user ? <Solutions user={user} posts={posts} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/videos" 
              element={user ? <Videos user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/livestreams" 
              element={user ? <LiveStreams user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/marketplace" 
              element={user ? <Marketplace user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/groups" 
              element={user ? <Groups user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/collaborate" 
              element={user ? <Collaborate user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <Settings user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/saved-posts" 
              element={user ? <SavedPosts user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/activity-log" 
              element={user ? <ActivityLog user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/help" 
              element={user ? <Help /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/feedback" 
              element={user ? <Feedback user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/search" 
              element={user ? <Search user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/inspire-hub" 
              element={user ? <Reflections user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
