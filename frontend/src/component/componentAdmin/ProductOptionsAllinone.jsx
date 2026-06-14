import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  TablePagination,
  CircularProgress,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Box,
} from "@mui/material";
import { Delete, Edit, Add, Search, Settings } from "@mui/icons-material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const ProductOptionsAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", values: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchProductOptions = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/product-options`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProductOptions(res.data.productOptions || []);
        setLoading(false);
      })
      .catch(() => {
        showSnackbar("Error fetching product options.", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductOptions();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", values: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (option) => {
    setIsEdit(true);
    setEditId(option._id);
    setFormData({ name: option.name, values: (option.values || []).join(", ") });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.values.trim()) {
      showSnackbar("Name and values are required.", "warning");
      return;
    }
    const valuesArray = formData.values.split(",").map((v) => v.trim()).filter((v) => v);
    if (valuesArray.length === 0) {
      showSnackbar("At least one value is required.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`${apiUrl}/product-options/${editId}`, { name: formData.name, values: valuesArray }, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Product option updated successfully!");
      } else {
        await axios.post(`${apiUrl}/product-options`, { name: formData.name, values: valuesArray }, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Product option added successfully!");
      }
      setDialogOpen(false);
      fetchProductOptions();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (option) => {
    setOptionToDelete(option);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!optionToDelete) return;
    try {
      await axios.delete(`${apiUrl}/product-options/${optionToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("Product option deleted successfully!");
      fetchProductOptions();
    } catch (err) {
      showSnackbar("Failed to delete product option.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setOptionToDelete(null);
    }
  };

  const filteredOptions = useMemo(() => {
    return productOptions
      .filter((opt) => (opt.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
      .reverse();
  }, [productOptions, searchTerm]);

  return (
    <Box>
      {/* Header Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2, display: "flex" }}>
              <Settings sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Product Option Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {productOptions.length} total options
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate} sx={{ borderRadius: 2 }}>
            Add Option
          </Button>
        </Box>
      </Paper>

      {/* Search & Filter Card */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          placeholder="Search by name..."
          fullWidth
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Paper>

      {/* Table Card */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Values</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No product options found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOptions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((opt) => (
                        <TableRow key={opt._id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>{opt.name || "N/A"}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {(opt.values || []).map((val, idx) => (
                                <Chip key={idx} label={val} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleOpenEdit(opt)} color="primary" size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => confirmDelete(opt)} color="error" size="small">
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOptions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEdit ? <Edit color="primary" /> : <Add color="primary" />}
            <Typography variant="h6" fontWeight={600}>
              {isEdit ? "Edit Product Option" : "Add New Product Option"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={!formData.name.trim()}
            helperText={!formData.name.trim() ? "Name is required" : ""}
            placeholder="e.g., Size, Color"
            sx={{ mb: 2, mt:2 }}
          />
          <TextField
            label="Values (comma-separated)"
            fullWidth
            value={formData.values}
            onChange={(e) => setFormData({ ...formData, values: e.target.value })}
            required
            error={!formData.values.trim()}
            helperText={!formData.values.trim() ? "At least one value is required" : "e.g., S, M, L, XL"}
            placeholder="e.g., Small, Medium, Large"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to delete option <strong>{optionToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductOptionsAllinone;