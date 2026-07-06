import React, { useEffect, useState, useCallback } from "react";
import useProductStore from "../../store/useProductStore.js";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import { Link } from "react-router-dom";
import RequirePermission from "./RequirePermission.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SectionHeader } from "@/component/componentAdmin/SectionHeader.jsx";

const ViewAllProducts = () => {
  const {
    products,
    totalPages,
    totalProductsAdmin,
    activeCount,
    inactiveCount,
    currentPage,
    loading,
    error,
    fetchProductsAdmin,
    deleteProduct,
    duplicateProduct,
  } = useProductStore();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProductsAdmin(filters);
  }, [filters.page, filters.limit, fetchProductsAdmin]);

  useEffect(() => {
    setFilteredProducts(
      products
        .filter((product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    );
  }, [filters.search, products]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  }, []);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenDialog = (id) => {
    setSelectedProductId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(selectedProductId);
      toast.success(`Product ID ${selectedProductId} deleted successfully!`);
      fetchProductsAdmin(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateProduct(id);
      toast.success("Product duplicated successfully!");
      fetchProductsAdmin(filters);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to duplicate product.",
      );
    }
  };

  const startItem =
    products.length > 0 ? (currentPage - 1) * filters.limit + 1 : 0;
  const endItem = Math.min(
    currentPage * filters.limit,
    (currentPage - 1) * filters.limit + filteredProducts.length,
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={"All Products"} />

      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-md border-0 border-l-4 border-l-[#00395d]">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-[#00395d]">
              {totalProductsAdmin}
            </p>
            <p className="text-sm text-muted-foreground">All Products</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-red-600">{inactiveCount}</p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Show</p>
          <Select
            value={String(filters.limit)}
            onValueChange={(value) => handleFilterChange("limit", value)}
          >
            <SelectTrigger className="w-16 h-8 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">entries</p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground py-8"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-muted-foreground">
                        #{product.productId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <ImageComponent
                        imageName={product?.thumbnailImage}
                        altName={product?.name}
                        skeletonHeight={30}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.name || "\u2014"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.variants?.length ? (
                        <div>
                          <p className="font-semibold">
                            ৳{Math.min(...product.variants.map((v) => v.price))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.variants.length} var.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">৳{product.finalPrice}</p>
                          {product.finalDiscount > 0 && (
                            <p className="text-xs text-destructive line-through">
                              ৳{product.finalDiscount}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            product.finalStock > 0
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {product.finalStock > 0
                            ? `${product.finalStock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {product.flags?.length ? (
                          product.flags.map((flag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {flag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            \u2014
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-xs" asChild>
                              <a
                                href={`/product/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="size-3.5" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Product</TooltipContent>
                        </Tooltip>
                        <RequirePermission
                          permission="edit_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-xs" asChild>
                                <Link
                                  to={`/admin/edit-product/${product.slug}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Product</TooltipContent>
                          </Tooltip>
                        </RequirePermission>
                        <RequirePermission
                          permission="add_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleDuplicate(product.id)}
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate</TooltipContent>
                          </Tooltip>
                        </RequirePermission>
                        <RequirePermission
                          permission="delete_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenDialog(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </RequirePermission>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalProductsAdmin} products
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {(() => {
              const pages = [];
              const delta = 1;
              const left = Math.max(2, currentPage - delta);
              const right = Math.min(totalPages - 1, currentPage + delta);
              pages.push(1);
              if (left > 2) pages.push("...");
              for (let i = left; i <= right; i++) pages.push(i);
              if (right < totalPages - 1) pages.push("...");
              if (totalPages > 1) pages.push(totalPages);
              return pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "ghost"}
                    size="sm"
                    className="min-w-9"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                ),
              );
            })()}
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAllProducts;
