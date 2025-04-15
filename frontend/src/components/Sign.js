import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, Typography, Box } from '@mui/material';

export function Sign() {
  const [login, setLogin] = useState('');
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.create({ login, name, password });
      localStorage.setItem('token', response.token);
      setUser(response);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка регистрации');
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Регистрация
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
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          Зарегистрироваться
        </Button>
      </form>
    </Box>
  );
}