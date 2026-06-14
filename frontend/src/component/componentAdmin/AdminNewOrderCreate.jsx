import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import useOrderStore from "../../store/useOrderStore.js";

const AdminNewOrderCreate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { fetchAllOrders } = useOrderStore();

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);

  // Customer selection
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isGuest, setIsGuest] = useState(true);

  // Guest customer info
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    mobileNo: "",
    email: "",
    address: "",
  });

  // Products
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Order items cart
  const [orderItems, setOrderItems] = useState([]);

  // Check if any product has free shipping
  const hasFreeShippingProduct = orderItems.some((item) => item.freeShipping);

  // Shipping & Payment
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  // Discounts
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");

  // Notes
  const [adminNote, setAdminNote] = useState("");

  // Calculations
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    vat: 0,
    deliveryCharge: 0,
    total: 0,
  });
  const [vatPercentage, setVatPercentage] = useState(0);

  // Loading & Alerts
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    mobileNo: false,
    address: false,
    selectedCustomer: false,
    selectedShipping: false,
  });

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchShippingOptions();
    fetchVatPercentage();
  }, []);

  // Fetch customers when switching to registered user
  useEffect(() => {
    if (!isGuest) {
      fetchCustomers();
    }
  }, [isGuest]);

  useEffect(() => {
    calculateTotals();
  }, [orderItems, selectedShipping, specialDiscount, vatPercentage]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllProductsAdmin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data?.success) {
        setProducts(res.data.products || []);
      } else {
        showSnackbar("Failed to fetch products", "error");
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to fetch products",
        "error",
      );
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllUsers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data?.success) {
        setCustomers(res.data.users || []);
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to fetch customers",
        "error",
      );
    }
  };

  const fetchShippingOptions = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllShipping`);
      if (res.data?.success) {
        setShippingOptions(res.data.data);
      }
    } catch (err) {
      showSnackbar("Failed to fetch shipping options", "error");
    }
  };

  const fetchVatPercentage = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getVatPercentage`);
      if (res.data?.success && res.data.data) {
        const vatValue = res.data.data.percentage || res.data.data.value || 0;
        setVatPercentage(parseFloat(vatValue) || 0);
      } else {
        setVatPercentage(0);
      }
    } catch (err) {
      setVatPercentage(0);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to build variant name from attributes
  const getVariantName = (variant) => {
    if (!variant) return "Unknown";

    // If variant has attributes, build name from them (e.g., "M - Red")
    if (variant.attributes && variant.attributes.length > 0) {
      return variant.attributes
        .map((attr) => attr.value) // attr.value is the actual value (e.g., "M", "Red")
        .join(" - ");
    }

    // Fallback to _id if no attributes
    return `Variant ${variant._id.slice(-4)}`;
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      showSnackbar("Please select a product", "error");
      return;
    }

    // Check if product has variants
    const hasVariants =
      selectedProduct.variants && selectedProduct.variants.length > 0;

    if (hasVariants && !selectedVariant) {
      showSnackbar("Please select a variant", "error");
      return;
    }

    if (quantity < 1) {
      showSnackbar("Please enter a valid quantity", "error");
      return;
    }

    // Handle both products with and without variants
    let price, variantId, variantName;

    if (hasVariants) {
      // Use discount price if available, otherwise use regular price (matching Checkout.jsx logic)
      price =
        selectedVariant.discount > 0
          ? selectedVariant.discount
          : selectedVariant.price || 0;
      variantId = selectedVariant._id;
      variantName = getVariantName(selectedVariant);
    } else {
      // For products without variants, use discount price if available (matching Checkout.jsx logic)
      price =
        selectedProduct.finalDiscount > 0
          ? selectedProduct.finalDiscount
          : selectedProduct.finalPrice || 0;
      variantId = null;
      variantName = "Default";
    }

    const newItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name, // Use 'name' not 'productName'
      variantId,
      variantName,
      quantity: parseInt(quantity),
      price,
      freeShipping: selectedProduct.freeShipping || false,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    showSnackbar("Product added to order", "success");
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const hasFreeShipping = orderItems.some((item) => item.freeShipping === true);
    
    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );
    
    // Use 'value' instead of 'deliveryCharge' - shipping model uses 'value' field
    // If any product has freeShipping, delivery charge is 0
    const deliveryCharge = hasFreeShipping ? 0 : (selectedShipping?.value || 0);
    const discount = parseFloat(specialDiscount) || 0;

    // Calculate amount after discounts (matching Checkout.jsx logic)
    const amountAfterDiscount = subtotal - discount;

    // VAT is calculated on the amount AFTER discounts (matching Checkout.jsx)
    const vatPercent = parseFloat(vatPercentage) || 0;
    const vat = Math.max(0, (amountAfterDiscount * vatPercent) / 100);

    // Total = subtotal - discount + vat + delivery
    const total = Math.max(0, subtotal + deliveryCharge + vat - discount);

    setCalculatedTotals({
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      deliveryCharge: Math.round(deliveryCharge * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  };

  const handleCreateOrder = async () => {
    try {
      if (orderItems.length === 0) {
        showSnackbar("Add at least one product to the order", "error");
        return;
      }

      if (!hasFreeShippingProduct && !selectedShipping) {
        showSnackbar("Please select a shipping option", "error");
        return;
      }

      // Validate customer information
      if (isGuest) {
        if (!guestInfo.fullName?.trim()) {
          showSnackbar("Full Name is required", "error");
          return;
        }
        if (!guestInfo.mobileNo?.trim()) {
          showSnackbar("Mobile Number is required", "error");
          return;
        }
        if (!guestInfo.address?.trim()) {
          showSnackbar("Address is required", "error");
          return;
        }
      } else {
        // For registered customers
        if (!selectedCustomer) {
          showSnackbar("Please select a customer", "error");
          return;
        }
        if (!selectedCustomer?.fullName?.trim()) {
          showSnackbar("Customer Full Name is required", "error");
          return;
        }
        if (!selectedCustomer?.phone?.trim()) {
          showSnackbar("Customer Mobile Number is required", "error");
          return;
        }
        if (!guestInfo.address?.trim()) {
          showSnackbar("Address is required", "error");
          return;
        }
      }

      setIsLoading(true);

      const orderData = {
        userId: isGuest ? null : selectedCustomer?._id,
        items: orderItems,
        paymentMethod,
        paymentStatus,
        shippingInfo: isGuest
          ? guestInfo
          : {
              fullName: selectedCustomer?.fullName || "",
              mobileNo: selectedCustomer?.phone || "",
              email: selectedCustomer?.email || "",
              address: guestInfo.address,
            },
        billingInfo: isGuest
          ? guestInfo
          : {
              fullName: selectedCustomer?.fullName || "",
              address: guestInfo.address,
            },
        shippingId: hasFreeShippingProduct ? shippingOptions[0]?._id : selectedShipping._id,
        deliveryCharge: hasFreeShippingProduct ? 0 : selectedShipping.value,
        subtotalAmount: calculatedTotals.subtotal,
        vat: calculatedTotals.vat,
        specialDiscount: specialDiscount,
        promoCode: promoCode || null,
        promoDiscount: 0,
        adminNote,
        orderSource: "admin", // Mark as admin order
      };

      const res = await axios.post(`${apiUrl}/orders/admin/create`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data?.success) {
        showSnackbar("Order created successfully!", "success");
        // Refetch all orders to show the new order
        fetchAllOrders();
        handleCloseDialog();
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to create order",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setOrderItems([]);
    setSelectedCustomer(null);
    setGuestInfo({ fullName: "", mobileNo: "", email: "", address: "" });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setSpecialDiscount(0);
    setPromoCode("");
    setAdminNote("");
    setPaymentMethod("cash_on_delivery");
    setPaymentStatus("unpaid");
    setFormErrors({
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    });
  };

  // Real-time form validation
  const validateForm = () => {
    const errors = {
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    };

    if (isGuest) {
      if (!guestInfo.fullName?.trim()) errors.fullName = true;
      if (!guestInfo.mobileNo?.trim()) errors.mobileNo = true;
      if (!guestInfo.address?.trim()) errors.address = true;
    } else {
      if (!selectedCustomer) errors.selectedCustomer = true;
      if (!guestInfo.fullName?.trim()) errors.fullName = true;
      if (!guestInfo.mobileNo?.trim()) errors.mobileNo = true;
      if (!guestInfo.address?.trim()) errors.address = true;
    }

    if (!hasFreeShippingProduct && !selectedShipping) errors.selectedShipping = true;

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  // Trigger validation whenever relevant fields change
  useEffect(() => {
    if (openDialog) {
      validateForm();
    }
  }, [
    isGuest,
    guestInfo.fullName,
    guestInfo.mobileNo,
    guestInfo.address,
    selectedCustomer,
    selectedShipping,
    orderItems,
  ]);

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        sx={{ mb: 2 }}
      >
        + Create New Order
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Admin Order</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Customer Selection */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Customer Information</h3>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    value={isGuest ? "guest" : "registered"}
                    onChange={(e) => setIsGuest(e.target.value === "guest")}
                    label="Customer Type"
                  >
                    <MenuItem value="guest">Guest Checkout</MenuItem>
                    <MenuItem value="registered">Registered User</MenuItem>
                  </Select>
                </FormControl>

                {isGuest ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={guestInfo.fullName}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            fullName: e.target.value,
                          })
                        }
                        error={formErrors.fullName}
                        helperText={
                          formErrors.fullName ? "Full Name is required" : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        value={guestInfo.mobileNo}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            mobileNo: e.target.value,
                          })
                        }
                        error={formErrors.mobileNo}
                        helperText={
                          formErrors.mobileNo ? "Mobile Number is required" : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={guestInfo.address}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            address: e.target.value,
                          })
                        }
                        error={formErrors.address}
                        helperText={
                          formErrors.address ? "Address is required" : ""
                        }
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Autocomplete
                      options={customers}
                      getOptionLabel={(option) =>
                        `${option.fullName} (${option.email})`
                      }
                      value={selectedCustomer}
                      onChange={(e, value) => {
                        setSelectedCustomer(value);
                        if (value) {
                          setGuestInfo({
                            fullName: value.fullName || "",
                            mobileNo: value.phone || "",
                            email: value.email || "",
                            address: value.address || "",
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Customer"
                          error={formErrors.selectedCustomer}
                          helperText={
                            formErrors.selectedCustomer
                              ? "Customer is required"
                              : ""
                          }
                        />
                      )}
                    />
                    {selectedCustomer && (
                      <>
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ mb: 2, fontWeight: "bold" }}
                          >
                            Customer Details (Editable)
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Full Name"
                                value={guestInfo.fullName}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    fullName: e.target.value,
                                  })
                                }
                                error={formErrors.fullName}
                                helperText={
                                  formErrors.fullName
                                    ? "Full Name is required"
                                    : ""
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Mobile Number"
                                value={guestInfo.mobileNo}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    mobileNo: e.target.value,
                                  })
                                }
                                error={formErrors.mobileNo}
                                helperText={
                                  formErrors.mobileNo
                                    ? "Mobile Number is required"
                                    : ""
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={guestInfo.email}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Address"
                                value={guestInfo.address}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    address: e.target.value,
                                  })
                                }
                                error={formErrors.address}
                                helperText={
                                  formErrors.address
                                    ? "Address is required"
                                    : ""
                                }
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Add Products</h3>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name || ""}
                      value={selectedProduct}
                      onChange={(e, value) => {
                        setSelectedProduct(value);
                        setSelectedVariant(null);
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.name}
                          {option.freeShipping && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "green",
                                fontSize: "0.75rem",
                              }}
                            >
                              (Free Shipping)
                            </span>
                          )}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Product"
                          placeholder="Search products..."
                        />
                      )}
                      noOptionsText="No products found"
                      loading={!products || products.length === 0}
                    />
                  </Grid>

                  {selectedProduct &&
                    selectedProduct.variants &&
                    selectedProduct.variants.length > 0 && (
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Variant</InputLabel>
                          <Select
                            value={selectedVariant?._id || ""}
                            onChange={(e) => {
                              const variant = (
                                selectedProduct.variants || []
                              ).find((v) => v._id === e.target.value);
                              setSelectedVariant(variant);
                            }}
                            label="Variant"
                          >
                            {selectedProduct.variants &&
                            selectedProduct.variants.length > 0 ? (
                              selectedProduct.variants.map((variant) => (
                                <MenuItem key={variant._id} value={variant._id}>
                                  {getVariantName(variant)} - ৳
                                  {variant.discount > 0
                                    ? variant.discount
                                    : variant.price || 0}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                No variants available
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      sx={{ mt: 1 }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                {/* Order Items Table */}
                {orderItems.length > 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Variant</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="right">
                              {item.variantName}
                            </TableCell>
                            <TableCell align="right">৳{item.price}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              ৳{item.price * item.quantity}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Shipping & Payment */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Shipping & Payment</h3>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {hasFreeShippingProduct ? (
                      <TextField
                        fullWidth
                        label="Shipping Option"
                        value="Free Shipping"
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "green",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    ) : (
                      <FormControl fullWidth error={formErrors.selectedShipping}>
                        <InputLabel>Shipping Option</InputLabel>
                        <Select
                          value={selectedShipping?._id || ""}
                          onChange={(e) => {
                            const shipping = shippingOptions.find(
                              (s) => s._id === e.target.value,
                            );
                            setSelectedShipping(shipping);
                          }}
                          label="Shipping Option"
                        >
                          {shippingOptions.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                              {option.name} - ৳{option.value}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.selectedShipping && (
                          <Box
                            sx={{
                              color: "#d32f2f",
                              fontSize: "0.75rem",
                              mt: 0.5,
                            }}
                          >
                            Shipping Option is required
                          </Box>
                        )}
                      </FormControl>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        label="Payment Method"
                      >
                        <MenuItem value="cash_on_delivery">
                          Cash on Delivery
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Status</InputLabel>
                      <Select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        label="Payment Status"
                      >
                        <MenuItem value="unpaid">Unpaid</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Special Discount (৳)"
                      type="number"
                      value={specialDiscount}
                      onChange={(e) =>
                        setSpecialDiscount(parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              variant="outlined"
            />

            {/* Order Summary */}
            <Card>
              <CardContent>
                <h3>Order Summary</h3>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <strong>Subtotal:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    ৳{calculatedTotals.subtotal.toFixed(2)}
                  </Grid>

                  {vatPercentage > 0 && (
                    <>
                      <Grid item xs={6}>
                        <strong>VAT ({vatPercentage}%):</strong>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: "right" }}>
                        ৳{calculatedTotals.vat.toFixed(2)}
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6}>
                    <strong>Delivery Charge:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    {hasFreeShippingProduct ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>Free</span>
                    ) : (
                      `৳${calculatedTotals.deliveryCharge.toFixed(2)}`
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <strong>Discount:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    -৳{specialDiscount.toFixed(2)}
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sx={{
                      borderTop: "2px solid #ddd",
                      pt: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Total:
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sx={{
                      textAlign: "right",
                      borderTop: "2px solid #ddd",
                      pt: 2,
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    ৳{calculatedTotals.total.toFixed(2)}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            color="primary"
            disabled={
              isLoading ||
              orderItems.length === 0 ||
              Object.values(formErrors).some((error) => error)
            }
          >
            {isLoading ? <CircularProgress size={24} /> : "Create Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNewOrderCreate;
