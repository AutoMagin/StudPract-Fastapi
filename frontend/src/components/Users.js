import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { useLoading } from '../contexts/LoadingContext';
import { Typography, Box, List, ListItem, ListItemText, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';

export function Users() {
  const [usersResponse, setUsersResponse] = useState({ users: [], total: 0, skip: 0, limit: 5 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); // По умолчанию 5 пользователей на странице
  const [sortBy, setSortBy] = useState('id'); // По умолчанию сортировка по ID (возрастание)
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const response = await userService.getUsers(skip, limit, sortBy);
      setUsersResponse(response);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Необходима авторизация'
          : err.response?.status === 404
          ? 'Пользователи не найдены'
          : err.response?.data?.detail || err.message || 'Произошла ошибка при загрузке пользователей'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, sortBy, setLoading]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1); // Сбрасываем страницу на первую при изменении количества на странице
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Сбрасываем страницу на первую при изменении сортировки
  };

  if (error) return <div className="error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(usersResponse.total / limit);

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>
        Пользователи
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography>Всего пользователей: {usersResponse.total}</Typography>
        <Box display="flex" gap={2}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortByChange}
              label="Сортировка"
            >
              <MenuItem value="id">По ID (возрастание)</MenuItem>
              <MenuItem value="id_desc">По ID (убывание)</MenuItem>
              <MenuItem value="name">По имени (возрастание)</MenuItem>
              <MenuItem value="name_desc">По имени (убывание)</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small">
            <InputLabel>На странице</InputLabel>
            <Select
              value={limit}
              onChange={handleLimitChange}
              label="На странице"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {usersResponse.users.length === 0 ? (
        <Typography>Нет пользователей</Typography>
      ) : (
        <List>
          {usersResponse.users.map((user) => (
            <ListItem key={user.id} component={Link} to={`/users/${user.id}`}>
              <ListItemText primary={user.name || `User ${user.id}`} secondary={`Логин: ${user.login}`} />
            </ListItem>
          ))}
        </List>
      )}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}