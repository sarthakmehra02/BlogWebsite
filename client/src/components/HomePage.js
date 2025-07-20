import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api';


const HomePage = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const fetchPosts = async () => {
    const response = await axios.get(`${API_URL}/posts`);
    setPosts(response.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const postData = { title, content };

    try {
      if (editingPost) {
        await axios.put(`${API_URL}/posts/${editingPost._id}`, postData, getAuthConfig());
      } else {
        await axios.post(`${API_URL}/posts`, postData, getAuthConfig());
      }
      setTitle('');
      setContent('');
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert(error.response.data);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, getAuthConfig());
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response.data);
    }
  };

  const startEditing = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo(0, 0); 
  };

  return (
    <div>
      {}
      {user && (
        <div className="form-container">
          <h2>{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
          <form onSubmit={handleCreateOrUpdate}>
            <input type="text" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Post Content" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
            <button type="submit">{editingPost ? 'Update Post' : 'Create Post'}</button>
            {editingPost && <button type="button" onClick={() => { setEditingPost(null); setTitle(''); setContent(''); }}>Cancel</button>}
          </form>
        </div>
      )}

      {}
      <div className="posts-container">
        <h2>Latest Posts</h2>
        {posts.map((post) => (
          <div key={post._id} className="post">
            <h3>{post.title}</h3>
            <p className="author">by {post.authorUsername}</p>
            <p>{post.content}</p>
            {user && user.id === post.author && (
              <div className="post-actions">
                <button onClick={() => startEditing(post)}>Edit</button>
                <button onClick={() => handleDelete(post._id)} className="delete-btn">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;