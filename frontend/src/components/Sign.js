import React, { useState, useContext } from 'react';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, Snackbar, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function Sign() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');  // Добавляем состояние для name
  const [error, setError] = useState(null);
  const { login: loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await userService.register({ login, password, name });  // Передаем name в запрос
      loginUser(user);
      navigate('/auth');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box className="sign">
      <Typography variant="h4" gutterBottom>
        Регистрация
      </Typography>
      <form onSubmit={handleSubmit} autoComplete="off">
        <TextField
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoComplete="off"
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoComplete="off"
        />
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          autoComplete="off"
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
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </Box>
  );
}