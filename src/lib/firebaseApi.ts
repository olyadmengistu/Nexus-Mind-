// Firebase API Client for NexusMind
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

// Error handling wrapper
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
};

// ==================== USER API ====================

export const userApi = {
  getProfile: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('User not found');
  },
  
  createProfile: async (userId: string, data: any) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await addDoc(collection(db, 'users'), {
        ...data,
        id: userId,
        interests: [],
        onboardingComplete: false,
        createdAt: Date.now()
      });
    }
    return { success: true };
  },
  
  updateProfile: async (userId: string, data: any) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, data);
    } else {
      // Create profile if it doesn't exist
      await addDoc(collection(db, 'users'), {
        ...data,
        id: userId,
        createdAt: Date.now()
      });
    }
    return { success: true };
  },
  
  updateInterests: async (userId: string, interests: string[]) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { 
      interests,
      onboardingComplete: true 
    });
    return { success: true };
  },
  
  getAllUsers: async (queryStr?: string) => {
    let q = query(collection(db, 'users'));
    if (queryStr) {
      q = query(collection(db, 'users'), where('username', '>=', queryStr), where('username', '<=', queryStr + '\uf8ff'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getUsersByInterests: async (interests: string[]) => {
    if (interests.length === 0) return [];
    // Get users who have at least one matching interest
    const q = query(collection(db, 'users'), where('interests', 'array-contains-any', interests));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  followUser: async (currentUserId: string, targetUserId: string) => {
    // Add targetUserId to current user's following list
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });
    
    // Add currentUserId to target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId)
    });
    
    return { success: true };
  },
  
  unfollowUser: async (currentUserId: string, targetUserId: string) => {
    // Remove targetUserId from current user's following list
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });
    
    // Remove currentUserId from target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId)
    });
    
    return { success: true };
  },
  
  getSavedItems: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.savedItems || [];
    }
    return [];
  },
  
  saveItem: async (userId: string, item: any) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      savedItems: arrayUnion(item)
    });
    return { success: true };
  },
  
  removeSavedItem: async (userId: string, itemId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const savedItems = (data.savedItems || []).filter((item: any) => item.id !== itemId);
      await updateDoc(docRef, { savedItems });
    }
    return { success: true };
  },
  
  getActivityLog: async (userId: string) => {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// ==================== POSTS API ====================

export const postsApi = {
  getAllPosts: async (params?: { userId?: string; category?: string; sortBy?: string }) => {
    let q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
    if (params?.userId) {
      q = query(collection(db, 'posts'), where('userId', '==', params.userId), orderBy('timestamp', 'desc'));
    }
    if (params?.category) {
      q = query(collection(db, 'posts'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getPost: async (postId: string) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Post not found');
  },
  
  createPost: async (data: any) => {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...data,
      timestamp: Date.now(),
      votes: 0,
      isSolved: false,
      solutions: [],
      comments: []
    });
    return { 
      id: docRef.id, 
      ...data,
      timestamp: Date.now(),
      votes: 0,
      isSolved: false,
      solutions: [],
      comments: []
    };
  },
  
  updatePost: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deletePost: async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    return { success: true };
  },
  
  votePost: async (postId: string, delta: number, userId: string, userAvatar: string) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      votes: increment(delta)
    });
    return { success: true };
  },
  
  addSolution: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      solutions: arrayUnion({
        ...data,
        timestamp: Date.now(),
        upvotes: 0,
        helpful: 0,
        replies: []
      })
    });
    return { success: true };
  },
  
  voteSolution: async (postId: string, solutionId: string, delta: number) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const solutions = data.solutions.map((sol: any) => {
        if (sol.id === solutionId) {
          return { ...sol, upvotes: (sol.upvotes || 0) + delta };
        }
        return sol;
      });
      await updateDoc(docRef, { solutions });
    }
    return { success: true };
  },
  
  markSolutionHelpful: async (postId: string, solutionId: string) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const solutions = data.solutions.map((sol: any) => {
        if (sol.id === solutionId) {
          return { ...sol, helpful: (sol.helpful || 0) + 1 };
        }
        return sol;
      });
      await updateDoc(docRef, { solutions });
    }
    return { success: true };
  },
  
  addComment: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      comments: arrayUnion({
        ...data,
        timestamp: new Date()
      })
    });
    return { success: true };
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  getNotifications: async (userId: string) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
    return { success: true };
  },
  
  markAllAsRead: async (userId: string) => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(async (doc) => {
      await updateDoc(doc.ref, { read: true });
    });
    return { success: true };
  },
  
  deleteNotification: async (notificationId: string) => {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  },
};

