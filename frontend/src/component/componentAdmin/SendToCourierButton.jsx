import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import useCourierStatus from "../../store/useCourierStatus.js";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const SendToCourierButton = ({ orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(orderData.note || "");
  const [sent, setSent] = useState(orderData.courier_status || false);
  const [showDeliveryStatus, setShowDeliveryStatus] = useState(false); // New state variable
  const {
    status: deliveryStatus,
    loading: statusLoading,
    refetch,
  } = useCourierStatus(orderData, sent, !sent);
  const [selectedCourier, setSelectedCourier] = useState("steadfast");
  const [pathaoStoreId, setPathaoStoreId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchPathaoConfig = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${apiURL}/pathao-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data) {
          setPathaoStoreId(response.data.data.storeId);
        }
      } catch (error) {
        console.error("Failed to fetch Pathao config:", error);
      }
    };
    fetchPathaoConfig();
  }, [apiURL, token]);

  const handleButtonClick = () => {
    if (sent) {
      setShowDeliveryStatus(true); // Set to true on click
      refetch();
    } else {
      setOpen(true);
    }
  };

  const sendToSteadfast = async () => {
    try {
      const response = await axios.post(
        `${apiURL}/steadfast/create-order`,
        {
          invoice: orderData.invoice,
          recipient_name: orderData.recipient_name,
          recipient_phone: orderData.recipient_phone,
          recipient_address: orderData.recipient_address,
          cod_amount: orderData.cod_amount,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = response.data;
      const statusCode = result.data.status;

      if (result.status === "success") {
        if (statusCode === 200) {
          await axios.put(
            `${apiURL}/orders/${orderData.order_id}`,
            {
              sentToCourier: true,
              orderStatus: "intransit",
              courierProvider: "steadfast",
              courierConsignmentId: result.data.consignment.consignment_id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setSnackbar({
            open: true,
            message: `✅ Order sent to Steadfast! Consignment ID: ${result.data.consignment.consignment_id}`,
            severity: "success",
          });

          setSent(true);
          if (onSuccess) onSuccess();
          setOpen(false);
        } else if (statusCode === 400) {
          const errors = result.data.errors;
          let errorMessage = "❌ Failed to send order:";
          if (errors) {
            errorMessage +=
              "\n" +
              Object.entries(errors)
                .map(([key, value]) => `${key}: ${value.join(", ")}`)
                .join("\n");
          }
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: "⚠️ Unknown status received from the server.",
            severity: "warning",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "❌ API call was not successful.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "❌ Network error while sending order.",
        severity: "error",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendToPathao = async () => {
    try {
      const payload = {
        store_id: pathaoStoreId,
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        merchant_order_id: orderData.invoice,
        recipient_address: orderData.recipient_address,
        delivery_type: "48",
        item_type: "2",
        item_quantity: orderData.items,
        item_weight: "0.5",
        amount_to_collect: orderData.cod_amount,
        special_instruction: note,
      };

      const response = await axios.post(`${apiURL}/pathao/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = response.data;
      if (result.type === "success") {
        await axios.put(
          `${apiURL}/orders/${orderData.order_id}`,
          {
            sentToCourier: true,
            orderStatus: "intransit",
            courierProvider: "pathao",
            courierConsignmentId: result.data.consignment_id,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setSnackbar({
          open: true,
          message: `✅ Order sent to Pathao! Consignment ID: ${result.data.consignment_id}`,
          severity: "success",
        });

        setSent(true);
        if (onSuccess) onSuccess();
        setOpen(false);
      } else {
        const errorMessage =
          result.message || "Failed to create Pathao consignment.";
        const errorDetails = result.errors
          ? "\n" +
            Object.entries(result.errors)
              .map(([key, value]) => `${key}: ${value.join(", ")}`)
              .join("\n")
          : "";
        setSnackbar({
          open: true,
          message: `❌ ${errorMessage}${errorDetails}`,
          severity: "error",
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "❌ Network error while sending order to Pathao.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    setLoading(true);
    if (selectedCourier === "steadfast") {
      sendToSteadfast();
    } else if (selectedCourier === "pathao") {
      if (!pathaoStoreId) {
        setSnackbar({
          open: true,
          message: "Pathao configuration is not loaded yet.",
          severity: "error",
        });
        setLoading(false);
        return;
      }
      sendToPathao();
    }
  };

  return (
    <>
      <button
        className={`primaryBgColor accentTextColor cursor-pointer px-4 py-2 w-48 rounded text-sm ${
          sent ? "opacity-50" : ""
        }`}
        onClick={handleButtonClick}
        disabled={statusLoading}
      >
        {sent ? (
          <>
            {statusLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 cursor-pointer border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </span>
            ) : (
              <>
                {showDeliveryStatus && deliveryStatus ? (
                  <>
                    <span className="font-semibold">{deliveryStatus} {" "}</span>
                    <span className="font-semibold">
                      | {orderData.courierProvider}
                    </span>
                  </>
                ) : (
                  "Sent | Click to show status"
                )}
              </>
            )}
          </>
        ) : (
          "Send to Courier"
        )}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Courier & Confirm</DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="courier">
                Courier:
              </label>
              <select
                id="courier"
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="steadfast">Steadfast</option>
                <option value="pathao">Pathao</option>
              </select>
            </div>

            <div className="bg-white shadow rounded p-6 space-y-2">
              <h1 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                Order Information
              </h1>
              <p className="text-gray-700">
                <span className="font-medium">Invoice:</span>{" "}
                {orderData.invoice}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Recipient Name:</span>{" "}
                {orderData.recipient_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Recipient Phone:</span>{" "}
                {orderData.recipient_phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Recipient Address:</span>{" "}
                {orderData.recipient_address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">COD Amount:</span> Tk{" "}
                {orderData.cod_amount}
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1" htmlFor="note">
                Order Note:
              </label>
              <textarea
                id="note"
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 rounded"
              ></textarea>
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <button
            className="px-4 py-2 bg-gray-300 cursor-pointer rounded hover:bg-gray-400"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2  rounded primaryBgColor accentTextColor  cursor-pointer flex items-center gap-2"
            onClick={handleSend}
            disabled={
              loading || (selectedCourier === "pathao" && !pathaoStoreId)
            }
          >
            {loading && (
              <span className="w-4 h-4 cursor-pointer border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            Send
          </button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          <span style={{ whiteSpace: "pre-line" }}>{snackbar.message}</span>
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendToCourierButton;
