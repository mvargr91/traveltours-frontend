import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form , useFormikContext} from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import { useDispatch, useSelector } from 'react-redux';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import MyDateField from '../../../../shared/components/MyDateField';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import defaultConfig from '@crema/constants/defaultConfig';
import { DATO_BOOLEAN_RADIO, ESTADO_ACTIVIDADES_POR_PROYECTO } from '../../../../shared/constants/ListaValores';

const options = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const customConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'fontColor',
    'fontSize',
    '|',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote'
  ],
  placeholder: 'Escribe algo aquí...',
  contentsCss: [
    'body { color: #ff0000 !important; font-family: Arial, sans-serif; }', // Configuración de color rojo
  ],
  fontColor: {
    colors: [
      { color: '#ff0000', label: 'Red' },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
  },
};




const useStyles = makeStyles((theme) => ({
  bottomsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px',
    gap: '10px',
    paddingRight: '20px',
    position: 'sticky',
    left: 0,
    bottom: 0,
  },
  myTextField: {
    width: '100%',
    marginBottom: 5,    
    height: '60px',
  },
  widthFull: {
    width: '100%',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const ActividadPorProyectoForm = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { setFieldValue, values: formikValues } = useFormikContext();
  const { handleOnClose, accion, initialValues, titulo, values, tiposProyectos, proyectos, ciudades, ActividadPorProyecto } = props;
  const { coleccionLigera: etapasProyectos } = useSelector((state) => state.etapaProyecto);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  useEffect(() => {  
    if(values.id_tipo_proyecto){
      dispatch(onGetEtapasProyectos({id_tipo_proyecto: values.id_tipo_proyecto}));   

    }
  }, [dispatch, values.id_tipo_proyecto]);

  const classes = useStyles(props);

  console.log(ActividadPorProyecto)

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 600 }}>
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          <Box
            component='h6'
            mb={{ xs: 4, xl: 6 }}
            fontSize={20}
            fontWeight={Fonts.MEDIUM}
          >
            {titulo}
          </Box>

          <Box px = {{md: 5, lg: 8, xl: 10}}>    
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                  }} 
                >                
                  <FormikAutocomplete
                    options={proyectos}
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },paddingRight: 4  }}
                    name="id_proyecto"
                    inputValue={initialValues.id_proyecto}
                    label="Proyecto"
                    InputLabelProps={{
                       shrink: true,
                     }}
                    disabled={true}
                    className={classes.myTextField}
                    variant="standard"
                    fullWidth
                  />
                  <MyTextField 
                     className = {classes.myTextField} 
                     label = 'Código Proyecto' 
                     name = 'codigo_proyecto' 
                     disabled = {true}
                     InputLabelProps={{
                       shrink: true,
                     }} 
                  />
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                  }} 
                >                
                  <FormikAutocomplete
                    options={tiposProyectos}
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },paddingRight: 4  }}
                    name="id_tipo_proyecto"
                    inputValue={initialValues.id_tipo_proyecto}
                    label="Tipo Proyecto"
                    InputLabelProps={{
                       shrink: true,
                     }}
                    disabled={true}
                    className={classes.myTextField}
                    variant="standard"
                    fullWidth
                    required
                  />
                  <FormikAutocomplete
                    options={ciudades}
                    name="ciudad_id"
                    inputValue={initialValues.ciudad_id}
                    label="Ciudad"
                    disabled={true}
                    className={classes.myTextField}
                    variant="standard"
                    fullWidth
                    required
                  />
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                  }} 
                >                
                  <FormikAutocomplete
                    options={etapasProyectos}
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    } }}
                    name="id_etapa_proyecto"
                    inputValue={initialValues.id_etapa_proyecto}
                    label="Etapa proyecto"
                    InputLabelProps={{
                       shrink: true,
                     }}
                    disabled={true}
                    className={classes.myTextField}
                    variant="standard"
                    fullWidth
                  />
                  <MyTextField 
                     className = {classes.myTextField} 
                     label = 'Actividad' 
                     name = 'nombre_actividad' 
                     disabled = {true}
                     InputLabelProps={{
                       shrink: true,
                     }}
                  />
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                  }} 
                >   
                <MyDateField
                    name="fecha_ejecucion"
                    label="Fecha ejecución"
                    disabled={disabled}
                    fullWidth
                    variant="standard"
                    InputProps={{
                      inputComponent: Input,
                      disableUnderline: false,
                    }}
                    sx={{                
                      '& .MuiInput-underline:before': {
                        borderBottomColor: '#ccc',
                        marginBottom: -0.1,
                      },
                      '& .MuiInput-underline:hover:before': {
                        borderBottomColor: theme.palette.text.primary,
                      },
                      '& .MuiInput-underline:after': {
                        borderBottomColor: theme.palette.text.primary,
                      }
                      ,paddingRight: 4 
                    }}
                  />
                  <FormikAutocomplete            
                    options={
                      accion !== 'ver'
                        ? ESTADO_ACTIVIDADES_POR_PROYECTO.filter((item) => item.estado === 1)
                        : ESTADO_ACTIVIDADES_POR_PROYECTO
                    }
                    name='estado_actividad'
                    inputValue={initialValues.estado_actividad}
                    label='Estado *'
                    disabled={disabled}            
                    className={classes.myTextField}
                    variant='standard'
                    fullWidth
                    required
                  /> 
                  </Box>
                  {
                    ActividadPorProyecto.indicativo_fecha_vcmto === 'S' && (
                        <Box
                          sx={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2,1fr)',
                          }} 
                        >                    
                          <MyDateField
                            name="fecha_compromiso"
                            label="Fecha compromiso"
                            disabled={disabled}
                            fullWidth
                            variant="standard"
                            InputProps={{
                              inputComponent: Input,
                              disableUnderline: false,
                            }}
                            sx={{                
                              '& .MuiInput-underline:before': {
                                borderBottomColor: '#ccc',
                                marginBottom: -0.1,
                              },
                              '& .MuiInput-underline:hover:before': {
                                borderBottomColor: theme.palette.text.primary,
                              },
                              '& .MuiInput-underline:after': {
                                borderBottomColor: theme.palette.text.primary,
                              }
                              ,paddingRight: 4 ,
                              marginBottom: 2
                            }}
                          />
                        </Box>
                    )
                  }

                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(1fr)',
                    }} 
                  >                    
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                        className = {classes.myTextField} 
                        label = 'Observación' 
                        name = 'observaciones' 
                        disabled = {disabled}                      
                    />
                  </Box>
                  <Box
  sx={{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    mt: 2,
  }}
