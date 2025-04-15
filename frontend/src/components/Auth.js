import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, Typography, Box } from '@mui/material';

export function Auth() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.login({ login, password });
      console.log('Login response:', response);  // Логирование ответа
      localStorage.setItem('token', response.token);
      setUser(response);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Неверный логин или пароль'
          : err.response?.data?.detail || err.message || 'Ошибка входа'
      );
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Вход
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Войти
        </Button>
      </form>
    </Box>
  );
}