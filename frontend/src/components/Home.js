import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { useLoading } from '../contexts/LoadingContext';
import { Typography, Box, List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffIcon from '@mui/icons-material/ThumbUpOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export function Home() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();
  const postsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    postService
      .getPosts((page - 1) * postsPerPage, postsPerPage)
      .then((response) => {
        setPosts(response);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message === 'An unexpected error occurred' ? 'Произошла непредвиденная ошибка' : err.message);
        setLoading(false);
      });
  }, [page, setLoading]);

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
      setError(err.message === 'An unexpected error occurred' ? 'Произошла непредвиденная ошибка' : err.message);
    }
  };

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <Box className="home">
      <Typography variant="h4" gutterBottom>
        Добро пожаловать в блог
      </Typography>
      {!user && (
        <Box display="flex" justifyContent="center" marginBottom="2rem">
          <Button
            component={Link}
            to="/auth"
            startIcon={<LoginIcon />}
            variant="contained"
            color="primary"
            style={{ marginRight: '1rem' }}
          >
            Вход
          </Button>
          <Button
            component={Link}
            to="/sign"
            startIcon={<PersonAddIcon />}
            variant="contained"
            color="secondary"
          >
            Регистрация
          </Button>
        </Box>
      )}
      <Typography variant="body1" gutterBottom>
        Здесь отображаются последние посты.
      </Typography>
      {posts.length === 0 ? (
        <Typography variant="body1">Постов пока нет.</Typography>
      ) : (
        <List>
          {posts.map((post) => (
            <ListItem key={post.id} divider>
              <ListItemText primary={post.content} secondary={`Автор: User ${post.user_id}`} />
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleLike(post.id, post.liked_by_me)}
                  disabled={!user}
                >
                  {post.liked_by_me ? <ThumbUpIcon /> : <ThumbUpOffIcon />}
                </IconButton>
                <Typography variant="body2">{post.likes_count}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      <Box display="flex" justifyContent="center" marginTop="1rem">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Назад
        </Button>
        <Typography variant="body1" style={{ margin: '0 1rem' }}>
          Страница {page}
        </Typography>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={posts.length < postsPerPage}
        >
          Вперед
        </Button>
      </Box>
    </Box>
  );
}