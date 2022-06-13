import * as React from 'react';
import { WINDOW_REGIONS } from '../../constants';

export default function RegionMenu({ width, height, open, click }) {
  const areas = [];
  WINDOW_REGIONS.map((region) => {
    const ratioX = width / 1600;
    areas.push({
      width: region.width * ratioX - 4,
      height: region.height * ratioX - 4,
      x: region.x * ratioX + 2,
      y: region.y * ratioX + 2,
      src: region.src ? `url(${region.src})` : '',
    });
    areas.map((area) => {
      area.css = {
        position: 'absolute',
        width: `${area.width}px`,
        height: `${area.height}px`,
        left: `${area.x}px`,
        top: `${area.y}px`,
        backgroundImage: area.src,
        backgroundSize: 'contain',
        border: 'solid 1px red',
      };
    });
  });
  let className = ['app-region-menu', open ? 'open' : ''].join(' ');
  return (
    <div
      className={className}
      style={{ height, width, border: 'solid 1px red', zIndex: 4 }}
    >
      {areas.map((area, i) => (
        <div key={i} onClick={() => click(i)} style={area.css}></div>
      ))}
    </div>
  );
}
RegionMenu.defaultProps = {
  width: 220,
  height: 130,
};
