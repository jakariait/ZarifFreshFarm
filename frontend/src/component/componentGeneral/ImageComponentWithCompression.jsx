import React, { useState, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import useIsMobile from "../../utils/useIsMobile.js";

const ImageComponentWithCompression = ({
  imageName,
  className = "",
  altName,
  skeletonHeight,
  width,
  height,
  loadingStrategy = "lazy",
  fetchPriority = "auto",
  hideSkeleton = false,
}) => {
  const [isLoading, setIsLoading] = useState(!hideSkeleton);
  const [hasError, setHasError] = useState(false);

  const isMobile = useIsMobile();

  if (!imageName) return null;

  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = `${apiUrl.replace("/api", "")}/uploads/${imageName}`;

  // 🔥 Adjust dimensions for mobile
  const { finalWidth, finalHeight } = useMemo(() => {
    if (!isMobile) {
      return { finalWidth: width, finalHeight: height };
    }

    return {
      finalWidth: width ? Math.floor(width / 2) : undefined,
      finalHeight: height ? Math.floor(height / 2) : undefined,
    };
  }, [isMobile, width, height]);

  // Build URL params
  const params = new URLSearchParams();
  if (finalWidth) params.append("width", finalWidth);
  if (finalHeight) params.append("height", finalHeight);

  const imageUrl = params.toString()
    ? `${baseUrl}?${params.toString()}`
    : baseUrl;

  return (
    <div className="relative overflow-hidden">
      {isLoading && !hasError && !hideSkeleton && (
        <div className="absolute inset-0 z-10">
          <Skeleton height={skeletonHeight} width="100%" />
        </div>
      )}

      <img
        src={imageUrl}
        alt={altName || "Image"}
        width={finalWidth}
        height={finalHeight}
        className={`${className || "w-full h-auto"} transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading={loadingStrategy}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </div>
  );
};

export default ImageComponentWithCompression;
