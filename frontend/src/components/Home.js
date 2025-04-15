// frontend/src/components/Home.js
import React, { useEffect, useState } from 'react';
import { postService } from '../services/postService';
import { useLoading } from '../contexts/LoadingContext';
import { Typography, Box } from '@mui/material';
import Post from './Post';

export function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    postService
      .getPosts()
      .then((response) => {
        setPosts(response);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.status === 401
            ? 'Необходима авторизация'
            : err.response?.status === 404
            ? 'Посты не найдены'
            : err.response?.data?.detail || err.message || 'Произошла ошибка при загрузке постов'
        );
        setLoading(false);
      });
  }, [setLoading]);

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Посты
      </Typography>
      {posts.length === 0 ? (
        <Typography>Нет постов</Typography>
      ) : (
        posts.map((post) => <Post key={post.id} post={post} className="post" />)
      )}
    </Box>
  );
}