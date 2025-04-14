import React, { useState, useContext } from 'react';
import { userService } from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, Snackbar, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function Auth() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login: loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await userService.login({ login, password });  // Здесь используется userService.login
      loginUser(user);
      navigate(`/users/${user.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box className="auth">
      <Typography variant="h4" gutterBottom>
        Вход
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