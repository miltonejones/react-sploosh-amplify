import React from 'react'; 
import { Box, IconButton, Fab } from '@mui/material'; 


export default function FabGroup ({ 
  icon,
  color = 'primary',
  buttons = [],  
  mainClick
}) {
  const [on, setOn] = React.useState(false);

  const boxStyle = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000
  }
  const style = {
    position: 'absolute',
    bottom: 20,
    right: 20,
    transform: 'rotate(0deg)',
    transition: 'transform 0.2s linear'
  }
  
  const over = {
    ...style,
    transform: 'rotate(180deg)'
  }
const css = on ? over : style;

return <Box
        style={boxStyle}
        onMouseLeave={() =>setOn(false)}
        onMouseOver={() => setOn(true)}>
  {buttons.map((button, i) => {
    const bottom = !on ? 20 : ((i + 2) * 48) - 8;
    const buttonStyle = {
      ...style,
      backgroundColor: 'white',
      boxShadow: 'var(--card-shadow)',
      transition: 'bottom 0.2s linear',
      right: 28,
      bottom 
    }
    return <IconButton color={button.color} style={buttonStyle} onClick={button.onClick}>{button.icon}</IconButton>
  })}
  <Fab style={css} color={color}
    onClick={() => mainClick && mainClick()}
    >
   {icon}
  </Fab>
</Box>
}

