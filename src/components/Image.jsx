export default function Image({ src, alt = "null", className, height, width }) {
  return (
    <img
      src={src}
      alt={alt}
      height={height}
      width={width}
      className={`rounded-lg shadow-md ${className}`}
    />
  );
}