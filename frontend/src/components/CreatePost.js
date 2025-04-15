import React, { useState, useContext } from 'react';
import { postService } from '../services/postService';
import { AuthContext } from '../contexts/AuthContext';
import { Typography, Box, TextField, Button } from '@mui/material';

export function CreatePost({ userId, onPostCreated }) {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.id !== parseInt(userId)) {
      setError('Вы можете создавать посты только от своего имени');
      return;
    }

    try {
      const newPost = { title, content };
      await postService.createPost(userId, newPost);
      setTitle('');
      setContent('');
      setError(null);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'Неавторизованное действие'
          : err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.data?.detail || err.message || 'Ошибка при создании поста'
      );
    }
  };

  return (
    <Box className="container">
      <Typography variant="h5" gutterBottom>
        Создать пост
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Содержание"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
        >
          Опубликовать
        </Button>
      </form>
    </Box>
  );
}