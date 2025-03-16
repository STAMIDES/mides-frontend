import React, { useState, useCallback, useRef } from "react";
import { Box, InputBase, Button, IconButton, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Header = ({ 
  createLink = null,
  createMessage = "Crear Nuevo", 
  onSearch,
  title = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  const debouncedSearch = useRef(
    debounce((value) => {
      onSearch(value);
    }, 500)
  ).current;

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  return (
    <Box 
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        py: 2,
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}
    >
      {/* Title area */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {title && (
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: "#1e1e2d",
              mr: 2
            }}
          >
            {title}
          </Typography>
        )}
        
        {/* Create button */}
        {createLink && (
          <Link to={createLink} style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "rgba(102, 108, 255, 0.9)",
                textTransform: "none",
                borderRadius: "8px",
                px: 2,
                py: 1,
                boxShadow: "0 4px 12px rgba(102, 108, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(102, 108, 255, 1)",
                  boxShadow: "0 6px 15px rgba(102, 108, 255, 0.3)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.2s"
              }}
            >
              {createMessage}
            </Button>
          </Link>
        )}
      </Box>

      {/* Search area */}
      <Box 
        sx={{ 
          position: "relative",
          width: { xs: "100%", sm: "320px" },
          maxWidth: "100%"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            width: "100%",
            backgroundColor: searchFocused ? "white" : "#f5f5f9",
            borderRadius: "10px",
            px: 2,
            boxShadow: searchFocused 
              ? "0 4px 12px rgba(0,0,0,0.08)" 
              : "0 2px 6px rgba(0,0,0,0.03)",
            transition: "all 0.2s ease",
            border: searchFocused 
              ? "1px solid rgba(102, 108, 255, 0.5)" 
              : "1px solid black",
          }}
        >
          <SearchIcon
            sx={{
              color: searchFocused ? "rgba(102, 108, 255, 0.9)" : "#666",
              mr: 1,
              transition: "color 0.2s",
            }}
          />
          <InputBase
            placeholder="Buscar..."
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              py: 1,
              fontSize: "0.95rem",
              "& input": {
                transition: "all 0.2s"
              }
            }}
          />
          {searchTerm && (
            <IconButton
              size="small"
              onClick={() => {
                setSearchTerm("");
                debouncedSearch("");
              }}
              sx={{ 
                p: 0.5,
                fontSize: "0.8rem",
                color: "#666"
              }}
            >
              ×
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;