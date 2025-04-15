import React, { useState, useContext } from 'react';
import { postService } from '../services/postService';
import { AuthContext } from '../contexts/AuthContext';
import { Typography, Box, Button, TextField } from '@mui/material';

export default function Post({ post }) {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [error, setError] = useState(null);
  const [postState, setPostState] = useState(post);

  const handleLike = async () => {
    try {
      if (postState.liked_by_me) {
        const updatedPost = await postService.unlikePost(postState.id);
        setPostState(updatedPost);
      } else {
        const updatedPost = await postService.likePost(postState.id);
        setPostState(updatedPost);
      }
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.data?.detail || err.message || 'Произошла ошибка'
      );
    }
  };

  const handleEdit = async () => {
    try {
      const updatedPost = await postService.updatePost(postState.id, { title, content });
      setPostState(updatedPost);
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.data?.detail || err.message || 'Произошла ошибка'
      );
    }
  };

  const handleDelete = async () => {
    try {
      await postService.deletePost(postState.id);
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.data?.detail || err.message || 'Произошла ошибка'
      );
    }
  };

  const isOwnPost = user && user.id === postState.user_id;

  return (
    <Box className="post">
      {error && <Typography color="error">{error}</Typography>}
      {isEditing ? (
        <>
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Содержание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            margin="normal"
            multiline
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
            style={{ marginRight: '1rem' }}
          >
            Сохранить
          </Button>
          <Button variant="outlined" onClick={() => setIsEditing(false)}>
            Отмена
          </Button>
        </>
      ) : (
        <>
          <Typography variant="h6">{postState.title}</Typography>
          <Typography>{postState.content}</Typography>
          <Typography>Лайков: {postState.likes_count}</Typography>
          {user && (
            <Button
              variant="contained"
              color={postState.liked_by_me ? "secondary" : "primary"}
              onClick={handleLike}
              style={{ marginTop: '0.5rem' }}
            >
              {postState.liked_by_me ? "Убрать лайк" : "Лайк"}
            </Button>
          )}
          {isOwnPost && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
                style={{ marginTop: '0.5rem', marginLeft: '1rem' }}
              >
                Редактировать
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                style={{ marginTop: '0.5rem', marginLeft: '1rem' }}
              >
                Удалить
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );
}