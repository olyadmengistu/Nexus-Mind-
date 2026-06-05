
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Loading from './pages/Loading';
import Solutions from './pages/Solutions';
import { User, Post } from './types';
import { INITIAL_POSTS } from './constants';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, reload } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;

    // Timeout to force loading screen to dismiss after 10 seconds
    authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Firebase auth initialization timeout - forcing load complete');
        setIsLoading(false);
      }
    }, 10000);

    // Initial data load
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
            
            const appUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || 'https://via.placeholder.com/40',
              reputation: 0,
            };
            setUser(appUser);
          } else {
            setUser(null);
            localStorage.removeItem('nexus_user');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }, (error) => {
      console.error('Firebase auth state observer error:', error);
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  const handleAddPost = (newPost: Post) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
  };

  const handleVote = (postId: string, delta: number) => {
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, votes: p.votes + delta } : p
    );
    setPosts(updatedPosts);
    localStorage.setItem('nexus_posts', JSON.stringify(updatedPosts));
  };

  if (isLoading) return <Loading />;

  return (
    <Router>
      <div className="min-h-screen">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <main className={user ? "pt-[56px]" : ""}>
          <Routes>
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
              element={user ? <Feed user={user} posts={posts} onAddPost={handleAddPost} onVote={handleVote} /> : <Navigate to="/login" />} 
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
              element={user ? <Notifications /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/solutions/:postId" 
              element={user ? <Solutions user={user} posts={posts} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
