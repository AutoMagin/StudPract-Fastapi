import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0288d1', // Яркий синий для primary кнопок
      dark: '#0277bd', // Темнее для состояния hover
    },
    secondary: {
      main: '#f50057', // Яркий розовый для secondary кнопок
      dark: '#d81b60', // Темнее для состояния hover
    },
  },
});

export default theme;