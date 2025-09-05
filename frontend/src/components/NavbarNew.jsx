import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Container,
  InputBase,
  alpha
} from '@mui/material';
import {
  Movie as MovieIcon,
  Search as SearchIcon,
  AccountCircle,
  Favorite,
  Menu as MenuIcon,
  Login,
  PersonAdd
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#f5c518', 0.15),
  border: '1px solid #f5c518',
  '&:hover': {
    backgroundColor: alpha('#f5c518', 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#f5c518'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/movies');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isMenuOpen = Boolean(anchorEl);

  const menuItems = [
    { label: 'Movies', path: '/movies', icon: <MovieIcon /> },
    { label: 'Wishlist', path: '/wishlist', icon: <Favorite /> }
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1a1a 100%)',
        borderBottom: '1px solid #333333'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: 4
              }}
              onClick={() => navigate('/movies')}
            >
              <Box
                sx={{
                  backgroundColor: '#f5c518',
                  color: '#000000',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  mr: 1,
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                IMDb
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#ffffff',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Movie Reviews
              </Typography>
            </Box>
          </motion.div>

          {/* Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {menuItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? '#f5c518' : '#ffffff',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    mx: 1,
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha('#f5c518', 0.1),
                      color: '#f5c518'
                    },
                    position: 'relative',
                    '&::after': location.pathname === item.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#f5c518',
                      borderRadius: '2px'
                    } : {}
                  }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </Box>

          {/* Search Bar */}
          <Search sx={{ mr: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search movies…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
            />
          </Search>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Chip
                  label={`Welcome, ${user?.username || 'User'}`}
                  variant="outlined"
                  sx={{
                    color: '#f5c518',
                    borderColor: '#f5c518',
                    display: { xs: 'none', sm: 'flex' }
                  }}
                />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    sx={{ color: '#f5c518' }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#f5c518', color: '#000000' }}>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </motion.div>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: '#f5c518',
                      color: '#f5c518',
                      '&:hover': {
                        borderColor: '#daa520',
                        backgroundColor: alpha('#f5c518', 0.1)
                      }
                    }}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(45deg, #f5c518 0%, #daa520 100%)',
                      color: '#000000',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #daa520 0%, #b8860b 100%)'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            mt: 1
          }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/wishlist'); }}>
          <Favorite sx={{ mr: 2, color: '#f5c518' }} />
          My Wishlist
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <AccountCircle sx={{ mr: 2, color: '#f5c518' }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
