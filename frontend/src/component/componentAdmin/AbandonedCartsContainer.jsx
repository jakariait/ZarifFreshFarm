import { useEffect, useState } from "react";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import CourierSummery from "./CourierSummery.jsx";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Checkbox,
  IconButton,
  Select,
} from "@mui/material";
import RequirePermission from "./RequirePermission.jsx";

const AbandonedCartsList = ({
  data,
  onPageChange,
  onDeleteRequest,
  onBulkDeleteRequest,
  onEditRequest,
  onConvertRequest,
  selectedCarts,
  onToggleSelect,
  onSelectAll,
}) => {
  const { totalCount, carts, page, limit, totalPages } = data;
  const allSelected =
    carts.length > 0 && carts.every((cart) => selectedCarts.includes(cart._id));
  const someSelected =
    carts.some((cart) => selectedCarts.includes(cart._id)) && !allSelected;

  const getStatusBadge = (status) => {
    if (status === "converted") {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Converted
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
        Abandoned
      </span>
    );
  };

  return (
    <div className="p-4 shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold">
          Incomplete Orders ({totalCount})
        </h1>
        {selectedCarts.length > 0 && (
          <RequirePermission
            permission="delete_incomplete_orders"
            fallback={true}
          >
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => onBulkDeleteRequest(selectedCarts)}
            >
              Delete Selected ({selectedCarts.length})
            </Button>
          </RequirePermission>
        )}
      </div>

      {carts.length === 0 ? (
        <p className="text-gray-600">No Incomplete Orders Found.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={() => onSelectAll(carts.map((c) => c._id))}
              size="small"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
          {carts.map((cart) => (
            <div
              key={cart._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex items-start gap-2 mb-2">
                <Checkbox
                  checked={selectedCarts.includes(cart._id)}
                  onChange={() => onToggleSelect(cart._id)}
                  disabled={cart.status === "converted"}
                  size="small"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 flex-1">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {cart.fullName || "Unnamed Customer"}
                    </h3>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <p>
                        <strong>Number:</strong> {cart.number || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong> {cart.email || "N/A"}
                      </p>
                      <p>
                        <strong>Address:</strong> {cart.address || "N/A"}
                      </p>
                      <div className="mt-1">{getStatusBadge(cart.status)}</div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <CourierSummery phone={cart.number} />
                  </div>

                  <div className="text-right flex flex-col mt-3 md:mt-0 items-end space-y-1">
                    <p className="text-md font-semibold text-gray-800">
                      Total: Tk.{cart.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(cart.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <div className="flex gap-1">
                      {cart.status !== "converted" && (
                        <>
                          <RequirePermission
                            permission="edit_incomplete_orders"
                            fallback={true}
                          >
                            <button
                              onClick={() => onEditRequest(cart)}
                              className="text-xs bg-blue-500 text-white rounded-md px-2 py-1 cursor-pointer hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          </RequirePermission>
                          <RequirePermission
                            permission="edit_incomplete_orders"
                            fallback={true}
                          >
                            <button
                              onClick={() => onConvertRequest(cart)}
                              className="text-xs bg-green-500 text-white rounded-md px-2 py-1 cursor-pointer hover:bg-green-600"
                            >
                              Convert
                            </button>
                          </RequirePermission>
                        </>
                      )}
                      <RequirePermission
                        permission="delete_incomplete_orders"
                        fallback={true}
                      >
                        <button
                          onClick={() => onDeleteRequest(cart._id)}
                          className="text-xs primaryBgColor accentTextColor rounded-md px-2 py-1 cursor-pointer"
                        >
                          Delete
                        </button>
                      </RequirePermission>
                    </div>
                  </div>
                </div>
              </div>

              {cart.cartItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {cart.cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-3 border border-gray-100 rounded-md p-2"
                    >
                      <ImageComponent
                        imageName={item.product?.thumbnailImage}
                        altName={item.product?.name}
                        skeletonHeight={50}
                        className="w-16 h-16 rounded object-cover"
                      />
                       <div className="flex-1 text-sm">
                         <p className="font-medium">
                           {item.product?.name || "-"}
                         </p>
                         <p className="text-gray-500">
                           {item.product?.category || "-"} |{" "}
                           {item.variant?.displayName || "No variant"}
                         </p>
                        <p className="text-gray-700">
                          Tk.{item.price?.toFixed(2) || "0.00"} ×{" "}
                          {item.quantity} ={" "}
                          <span className="font-semibold">
                            Tk.
                            {((item.price || 0) * (item.quantity || 0)).toFixed(
                              2,
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">No items in cart.</p>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-1 rounded primaryBgColor accentTextColor disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-1 rounded primaryBgColor accentTextColor disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EditCartDialog = ({ open, cart, onClose, onSave, shippingOptions }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    email: "",
    address: "",
    totalAmount: 0,
  });

  useEffect(() => {
    if (cart) {
      setFormData({
        fullName: cart.fullName || "",
        number: cart.number || "",
        email: cart.email || "",
        address: cart.address || "",
        totalAmount: cart.totalAmount || 0,
      });
    }
  }, [cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalAmount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    onSave(cart._id, formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Abandoned Cart</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-2" style={{ padding: "10px" }}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Number"
            name="number"
            value={formData.number}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Total Amount"
            name="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={handleChange}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConvertToOrderDialog = ({
  open,
  cart,
  onClose,
  onConvert,
  shippingOptions,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    email: "",
    address: "",
    shippingId: "",
    paymentMethod: "cash_on_delivery",
    specialDiscount: 0,
  });

  useEffect(() => {
    if (cart) {
      setFormData({
        fullName: cart.fullName || "",
        number: cart.number || "",
        email: cart.email || "",
        address: cart.address || "",
        shippingId: shippingOptions[0]?._id || "",
        paymentMethod: "cash_on_delivery",
        specialDiscount: 0,
      });
    }
  }, [cart, shippingOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "shippingId" || name === "specialDiscount" ? value : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.shippingId) {
      alert("Please select a shipping method");
      return;
    }
    onConvert(cart._id, formData);
  };

  const isFormValid =
    formData.fullName.trim() && formData.address.trim() && formData.shippingId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Convert to Order</DialogTitle>
      <DialogContent>
        <DialogContentText className="mb-3">
          Create an order from this abandoned cart. Stock will be deducted.
        </DialogContentText>
        <div className="flex flex-col gap-4" style={{ padding: "10px" }}>
          <TextField
            fullWidth
            label="Full Name *"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={!formData.fullName.trim()}
            helperText={
              !formData.fullName.trim() ? "Full Name is required" : ""
            }
          />
          <TextField
            fullWidth
            label="Number"
            name="number"
            value={formData.number}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Address *"
            name="address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            required
            error={!formData.address.trim()}
            helperText={!formData.address.trim() ? "Address is required" : ""}
          />
          <TextField
            fullWidth
            select
            label="Shipping Method"
            name="shippingId"
            value={formData.shippingId}
            onChange={handleChange}
          >
            {shippingOptions.map((option) => (
              <MenuItem key={option._id} value={option._id}>
                {option.name} - Tk.{option.value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Payment Method"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            style={{ marginBottom: "8px" }}
          >
            <MenuItem value="cash_on_delivery">Cash on Delivery</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Special Discount"
            name="specialDiscount"
            type="number"
            value={formData.specialDiscount}
            onChange={handleChange}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={!isFormValid}
        >
          Create Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AbandonedCartsContainer = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [data, setData] = useState({
    totalCount: 0,
    carts: [],
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    totalCount: 0,
    abandonedCount: 0,
    convertedCount: 0,
    ratio: 0,
  });

  // Filter state
  const [sort, setSort] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selection state
  const [selectedCarts, setSelectedCarts] = useState([]);

  // Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState(null);

  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCart, setEditingCart] = useState(null);

  // Convert to order dialog state
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [convertingCart, setConvertingCart] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchAbandonedCarts = async (
    page = 1,
    limit = 10,
    filterStatus = null,
  ) => {
    try {
      setLoading(true);
      const currentStatus = filterStatus !== null ? filterStatus : statusFilter;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        status: currentStatus,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${apiUrl}/abandoned-cart?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json.success) {
        setData({
          carts: json.data.carts,
          totalCount: json.data.totalCount,
          page,
          limit,
          totalPages: json.data.totalPages,
        });
        setError(null);
        setSelectedCarts([]);
      } else {
        throw new Error(json.message || "Failed to fetch abandoned carts");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/abandoned-cart/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchShippingOptions = async () => {
    try {
      const response = await fetch(`${apiUrl}/getAllShipping`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
      if (json.success) {
        setShippingOptions(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch shipping options:", err);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts(1, itemsPerPage);
    fetchShippingOptions();
    fetchStats();
  }, []);

  // Selection handlers
  const handleToggleSelect = (cartId) => {
    setSelectedCarts((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const handleSelectAll = (cartIds) => {
    const allSelected = cartIds.every((id) => selectedCarts.includes(id));
    if (allSelected) {
      setSelectedCarts([]);
    } else {
      setSelectedCarts(cartIds);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (cartId) => {
    setSelectedCartId(cartId);
    setOpenDeleteDialog(true);
  };

  const handleBulkDeleteRequest = (cartIds) => {
    setSelectedCartId(cartIds);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const isBulk = Array.isArray(selectedCartId);
      const url = isBulk
        ? `${apiUrl}/abandoned-cart/bulk-delete`
        : `${apiUrl}/abandoned-cart/${selectedCartId}`;

      const res = await fetch(url, {
        method: isBulk ? "DELETE" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: isBulk ? JSON.stringify({ ids: selectedCartId }) : undefined,
      });

      if (!res.ok) {
        throw new Error("Failed to delete cart(s)");
      }

      const json = await res.json();
      setSnackbar({ open: true, message: json.message, severity: "success" });
      setOpenDeleteDialog(false);
      setSelectedCartId(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter);
      fetchStats();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error: " + err.message,
        severity: "error",
      });
    }
  };

  // Edit handlers
  const handleEditRequest = (cart) => {
    setEditingCart(cart);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async (cartId, updateData) => {
    try {
      const res = await fetch(`${apiUrl}/abandoned-cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update cart");
      }

      const json = await res.json();
      setSnackbar({ open: true, message: json.message, severity: "success" });
      setOpenEditDialog(false);
      setEditingCart(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter);
      fetchStats();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error: " + err.message,
        severity: "error",
      });
    }
  };

  // Convert handlers
  const handleConvertRequest = (cart) => {
    setConvertingCart(cart);
    setOpenConvertDialog(true);
  };

  const handleConvertToOrder = async (cartId, orderData) => {
    try {
      const res = await fetch(
        `${apiUrl}/abandoned-cart/${cartId}/convert-to-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        },
      );

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message || "Failed to convert to order");
      }

      const json = await res.json();
      setSnackbar({ open: true, message: json.message, severity: "success" });
      setOpenConvertDialog(false);
      setConvertingCart(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter);
      fetchStats();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error: " + err.message,
        severity: "error",
      });
    }
  };

  const handlePageChange = (newPage) => {
    fetchAbandonedCarts(newPage, itemsPerPage, statusFilter);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    fetchAbandonedCarts(1, itemsPerPage, newStatus);
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    fetchAbandonedCarts(1, newLimit, statusFilter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAbandonedCarts(1, itemsPerPage, statusFilter);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter);
  };

  const handleResetFilters = () => {
    setSort("desc");
    setStatusFilter("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setItemsPerPage(10);
    fetchAbandonedCarts(1, 10, "all");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading)
    return <p className="text-center mt-10">Loading abandoned carts...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-600">Error: {error}</p>;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Carts</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Abandoned</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.abandonedCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Converted</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.convertedCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Conversion Ratio</p>
          <p className="text-2xl font-bold text-gray-800">{stats.ratio}%</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-50 p-4 flex items-center justify-center gap-4 rounded-lg mb-4">
        {/* Row 1: Sort, Status, Search */}
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by Date:</label>
            <Select
              value={sort}
              onChange={handleSortChange}
              size="small"
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status:</label>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              size="small"
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="abandoned">Abandoned</MenuItem>
              <MenuItem value="converted">Converted</MenuItem>
            </Select>
          </div>
          <TextField
            size="small"
            placeholder="Search by number..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
            sx={{ minWidth: 180 }}
          />
          <Button variant="contained" size="small" onClick={handleSearchSubmit}>
            Search
          </Button>
        </div>

        {/* Row 2: Date Range, Reset, Items per page */}
        <div className="flex flex-wrap gap-3 items-center">
          <TextField
            type="date"
            label="From Date"
            value={startDate}
            onChange={handleStartDateChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            type="date"
            label="To Date"
            value={endDate}
            onChange={handleEndDateChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            Reset
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-600">Items per page:</label>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              size="small"
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </div>
        </div>
      </div>

      <AbandonedCartsList
        data={data}
        onPageChange={handlePageChange}
        onDeleteRequest={handleDeleteRequest}
        onBulkDeleteRequest={handleBulkDeleteRequest}
        onEditRequest={handleEditRequest}
        onConvertRequest={handleConvertRequest}
        selectedCarts={selectedCarts}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Abandoned Cart</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {Array.isArray(selectedCartId)
              ? `Are you sure you want to delete ${selectedCartId.length} abandoned cart(s)? This action cannot be undone.`
              : "Are you sure you want to delete this abandoned cart? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <EditCartDialog
        open={openEditDialog}
        cart={editingCart}
        onClose={() => {
          setOpenEditDialog(false);
          setEditingCart(null);
        }}
        onSave={handleSaveEdit}
        shippingOptions={shippingOptions}
      />

      {/* Convert to Order Dialog */}
      <ConvertToOrderDialog
        open={openConvertDialog}
        cart={convertingCart}
        onClose={() => {
          setOpenConvertDialog(false);
          setConvertingCart(null);
        }}
        onConvert={handleConvertToOrder}
        shippingOptions={shippingOptions}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AbandonedCartsContainer;
