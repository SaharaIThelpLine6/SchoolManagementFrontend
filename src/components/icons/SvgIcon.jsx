import icons from './icons.json';

const SvgIcon = ({ name, size = 20, className = '' }) => {
  const iconSvg = icons.icons[name];
  
  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Create a sanitized SVG string
  const svg = iconSvg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`)
    .replace(/<svg/, `<svg width="${size}" height="${size}"`);

  return (
    <span 
      className={`flex justify-center items-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default SvgIcon;