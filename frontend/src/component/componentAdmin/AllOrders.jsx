import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  TextField,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  InputAdornment,
  IconButton,
  Checkbox,
} from "@mui/material";
import { Skeleton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../../store/useOrderStore.js";
import OrderStatusSelector from "./OrderStatusSelector.jsx";
import SendToCourierButton from "./SendToCourierButton.jsx";
import CourierSummary from "../componentAdmin/CourierSummery.jsx";
import RequirePermission from "./RequirePermission.jsx";

const AllOrders = ({ title, status = "" }) => {
  const {
    fetchAllOrders,
    totalOrders,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    searchQuery,
    setSearchQuery,
    orderListByStatus,
    orderListLoading,
    orderListError,
    allOrders: allOrdersFromStore,
    startDate: startDateFromStore,
    endDate: endDateFromStore,
    setDateRange,
  } = useOrderStore();

  const allOrders = useMemo(
    () => (status ? orderListByStatus[status] : allOrdersFromStore) || [],
    [status, orderListByStatus, allOrdersFromStore],
  );

  // Local state for sorting and UI
  const [sortDirection, setSortDirection] = useState("desc");
  const [orderBy, setOrderBy] = useState("orderNo");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [localStartDate, setLocalStartDate] = useState(
    startDateFromStore || "",
  );
  const [localEndDate, setLocalEndDate] = useState(endDateFromStore || "");

  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkCourierDialog, setBulkCourierDialog] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [sendingToCourier, setSendingToCourier] = useState(false);
  const [downloadingOrders, setDownloadingOrders] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Reset on status change
  useEffect(() => {
    setCurrentPage(1);
    setSearchInput("");
    setSearchQuery("");
    setLocalStartDate("");
    setLocalEndDate("");
    setDateRange(null, null);
    setSelectedOrders([]);
  }, [status, setSearchQuery, setDateRange]);

  // Fetch orders - memoized to prevent unnecessary recreations
  const fetchOrders = useCallback(() => {
    fetchAllOrders(status, currentPage, itemsPerPage);
  }, [status, currentPage, itemsPerPage, fetchAllOrders]);

  // Only fetch when dependencies actually change
  useEffect(() => {
    fetchOrders();
  }, [
    searchQuery,
    currentPage,
    itemsPerPage,
    status,
    startDateFromStore,
    endDateFromStore,
  ]);

  const handleOpenDialog = useCallback((id) => {
    setDeleteId(id);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setDeleteId(null);
  }, []);

  // Debounced search input
  const handleSearchInputChange = useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  const handleSearchExecute = useCallback(() => {
    const trimmedSearch = searchInput.trim();
    if (trimmedSearch !== searchQuery) {
      setSearchQuery(trimmedSearch);
      setCurrentPage(1);
    }
  }, [searchInput, searchQuery, setSearchQuery]);

  const handleDateFilter = () => {
    setDateRange(localStartDate, localEndDate);
  };

  const handleClearDateFilter = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    setDateRange(null, null);
  };

  const handleSearchKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearchExecute();
      }
    },
    [handleSearchExecute],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  }, [setSearchQuery]);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  const handleItemsPerPageChange = useCallback(
    (event) => {
      const newLimit = event.target.value;
      setItemsPerPage(newLimit);
      setCurrentPage(1); // Reset to first page
    },
    [setItemsPerPage],
  );

  const handleSortRequest = useCallback(
    (property) => {
      setSortDirection((prev) => {
        const isAsc = orderBy === property && prev === "asc";
        return isAsc ? "desc" : "asc";
      });
      setOrderBy(property);
    },
    [orderBy],
  );

  // Memoized sorting function
  const sortedOrders = useMemo(() => {
    const compare = (a, b) => {
      let aVal, bVal;

      switch (orderBy) {
        case "orderNo":
          aVal = a.orderNo;
          bVal = b.orderNo;
          break;
        case "orderDate":
          aVal = new Date(a.orderDate);
          bVal = new Date(b.orderDate);
          break;
        case "totalAmount":
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case "shippingInfo.fullName":
          aVal = a.shippingInfo.fullName;
          bVal = b.shippingInfo.fullName;
          break;
        case "shippingInfo.mobileNo":
          aVal = a.shippingInfo.mobileNo;
          bVal = b.shippingInfo.mobileNo;
          break;
        case "orderStatus":
          aVal = a.orderStatus;
          bVal = b.orderStatus;
          break;
        case "orderSource":
          aVal = a.orderSource;
          bVal = b.orderSource;
          break;
        case "paymentStatus":
          aVal = a.paymentStatus;
          bVal = b.paymentStatus;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    };

    return [...allOrders].sort(compare);
  }, [allOrders, orderBy, sortDirection]);

  // Calculate pagination info
  const { startEntry, endEntry } = useMemo(
    () => ({
      startEntry: (currentPage - 1) * itemsPerPage + 1,
      endEntry: Math.min(currentPage * itemsPerPage, totalOrders),
    }),
    [currentPage, itemsPerPage, totalOrders],
  );

  const handleView = useCallback(
    (orderId) => {
      navigate(`/admin/orders/${orderId}`);
    },
    [navigate],
  );

  const handleConfirmDelete = useCallback(async () => {
    try {
      const response = await axios.delete(`${apiUrl}/orders/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSnackbarMessage("Order deleted successfully");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        // Refetch current page
        fetchOrders();
      } else {
        setSnackbarMessage(response.data.message || "Failed to delete order");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "Error deleting order",
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    handleCloseDialog();
  }, [deleteId, apiUrl, token, fetchOrders, handleCloseDialog]);

  const handleSuccess = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Download orders as CSV
  const handleDownloadOrders = useCallback(async () => {
    setDownloadingOrders(true);
    try {
      // Fetch all orders from API
      const response = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 10000, // Large number to get all orders
          page: 1,
          ...(status && { orderStatus: status }), // Include status filter if applied
          ...(searchQuery && { search: searchQuery }), // Include search filter if applied
        },
      });

      const ordersToDownload = response.data.orders || [];

      if (ordersToDownload.length === 0) {
        setSnackbarMessage("No orders to download");
        setSnackbarSeverity("warning");
        setOpenSnackbar(true);
        setDownloadingOrders(false);
        return;
      }

      // Prepare CSV headers
      const headers = [
        "Order No",
        "Source",
        "Order Date",
        "Customer Name",
        "Mobile Number",
        "Email",
        "Address",
        "Billed Amount",
      ];

      // Prepare CSV rows
      const rows = ordersToDownload.map((order) => [
        order.orderNo || "",
        order.orderSource || "web",
        order.orderDate
          ? new Date(order.orderDate).toLocaleDateString()
          : new Date(order.createdAt).toLocaleDateString(),
        order.shippingInfo?.fullName || "",
        order.shippingInfo?.mobileNo || "",
        order.shippingInfo?.email || "",
        order.shippingInfo?.address || "",
        order.totalAmount?.toFixed(2) || "0",
      ]);

      // Create CSV content
      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) =>
          row
            .map((cell) => `"${cell?.toString().replace(/"/g, '""') || ""}"`)
            .join(","),
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Orders_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setSnackbarMessage(
        `Downloaded ${ordersToDownload.length} orders successfully`,
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "Error downloading orders",
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setDownloadingOrders(false);
    }
  }, [apiUrl, token, status, searchQuery]);

  // Bulk selection handlers
  const handleSelectAll = useCallback(
    (event) => {
      if (event.target.checked) {
        setSelectedOrders(allOrders.map((order) => order._id));
      } else {
        setSelectedOrders([]);
      }
    },
    [allOrders],
  );

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  }, []);

  const handleBulkUpdateOpen = useCallback(() => {
    setBulkNewStatus("");
    setBulkUpdateDialog(true);
  }, []);

  const handleBulkUpdateClose = useCallback(() => {
    setBulkUpdateDialog(false);
    setBulkNewStatus("");
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    if (!bulkNewStatus || selectedOrders.length === 0) return;

    setBulkUpdating(true);
    try {
      const response = await axios.put(
        `${apiUrl}/orders/bulk-update-status`,
        { orderIds: selectedOrders, orderStatus: bulkNewStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setSnackbarMessage(
          `${response.data.totalUpdated} orders updated successfully`,
        );
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        setSnackbarMessage(response.data.message || "Failed to update orders");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "Error updating orders",
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setBulkUpdating(false);
      handleBulkUpdateClose();
    }
  }, [
    bulkNewStatus,
    selectedOrders,
    apiUrl,
    token,
    fetchOrders,
    handleBulkUpdateClose,
  ]);

  // Bulk delete handlers
  const handleBulkDeleteOpen = useCallback(() => {
    setBulkDeleteDialog(true);
  }, []);

  const handleBulkDeleteClose = useCallback(() => {
    setBulkDeleteDialog(false);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedOrders.length === 0) return;

    setBulkDeleting(true);
    try {
      const response = await axios.delete(`${apiUrl}/orders/bulk-delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderIds: selectedOrders },
      });

      if (response.data.success) {
        setSnackbarMessage(
          `${response.data.totalDeleted} orders deleted successfully`,
        );
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        setSnackbarMessage(response.data.message || "Failed to delete orders");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "Error deleting orders",
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setBulkDeleting(false);
      handleBulkDeleteClose();
    }
  }, [selectedOrders, apiUrl, token, fetchOrders, handleBulkDeleteClose]);

  const handleBulkCourierOpen = useCallback(() => {
    setSelectedCourier("");
    setBulkCourierDialog(true);
  }, []);

  const handleBulkCourierClose = useCallback(() => {
    setBulkCourierDialog(false);
    setSelectedCourier("");
  }, []);

  const handleBulkSendToCourier = useCallback(async () => {
    if (!selectedCourier || selectedOrders.length === 0) return;

    setSendingToCourier(true);
    try {
      const ordersToSend = allOrders
        .filter((order) => selectedOrders.includes(order._id))
        .map((order) => ({
          invoice: order.orderNo,
          recipient_name: order.shippingInfo?.fullName || "N/A",
          recipient_phone: order.shippingInfo?.mobileNo || "",
          recipient_address: order.shippingInfo?.address || "N/A",
          cod_amount: String(order.dueAmount || 0), // Send as string for Steadfast
          note: order.note || "",
        }));

      console.log("Sending to Steadfast:", ordersToSend);

      let response;
      if (selectedCourier === "steadfast") {
        response = await axios.post(
          `${apiUrl}/steadfast/bulk-order`,
          { data: ordersToSend },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (selectedCourier === "pathao") {
        response = await axios.post(
          `${apiUrl}/pathao/orders/bulk`,
          { data: ordersToSend },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      console.log("Courier response:", response.data);

      if (response.data.status === "success") {
        // Ensure data is an array before filtering
        const responseData = Array.isArray(response.data.data) ? response.data.data : [];

        console.log("Response data array:", responseData);

        const successCount = responseData.filter(
          (r) => r.status === "success",
        ).length;
        const errorCount = responseData.filter(
          (r) => r.status === "error",
        ).length;

        // Update successfully sent orders with courier details
        if (successCount > 0) {
          const updatePromises = responseData
            .filter((r) => r.status === "success")
            .map((result) => {
              // Find the order by invoice number
              const order = allOrders.find((o) => o.orderNo === result.invoice);
              if (!order) return null;

              // Prepare update payload based on courier type
              let updatePayload = {
                sentToCourier: true,
                orderStatus: "intransit",
                courierProvider: selectedCourier,
              };

              if (selectedCourier === "steadfast") {
                updatePayload.courierConsignmentId = result.consignment_id;
              } else if (selectedCourier === "pathao") {
                updatePayload.courierConsignmentId = result.consignment_id;
              }

              return axios.put(
                `${apiUrl}/orders/${order._id}`,
                updatePayload,
                { headers: { Authorization: `Bearer ${token}` } },
              );
            })
            .filter((p) => p !== null);

          // Wait for all updates to complete
          try {
            await Promise.all(updatePromises);
            console.log("All orders updated successfully");
          } catch (updateError) {
            console.error("Error updating orders:", updateError);
          }
        }

        // If all orders failed, show detailed error
        if (successCount === 0 && errorCount === 0 && responseData.length === 0) {
          setSnackbarMessage(
            "All orders were rejected by Steadfast. Check console logs and your Steadfast dashboard for details.",
          );
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage(
            `${successCount} orders sent to ${selectedCourier} successfully${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
          );
          setSnackbarSeverity(errorCount > 0 ? "warning" : "success");
        }
        setOpenSnackbar(true);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        setSnackbarMessage(
          response.data.message || "Failed to send orders to courier",
        );
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        error.message ||
        "Error sending orders to courier";
      console.error("Bulk courier error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setSendingToCourier(false);
      handleBulkCourierClose();
    }
  }, [
    selectedCourier,
    selectedOrders,
    allOrders,
    apiUrl,
    token,
    fetchOrders,
    handleBulkCourierClose,
  ]);

  // Memoize the loading skeleton
  const LoadingSkeleton = useMemo(
    () => (
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Order No",
                "Order Date & Time",
                "Customer",
                "Mobile No",
                "Courier",
                "Courier Status",
                "Status",
                "Payment Status",
                "Total Amount",
                "Source",
                "Actions",
              ].map((header, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width={120} height={30} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(itemsPerPage)].map((_, index) => (
              <TableRow key={index}>
                {Array(11)
                  .fill()
                  .map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [itemsPerPage],
  );

  return (
    <div className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        {title}
      </h1>

      <div className={"flex justify-center items-center"}>
        <Button
          variant="contained"
          color="success"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadOrders}
          disabled={downloadingOrders}
        >
          {downloadingOrders ? "Downloading..." : "Download All Orders (CSV)"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 shadow rounded-lg p-4 items-center mt-6 mb-6">
        <TextField
          label="Search Orders"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
          placeholder="Search Orders..."
          disabled={orderListLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchInput && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <IconButton
                  aria-label="search"
                  onClick={handleSearchExecute}
                  edge="end"
                  disabled={!searchInput.trim()}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl>
          <InputLabel>Items per Page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Items per Page"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shadow rounded-lg p-4 items-center mb-6">
        <TextField
          label="Start Date"
          type="date"
          value={localStartDate}
          onChange={(e) => setLocalStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="End Date"
          type="date"
          value={localEndDate}
          onChange={(e) => setLocalEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleDateFilter}
          disabled={!localStartDate && !localEndDate}
        >
          Filter by Date
        </Button>
        <Button
          variant="outlined"
          onClick={handleClearDateFilter}
          disabled={!localStartDate && !localEndDate}
        >
          Clear Dates
        </Button>
      </div>

      {searchQuery && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {orderListLoading
              ? "Searching..."
              : `Search results for: "${searchQuery}"`}
          </Typography>
          <Button size="small" variant="outlined" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </Box>
      )}

      {orderListLoading ? (
        LoadingSkeleton
      ) : orderListError ? (
        <Typography color="error">{orderListError}</Typography>
      ) : (
        <>
          {allOrders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                {searchQuery
                  ? "No orders found matching your search."
                  : "No orders found."}
              </Typography>
              {searchQuery && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Try adjusting your search terms or clear the search to see all
                  orders.
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ position: "relative" }}>
              {selectedOrders.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: "primary.light",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1">
                    {selectedOrders.length} order(s) selected
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBulkUpdateOpen}
                  >
                    Bulk Update Status
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleBulkDeleteOpen}
                  >
                    Bulk Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleBulkCourierOpen}
                  >
                    Send to Courier
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedOrders([])}
                  >
                    Clear Selection
                  </Button>
                </Box>
              )}

              <TableContainer
                component={Paper}
                sx={{
                  opacity: orderListLoading ? 0.6 : 1,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={
                            allOrders.length > 0 &&
                            selectedOrders.length === allOrders.length
                          }
                          indeterminate={
                            selectedOrders.length > 0 &&
                            selectedOrders.length < allOrders.length
                          }
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "orderNo"}
                          direction={
                            orderBy === "orderNo" ? sortDirection : "asc"
                          }
                          onClick={() => handleSortRequest("orderNo")}
                        >
                          Order No
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "orderDate"}
                          direction={
                            orderBy === "orderDate" ? sortDirection : "asc"
                          }
                          onClick={() => handleSortRequest("orderDate")}
                        >
                          Order Date & Time
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "shippingInfo.fullName"}
                          direction={
                            orderBy === "shippingInfo.fullName"
                              ? sortDirection
                              : "asc"
                          }
                          onClick={() =>
                            handleSortRequest("shippingInfo.fullName")
                          }
                        >
                          Customer
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "shippingInfo.mobileNo"}
                          direction={
                            orderBy === "shippingInfo.mobileNo"
                              ? sortDirection
                              : "asc"
                          }
                          onClick={() =>
                            handleSortRequest("shippingInfo.mobileNo")
                          }
                        >
                          Mobile No
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Courier</TableCell>
                      <TableCell>Courier Status</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "orderStatus"}
                          direction={
                            orderBy === "orderStatus" ? sortDirection : "asc"
                          }
                          onClick={() => handleSortRequest("orderStatus")}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "orderSource"}
                          direction={
                            orderBy === "orderSource" ? sortDirection : "asc"
                          }
                          onClick={() => handleSortRequest("orderSource")}
                        >
                          Source
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "totalAmount"}
                          direction={
                            orderBy === "totalAmount" ? sortDirection : "asc"
                          }
                          onClick={() => handleSortRequest("totalAmount")}
                        >
                          Total Amount
                        </TableSortLabel>
                      </TableCell>                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOrders.map((order) => (
                      <TableRow key={order._id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                          />
                        </TableCell>
                        <TableCell>{order.orderNo}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{order.shippingInfo.fullName}</TableCell>
                        <TableCell>{order.shippingInfo.mobileNo}</TableCell>
                        <TableCell>
                          <SendToCourierButton
                            orderData={{
                              invoice: order.orderNo,
                              recipient_name: order.shippingInfo?.fullName,
                              recipient_phone: order.shippingInfo?.mobileNo,
                              recipient_address: order.shippingInfo?.address,
                              cod_amount: order.dueAmount,
                              note: order.note || "",
                              order_id: order._id,
                              courier_status: order.sentToCourier,
                              items: order.items.length,
                              courierProvider: order.courierProvider,
                            }}
                            onSuccess={handleSuccess}
                          />
                        </TableCell>
                        <TableCell>
                          <CourierSummary
                            phone={order.shippingInfo?.mobileNo}
                          />
                        </TableCell>
                        <TableCell>
                          <OrderStatusSelector
                            orderId={order._id}
                            refetchOrders={fetchOrders}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={order.orderSource === "admin" ? "Admin" : "Web"}
                            color={order.orderSource === "admin" ? "primary" : "success"}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          Tk. {order.totalAmount?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View">
                              <IconButton
                                onClick={() => handleView(order._id)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <RequirePermission
                              permission="delete_orders"
                              fallback={true}
                            >
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleOpenDialog(order._id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </RequirePermission>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography>
                  Showing {startEntry} to {endEntry} of {totalOrders} entries
                  {searchQuery && ` (filtered)`}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  disabled={orderListLoading}
                />
              </Box>
            </Box>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkUpdateDialog} onClose={handleBulkUpdateClose}>
        <DialogTitle>Bulk Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to update {selectedOrders.length} order(s) to a new
            status.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={bulkNewStatus}
              label="New Status"
              onChange={(e) => setBulkNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="intransit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkUpdateClose} disabled={bulkUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpdate}
            color="primary"
            disabled={!bulkNewStatus || bulkUpdating}
          >
            {bulkUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeleteDialog} onClose={handleBulkDeleteClose}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedOrders.length} order(s)?
            This action cannot be undone and will restore stock for each order.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkDeleteClose} disabled={bulkDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            disabled={bulkDeleting}
          >
            {bulkDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkCourierDialog} onClose={handleBulkCourierClose}>
        <DialogTitle>Send to Courier</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to send {selectedOrders.length} order(s) to a courier
            service.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Select Courier</InputLabel>
            <Select
              value={selectedCourier}
              label="Select Courier"
              onChange={(e) => setSelectedCourier(e.target.value)}
            >
              <MenuItem value="steadfast">Steadfast</MenuItem>
              <MenuItem value="pathao">Pathao</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkCourierClose} disabled={sendingToCourier}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkSendToCourier}
            color="primary"
            disabled={!selectedCourier || sendingToCourier}
          >
            {sendingToCourier ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AllOrders;