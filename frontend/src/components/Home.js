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
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found, redirecting to login...');
      return;
    }

    setLoading(true);
    postService
      .getPosts()
      .then((response) => {
        setPosts(response.posts || response); 
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

        // Дополнительно: если всё-таки получили 401, перенаправляем
        if (err.response?.status === 401) {
          localStorage.removeItem('token'); // Удаляем недействительный токен
          window.location.href = '/sign';
        }
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