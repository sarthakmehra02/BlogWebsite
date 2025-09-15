import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/index';
import { Link } from 'react-router-dom';

const COMMUNITIES = ["Coding & Development", "Technology & Gadgets", "Health & Wellness", "Travel & Adventure", "Food & Cooking", "Finance & Investing", "Arts & Culture", "Personal Growth"];

const HomePage = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState(COMMUNITIES[0]);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState('All');

  const fetchPosts = useCallback(async () => {
    try {
      const encodedCommunity = encodeURIComponent(selectedCommunity);
      // THIS IS THE FIX for the 404 error
      const url = selectedCommunity === 'All'
        ? '/api/articles'
        : `/api/articles/community/${encodedCommunity}`;
      const response = await API.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    }
  }, [selectedCommunity]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const resetForm = () => { setTitle(''); setContent(''); setCommunity(COMMUNITIES[0]); setEditingPost(null); };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const postData = { title, content, community };
    try {
      if (editingPost) {
        await API.put(`/api/articles/${editingPost._id}`, postData); // RENAMED
      } else {
        await API.post('/api/articles', postData); // RENAMED
      }
      resetForm();
      if (selectedCommunity !== community) {
        setSelectedCommunity(community);
      } else {
        fetchPosts();
      }
    } catch (error) { console.error("Error saving post:", error); }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await API.delete(`/api/articles/${postId}`); // RENAMED
        fetchPosts();
      } catch (error) { console.error("Error deleting post:", error); }
    }
  };

  const startEditing = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setCommunity(post.community);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      {user ? (
        <div className="form-container">
          <h2>{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
          <form onSubmit={handleCreateOrUpdate}>
            <input type="text" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <select value={community} onChange={(e) => setCommunity(e.target.value)} required>
              {COMMUNITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Post Content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
            <button type="submit">{editingPost ? 'Update Post' : 'Create Post'}</button>
            {editingPost && <button type="button" onClick={resetForm}>Cancel Edit</button>}
          </form>
        </div>
      ) : (
        <div className="welcome-guest">
          <h2>Welcome to My Blog</h2>
          <p>Please <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to create a post and join the communities.</p>
        </div>
      )}
      <div className="community-filters">
        <button onClick={() => setSelectedCommunity('All')} className={selectedCommunity === 'All' ? 'active' : ''}>All Posts</button>
        {COMMUNITIES.map(c => (
          <button key={c} onClick={() => setSelectedCommunity(c)} className={selectedCommunity === c ? 'active' : ''}>{c}</button>
        ))}
      </div>
      <div className="posts-container">
        <h2 className="page-title">{selectedCommunity}</h2>
        {posts.length > 0 ? posts.map((post) => (
          <div key={post._id} className="post">
            <h3>{post.title}</h3>
            <p className="author">by {post.authorUsername}</p>
            {post.community && (
              <p className="post-community">
                in <button onClick={() => setSelectedCommunity(post.community)}>{post.community}</button>
              </p>
            )}
            <p>{post.content}</p>
            {user && user.id === post.author && (
              <div className="post-actions">
                <button onClick={() => startEditing(post)}>Edit</button>
                <button onClick={() => handleDelete(post._id)} className="delete-btn">Delete</button>
              </div>
            )}
          </div>
        )) : <p>No posts in this community yet. Be the first!</p>}
      </div>
    </div>
  );
};

export default HomePage;