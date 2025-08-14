import icons from './icons.json';

const SvgIcon = ({ name, size = 20, className = '' }) => {
  const iconSvg = icons.icons[name];
  
  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <span 
      className={`inline-block ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};

export default SvgIcon;