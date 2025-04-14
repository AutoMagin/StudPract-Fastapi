import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LoginIcon from '@mui/icons-material/Login'; // Добавляем импорт
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Добавляем импорт

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/auth');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton component={Link} to="/" edge="start" color="inherit" aria-label="home">
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Блог
        </Typography>
        {!user ? (
          <>
            <Button component={Link} to="/auth" color="inherit" startIcon={<LoginIcon />}>
              Вход
            </Button>
            <Button component={Link} to="/sign" color="inherit" startIcon={<PersonAddIcon />}>
              Регистрация
            </Button>
          </>
        ) : (
          <>
            <Button component={Link} to="/users" color="inherit">
              Пользователи
            </Button>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenu}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Typography>{user.name || user.login || `User ${user.id}`}</Typography>
              <ArrowDropDownIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to={`/users/${user.id}`} onClick={handleClose}>
                Профиль
              </MenuItem>
              <MenuItem component={Link} to={`/users/${user.id}/update`} onClick={handleClose}>
                Обновить
              </MenuItem>
              <MenuItem onClick={handleLogout}>Выход</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}