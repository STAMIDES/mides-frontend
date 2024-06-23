import React, { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Grid, Typography, IconButton, Paper, Pagination } from "@mui/material";
import "./css/listado.css";
import { Link } from "react-router-dom";

const ListComponent = ({
  title,
  data,
  columns,
  detailLink="",
  filterComponentProps,
  filterComponent: FilterComponent,
  icons,
  iconsLinks,
  iconsTooltip,
  getFunction,
  pageCounter,
  onDelete,
  currentPage
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
    }
    setDeleteConfirmOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  return (
    <Box style={{width:"100%", marginTop:"10px"}} >
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
                        <Link to={`${detailLink}${item.id}`} className="link-hover-outline">
                        <Typography variant="body2" color="textSecondary" className="dataText">
                          {item[column.key]}
                        </Typography>
                        </Link>
                      </Box>
                    ))}
                    <Box flexBasis={`${100 / columns.length}%`} display="flex" justifyContent="center">
                    {icons.map((icon, iconIndex) => (
                          <IconButton
                            size="small"
                            key={iconIndex}
                            title={iconsTooltip[iconIndex]}
                            onClick={() => {
                              if (icon.type.type.render.displayName === 'DeleteIcon') {
                                handleDeleteClick(item);
                              } else {
                                window.location.href = iconsLinks[iconIndex] + item.id;
                              }
                            }}
                          >
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
          <Box>
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">Confirmar Borrado</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                ¿Estás seguro que deseas eliminar este {title.substr(0, title.length - 1).toLowerCase()}?
              </DialogContentText>
              {itemToDelete && (
                <Box  className="delete-container">
                  {columns.map((column, colIndex) => (
                    <Box key={colIndex} display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold" mr={1}>
                        {column.label}:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {itemToDelete[column.key]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDeleteCancel}>Cancelar</Button>
                <Button  color="error" onClick={handleDeleteConfirm} autoFocus>
                    Confirmar
                </Button>
            </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ListComponent;