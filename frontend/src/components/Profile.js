import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useLoading } from '../contexts/LoadingContext';
import { Typography, Box, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffIcon from '@mui/icons-material/ThumbUpOutlined';

export function Profile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (id) {
      setLoading(true);
      userService
        .get(id)
        .then((response) => {
          setProfileUser(response);
          return postService.getPostsByUser(id);
        })
        .then((postsResponse) => {
          setPosts(postsResponse);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, setLoading]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent) {
      setError('Содержимое поста не может быть пустым');
      return;
    }
    try {
      const newPost = await postService.createPost(id, { content: newPostContent });
      setPosts([...posts, newPost]);
      setNewPostContent('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleUpdatePost = async (postId) => {
    if (!editContent) {
      setError('Содержимое поста не может быть пустым');
      return;
    }
    try {
      const updatedPost = await postService.updatePost(postId, { content: editContent });
      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)));
      setEditingPost(null);
      setEditContent('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLike = async (postId, likedByMe) => {
    try {
      const response = likedByMe
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);
      setPosts(posts.map((post) =>
        post.id === postId
          ? { ...post, likes_count: response.likes_count, liked_by_me: response.liked_by_me }
          : post
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <Box className="profile">
      <Typography variant="h4" gutterBottom>
        Профиль
      </Typography>
      {profileUser ? (
        <>
          <Typography variant="body1"><strong>ID:</strong> {profileUser.id}</Typography>
          <Typography variant="body1"><strong>Имя:</strong> {profileUser.name || 'Не указано'}</Typography>
          <Typography variant="body1"><strong>Логин:</strong> {profileUser.login || 'Не указано'}</Typography>

          <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
            Посты
          </Typography>
          <List>
            {posts.map((post) => (
              <ListItem key={post.id} divider>
                {editingPost === post.id ? (
                  <>
                    <TextField
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                    <Button
                      onClick={() => handleUpdatePost(post.id)}
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: '1rem' }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      onClick={() => setEditingPost(null)}
                      variant="outlined"
                      color="secondary"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Отмена
                    </Button>
                  </>
                ) : (
                  <>
                    <ListItemText primary={post.content} />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => handleLike(post.id, post.liked_by_me)}
                        disabled={!user}
                      >
                        {post.liked_by_me ? <ThumbUpIcon /> : <ThumbUpOffIcon />}
                      </IconButton>
                      <Typography variant="body2">{post.likes_count}</Typography>
                      {user && user.id === parseInt(id) && (
                        <>
                          <IconButton onClick={() => handleEditPost(post)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeletePost(post.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </>
                )}
              </ListItem>
            ))}
          </List>

          {user && user.id === parseInt(id) && (
            <Box component="form" onSubmit={handleCreatePost} style={{ marginTop: '1rem' }}>
              <TextField
                label="Новый пост"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <Button type="submit" variant="contained" color="primary">
                Создать пост
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1">Пользователь не найден</Typography>
      )}
    </Box>
  );
}