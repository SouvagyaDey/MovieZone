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
  InputBase,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Movie as MovieIcon,
  Favorite as FavoriteIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <MovieIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ff4569, #ffd54f)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MovieZone
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              component={Link}
              to="/movies"
              color="inherit"
              sx={{ 
                color: isActive('/movies') || isActive('/') ? 'primary.main' : 'inherit',
                fontWeight: isActive('/movies') || isActive('/') ? 600 : 400,
              }}
            >
              Movies
            </Button>
            {isAuthenticated && (
              <Button
                component={Link}
                to="/wishlist"
                color="inherit"
                startIcon={<FavoriteIcon />}
                sx={{ 
                  color: isActive('/wishlist') ? 'primary.main' : 'inherit',
                  fontWeight: isActive('/wishlist') ? 600 : 400,
                }}
              >
                Wishlist
              </Button>
            )}
            {user?.is_staff && (
              <Button
                component={Link}
                to="/admin/movies"
                color="inherit"
                startIcon={<AdminIcon />}
                sx={{ 
                  color: isActive('/admin/movies') ? 'primary.main' : 'inherit',
                  fontWeight: isActive('/admin/movies') ? 600 : 400,
                }}
              >
                Admin
              </Button>
            )}
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha('#ffffff', 0.15),
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.25),
            },
            marginLeft: { xs: 1, sm: 3 },
            width: { xs: 'auto', sm: '300px' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Box
            sx={{
              padding: (theme) => theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: (theme) => theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${48}px)`,
                width: '100%',
              },
            }}
          />
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ p: 0 }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 36,
                    height: 36,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
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
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/wishlist'); handleClose(); }}>
                  My Wishlist
                </MenuItem>
                {user?.is_staff && (
                  <MenuItem onClick={() => { navigate('/admin/movies'); handleClose(); }}>
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                component={Link} 
                to="/login" 
                color="inherit"
                variant="outlined"
                size="small"
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                color="primary"
                variant="contained"
                size="small"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;