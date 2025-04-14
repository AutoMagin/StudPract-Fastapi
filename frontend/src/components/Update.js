import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { TextField, Button, Typography, Box } from '@mui/material';

export function Update() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id !== parseInt(id)) {
      navigate(`/users/${user.id}`);
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
        setError(err.message);
        setLoading(false);
      });
  }, [id, user, setLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.update(id, { name });
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <Box className="update">
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