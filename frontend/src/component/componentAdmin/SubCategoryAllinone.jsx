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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Box,
} from "@mui/material";
import { Delete, Edit, Add, Search, List } from "@mui/icons-material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const SubCategoryAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", category: "", isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchSubCategories = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/sub-category`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setSubCategories(res.data.subCategories || []);
        setLoading(false);
      })
      .catch(() => {
        showSnackbar("Error fetching subcategories.", "error");
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    axios
      .get(`${apiUrl}/category`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", category: "", isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (subCat) => {
    setIsEdit(true);
    setEditId(subCat._id);
    setFormData({
      name: subCat.name,
      category: subCat.category?._id || "",
      isActive: subCat.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category) {
      showSnackbar("Name and category are required.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`${apiUrl}/sub-category/${editId}`, {
          name: formData.name,
          category: formData.category,
          isActive: formData.isActive,
        }, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Subcategory updated successfully!");
      } else {
        await axios.post(`${apiUrl}/sub-category`, {
          name: formData.name,
          category: formData.category,
        }, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        showSnackbar("Subcategory added successfully!");
      }
      setDialogOpen(false);
      fetchSubCategories();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (subCat) => {
    setSubCategoryToDelete(subCat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subCategoryToDelete) return;
    try {
      await axios.delete(`${apiUrl}/sub-category/${subCategoryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("Subcategory deleted successfully!");
      fetchSubCategories();
    } catch (err) {
      showSnackbar("Failed to delete subcategory.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
    }
  };

  const filteredSubCategories = useMemo(() => {
    return subCategories
      .filter((subCat) =>
        (subCat.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subCat.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
      .reverse();
  }, [subCategories, searchTerm]);

  return (
    <Box>
      {/* Header Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2, display: "flex" }}>
              <List sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Subcategory Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subCategories.length} total subcategories
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate} sx={{ borderRadius: 2 }}>
            Add Subcategory
          </Button>
        </Box>
      </Paper>

      {/* Search & Filter Card */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          placeholder="Search subcategories..."
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
                    <TableCell sx={{ fontWeight: 600 }}>Subcategory Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Active</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No subcategories found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubCategories
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((subCat) => (
                        <TableRow key={subCat._id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>{subCat.name || "N/A"}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={subCat.category?.name || "N/A"} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={subCat.isActive ? "Yes" : "No"}
                              color={subCat.isActive ? "success" : "default"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleOpenEdit(subCat)} color="primary" size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => confirmDelete(subCat)} color="error" size="small">
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
              count={filteredSubCategories.length}
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
              {isEdit ? "Edit Subcategory" : "Add New Subcategory"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Subcategory Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={!formData.name.trim()}
            helperText={!formData.name.trim() ? "Subcategory name is required" : ""}
            sx={{ mb: 2, mt:2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="">Select a Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isEdit && (
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                label="Active"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          )}
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
            Are you sure you want to delete <strong>{subCategoryToDelete?.name}</strong>? This action cannot be undone.
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

export default SubCategoryAllinone;