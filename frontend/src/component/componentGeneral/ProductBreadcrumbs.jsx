import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const ProductBreadcrumbs = ({ product }) => {
  return (
    <div className={"md:p-3"}>
      <Breadcrumbs separator="/" aria-label="breadcrumb">
        {/* Home */}
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ textDecoration: "none" }} // Removes the underline
        >
          Home
        </Link>

        {/* Category */}
        {product?.category?.name && (
          <Link
            component={RouterLink}
            to={`/shop?category=${product.category.name}`}
            color="inherit"
            sx={{ textDecoration: "none" }}
          >
            {product.category.name}
          </Link>
        )}

        {/* Subcategory */}
        {product?.subCategory?.name && (
          <Link
            component={RouterLink}
            to={`/shop?subcategory=${product.subCategory.slug}`}
            color="inherit"
            sx={{ textDecoration: "none" }}
          >
            {product.subCategory.name}
          </Link>
        )}

        {/* Child Category */}
        {product?.childCategory?.name && (
          <Link
            component={RouterLink}
            to={`/shop?childCategory=${product.childCategory.slug}`}
            color="inherit"
            sx={{ textDecoration: "none" }}
          >
            {product.childCategory.name}
          </Link>
        )}

        {/* Product Name */}
        {product?.name && (
          <Typography color="text.primary">{product.name}</Typography>
        )}
      </Breadcrumbs>
    </div>
  );
};

export default ProductBreadcrumbs;
