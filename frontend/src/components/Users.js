import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { useLoading } from '../contexts/LoadingContext';
import { Link } from 'react-router-dom';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    userService
      .getAll()
      .then((response) => {
        setUsers(response);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [setLoading]);

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="users">
      <Typography variant="h4" gutterBottom>
        Пользователи
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Логин</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name || 'Не указано'}</TableCell>
              <TableCell>{user.login}</TableCell>
              <TableCell>
                <Link to={`/users/${user.id}`}>Подробнее</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}