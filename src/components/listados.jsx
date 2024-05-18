import React from "react";
import { Box, Grid, Avatar, Typography, IconButton, Paper, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';


const ListComponent = ({ title, data, columns, createLink, filterComponentProps, filterComponent: FilterComponent }) => {
  return (
    <Box mt={2}>
      <Paper elevation={2} style={{ padding: "16px" }}>
        
        <Box mt={2}  >
        {FilterComponent && (
          <FilterComponent  {...filterComponentProps} />
        )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                { columns.map((column, colIndex) => (
                  <Box key={colIndex} flexBasis="20%">
                    <Typography variant="body1" fontWeight="bold">
                      {column.label}
                    </Typography>
                  </Box>
                ))}
                <Box flexBasis="10%">
                  <Typography variant="body1" fontWeight="bold">
                    Actions
                  </Typography>
                </Box>
              </Box>
            </Grid>
            { data.length==0 ?
                <Grid item xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    No se encontraron resultados
                  </Typography>
                </Box>
              </Grid>
            : data.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {columns.map((column, colIndex) => (
                    <Box key={colIndex} flexBasis="20%">
                      <Typography variant="body2" color="textSecondary" style={{ whiteSpace: 'pre-line' }}>
                        {item[column.key]}
                      </Typography>
                    </Box>
                  ))}
                  <Box flexBasis="10%">
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ListComponent;
