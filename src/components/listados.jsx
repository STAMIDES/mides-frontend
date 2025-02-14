import React, { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Grid, Typography, IconButton, Paper, Pagination } from "@mui/material";
import "./css/listado.css";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
const ListComponent = ({
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
  setStatus,
  onDelete,
  currentPage
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
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
  const handleNavigation = (id) => {
    navigate(`${detailLink}${id}`);
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
                  { icons.length > 0 && <th className="header-cell">
                    <Typography variant="body1" className="headerText">
                      Acciones
                    </Typography>
                  </th>}
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
                          <div className="link-hover-outline" onClick={() => handleNavigation(item.id)} style={{ cursor: 'pointer' }}>
                            {!column.columns ? (
                              <Typography variant="body2" color="textSecondary" className="dataText">
                                {column.key === 'activo' ? item[column.key] ? 'Si' : 'No' : item[column.key]}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="textSecondary" className="dataText">
                                {item[column.key].map((innerItem, indexData) => (
                                  <div key={indexData}>
                                    {column.columns.map((subColumn, subColIndex) => (
                                      <div key={subColIndex}>
                                        {subColumn.label ? <strong>{subColumn.label}:</strong> : null}
                                        {innerItem?.[subColumn.key]}
                                      </div>
                                    ))}
                                    {column.borderSeparation && indexData < item[column.key].length - 1 && (
                                      <div>-------------------</div>
                                    )}
                                  </div>
                                ))}
                              </Typography>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="data-cell actions-cell">
                        {icons.map((icon, iconIndex) => {
                          if (icon.type.type.render.displayName === 'ToggleOnIcon' && item.activo === true) {
                            return null;
                          }
                          if (icon.type.type.render.displayName === 'ToggleOffIcon' && item.activo === false) {
                            return null;
                          }
                          return (
                            <IconButton
                              size="small"
                              key={iconIndex}
                              title={iconsTooltip[iconIndex]}
                              onClick={() => {
                                if (icon.type.type.render.displayName === 'DeleteIcon') {
                                  handleDeleteClick(item);
                                } else if (icon.type.type.render.displayName === 'ToggleOnIcon') {
                                  setStatus(item.id, true);
                                } else if ( icon.type.type.render.displayName === 'ToggleOffIcon'){
                                  setStatus(item.id, false);
                                }else {
                                  navigate(`${iconsLinks[iconIndex]}${item.id}`);
                                }
                              }}
                            >
                              {icon}
                            </IconButton>
                          );
                        })}
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
            ¿Estás seguro que deseas eliminar a?
          </DialogContentText>
          {itemToDelete && (
            <Box className="delete-container">
              {columns.map((column, colIndex) => (
                !column.columns && (
                <Box key={colIndex} display="flex" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight="bold" mr={1}>
                    {column.label}:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {column.key === 'activo' ? itemToDelete[column.key] ? 'Si' : 'No' : itemToDelete[column.key]}
                  </Typography>
                </Box>)
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