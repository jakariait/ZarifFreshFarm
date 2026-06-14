import React from "react";
import { Skeleton } from "@mui/material";

const ProductDetailsSkeleton = () => {
  return (
    <div className="xl:container xl:mx-auto p-3">
      {/* Skeleton for Breadcrumbs */}
      <div className="md:p-3">
        <Skeleton height={24} width={"70%"} />
      </div>

      <div className={"grid md:grid-cols-2 gap-4"}>
        <div>
          <Skeleton height={650} width={"100%"} />
        </div>
        <div>
          {/* Skeletons for ProductAddToCart */}
          <Skeleton height={50} width={"90%"} />
          <Skeleton height={50} width={"80%"} />
          <Skeleton height={50} width={"90%"} />
          <div className={"grid grid-cols-3 gap-1"}>
            <Skeleton height={50} width={"90%"} />
            <Skeleton height={50} width={"80%"} />
            <Skeleton height={50} width={"90%"} />
          </div>
          <Skeleton height={50} width={"90%"} />

          {/* Skeleton for Social Share, Product Code, Short Desc */}
          <div className="flex flex-col gap-3 pt-4">
            <Skeleton height={24} width={"60%"} />
            <Skeleton height={20} width={"40%"} />
            <Skeleton count={2} height={18} width={"90%"} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Skeleton height={400} width={"100%"} />
        <Skeleton count={2} height={60} width={"100%"} />
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Skeleton height={40} width={"100%"} />
        <div className={"grid grid-cols-2 md:grid-cols-4 gap-4"}>
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <Skeleton height={40} width={"100%"} />
        <div className={"grid grid-cols-2 md:grid-cols-4 gap-4"}>
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
          <Skeleton height={300} width={"100%"} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
