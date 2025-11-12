import Image from 'next/image';

/**
 * Optimized Image Component
 * Provides automatic lazy loading, blur placeholder, and responsive sizing
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {boolean} props.priority - Whether to load eagerly (for above-the-fold images)
 * @param {string} props.className - CSS classes
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {number} props.quality - Image quality (1-100, default 85)
 */
export default function OptimizedImage({
  src,
  alt,
  priority = false,
  className = '',
  width,
  height,
  quality = 85,
  ...props
}) {
  // Generate blur placeholder (simple data URI)
  const shimmer = (w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="0%" />
          <stop stop-color="#edeef1" offset="20%" />
          <stop stop-color="#f6f7f8" offset="40%" />
          <stop stop-color="#f6f7f8" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f6f7f8" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

  const toBase64 = (str) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  const blurDataURL = `data:image/svg+xml;base64,${toBase64(
    shimmer(width || 700, height || 475)
  )}`;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={quality}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}
