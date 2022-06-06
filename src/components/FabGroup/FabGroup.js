import React from 'react'; 
import { Box, IconButton, Fab, styled } from '@mui/material'; 

const Backdrop = styled('div')(({ shown }) => ({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.2)',
  position: 'fixed',
  top: 0,
  left: 0,
  display: shown ? 'block' : 'none'
}))

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
    zIndex: 1000,
    backgroundColor: 'white' 
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
 

return <><Box
        style={boxStyle}
        onMouseLeave={() => setOn(false)}
        onMouseMove={() => setOn(true)}>
  {buttons.map((button, i) => {
    const bottom = !on ? 20 : ((i + 2) * 48) - 8;
    const buttonStyle = {
      ...style,
      backgroundColor: 'white',
      boxShadow: 'var(--card-shadow)',
      transition: 'bottom 0.2s ease-in',
      right: 28,
      bottom 
    }
    return <IconButton color={button.color} style={buttonStyle} onClick={(w) => {
      setOn(false);
      button.onClick(w);
    }}>{button.icon}</IconButton>
  })}
  <Fab style={css} color={color}
    onClick={() => {
      setOn(false);
      mainClick && mainClick();
    }}
    >
   {icon}
  </Fab>
</Box>
<Backdrop 
  shown={on}
  onMouseOver={() => setOn(true)}
  onMouseDown={(e) => {
    console.log ({ e });
    setOn(false);
  }} />
</>
}