>
  {accion === 'ver' ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {initialValues?.nombre_archivo ? (
        <>
        <Box sx={{ fontSize: 10, color: theme.palette.text.secondary, display: 'grid'}}>
            Documento anexo
          <a
            href={`${defaultConfig.API_URL}/descargarActividades/${initialValues.id_proyecto}/${initialValues.id_etapa_proyecto}/${initialValues.id_actividad_proyecto}/${encodeURIComponent(initialValues.nombre_archivo)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color:  theme.palette.secondary.light,
              marginTop:12,
            }}
            // Si quieres forzar descarga en navegadores que lo respetan:
            download
          >
            <DownloadIcon fontSize="small" />
            
            <Box sx={{ fontSize: 14, color: theme.palette.secondary.light }}>
              {initialValues.nombre_archivo}
            </Box>
          </a>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ fontSize: 10, color: theme.palette.text.secondary }}>
            Documento anexo
            <Box sx={{ fontSize: 12, color: theme.palette.text.secondary, marginTop:5 }}>
              Sin documento anexo
            </Box>
          </Box>          
        </>
      )}
    </Box>
  ) : (
    // === UI de carga/gestión de archivo para crear/editar (tu bloque actual) ===
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        id="archivo"
        name="archivo"
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0] || null;
          setFieldValue('archivo', file);
          setFieldValue('borrar_archivo', 1);
          if (file) setFieldValue('nombre_archivo', file.name);
        }}
      />
      <label htmlFor="archivo">
        <Button
          variant="contained"
          component="span"
          disabled={disabled}
          startIcon={<UploadFileIcon />}
          sx={{
            padding: 2,
            color: 'white',
            '&:hover': { backgroundColor: theme.palette.secondary.light, cursor: 'pointer' },
            backgroundColor: theme.palette.secondary.light,
          }}
        >
          <Box sx={{ fontSize: 10, color: 'white' }}>
            Documento anexo
          </Box>
        </Button>
      </label>

      <Box sx={{ fontSize: 12, color: theme.palette.text.secondary, flexGrow: 1 }}>
        {formikValues?.archivo
          ? `${formikValues.archivo.name}` : (formikValues?.nombre_archivo || '')}
      </Box>

      {(formikValues?.archivo || initialValues?.nombre_archivo) && accion !== 'ver' ? (
        <Button
          color="error"
          onClick={() => {
            setFieldValue('archivo', '');
            setFieldValue('nombre_archivo', '');
            setFieldValue('borrar_archivo', 0);
            const input = document.getElementById('archivo');
            if (input) input.value = '';
          }}
          sx={{ minWidth: 40, border: 'none' }}
        >
          <DeleteIcon />
        </Button>
      ) : null}
    </Box>
  )}
</Box>
</Box>
        </Box>
      </AppScrollbar>
      <Box className={classes.bottomsGroup}>
        {accion !== 'ver' ? (
          <Button
            sx={{
              paddingLeft: 15,
              paddingRight: 15,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.colorHovers,
                cursor: 'pointer',
                boxShadow:'none',
              },
              backgroundColor: theme.palette.primary.main,
              boxShadow:'none',
            }}
            variant='contained'
            type='submit'
          >
            <IntlMessages id='boton.submit' />
          </Button>
        ) : (
          ''
        )}
        <Button
          sx={{paddingLeft: 15,
            paddingRight: 15,
            color: 'white !important',
            '&:hover': {
              backgroundColor: theme.palette.colorHovers,
              cursor: 'pointer',
            },
            backgroundColor: theme.palette.secondary.light,
          }}
          onClick={handleOnClose}
        >
          <IntlMessages id='boton.cancel' />
        </Button>
      </Box>
    </Form>
  );
};

ActividadPorProyectoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ActividadPorProyectoForm;
