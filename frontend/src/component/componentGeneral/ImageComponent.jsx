import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";

const ImageComponent = ({
  imageName,
  className = "",
  altName,
  skeletonHeight,
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageName) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const imageUrl = `${apiUrl.replace("/api", "")}/uploads/${imageName}`;
      setImageSrc(imageUrl);
    }
  }, [imageName]);

  return (
    <div className="relative" style={skeletonHeight ? { minHeight: skeletonHeight } : {}}>
      {isLoading && skeletonHeight && <Skeleton height="100%" width={"100%"} />}
      {isLoading && !skeletonHeight && <Skeleton height={100} width={"100%"} />}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={altName}
          className={className}
          style={{ display: isLoading ? "none" : "block", position: isLoading ? "absolute" : "relative", top: 0, left: 0, right: 0, bottom: 0 }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setImageSrc();
          }}
        />
      )}
    </div>
  );
};

export default ImageComponent;
