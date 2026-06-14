import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useGeneralInfoStore from "../../store/GeneralInfoStore";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRef } from "react";
import OrderStatusUpdate from "./OrderStatusUpdate.jsx";
import CourierStats from "./CourierStats.jsx";
import RequirePermission from "./RequirePermission.jsx";
import { debounce } from "lodash";

const apiUrl = import.meta.env.VITE_API_URL;

const ViewOrder = () => {
  const printRef = useRef(null);

  const { GeneralInfoList } = useGeneralInfoStore();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);

  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Helper function to get variant display name from attributes
  const getVariantDisplayName = (variant) => {
    if (!variant) return "N/A";
    
    // Handle new variant structure with attributes
    if (variant.attributes && Array.isArray(variant.attributes)) {
      const attributeValues = variant.attributes
        .map((attr) => attr.value)
        .filter((val) => val);
      if (attributeValues.length > 0) {
        return attributeValues.join(" / ");
      }
    }
    
    // Fallback for old structure (if any legacy data exists)
    if (variant.size?.name) {
      return variant.size.name;
    }
    
    return "N/A";
  };

  const handlePrint = () => {
    const content = document.getElementById("print-area");
    if (!content) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`
    <html><head><title>Print Invoice</title><style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1; margin: 20px; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    img { width: 100px; }
    #firstRow, #secondRow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    #thirdRow { display: flex; justify-content: space-between; margin-top: 20px; }
    button, .no-print { display: none !important; }
    #thirdRowRight, #secondRowRight { text-align: right; }
    </style></head><body>${content.innerHTML}</body></html>
  `);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  const getStatusColor = (status) =>
    ({
      pending: { color: "orange", text: "Pending" },
      intransit: { color: "blue", text: "In Transit" },
      approved: { color: "teal", text: "Approved" },
      delivered: { color: "green", text: "Delivered" },
      cancelled: { color: "red", text: "Cancelled" },
      returned: { color: "purple", text: "Returned" },
    })[status] || { color: "gray", text: "Unknown" };

  const getPaymentStatusColor = (status) =>
    ({
      unpaid: { color: "orange", text: "Unpaid" },
      paid: { color: "green", text: "Paid" },
    })[status] || { color: "gray", text: "Unknown" };

  const getPaymentMethodText = (method) =>
    ({
      cash_on_delivery: "Cash on Delivery",
      bkash: "bKash",
      nagad: "Nagad",
      card: "Card",
    })[method] || "Unknown Method";

  const getDeliveryMethodText = (method) =>
    ({
      home_delivery: "Home Delivery",
    })[method] || "Unknown Method";

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not authenticated.");

      const res = await axios.get(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data.order);
      const editable = JSON.parse(JSON.stringify(res.data.order));
      if (!editable.billingInfo) {
        editable.billingInfo = { ...editable.shippingInfo };
      }
      setEditableOrder(editable);
    } catch (err) {
      setError(err.message || "Failed to fetch order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleEditToggle = () => {
    if (isEditMode) {
      const editable = JSON.parse(JSON.stringify(order));
      if (!editable.billingInfo) {
        editable.billingInfo = { ...editable.shippingInfo };
      }
      setEditableOrder(editable); // Reset changes
    }
    setIsEditMode(!isEditMode);
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [name]: value },
    }));
  };

  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => ({
      ...prev,
      billingInfo: { ...prev.billingInfo, [name]: value },
    }));
  };

  const handleItemQuantityChange = (index, quantity) => {
    const newQuantity = Math.max(1, Number(quantity));
    const newItems = [...editableOrder.items];
    newItems[index].quantity = newQuantity;
    setEditableOrder((prev) => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index) => {
    const newItems = editableOrder.items.filter((_, i) => i !== index);
    setEditableOrder((prev) => ({ ...prev, items: newItems }));
  };

  const debouncedProductSearch = useMemo(
    () =>
      debounce(async (query) => {
        try {
          const res = await axios.get(
            `${apiUrl}/getAllProductsAdmin?search=${query}`,
          );
          setSearchedProducts(res.data.products);
        } catch (error) {
          console.error("Failed to search products:", error);
        }
      }, 500),
    [],
  );

  useEffect(() => {
    if (isAddProductModalOpen) {
      debouncedProductSearch(productSearchQuery);
    }
    return () => debouncedProductSearch.cancel();
  }, [productSearchQuery, debouncedProductSearch, isAddProductModalOpen]);

  const handleAddProduct = async (product, variant = null) => {
    const price = variant
      ? variant.discount || variant.price
      : product.finalDiscount > 0
        ? product.finalDiscount
        : product.finalPrice;

    // Create the new item with proper variant structure
    const newItem = {
      productId: product._id,
      variantId: variant ? variant._id : undefined,
      quantity: 1,
      price: price,
      // For display purposes
      product: {
        _id: product._id,
        name: product.name,
        productCode: product.productCode || product.code,
        category: { name: product.category?.name },
        variants: variant ? [variant] : [],
      },
    };

    setEditableOrder((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setAddProductModalOpen(false);
    setProductSearchQuery("");
    setSearchedProducts([]);
  };
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const updatePayload = {
        shippingInfo: editableOrder.shippingInfo,
        billingInfo: editableOrder.billingInfo,
        items: editableOrder.items.map(
          ({ productId, variantId, quantity, price }) => ({
            productId:
              typeof productId === "object" ? productId._id : productId,
            variantId:
              typeof variantId === "object" && variantId !== null
                ? variantId._id
                : variantId,
            quantity,
            price,
          }),
        ),
      };

      await axios.put(`${apiUrl}/orders/${orderId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditMode(false);
      await fetchOrder(); // Refresh data
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update order.",
      );
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const currentOrderData = isEditMode ? editableOrder : order;
  const orderStatusColor = getStatusColor(currentOrderData.orderStatus);
  const paymentStatusColor = getPaymentStatusColor(
    currentOrderData.paymentStatus,
  );

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4 no-print">
        <RequirePermission permission="edit_orders">
          <Button variant="contained" onClick={handleEditToggle}>
            {isEditMode ? "Cancel" : "Edit Order"}
          </Button>
        </RequirePermission>
        <Button variant="outlined" onClick={handlePrint}>
          Print Invoice
        </Button>
      </div>

      <div id="print-area" ref={printRef} className="p-4 shadow rounded-lg">
        {/* Header */}
        <div id="firstRow" className={"flex justify-between"}>
          <h1 className="text-2xl">{GeneralInfoList.CompanyName}</h1>
          <ImageComponent
            imageName={GeneralInfoList.PrimaryLogo}
            className="w-30"
          />
          <div className="text-2xl">
            <h1>Invoice</h1>
          </div>
        </div>

        {/* Shipping and Order Details */}
        <div id="secondRow">
          <div>
            <h2 className="font-bold text-xl">Shipping Info:</h2>
            {isEditMode ? (
              <div className="flex flex-col gap-2 mt-2">
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={editableOrder.shippingInfo.fullName}
                  onChange={handleShippingInfoChange}
                  variant="standard"
                />
                <TextField
                  label="Mobile No"
                  name="mobileNo"
                  value={editableOrder.shippingInfo.mobileNo}
                  onChange={handleShippingInfoChange}
                  variant="standard"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={editableOrder.shippingInfo.email}
                  onChange={handleShippingInfoChange}
                  variant="standard"
                />
                <TextField
                  label="Address"
                  name="address"
                  value={editableOrder.shippingInfo.address}
                  onChange={handleShippingInfoChange}
                  variant="standard"
                  multiline
                />
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <p>{currentOrderData.shippingInfo.fullName}</p>
                <p>{currentOrderData.shippingInfo.mobileNo}</p>
                <p>{currentOrderData.shippingInfo.email}</p>
                <p>{currentOrderData.shippingInfo.address}</p>
              </div>
            )}
          </div>
          <div
            id="secondRowRight"
            className={`flex flex-col gap-2 text-right ${
              isEditMode ? "" : "-mt-25"
            }`}
          >
            <p>
              <strong>Order No:</strong> {currentOrderData.orderNo}
            </p>
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(currentOrderData.orderDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: orderStatusColor.color }}>
                {orderStatusColor.text}
              </span>
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {getPaymentMethodText(currentOrderData.paymentMethod)}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span style={{ color: paymentStatusColor.color }}>
                {paymentStatusColor.text}
              </span>
            </p>
            {currentOrderData.paymentId && (
              <p>
                <strong>Payment ID:</strong>{" "}
                <span className="text-sm">{currentOrderData.paymentId}</span>
              </p>
            )}
            {currentOrderData.transId && (
              <p>
                <strong>Transaction ID:</strong> {currentOrderData.transId}
              </p>
            )}
            <p>
              <strong>Delivery Method:</strong>{" "}
              {getDeliveryMethodText(currentOrderData.deliveryMethod)}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-6">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SL</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Cost</TableCell>
                  <TableCell>Total</TableCell>
                  {isEditMode && (
                    <TableCell className="no-print">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentOrderData.items.map((item, index) => {
                  const product = item.product || item.productId;
                  const variant = product.variants?.[0];
                  const totalPrice = item.price * item.quantity;

                  return (
                    <TableRow key={item._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>{product.name}</div>
                        <div>Category: {product.category?.name}</div>
                        <div>Code: {product.productCode || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        {variant ? getVariantDisplayName(variant) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemQuantityChange(index, e.target.value)
                            }
                            style={{ width: "80px" }}
                            variant="standard"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell>{item.price.toFixed(2)}</TableCell>
                      <TableCell>{totalPrice.toFixed(2)}</TableCell>
                      {isEditMode && (
                        <TableCell className="no-print">
                          <Button
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {isEditMode && (
            <div className="flex justify-start mt-4">
              <Button
                variant="contained"
                onClick={() => setAddProductModalOpen(true)}
              >
                Add Product
              </Button>
            </div>
          )}
        </div>

        {/* Billing and Totals */}
        <div id="thirdRow" className="mt-6 p-1 flex justify-between">
          <div>
            <h1>Billing Address:</h1>
            {isEditMode ? (
              <div className="flex flex-col gap-2 mt-2">
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={editableOrder.billingInfo?.fullName || ""}
                  onChange={handleBillingInfoChange}
                  variant="standard"
                />
                <TextField
                  label="Address"
                  name="address"
                  value={editableOrder.billingInfo?.address || ""}
                  onChange={handleBillingInfoChange}
                  variant="standard"
                  multiline
                />
              </div>
            ) : (
              <>
                <p>
                  {currentOrderData.billingInfo?.fullName ||
                    currentOrderData.shippingInfo.fullName}
                </p>
                <p>
                  {currentOrderData.billingInfo?.address ||
                    currentOrderData.shippingInfo.address}
                </p>
              </>
            )}
          </div>
          <div id="thirdRowRight" className="flex flex-col gap-2 items-end">
            <p>Sub-total: Tk.{currentOrderData.subtotalAmount.toFixed(2)}</p>
            {currentOrderData.promoDiscount > 0 && (
              <p>
                Promo Discount: Tk.{currentOrderData.promoDiscount.toFixed(2)}
              </p>
            )}
            {currentOrderData.rewardPointsUsed > 0 && (
              <p>Reward Points Used: {currentOrderData.rewardPointsUsed}</p>
            )}
            {currentOrderData.vat > 0 && (
              <p>VAT/TAX: {currentOrderData.vat.toFixed(2)}</p>
            )}
            <p>Delivery Charge: {currentOrderData.deliveryCharge.toFixed(2)}</p>
            {currentOrderData.specialDiscount > 0 && (
              <p>
                Special Discount Amount:{" "}
                {currentOrderData.specialDiscount.toFixed(2)}
              </p>
            )}
            <p className="text-2xl">
              Total Order Amount: {currentOrderData.totalAmount.toFixed(2)}
            </p>
            {currentOrderData.advanceAmount > 0 && (
              <p className="text-red-500">
                Advance: {currentOrderData.advanceAmount.toFixed(2)}
              </p>
            )}
            <p className="text-2xl">
              Total Due Amount: {currentOrderData.dueAmount.toFixed(2)}
            </p>
          </div>
        </div>
        {isEditMode && (
          <div className="flex justify-end gap-2 mt-4 no-print">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outlined" onClick={handleEditToggle}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <RequirePermission permission="edit_orders">
          <OrderStatusUpdate orderId={order._id} onUpdate={fetchOrder} />
        </RequirePermission>
      </div>
      <div className="mt-6">
        <CourierStats phone={order.shippingInfo.mobileNo} />
      </div>

      {/* Add Product Modal */}
      <Dialog
        open={isAddProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add Product to Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search for a product by name or code..."
            type="text"
            fullWidth
            variant="standard"
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
          />
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchedProducts.length > 0 ? (
                  searchedProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>

                      <TableCell>
                        {product.variants && product.variants.length > 0
                          ? "Multiple Variants"
                          : `Stock: ${product.finalStock}`}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            if (
                              product.variants &&
                              product.variants.length > 0
                            ) {
                              setSelectedProduct(product);
                            } else {
                              handleAddProduct(product);
                            }
                          }}
                          disabled={
                            !product.variants?.length && product.finalStock < 1
                          }
                        >
                          {product.variants && product.variants.length > 0
                            ? "Select Variant"
                            : "Add"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {productSearchQuery.length > 1
                        ? "No products found."
                        : "Type to search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Variant Selection Modal */}
      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select Variant for {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variant</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                 {selectedProduct?.variants?.map((variant) => (
                   <TableRow key={variant._id}>
                     <TableCell>{getVariantDisplayName(variant)}</TableCell>
                     <TableCell>{variant.stock}</TableCell>
                     <TableCell>
                       <Button
                         onClick={() => {
                           handleAddProduct(selectedProduct, variant);
                           setSelectedProduct(null);
                         }}
                         disabled={variant.stock < 1}
                       >
                         Add
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProduct(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewOrder;
