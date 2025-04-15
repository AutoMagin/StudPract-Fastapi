import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { AuthContext } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { Typography, Box, Button } from '@mui/material';
import Post from './Post';
import { CreatePost } from './CreatePost';

export function Profile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userResponse = await userService.get(id);
      setProfile(userResponse);
      const postsResponse = await postService.getPostsByUser(id);
      setPosts(postsResponse);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.status === 404
          ? 'Пользователь или посты не найдены'
          : err.response?.data?.detail || err.message || 'Произошла ошибка при загрузке профиля'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, setLoading]);

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  if (!profile) {
    return <Typography className="container">Загрузка...</Typography>;
  }

  const isOwnProfile = user && user.id === parseInt(id);

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Профиль {profile.name || `User ${profile.id}`}
      </Typography>
      <Typography variant="subtitle1">Логин: {profile.login}</Typography>
      {isOwnProfile && (
        <>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href={`/users/${id}/update`}
            style={{ margin: '1rem 0' }}
          >
            Обновить профиль
          </Button>
          <CreatePost userId={id} onPostCreated={fetchProfile} />
        </>
      )}
      <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
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