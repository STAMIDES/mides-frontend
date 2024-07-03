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
    <Box className="list-wrapper">
      <Paper elevation={2} className="list-paper">
        <Box className="list-content">
          {FilterComponent && <FilterComponent {...filterComponentProps} />}
          <div className="table-responsive">
            <table className="list-table">
              <thead>
                <tr>
                  {columns.map((column, colIndex) => (
                    <th key={colIndex} className="header-cell">
                      <Typography variant="body1" className="headerText">
                        {column.label}
                      </Typography>
                    </th>
                  ))}
                  <th className="header-cell">
                    <Typography variant="body1" className="headerText">
                      Acciones
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="no-results">
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron resultados
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index} className="grid-item">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="data-cell">
                          <Link to={`${detailLink}${item.id}`} className="link-hover-outline">
                            <Typography variant="body2" color="textSecondary" className="dataText">
                              {item[column.key]}
                            </Typography>
                          </Link>
                        </td>
                      ))}
                      <td className="data-cell actions-cell">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {currentPage && pageCounter > 1 ? (
            <Pagination 
              count={pageCounter}
              className="pagination"
              variant="outlined" 
              color="primary"
              onChange={(event, value) => getFunction(value)}
              shape="rounded"
              page={currentPage}
            />
          ) : pageCounter > 1 ? (
            <Pagination
              className="pagination"
              count={pageCounter}
              variant="outlined"
              color="primary"
              onChange={(event, value) => getFunction(value)}
              shape="rounded"
            />
          ) : null}
        </Box>
      </Paper>
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
            <Box className="delete-container">
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
          <Button color="error" onClick={handleDeleteConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListComponent;