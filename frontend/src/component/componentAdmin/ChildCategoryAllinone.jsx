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
import { Delete, Edit, Add, Search, FolderOpen } from "@mui/icons-material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const ChildCategoryAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [childCategories, setChildCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
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
    category: "",
    subCategory: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childCategoryToDelete, setChildCategoryToDelete] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchChildCategories = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/child-category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setChildCategories(res.data.childCategories || []);
        setLoading(false);
      })
      .catch(() => {
        showSnackbar("Error fetching child categories.", "error");
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    axios
      .get(`${apiUrl}/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  };

  const fetchSubCategories = () => {
    axios
      .get(`${apiUrl}/sub-category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubCategories(res.data.subCategories || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchChildCategories();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return subCategories.filter(
      (sub) => sub.category?._id === formData.category,
    );
  }, [formData.category, subCategories]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", category: "", subCategory: "", isActive: true });
    setDialogOpen(true);
  };

  const handleOpenEdit = (childCat) => {
    setIsEdit(true);
    setEditId(childCat._id);
    setFormData({
      name: childCat.name,
      category: childCat.category?._id || "",
      subCategory: childCat.subCategory?._id || "",
      isActive: childCat.isActive,
    });
    setDialogOpen(true);
  };

  const handleCategoryChange = (catId) => {
    setFormData((prev) => ({ ...prev, category: catId, subCategory: "" }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category || !formData.subCategory) {
      showSnackbar("Name, category, and subcategory are required.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(
          `${apiUrl}/child-category/${editId}`,
          {
            name: formData.name,
            category: formData.category,
            subCategory: formData.subCategory,
            isActive: formData.isActive,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        showSnackbar("Child category updated successfully!");
      } else {
        await axios.post(
          `${apiUrl}/child-category`,
          {
            name: formData.name,
            category: formData.category,
            subCategory: formData.subCategory,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        showSnackbar("Child category added successfully!");
      }
      setDialogOpen(false);
      fetchChildCategories();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (childCat) => {
    setChildCategoryToDelete(childCat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!childCategoryToDelete) return;
    try {
      await axios.delete(
        `${apiUrl}/child-category/${childCategoryToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showSnackbar("Child category deleted successfully!");
      fetchChildCategories();
    } catch (err) {
      showSnackbar("Failed to delete child category.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setChildCategoryToDelete(null);
    }
  };

  const filteredChildCategories = useMemo(() => {
    return childCategories
      .filter(
        (childCat) =>
          (childCat.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (childCat.category?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (childCat.subCategory?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
      .reverse();
  }, [childCategories, searchTerm]);

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
              <FolderOpen sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Child Category Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {childCategories.length} total child categories
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2 }}
          >
            Add Child Category
          </Button>
        </Box>
      </Paper>

      {/* Search & Filter Card */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          placeholder="Search child categories..."
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
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Subcategory
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Active
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChildCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No child categories found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChildCategories
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((childCat) => (
                        <TableRow key={childCat._id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>
                              {childCat.name || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={childCat.category?.name || "N/A"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={childCat.subCategory?.name || "N/A"}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={childCat.isActive ? "Yes" : "No"}
                              color={childCat.isActive ? "success" : "default"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleOpenEdit(childCat)}
                              color="primary"
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => confirmDelete(childCat)}
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
              count={filteredChildCategories.length}
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
              {isEdit ? "Edit Child Category" : "Add New Child Category"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Child Category Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={!formData.name.trim()}
            helperText={
              !formData.name.trim() ? "Child category name is required" : ""
            }
            sx={{ mb: 2, mt: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={formData.subCategory}
              onChange={(e) =>
                setFormData({ ...formData, subCategory: e.target.value })
              }
              label="Subcategory"
              disabled={!formData.category}
            >
              <MenuItem value="">Select a Subcategory</MenuItem>
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map((sub) => (
                  <MenuItem key={sub._id} value={sub._id}>
                    {sub.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No subcategories available</MenuItem>
              )}
            </Select>
          </FormControl>
          {isEdit && (
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                value={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.value })
                }
                label="Active"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          )}
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
            <strong>{childCategoryToDelete?.name}</strong>? This action cannot
            be undone.
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

export default ChildCategoryAllinone;
