import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import moment from 'moment';

const DateFilter = ({ defaultValue, getElementosFiltrados }) => {
  const [date, setDate] = useState(moment(defaultValue, "YYYY-MM-DD"));
  moment.locale('en', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });
  useEffect(() => {
    if (defaultValue) {
      setDate(moment(defaultValue, "YYYY-MM-DD"));
    }
  }, [defaultValue]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (moment(newDate, "DD-MM-YYYY", true).isValid()) {
      getElementosFiltrados(newDate.format("YYYY-MM-DD"));
    }
  };
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
