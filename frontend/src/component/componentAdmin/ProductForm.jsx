import React, { useRef, useState, useEffect, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCategoryStore from "../../store/useCategoryStore.js";
import useSubCategoryStore from "../../store/useSubCategoryStore.js";
import useChildCategoryStore from "../../store/useChildCategoryStore.js";
import useFlagStore from "../../store/useFlagStore.js";
import useProductOptionStore from "../../store/useProductOptionStore.js";
import AuthAdminStore from "../../store/AuthAdminStore.js";
import useProductStore from "../../store/useProductStore.js";
const Editor = lazy(() =>
  import("primereact/editor").then((module) => ({ default: module.Editor })),
);
import {
  Box,
  MenuItem,
  Select,
  Typography,
  Chip,
  Input,
  ListItemText,
  Checkbox,
  FormHelperText,
  FormControl,
  TextField,
  InputAdornment,
  Button,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Skeleton from "react-loading-skeleton";

const ProductForm = ({ isEdit: isEditMode }) => {
  const { slug } = useParams();

  const { fetchProductBySlug, product } = useProductStore();
  const { categories } = useCategoryStore();
  const { subCategories } = useSubCategoryStore();
  const { childCategories } = useChildCategoryStore();
  const { flags } = useFlagStore();
  const { productOptions, fetchProductOptions } = useProductOptionStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = AuthAdminStore();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [productCode, setProductCode] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [filteredChildCategories, setFilteredChildCategories] = useState([]);
  const [selectedChildCategory, setSelectedChildCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [finalPrice, setFinalPrice] = useState("");
  const [finalDiscount, setFinalDiscount] = useState("");
  const [finalStock, setFinalStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [hasVariant, setHasVariant] = useState(true);
  const [variants, setVariants] = useState([
    { attributes: [{ option: "", value: "" }], stock: "", price: "", discount: "" },
  ]);
  const [isActive, setIsActive] = useState("true");
  const [freeShipping, setFreeShipping] = useState(false);

  // State specific to update mode
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragSource, setDragSource] = useState(null); // 'existing' or 'new'

  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const imageUrl = `${apiUrl.replace("/api", "")}/uploads`;

  useEffect(() => {
    if (isEditMode && slug) {
      fetchProductBySlug(slug);
    }
    fetchProductOptions();
  }, [isEditMode, slug, fetchProductBySlug, fetchProductOptions]);

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name || "");
      setShortDesc(product.shortDesc || "");
      setLongDesc(product.longDesc || "");
      setProductCode(product.productCode || "");
      setRewardPoints(product.rewardPoints || "");
      setVideoUrl(product.videoUrl || "");
      setMetaTitle(product.metaTitle || "");
      setMetaDescription(product.metaDescription || "");
      setMetaKeywords(product.metaKeywords || []);
      setSearchTags(product.searchTags || []);
      setFinalPrice(product.finalPrice || "");
      setFinalDiscount(product.finalDiscount || "");
      setFinalStock(product.finalStock || "");
      setPurchasePrice(product.purchasePrice || "");
      setSelectedFlags(product.flags?.map((f) => f._id) || []);
      setIsActive(String(product.isActive));
      setFreeShipping(product.freeShipping || false);

      if (product.category) {
        setSelectedCategory(product.category._id);
        const filteredSubs = subCategories.filter(
          (sub) => sub.category._id === product.category._id,
        );
        setFilteredSubCategories(filteredSubs);

        if (product.subCategory) {
          setSelectedSubCategory(product.subCategory._id);
          const filteredChilds = childCategories.filter(
            (child) => child.subCategory._id === product.subCategory._id,
          );
          setFilteredChildCategories(filteredChilds);

          if (product.childCategory) {
            setSelectedChildCategory(product.childCategory._id);
          }
        }
      }

      if (product.thumbnailImage) {
        setImagePreview(`${imageUrl}/${product.thumbnailImage}`);
      }

      setExistingImages(product.images || []);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            attributes: v.attributes ? v.attributes.map((attr) => ({
              option: attr.option ? attr.option._id : "",
              value: attr.value || "",
            })) : [],
            stock: v.stock,
            price: v.price,
            discount: v.discount || "",
          })),
        );
        setHasVariant(true);
      } else {
        setVariants([
          { attributes: [{ option: "", value: "" }], stock: "", price: "", discount: "" },
        ]);
        setHasVariant(false);
      }
    }
  }, [product, isEditMode, subCategories, childCategories, apiUrl]);

  const handleToggle = () => {
    setHasVariant(!hasVariant);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { attributes: [{ option: "", value: "" }], stock: "", price: "", discount: "" },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddAttribute = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].attributes.push({ option: "", value: "" });
    setVariants(updatedVariants);
  };

  const handleRemoveAttribute = (variantIndex, attributeIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].attributes.splice(attributeIndex, 1);
    setVariants(updatedVariants);
  };

  const handleMultipleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => file);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImages = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });

    if (selectedImages.length === 1 && !isEditMode) {
      document.getElementById("multi-image-upload").value = "";
    }
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    const imageNameToDelete = existingImages[indexToRemove];
    setImagesToDelete((prev) => [...prev, imageNameToDelete]);
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveAllNewImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e, index, source) => {
    setDraggedIndex(index);
    setDragSource(source);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex, targetSource) => {
    e.preventDefault();
    
    // Only reorder within the same source (existing or new)
    if (dragSource !== targetSource) {
      setDraggedIndex(null);
      setDragSource(null);
      return;
    }

    if (dragSource === "existing") {
      const newExistingImages = [...existingImages];
      const draggedItem = newExistingImages[draggedIndex];
      newExistingImages.splice(draggedIndex, 1);
      newExistingImages.splice(targetIndex, 0, draggedItem);
      setExistingImages(newExistingImages);
    } else if (dragSource === "new") {
      const newSelectedImages = [...selectedImages];
      const newPreviews = [...imagePreviews];
      
      const draggedImageItem = newSelectedImages[draggedIndex];
      const draggedPreview = newPreviews[draggedIndex];
      
      newSelectedImages.splice(draggedIndex, 1);
      newPreviews.splice(draggedIndex, 1);
      
      newSelectedImages.splice(targetIndex, 0, draggedImageItem);
      newPreviews.splice(targetIndex, 0, draggedPreview);
      
      setSelectedImages(newSelectedImages);
      setImagePreviews(newPreviews);
    }

    setDraggedIndex(null);
    setDragSource(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragSource(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnailImage(file);
      setImagePreview(imageUrl);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!searchTags.includes(tagInput.trim())) {
        setSearchTags([...searchTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToDelete));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setFilteredSubCategories([]);
    setSelectedChildCategory("");
    setFilteredChildCategories([]);

    if (categoryId) {
      const filtered = subCategories.filter(
        (sub) => sub.category._id === categoryId,
      );
      setFilteredSubCategories(filtered);
    }
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    setSelectedSubCategory(subCategoryId);
    setSelectedChildCategory("");
    setFilteredChildCategories([]);

    if (subCategoryId) {
      const filtered = childCategories.filter(
        (child) => child.subCategory._id === subCategoryId,
      );
      setFilteredChildCategories(filtered);
    }
  };

  const handleChildCategoryChange = (e) => {
    setSelectedChildCategory(e.target.value);
  };

  const handleFlagChange = (e) => {
    setSelectedFlags(e.target.value);
  };

  const handleFinalPriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalPrice(value);
  };

  const handleDiscountChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalDiscount(value);
  };

  const handleFinalStockChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalStock(value);
  };

  const handleRewardPointsChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setRewardPoints(value);
  };

  const handlePurchasePriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setPurchasePrice(value);
  };

  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim() !== "") {
      e.preventDefault();
      if (!metaKeywords.includes(keywordInput.trim())) {
        setMetaKeywords([...metaKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setMetaKeywords(
      metaKeywords.filter((keyword) => keyword !== keywordToDelete),
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let validationErrors = {};
    if (!name.trim()) validationErrors.name = "Product name is required.";
    if (!selectedCategory) validationErrors.category = "Category is required.";

    if (!imagePreview && !isEditMode) {
      validationErrors.thumbnailImage = "Thumbnail image is required.";
    } else if (isEditMode && !imagePreview && !product?.thumbnailImage) {
      validationErrors.thumbnailImage = "Thumbnail image is required.";
    }

    if (existingImages.length + selectedImages.length === 0) {
      validationErrors.images = "At least one image is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("shortDesc", shortDesc);
    formData.append("longDesc", longDesc);
    formData.append("productCode", productCode);
    formData.append("rewardPoints", rewardPoints);
    formData.append("videoUrl", videoUrl);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("finalPrice", finalPrice);
    formData.append("finalDiscount", finalDiscount);
    formData.append("finalStock", finalStock);
    formData.append("purchasePrice", purchasePrice);
    formData.append("isActive", isActive);
    formData.append("freeShipping", freeShipping);

    if (selectedCategory) formData.append("category", selectedCategory);
    if (selectedSubCategory)
      formData.append("subCategory", selectedSubCategory);
    if (selectedChildCategory)
      formData.append("childCategory", selectedChildCategory);

    selectedFlags.forEach((flag) => formData.append("flags", flag));
    searchTags.forEach((tag) => formData.append("searchTags", tag));
    metaKeywords.forEach((keyword) => formData.append("metaKeywords", keyword));

    if (thumbnailImage instanceof File) {
      formData.append("thumbnailImage", thumbnailImage);
    }

    if (isEditMode && imagesToDelete.length > 0) {
      imagesToDelete.forEach((imageName) => {
        formData.append("imagesToDelete", imageName);
      });
    }

    if (isEditMode && existingImages.length > 0) {
      existingImages.forEach((imageName) => {
        formData.append("existingImages", imageName);
      });
    }

    selectedImages.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    const processedVariants = variants.filter(
      (variant) =>
        variant.attributes.length > 0 &&
        variant.attributes.every((attr) => attr.option && attr.value) &&
        variant.price &&
        variant.stock !== "" &&
        variant.stock != null,
    );

    if (hasVariant && processedVariants.length > 0) {
      processedVariants.forEach((variant, index) => {
        formData.append(`variants[${index}][stock]`, variant.stock);
        formData.append(`variants[${index}][price]`, variant.price);
        formData.append(`variants[${index}][discount]`, variant.discount);
        variant.attributes.forEach((attr, attrIndex) => {
          formData.append(
            `variants[${index}][attributes][${attrIndex}][option]`,
            attr.option,
          );
          formData.append(
            `variants[${index}][attributes][${attrIndex}][value]`,
            attr.value,
          );
        });
      });
    }

    try {
      if (isEditMode) {
        await axios.put(`${apiUrl}/products/${product._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSnackbarMessage("Product updated successfully!");
        setImagesToDelete([]);
      } else {
        await axios.post(`${apiUrl}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage("Product created successfully!");
        setName("");
        setShortDesc("");
        setLongDesc("");
        setProductCode("");
        setRewardPoints("");
        setVideoUrl("");
        setMetaTitle("");
        setMetaDescription("");
        setFinalPrice("");
        setFinalDiscount("");
        setFinalStock("");
        setPurchasePrice("");
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSelectedChildCategory("");
        setSelectedFlags([]);
        setSearchTags([]);
        setMetaKeywords([]);
        setThumbnailImage(null);
        setImagePreview("");
        setSelectedImages([]);
        setImagePreviews([]);
        setVariants([{ attributes: [{ option: "", value: "" }], stock: "", price: "", discount: "" }]);
        setHasVariant(true);
        setIsActive("true");
        setFreeShipping(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (imagesInputRef.current) imagesInputRef.current.value = "";
      }

      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/admin/viewallproducts");
      }, 3000);
    } catch (error) {
      setSnackbarMessage(
        isEditMode ? "Failed to update product." : "Failed to create product.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  if (isEditMode && !product) {
    return (
      <div>
        <div className={"grid grid-cols-6 gap-6"}>
          <div className={"col-span-4"}>
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={150} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={100} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
          </div>
          <div className={"col-span-2 "}>
            <Skeleton height={150} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={100} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
          </div>
        </div>
        <Skeleton height={250} width={"100%"} />
        <Skeleton height={200} width={"100%"} />
        <div className={"grid grid-cols-2 gap-6"}>
          <Skeleton height={50} width={"100%"} />
          <Skeleton height={50} width={"100%"} />
        </div>
        <Skeleton height={200} width={"100%"} />
      </div>
    );
  }

  return (
    <div className={"shadow rounded-lg p-3"}>
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        {isEditMode ? "Update Product" : "Add New Product"}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className={"md:grid grid-cols-12 gap-8 p-3"}>
          <div className={"col-span-8"}>
            <TextField
              label="Product Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="normal"
            />

            <h1 className={"py-3 pl-1"}>Short Description</h1>
            <Editor
              value={shortDesc}
              onTextChange={(e) => setShortDesc(e.htmlValue)}
              style={{ height: "260px" }}
            />

            <h1 className={"py-3 pl-1"}>Long Description</h1>
            <Editor
              value={longDesc}
              onTextChange={(e) => setLongDesc(e.htmlValue)}
              style={{ height: "260px" }}
            />

            <Box mb={2}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                margin="normal"
              >
                <TextField
                  label="Search Tags"
                  fullWidth
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: searchTags.length > 0 && (
                      <InputAdornment position="start">
                        <Box gap={1}>
                          {searchTags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleDeleteTag(tag)}
                              size="small"
                              style={{
                                margin: "2px",
                                backgroundColor: "#e0e0e0",
                              }}
                            />
                          ))}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                label="Video URL"
                fullWidth
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                margin="normal"
              />
            </Box>
          </div>
          <div className={"col-span-4"}>
            <Box mb={2}>
              <Typography>
                Product Thumbnail Image{" "}
                <span style={{ color: "red", fontSize: "18px" }}>*</span>
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "inline-block" }}
                id="thumbnail-upload"
                name="thumbnailImage"
                ref={fileInputRef}
                required={!isEditMode}
              />
              <label
                htmlFor="thumbnail-upload"
                style={{
                  display: "block",
                  height: "210px",
                  marginTop: "10px",
                  border: "2px solid #aaa",
                  cursor: "pointer",
                  textAlign: "center",
                  position: "relative",
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : "none",
                  backgroundColor: imagePreview ? "transparent" : "#f0f0f0",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  color: imagePreview ? "transparent" : "#000",
                }}
              >
                {imagePreview ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      Image Selected
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        zIndex: 10,
                      }}
                      onClick={handleRemoveThumbnail}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    Click to upload an image
                  </Typography>
                )}
              </label>
              {errors.thumbnailImage && (
                <FormHelperText error>{errors.thumbnailImage}</FormHelperText>
              )}
            </Box>

            {!hasVariant && (
              <>
                <TextField
                  label="Price (In BDT)"
                  type="number"
                  fullWidth
                  value={finalPrice}
                  onChange={handleFinalPriceChange}
                  margin="normal"
                  required={!hasVariant}
                />
                <TextField
                  label="Discount Price"
                  type="number"
                  fullWidth
                  value={finalDiscount}
                  onChange={handleDiscountChange}
                  margin="normal"
                />
                <TextField
                  label="Stock"
                  type="number"
                  fullWidth
                  value={finalStock}
                  onChange={handleFinalStockChange}
                  required={!hasVariant}
                  margin="normal"
                />
              </>
            )}

            {isEditMode && (
              <Box sx={{ minWidth: 200, my: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={isActive}
                    label="Status"
                    onChange={(e) => setIsActive(e.target.value)}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Free Shipping</Typography>
              <Switch
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
              />
            </Box>

            <TextField
              label="Reward Points"
              type="number"
              fullWidth
              value={rewardPoints}
              onChange={handleRewardPointsChange}
              margin="normal"
            />
            <TextField
              label="Purchase Price"
              type="number"
              fullWidth
              value={purchasePrice}
              onChange={handlePurchasePriceChange}
              margin="normal"
            />
            <TextField
              label="Product Code"
              fullWidth
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              margin="normal"
            />

            <FormControl
              fullWidth
              error={Boolean(errors.category)}
              margin="normal"
            >
              <InputLabel required>Select Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
                label="Select Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(errors.subCategory)}
              margin="normal"
              disabled={!selectedCategory}
            >
              <InputLabel>Select Sub Category</InputLabel>
              <Select
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
                label="Select Sub Category"
              >
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((sub) => (
                    <MenuItem key={sub._id} value={sub._id}>
                      {sub.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No subcategories available</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(errors.childCategory)}
              margin="normal"
              disabled={!selectedSubCategory}
            >
              <InputLabel>Select Child Category</InputLabel>
              <Select
                value={selectedChildCategory}
                onChange={handleChildCategoryChange}
                label="Select Child Category"
              >
                {filteredChildCategories.length > 0 ? (
                  filteredChildCategories.map((child) => (
                    <MenuItem key={child._id} value={child._id}>
                      {child.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No child categories available</MenuItem>
                )}
              </Select>
            </FormControl>

            <Box mb={2}>
              <Typography>Select Flags</Typography>
              <Select
                multiple
                fullWidth
                value={selectedFlags}
                onChange={handleFlagChange}
                input={<Input />}
                renderValue={(selected) => (
                  <div>
                    {" "}
                    {selected.map((flagId) => {
                      const flag = flags.find((f) => f._id === flagId);
                      return flag ? (
                        <Chip
                          key={flag._id}
                          label={flag.name}
                          style={{ margin: 2 }}
                        />
                      ) : null;
                    })}{" "}
                  </div>
                )}
              >
                {flags.map((flag) => (
                  <MenuItem key={flag._id} value={flag._id}>
                    {" "}
                    <Checkbox
                      checked={selectedFlags.indexOf(flag._id) > -1}
                    />{" "}
                    <ListItemText primary={flag.name} />{" "}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </div>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <Box mb={2}>
            <Typography>
              Product Images{" "}
              <span style={{ color: "red", fontSize: "18px" }}>*</span>
            </Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesChange}
              style={{ display: "block" }}
              id="multi-image-upload"
              name="images"
              ref={imagesInputRef}
              required={!isEditMode && selectedImages.length === 0}
            />
            <label
              htmlFor="multi-image-upload"
              style={{
                marginTop: "10px",
                border: "2px solid #aaa",
                cursor: "pointer",
                textAlign: "center",
                position: "relative",
                backgroundColor:
                  existingImages.length + selectedImages.length > 0
                    ? "transparent"
                    : "#f0f0f0",
                overflow: "hidden",
                padding: "10px",
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "150px",
              }}
            >
              {existingImages.length > 0 || selectedImages.length > 0 ? (
                <>
                  {selectedImages.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAllNewImages();
                      }}
                      type="button"
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {isEditMode ? "Remove New Images" : "Remove All"}
                    </button>
                  )}
                  <div
                    className={
                      "flex gap-5 flex-wrap mt-7 justify-center items-center"
                    }
                  >
                    {isEditMode &&
                      existingImages.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index, "existing")}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index, "existing")}
                          onDragEnd={handleDragEnd}
                          style={{
                            width: "150px",
                            height: "150px",
                            marginTop: "5px",
                            backgroundImage: `url(${imageUrl}/${image})`,
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            borderRadius: "5px",
                            position: "relative",
                            backgroundRepeat: "no-repeat",
                            cursor: "move",
                            opacity: draggedIndex === index && dragSource === "existing" ? 0.5 : 1,
                            transition: "opacity 0.2s",
                            border: draggedIndex === index && dragSource === "existing" ? "2px dashed #ccc" : "none",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(index);
                            }}
                            type="button"
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    {imagePreviews.map((image, index) => (
                      <div
                        key={`new-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, "new")}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index, "new")}
                        onDragEnd={handleDragEnd}
                        style={{
                          width: "150px",
                          height: "150px",
                          marginTop: "5px",
                          backgroundImage: `url(${image})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          borderRadius: "5px",
                          position: "relative",
                          backgroundRepeat: "no-repeat",
                          cursor: "move",
                          opacity: draggedIndex === index && dragSource === "new" ? 0.5 : 1,
                          transition: "opacity 0.2s",
                          border: draggedIndex === index && dragSource === "new" ? "2px dashed #ccc" : "none",
                        }}
                      >
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleRemoveImages(index);
                           }}
                           type="button"
                          style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  Click to upload images
                </Typography>
              )}
            </label>
            {errors.images && (
              <FormHelperText error>{errors.images}</FormHelperText>
            )}
          </Box>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <Box border={1} p={2} borderRadius={2}>
            <div className="flex flex-col items-center">
              <Typography variant="h6" align="center">
                Product Has Variant?
              </Typography>
              <Switch checked={hasVariant} onChange={handleToggle} />
            </div>

            {hasVariant && (
              <>
                <Typography
                  variant="h6"
                  align="center"
                  color="error"
                  fontWeight={400}
                  sx={{ mb: 1 }}
                >
                  Product Variant (Insert the Base Variant First)
                </Typography>

                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Attributes</TableCell>
                        <TableCell>Stock *</TableCell>
                        <TableCell>Price *</TableCell>
                        <TableCell>Disc. Price *</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {variants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {variant.attributes.map((attr, attrIndex) => (
                              <Box
                                key={attrIndex}
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={1}
                              >
                                <TextField
                                  select
                                  label="Option"
                                  value={attr.option}
                                  onChange={(e) => {
                                    const updatedVariants = [...variants];
                                    updatedVariants[index].attributes[
                                      attrIndex
                                    ].option = e.target.value;
                                    updatedVariants[index].attributes[
                                      attrIndex
                                    ].value = "";
                                    setVariants(updatedVariants);
                                  }}
                                  sx={{ width: "120px" }}
                                >
                                  {productOptions.map((option) => (
                                    <MenuItem
                                      key={option._id}
                                      value={option._id}
                                    >
                                      {option.name}
                                    </MenuItem>
                                  ))}
                                </TextField>
                                <TextField
                                  select
                                  label="Value"
                                  value={attr.value}
                                  onChange={(e) => {
                                    const updatedVariants = [...variants];
                                    updatedVariants[index].attributes[
                                      attrIndex
                                    ].value = e.target.value;
                                    setVariants(updatedVariants);
                                  }}
                                  sx={{ width: "120px" }}
                                  disabled={!attr.option}
                                >
                                  {attr.option &&
                                    productOptions
                                      .find((o) => o._id === attr.option)
                                      ?.values?.map((val) => (
                                        <MenuItem key={val} value={val}>
                                          {val}
                                        </MenuItem>
                                      ))}
                                </TextField>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleRemoveAttribute(index, attrIndex)
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleAddAttribute(index)}
                            >
                              + Add Attribute
                            </Button>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.stock}
                              required={true}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].stock = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.price}
                              required={true}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].price = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.discount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].discount = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              color="error"
                              fullWidth
                              onClick={() => handleRemoveVariant(index)}
                            >
                              <DeleteIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVariant}
                  >
                    + Add Another Variant
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <h1>
            Product SEO Information{" "}
            <span className={"text-red-500"}>(Optional)</span>
          </h1>
          <div className={"grid grid-cols-2 gap-4"}>
            <TextField
              label="Meta Title"
              fullWidth
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              margin="normal"
            />
            <Box mb={2}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                margin="normal"
              >
                <TextField
                  label="Meta Keywords"
                  fullWidth
                  placeholder="Type a keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: metaKeywords.length > 0 && (
                      <InputAdornment position="start">
                        <Box gap={1}>
                          {metaKeywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              onDelete={() => handleDeleteKeyword(keyword)}
                              size="small"
                              style={{
                                margin: "2px",
                                backgroundColor: "#e0e0e0",
                              }}
                            />
                          ))}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </div>
          <TextField
            label="Meta Description"
            fullWidth
            multiline
            rows={4}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            margin="none"
            InputProps={{ style: { resize: "vertical", overflow: "auto" } }}
          />
        </div>

        <div className={"flex justify-center items-center m-8"}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            className="mt-4"
          >
            {isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </form>
    </div>
  );
};

export default ProductForm;