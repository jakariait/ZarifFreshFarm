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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Upload,
  X,
  Image,
  Loader2,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { SectionHeader } from "#component/componentAdmin/SectionHeader.jsx";

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
    {
      attributes: [{ option: "", value: "" }],
      stock: "",
      price: "",
      discount: "",
    },
  ]);
  const [isActive, setIsActive] = useState("true");
  const [freeShipping, setFreeShipping] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

      if (product.thumbnailImage) {
        setImagePreview(`${imageUrl}/${product.thumbnailImage}`);
      }

      setExistingImages(product.images || []);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            attributes: v.attributes
              ? v.attributes.map((attr) => ({
                  option: attr.option ? attr.option._id : "",
                  value: attr.value || "",
                }))
              : [],
            stock: v.stock,
            price: v.price,
            discount: v.discount || "",
          })),
        );
        setHasVariant(true);
      } else {
        setVariants([
          {
            attributes: [{ option: "", value: "" }],
            stock: "",
            price: "",
            discount: "",
          },
        ]);
        setHasVariant(false);
      }
    }
  }, [product, isEditMode, apiUrl]);

  useEffect(() => {
    if (isEditMode && product && product.category) {
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
  }, [product, subCategories, childCategories, isEditMode]);

  const handleToggle = () => {
    setHasVariant(!hasVariant);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        attributes: [{ option: "", value: "" }],
        stock: "",
        price: "",
        discount: "",
      },
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

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubCategory("");
    setFilteredSubCategories([]);
    setSelectedChildCategory("");
    setFilteredChildCategories([]);

    if (value) {
      const filtered = subCategories.filter(
        (sub) => sub.category._id === value,
      );
      setFilteredSubCategories(filtered);
    }
  };

  const handleSubCategoryChange = (value) => {
    setSelectedSubCategory(value);
    setSelectedChildCategory("");
    setFilteredChildCategories([]);

    if (value) {
      const filtered = childCategories.filter(
        (child) => child.subCategory._id === value,
      );
      setFilteredChildCategories(filtered);
    }
  };

  const handleChildCategoryChange = (value) => {
    setSelectedChildCategory(value);
  };

  const handleFlagToggle = (flagId) => {
    setSelectedFlags((prev) =>
      prev.includes(flagId)
        ? prev.filter((id) => id !== flagId)
        : [...prev, flagId],
    );
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

    setSubmitting(true);
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
        toast.success("Product updated successfully!");
        setImagesToDelete([]);
      } else {
        await axios.post(`${apiUrl}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product created successfully!");
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
        setVariants([
          {
            attributes: [{ option: "", value: "" }],
            stock: "",
            price: "",
            discount: "",
          },
        ]);
        setHasVariant(true);
        setIsActive("true");
        setFreeShipping(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (imagesInputRef.current) imagesInputRef.current.value = "";
      }

      setTimeout(() => {
        navigate("/admin/viewallproducts");
      }, 3000);
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update product." : "Failed to create product.",
      );
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && !product) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${isEditMode ? "Update Product" : "Add New Product"}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Editor
                    value={shortDesc}
                    onTextChange={(e) => setShortDesc(e.htmlValue)}
                    style={{ height: "260px" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Long Description</Label>
                  <Editor
                    value={longDesc}
                    onTextChange={(e) => setLongDesc(e.htmlValue)}
                    style={{ height: "260px" }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Search Tags & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Tags</Label>
                  <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Thumbnail Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="thumbnail-upload"
                  name="thumbnailImage"
                  ref={fileInputRef}
                  required={!isEditMode}
                />
                <Label
                  htmlFor="thumbnail-upload"
                  className="block relative cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveThumbnail();
                        }}
                      >
                        <X className="size-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 transition-colors">
                      <Upload className="size-8" />
                      <p className="text-sm">Click to upload an image</p>
                    </div>
                  )}
                </Label>
                {errors.thumbnailImage && (
                  <p className="text-xs text-destructive">
                    {errors.thumbnailImage}
                  </p>
                )}
              </CardContent>
            </Card>

            {!hasVariant && (
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice">
                      Price (In BDT) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={finalPrice}
                      onChange={handleFinalPriceChange}
                      required={!hasVariant}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalDiscount">Discount Price</Label>
                    <Input
                      id="finalDiscount"
                      type="number"
                      value={finalDiscount}
                      onChange={handleDiscountChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalStock">
                      Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="finalStock"
                      type="number"
                      value={finalStock}
                      onChange={handleFinalStockChange}
                      required={!hasVariant}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={isActive} onValueChange={setIsActive}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    id="freeShipping"
                    checked={freeShipping}
                    onCheckedChange={setFreeShipping}
                  />
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardPoints">Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    type="number"
                    value={rewardPoints}
                    onChange={handleRewardPointsChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={handlePurchasePriceChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Select Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Select Sub Category</Label>
                  <Select
                    value={selectedSubCategory}
                    onValueChange={handleSubCategoryChange}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCategory
                            ? "Select a subcategory"
                            : "Select a category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubCategories.length > 0 ? (
                        filteredSubCategories.map((sub) => (
                          <SelectItem key={sub._id} value={sub._id}>
                            {sub.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No subcategories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Child Category</Label>
                  <Select
                    value={selectedChildCategory}
                    onValueChange={handleChildCategoryChange}
                    disabled={!selectedSubCategory}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedSubCategory
                            ? "Select a child category"
                            : "Select a subcategory first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredChildCategories.length > 0 ? (
                        filteredChildCategories.map((child) => (
                          <SelectItem key={child._id} value={child._id}>
                            {child.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No child categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedFlags.length > 0
                        ? `${selectedFlags.length} flag(s) selected`
                        : "Select flags"}
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2" align="start">
                    <div className="space-y-1">
                      {flags.map((flag) => (
                        <div
                          key={flag._id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => handleFlagToggle(flag._id)}
                        >
                          <Checkbox
                            checked={selectedFlags.includes(flag._id)}
                            onCheckedChange={() => handleFlagToggle(flag._id)}
                          />
                          <Label className="cursor-pointer">{flag.name}</Label>
                        </div>
                      ))}
                      {flags.length === 0 && (
                        <p className="text-sm text-muted-foreground px-2">
                          No flags available
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {selectedFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedFlags.map((flagId) => {
                      const flag = flags.find((f) => f._id === flagId);
                      return flag ? (
                        <Badge key={flag._id} variant="secondary">
                          {flag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>
              Product Images <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesChange}
              className="hidden"
              id="multi-image-upload"
              name="images"
              ref={imagesInputRef}
              required={!isEditMode && selectedImages.length === 0}
            />
            <Label
              htmlFor="multi-image-upload"
              className="block relative cursor-pointer"
            >
              {existingImages.length > 0 || selectedImages.length > 0 ? (
                <div className="relative min-h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
                  {selectedImages.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAllNewImages();
                      }}
                    >
                      <X className="size-3 mr-1" />
                      {isEditMode ? "Remove New Images" : "Remove All"}
                    </Button>
                  )}
                  <div className="flex gap-4 flex-wrap mt-2 justify-center items-center">
                    {isEditMode &&
                      existingImages.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, index, "existing")
                          }
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index, "existing")}
                          onDragEnd={handleDragEnd}
                          className="relative w-[150px] h-[150px] rounded-lg overflow-hidden bg-muted/50 shadow-sm cursor-move"
                          style={{
                            opacity:
                              draggedIndex === index &&
                              dragSource === "existing"
                                ? 0.5
                                : 1,
                            outline:
                              draggedIndex === index &&
                              dragSource === "existing"
                                ? "2px dashed hsl(var(--muted-foreground))"
                                : "none",
                          }}
                        >
                          <img
                            src={`${imageUrl}/${image}`}
                            alt={`Existing ${index}`}
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(index);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
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
                        className="relative w-[150px] h-[150px] rounded-lg overflow-hidden bg-muted/50 shadow-sm cursor-move"
                        style={{
                          opacity:
                            draggedIndex === index && dragSource === "new"
                              ? 0.5
                              : 1,
                          outline:
                            draggedIndex === index && dragSource === "new"
                              ? "2px dashed hsl(var(--muted-foreground))"
                              : "none",
                        }}
                      >
                        <img
                          src={image}
                          alt={`New ${index}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImages(index);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Label
                      htmlFor="multi-image-upload"
                      className="w-[150px] h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/50 transition-colors cursor-pointer"
                    >
                      <Plus className="size-6" />
                      <p className="text-xs">Add more</p>
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 transition-colors">
                  <Image className="size-8" />
                  <p className="text-sm">Click to upload images</p>
                </div>
              )}
            </Label>
            {errors.images && (
              <p className="text-xs text-destructive">{errors.images}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Label>Product Has Variant?</Label>
              <Switch checked={hasVariant} onCheckedChange={handleToggle} />
            </div>

            {hasVariant && (
              <>
                <p className="text-center text-sm text-destructive">
                  Product Variant (Insert the Base Variant First)
                </p>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attributes</TableHead>
                        <TableHead className="w-24">Stock *</TableHead>
                        <TableHead className="w-24">Price *</TableHead>
                        <TableHead className="w-28">Disc. Price</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="space-y-2">
                              {variant.attributes.map((attr, attrIndex) => (
                                <div
                                  key={attrIndex}
                                  className="flex items-center gap-1.5"
                                >
                                  <Select
                                    value={attr.option}
                                    onValueChange={(value) => {
                                      const updatedVariants = [...variants];
                                      updatedVariants[index].attributes[
                                        attrIndex
                                      ].option = value;
                                      updatedVariants[index].attributes[
                                        attrIndex
                                      ].value = "";
                                      setVariants(updatedVariants);
                                    }}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {productOptions.map((option) => (
                                        <SelectItem
                                          key={option._id}
                                          value={option._id}
                                        >
                                          {option.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={attr.value}
                                    onValueChange={(value) => {
                                      const updatedVariants = [...variants];
                                      updatedVariants[index].attributes[
                                        attrIndex
                                      ].value = value;
                                      setVariants(updatedVariants);
                                    }}
                                    disabled={!attr.option}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {attr.option &&
                                        productOptions
                                          .find((o) => o._id === attr.option)
                                          ?.values?.map((val) => (
                                            <SelectItem key={val} value={val}>
                                              {val}
                                            </SelectItem>
                                          ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    type="button"
                                    onClick={() =>
                                      handleRemoveAttribute(index, attrIndex)
                                    }
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => handleAddAttribute(index)}
                              >
                                <Plus className="size-3 mr-1" />
                                Add Attribute
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.stock}
                              required
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].stock = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.price}
                              required
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].price = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.discount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === "") {
                                  const updatedVariants = [...variants];
                                  updatedVariants[index].discount = value;
                                  setVariants(updatedVariants);
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleAddVariant}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Another Variant
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>
              Product SEO Information{" "}
              <span className="text-muted-foreground font-normal text-sm">
                (Optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input
                  placeholder="Type a keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                />
                {metaKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {metaKeywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleDeleteKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{isEditMode ? "Update Product" : "Add Product"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
