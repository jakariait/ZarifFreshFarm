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
import { Delete, Edit, Add, Search, Category } from "@mui/icons-material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const AdminCategoryAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    featureCategory: true,
    showOnNavbar: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCategories = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        showSnackbar("Error fetching categories.", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", featureCategory: true, showOnNavbar: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEdit(true);
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      featureCategory: cat.featureCategory,
      showOnNavbar: cat.showOnNavbar,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar("Category name is required.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`${apiUrl}/category/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        showSnackbar("Category updated successfully!");
      } else {
        await axios.post(`${apiUrl}/category`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        showSnackbar("Category added successfully!");
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`${apiUrl}/category/${categoryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      showSnackbar("Failed to delete category.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .reverse();
  }, [categories, searchTerm]);

  return (
    <Box>
      {/* Header Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "primary.main",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
              }}
            >
              <Category sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Category Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {categories.length} total categories
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2 }}
          >
            Add Category
          </Button>
        </Box>
      </Paper>

      {/* Search & Filter Card */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          placeholder="Search categories..."
          fullWidth
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
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
                    <TableCell sx={{ fontWeight: 600 }}>
                      Category Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Featured
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Show on Navbar
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No categories found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((cat) => (
                        <TableRow key={cat._id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>{cat.name}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={cat.featureCategory ? "Yes" : "No"}
                              color={
                                cat.featureCategory ? "success" : "default"
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={cat.showOnNavbar ? "Yes" : "No"}
                              color={cat.showOnNavbar ? "primary" : "default"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleOpenEdit(cat)}
                              color="primary"
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => confirmDelete(cat)}
                              color="error"
                              size="small"
                            >
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
              count={filteredCategories.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEdit ? <Edit color="primary" /> : <Add color="primary" />}
            <Typography variant="h6" fontWeight={600}>
              {isEdit ? "Edit Category" : "Add New Category"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Category Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={!formData.name.trim()}
            helperText={
              !formData.name.trim() ? "Category name is required" : ""
            }
            sx={{ mb: 2, mt: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Feature Category</InputLabel>
              <Select
                value={formData.featureCategory}
                onChange={(e) =>
                  setFormData({ ...formData, featureCategory: e.target.value })
                }
                label="Feature Category"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Show on Navbar</InputLabel>
              <Select
                value={formData.showOnNavbar}
                onChange={(e) =>
                  setFormData({ ...formData, showOnNavbar: e.target.value })
                }
                label="Show on Navbar"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{categoryToDelete?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCategoryAllinone;
