
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
import { User, Post } from './types';
import { INITIAL_POSTS } from './constants';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App useEffect - initializing');
    
    // Load posts from localStorage
    const storedPosts = localStorage.getItem('nexus_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      setPosts(INITIAL_POSTS);
      localStorage.setItem('nexus_posts', JSON.stringify(INITIAL_POSTS));
    }

    // Temporarily disable Firebase auth to test
    setIsLoading(false);

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser);
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + firebaseUser.uid,
          reputation: 0,
          email: firebaseUser.email
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
    }, (error) => {
      console.error('Firebase auth error:', error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              element={user ? <Feed user={user} posts={posts} onAddPost={handleAddPost} onVote={handleVote} /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/profile" 
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
              path="*" 
              element={<Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
