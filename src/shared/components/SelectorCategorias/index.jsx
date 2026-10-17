// Selector múltiple de categorías (categorías del proveedor): registro público, Mi negocio y panel.
// value y onChange trabajan con ids.
import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, Chip, TextField } from '@mui/material';

const SelectorCategorias = ({ categorias, value, onChange, label = 'Categorías de experiencias que ofreces', helperText, disabled }) => (
  <Autocomplete
    multiple
    disabled={disabled}
    options={categorias}
    getOptionLabel={(c) => c.nombre}
    value={categorias.filter((c) => value.includes(c.id))}
    onChange={(_, elegidas) => onChange(elegidas.map((c) => c.id))}
    isOptionEqualToValue={(a, b) => a.id === b.id}
    renderTags={(elegidas, getTagProps) =>
      elegidas.map((c, i) => <Chip size='small' label={c.nombre} {...getTagProps({ index: i })} key={c.id} />)
    }
    renderInput={(params) => <TextField {...params} label={label} helperText={helperText} />}
  />
);

SelectorCategorias.propTypes = {
  categorias: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SelectorCategorias;
