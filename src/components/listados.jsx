import React from "react";
import { Box, Grid, Typography, IconButton, Paper, Pagination } from "@mui/material";
import "./css/listado.css";

const ListComponent = ({
  data,
  columns,
  filterComponentProps,
  filterComponent: FilterComponent,
  icons,
  iconsLinks,
  iconsTooltip,
  getFunction,
  pageCounter,
  currentPage
}) => {
  return (
    <Box style={{width:"100%"}} >
      <Paper elevation={2} style={{ padding: "16px" }}>
        <Box mt={2}>
          {FilterComponent && <FilterComponent {...filterComponentProps} />}
          <Grid container spacing={0.1}  display="flex" justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {columns.map((column, colIndex) => (
                  <Box key={colIndex} flexBasis={`${100 / columns.length}%`}>
                    <Typography variant="body1" fontWeight="bold" className="headerText">
                      {column.label}
                    </Typography>
                  </Box>
                ))}
                <Box flexBasis={`${100 / columns.length}%`}>
                  <Typography variant="body1" fontWeight="bold" className="headerText">
                    Acciones
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {data.length === 0 ? (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    No se encontraron resultados
                  </Typography>
                </Box>
              </Grid>
            ) : (
              data.map((item, index) => (
                <Grid item xs={12} key={index} className="grid-item">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    {columns.map((column, colIndex) => (
                      <Box key={colIndex} flexBasis={`${100 / columns.length}%`}>
                        <Typography variant="body2" color="textSecondary" className="dataText">
                          {item[column.key]}
                        </Typography>
                      </Box>
                    ))}
                    <Box flexBasis={`${100 / columns.length}%`} display="flex" justifyContent="center">
                      {icons.map((icon, iconIndex) => (
                        <IconButton size="small" href={iconsLinks[iconIndex]} key={iconIndex} title={iconsTooltip[iconIndex]}>
                          {icon}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))
              )}
              {currentPage && pageCounter>1 ?
                <Pagination 
                count={pageCounter} 
                variant="outlined" 
                color="primary"
                onChange={(event, value) => getFunction(value)}
                shape="rounded"
                page={currentPage}
                />
                : pageCounter>1 ?
                <Pagination
                count={pageCounter}
                variant="outlined"
                color="primary"
                onChange={(event, value) => getFunction(value)}
                shape="rounded"
                />
                : null}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ListComponent;