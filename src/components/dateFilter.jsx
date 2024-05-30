import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

const DateFilter = ({ date, handleDateChange, getElementosFiltrados }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <DesktopDatePicker
            label="Date desktop"
            inputFormat="DD-MM-YYYY"
            outputFormat="DD-MM-YYYY"
            value={date}
            onChange={handleDateChange}
            renderInput={(params) => <TextField inputFormat="DD-MM-YYYY" {...params} />}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default DateFilter;
