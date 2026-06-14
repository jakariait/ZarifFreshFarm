import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useLocation, useParams } from "react-router-dom";
import useProductStore from "../../store/useProductStore.js";
import GeneralInfoStore from "../../store/GeneralInfoStore.js";
import Skeleton from "react-loading-skeleton";
import LazySocialShareButtons from "./LazySocialShareButtons.jsx";
import { Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import ProductGallery from "./ProductGallery.jsx";
import ProductAddToCart from "./ProductAddToCart.jsx";
import ProductBreadcrumbs from "./ProductBreadcrumbs.jsx";
import ProductDetailsSkeleton from "../skeleton/ProductDetailsSkeleton.jsx";
const SimilarProducts = lazy(() => import("./SimilarProducts.jsx"));
const YouTubeEmbed = lazy(() => import("./YouTubeEmbed.jsx"));
const RecentlyViewedProducts = lazy(
  () => import("./RecentlyViewedProducts.jsx"),
);

const ProductDetails = () => {
  const hasPushedRef = useRef(false);

  const { fetchProductBySlug, product, loading, error, resetProduct } =
    useProductStore();

  const { GeneralInfoList } = GeneralInfoStore();
  const { slug } = useParams();

  const [currentProductSlug, setCurrentProductSlug] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (slug !== currentProductSlug) {
      // Reset product state and show loading
      resetProduct(); // Clear previous product data
      setCurrentProductSlug(slug);
      fetchProductBySlug(slug);
    }
  }, [slug, currentProductSlug, fetchProductBySlug, resetProduct]);

  const calculateDiscountPercentage = (
    priceBeforeDiscount,
    priceAfterDiscount,
  ) => {
    if (
      !priceBeforeDiscount ||
      !priceAfterDiscount ||
      priceBeforeDiscount <= priceAfterDiscount
    )
      return 0;
    const discountAmount = priceBeforeDiscount - priceAfterDiscount;
    return Math.ceil((discountAmount / priceBeforeDiscount) * 100);
  };

  const location = useLocation();
  const url = `${window.location.origin}${location.pathname}`;
  const title = product?.name;

  const discountPercentage =
    product?.finalPrice && product?.finalDiscount
      ? calculateDiscountPercentage(product.finalPrice, product.finalDiscount)
      : 0;

  // Function to sanitize/remove editor-specific tags like ql-ui
  const cleanHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove Quill editor-only UI elements
    doc.querySelectorAll(".ql-ui").forEach((el) => el.remove());

    return doc.body.innerHTML;
  };

  // Data layer for View Content

  useEffect(() => {
    if (!product || hasPushedRef.current) return;

    const price =
      product.finalDiscount > 0 ? product.finalDiscount : product.finalPrice;

    const discount =
      product.finalDiscount > 0
        ? product.finalPrice - product.finalDiscount
        : 0;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        currency: "BDT",
        value: price,
        items: [
          {
            item_id: product.productId,
            item_name: product.name,
            currency: "BDT",
            discount,
            item_variant: "Default",
            price,
            quantity: 1,
          },
        ],
      },
    });

    hasPushedRef.current = true;
  }, [product]);

  useEffect(() => {
    if (!product?._id) return;

    // Get existing list or empty array
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

    // Remove if already exists (avoid duplicates)
    viewed = viewed.filter((item) => item._id !== product._id);

    // Add new one at beginning
    viewed.unshift({
      _id: product._id,
      name: product.name,
      isActive: product.isActive,
      category: product.category,
      finalDiscount: product.finalDiscount,
      finalPrice: product.finalPrice,
      productId: product.productId,
      slug: product.slug,
      variants: product.variants,
      finalStock: product.finalStock,
      flags: product.flags,
      images: product.images,
      thumbnailImage: product.thumbnailImage,
    });

    // Limit to 5 items
    viewed = viewed.slice(0, 5);

    // Save back
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    setRecentlyViewed(viewed);
  }, [product]);

  if (loading || product?.slug !== slug) {
    return <ProductDetailsSkeleton />; // Loading message while new product data is being fetched
  }

  return (
    <div className="xl:container xl:mx-auto p-3">
      {error && (
        <div className="text-red-500 flex items-center justify-center pt-40">
          Error: {error}
        </div>
      )}

      {product && (
        <div>
          {/*Seo Meta Data*/}
          <title>{`${product?.name || product?.metaTitle} | ${GeneralInfoList?.CompanyName}`}</title>
          <meta name="description" content={product?.metaDescription} />
          <meta name="keywords" content={product.metaKeywords.join(", ")} />
          <meta
            property="og:title"
            content={`${product?.name || product?.metaTitle} | ${GeneralInfoList?.CompanyName}`}
          />
          <meta property="og:description" content={product?.metaDescription} />
          <meta property="og:image" content={product?.thumbnailImage} />
          <meta property="og:url" content={window.location.href} />

          {/*BreadCrumbs*/}
          <ProductBreadcrumbs product={product} />

          <div className="md:grid md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-9 gap-8">
            <div className="md:col-span-4 lg:col-span-6 xl:col-span-5 relative">
              <ProductGallery
                images={product.images}
                discount={discountPercentage}
                productName={product.name}
              />
            </div>
            <div className="flex flex-col gap-3 md:col-span-4 lg:col-span-3 xl:col-span-4 pt-4 md:pt-0">
              <ProductAddToCart product={product} />

              {/*Social Share Buttons*/}
              <div className="flex items-center gap-2">
                <h1>Social Share:</h1>
                <LazySocialShareButtons url={url} title={title} />
              </div>
              {/*Product Code*/}
              {product.productCode && (
                <div>
                  <strong>Product Code:</strong> {product.productCode}
                </div>
              )}

              {/*Short Description*/}
              {product.shortDesc && (
                <div
                  className="rendered-html"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(product.shortDesc),
                  }}
                />
              )}
            </div>
          </div>

          {/*YoutubeEmbed*/}
          {product.videoUrl && (
            <div className={"flex items-center justify-center pt-10 pb-10"}>
              <Suspense
                fallback={
                  <div className="w-full sm:w-[560px]">
                    <div className="aspect-video">
                      <Skeleton className="w-full h-full" />
                    </div>
                  </div>
                }
              >
                <YouTubeEmbed videoId={product.videoUrl} />
              </Suspense>
            </div>
          )}

          <div className={"xl:w-3/4 mx-auto shadow mt-4"}>
            {/*product Description*/}
            {product.longDesc && (
              <Accordion
                defaultExpanded
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <span>Description</span>
                    </div>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: "20rem" }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.longDesc),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
            {/*Product Size Chart*/}
            {product.sizeChart && (
              <Accordion
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <span>Size Chart</span>
                    </div>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: "20rem" }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.sizeChart),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}

            {/*Shipping and Return*/}
            {product.shippingReturn && (
              <Accordion
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  width: "100%",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="p-2 flex items-center"
                >
                  <Typography component="span">
                    <div className="flex items-center gap-2">
                      <span>Shipping and Return</span>
                    </div>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: "20rem" }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.shippingReturn),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </div>
          <div>
            <Suspense fallback={<Skeleton height={200} width={"100%"} />}>
              <RecentlyViewedProducts
                currentProductId={product._id}
                products={recentlyViewed}
              />
            </Suspense>
            <Suspense fallback={<Skeleton height={200} width={"100%"} />}>
              <SimilarProducts
                categoryId={product?.category?._id}
                productId={product?._id}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