// ==================== GROUPS API ====================

export const groupsApi = {
  getAllGroups: async (params?: { query?: string; category?: string }) => {
    let q = query(collection(db, 'groups'));
    if (params?.category) {
      q = query(collection(db, 'groups'), where('category', '==', params.category));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getGroup: async (groupId: string) => {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Group not found');
  },
  
  createGroup: async (data: any) => {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...data,
      timestamp: Date.now(),
      members: [data.creatorId],
      memberCount: 1
    });
    return { id: docRef.id, ...data };
  },
  
  joinGroup: async (groupId: string, userId: string) => {
    const docRef = doc(db, 'groups', groupId);
    await updateDoc(docRef, {
      members: arrayUnion(userId),
      memberCount: increment(1)
    });
    return { success: true };
  },
};

// ==================== SEARCH API ====================

export const searchApi = {
  globalSearch: async (query: string, type?: string) => {
    const results: any = { users: [], posts: [], groups: [] };
    
    if (!type || type === 'all' || type === 'users') {
      const userQ = query(collection(db, 'users'), where('username', '>=', query), where('username', '<=', query + '\uf8ff'), limit(10));
      const userSnapshot = await getDocs(userQ);
      results.users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'all' || type === 'posts') {
      const postQ = query(collection(db, 'posts'), where('content', '>=', query), where('content', '<=', query + '\uf8ff'), limit(10));
      const postSnapshot = await getDocs(postQ);
      results.posts = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'all' || type === 'groups') {
      const groupQ = query(collection(db, 'groups'), where('name', '>=', query), where('name', '<=', query + '\uf8ff'), limit(10));
      const groupSnapshot = await getDocs(groupQ);
      results.groups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    return results;
  },
};

// ==================== VIDEOS API ====================

export const videosApi = {
  getAllVideos: async (params?: { userId?: string; category?: string; sortBy?: string }) => {
    let q = query(collection(db, 'videos'), orderBy('timestamp', 'desc'));
    
    if (params?.userId) {
      q = query(collection(db, 'videos'), where('userId', '==', params.userId), orderBy('timestamp', 'desc'));
    }
    if (params?.category) {
      q = query(collection(db, 'videos'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getVideo: async (videoId: string) => {
    const docRef = doc(db, 'videos', videoId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Video not found');
  },
  
  createVideo: async (data: any) => {
    const docRef = await addDoc(collection(db, 'videos'), {
      ...data,
      timestamp: Date.now(),
      views: 0,
      likes: 0
    });
    return { id: docRef.id, ...data };
  },
  
  updateVideo: async (videoId: string, data: any) => {
    const docRef = doc(db, 'videos', videoId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteVideo: async (videoId: string) => {
    await deleteDoc(doc(db, 'videos', videoId));
    return { success: true };
  },
  
  likeVideo: async (videoId: string, delta: number) => {
    const docRef = doc(db, 'videos', videoId);
    await updateDoc(docRef, {
      likes: increment(delta)
    });
    return { success: true };
  },
  
  incrementViews: async (videoId: string) => {
    const docRef = doc(db, 'videos', videoId);
    await updateDoc(docRef, {
      views: increment(1)
    });
    return { success: true };
  },
};

// ==================== PRODUCTS API ====================

export const productsApi = {
  getAllProducts: async (params?: { sellerId?: string; category?: string }) => {
    let q = query(collection(db, 'products'), orderBy('timestamp', 'desc'));
    
    if (params?.sellerId) {
      q = query(collection(db, 'products'), where('sellerId', '==', params.sellerId), orderBy('timestamp', 'desc'));
    }
    if (params?.category) {
      q = query(collection(db, 'products'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getProduct: async (productId: string) => {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Product not found');
  },
  
  createProduct: async (data: any) => {
    const docRef = await addDoc(collection(db, 'products'), {
      ...data,
      timestamp: Date.now(),
      rating: 0,
      reviews: 0
    });
    return { id: docRef.id, ...data };
  },
  
  updateProduct: async (productId: string, data: any) => {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteProduct: async (productId: string) => {
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  },
};

// ==================== CONVERSATIONS API ====================

export const conversationsApi = {
  getAllConversations: async (userId: string) => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getConversation: async (conversationId: string) => {
    const docRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Conversation not found');
  },
  
  createConversation: async (data: any) => {
    const docRef = await addDoc(collection(db, 'conversations'), {
      ...data,
      timestamp: Date.now(),
      messages: []
    });
    return { id: docRef.id, ...data };
  },
  
  sendMessage: async (conversationId: string, message: any) => {
    const docRef = doc(db, 'conversations', conversationId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        ...message,
        timestamp: Date.now()
      }),
      lastMessage: message.text,
      timestamp: Date.now()
    });
    return { success: true };
  },
  
  deleteConversation: async (conversationId: string) => {
    await deleteDoc(doc(db, 'conversations', conversationId));
    return { success: true };
  },
};

// ==================== ACTIVITIES API ====================

export const activitiesApi = {
  logActivity: async (activity: any) => {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      timestamp: Date.now()
    });
    return { id: docRef.id, ...activity };
  },
  
  getUserActivities: async (userId: string, limitCount: number = 50) => {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getAllActivities: async (limitCount: number = 100) => {
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// ==================== INSPIRATIONS API ====================

export const inspirationsApi = {
  getAllInspirations: async (params?: { userId?: string }) => {
    let q = query(collection(db, 'inspirations'), orderBy('timestamp', 'desc'));
    
    if (params?.userId) {
      q = query(collection(db, 'inspirations'), where('userId', '==', params.userId), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getInspiration: async (inspirationId: string) => {
    const docRef = doc(db, 'inspirations', inspirationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Inspiration not found');
  },
  
  createInspiration: async (data: any) => {
    const docRef = await addDoc(collection(db, 'inspirations'), {
      ...data,
      timestamp: Date.now(),
      likes: 0
    });
    return { id: docRef.id, ...data };
  },
  
  updateInspiration: async (inspirationId: string, data: any) => {
    const docRef = doc(db, 'inspirations', inspirationId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteInspiration: async (inspirationId: string) => {
    await deleteDoc(doc(db, 'inspirations', inspirationId));
    return { success: true };
  },
  
  likeInspiration: async (inspirationId: string, delta: number) => {
    const docRef = doc(db, 'inspirations', inspirationId);
    await updateDoc(docRef, {
      likes: increment(delta)
    });
    return { success: true };
  },
};

// ==================== COLLABORATIONS API ====================

export const collaborationsApi = {
  getAllCollaborations: async (params?: { category?: string; status?: string }) => {
    let q = query(collection(db, 'collaborations'), orderBy('timestamp', 'desc'));
    
    if (params?.category) {
      q = query(collection(db, 'collaborations'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    if (params?.status) {
      q = query(collection(db, 'collaborations'), where('status', '==', params.status), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getCollaboration: async (collaborationId: string) => {
    const docRef = doc(db, 'collaborations', collaborationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Collaboration not found');
  },
  
  createCollaboration: async (data: any) => {
    const docRef = await addDoc(collection(db, 'collaborations'), {
      ...data,
      timestamp: Date.now(),
      applicants: [],
      status: 'open'
    });
    return { id: docRef.id, ...data };
  },
  
  updateCollaboration: async (collaborationId: string, data: any) => {
    const docRef = doc(db, 'collaborations', collaborationId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteCollaboration: async (collaborationId: string) => {
    await deleteDoc(doc(db, 'collaborations', collaborationId));
    return { success: true };
  },
  
  applyToCollaboration: async (collaborationId: string, applicant: any) => {
    const docRef = doc(db, 'collaborations', collaborationId);
    await updateDoc(docRef, {
      applicants: arrayUnion({
        ...applicant,
        timestamp: Date.now(),
        status: 'pending'
      })
    });
    return { success: true };
  },
  
  updateApplicantStatus: async (collaborationId: string, userId: string, status: string) => {
    const docRef = doc(db, 'collaborations', collaborationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const applicants = data.applicants.map((app: any) => {
        if (app.userId === userId) {
          return { ...app, status };
        }
        return app;
      });
      await updateDoc(docRef, { applicants });
    }
    return { success: true };
  },
};

// ==================== LIVE STREAMS API ====================

export const liveStreamsApi = {
  getAllStreams: async (params?: { streamerId?: string; category?: string; status?: string }) => {
    let q = query(collection(db, 'livestreams'), orderBy('timestamp', 'desc'));
    
    if (params?.streamerId) {
      q = query(collection(db, 'livestreams'), where('streamerId', '==', params.streamerId), orderBy('timestamp', 'desc'));
    }
    if (params?.category) {
      q = query(collection(db, 'livestreams'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    if (params?.status) {
      q = query(collection(db, 'livestreams'), where('status', '==', params.status), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getStream: async (streamId: string) => {
    const docRef = doc(db, 'livestreams', streamId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Stream not found');
  },
  
  createStream: async (data: any) => {
    const docRef = await addDoc(collection(db, 'livestreams'), {
      ...data,
      timestamp: Date.now(),
      viewers: 0,
      likes: 0,
      status: 'offline'
    });
    return { id: docRef.id, ...data };
  },
  
  updateStream: async (streamId: string, data: any) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteStream: async (streamId: string) => {
    await deleteDoc(doc(db, 'livestreams', streamId));
    return { success: true };
  },
  
  startStream: async (streamId: string) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, {
      status: 'live',
      startedAt: Date.now()
    });
    return { success: true };
  },
  
  endStream: async (streamId: string) => {
    const docRef = doc(db, 'livestreams', streamId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const duration = data.startedAt ? Date.now() - data.startedAt : 0;
      await updateDoc(docRef, {
        status: 'offline',
        endedAt: Date.now(),
        duration
      });
    }
    return { success: true };
  },
  
  likeStream: async (streamId: string, delta: number) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, {
      likes: increment(delta)
    });
    return { success: true };
  },
  
  addViewer: async (streamId: string, viewer: any) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, {
      viewers: increment(1)
    });
    return { success: true };
  },
  
  removeViewer: async (streamId: string) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, {
      viewers: increment(-1)
    });
    return { success: true };
  },
  
  addChatMessage: async (streamId: string, message: any) => {
    const docRef = doc(db, 'livestreams', streamId);
    await updateDoc(docRef, {
      chatMessages: arrayUnion({
        ...message,
        timestamp: Date.now()
      })
    });
    return { success: true };
  },
};

// ==================== MEETINGS API ====================

export const meetingsApi = {
  getAllMeetings: async (params?: { hostId?: string; status?: string }) => {
    let q = query(collection(db, 'meetings'), orderBy('scheduledTime', 'desc'));
    
    if (params?.hostId) {
      q = query(collection(db, 'meetings'), where('hostId', '==', params.hostId), orderBy('scheduledTime', 'desc'));
    }
    if (params?.status) {
      q = query(collection(db, 'meetings'), where('status', '==', params.status), orderBy('scheduledTime', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getMeeting: async (meetingId: string) => {
    const docRef = doc(db, 'meetings', meetingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Meeting not found');
  },
  
  createMeeting: async (data: any) => {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...data,
      timestamp: Date.now(),
      status: 'scheduled',
      participants: []
    });
    return { id: docRef.id, ...data };
  },
  
  updateMeeting: async (meetingId: string, data: any) => {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deleteMeeting: async (meetingId: string) => {
    await deleteDoc(doc(db, 'meetings', meetingId));
    return { success: true };
  },
  
  joinMeeting: async (meetingId: string, userId: string) => {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, {
      participants: arrayUnion(userId)
    });
    return { success: true };
  },
  
  startMeeting: async (meetingId: string) => {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, {
      status: 'live'
    });
    return { success: true };
  },
  
  endMeeting: async (meetingId: string) => {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, {
      status: 'ended'
    });
    return { success: true };
  },
};

// ==================== FEEDBACK API ====================

export const feedbackApi = {
  submitFeedback: async (data: any) => {
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...data,
      timestamp: Date.now()
    });
    return { id: docRef.id, success: true, message: 'Feedback submitted successfully' };
  },
};

export default { 
  userApi, 
  postsApi, 
  notificationsApi, 
  groupsApi, 
  searchApi,
  videosApi,
  productsApi,
  conversationsApi,
  activitiesApi,
  inspirationsApi,
  collaborationsApi,
  liveStreamsApi,
  meetingsApi,
  feedbackApi
};
