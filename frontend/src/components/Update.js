// frontend/src/components/Update.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { TextField, Button, Typography, Box } from '@mui/material';

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { setLoading } = useLoading();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || parseInt(id) !== user.id) {
      navigate(`/users/${id}`);
      return;
    }

    setLoading(true);
    userService
      .get(id)
      .then((response) => {
        setName(response.name || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.status === 401
            ? 'Необходима авторизация'
            : err.response?.status === 404
            ? 'Пользователь не найден'
            : err.response?.data?.detail || err.message || 'Произошла ошибка при загрузке данных'
        );
        setLoading(false);
      });
  }, [id, user, navigate, setLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await userService.update(id, { name });
      setUser(updatedUser);
      navigate(`/users/${id}`);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.status === 404
          ? 'Пользователь не найден'
          : err.response?.data?.detail || err.message || 'Произошла ошибка при сохранении'
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Обновить профиль
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
        >
          Сохранить
        </Button>
      </form>
    </Box>
  );
}