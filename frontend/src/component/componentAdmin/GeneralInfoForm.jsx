import React, { useEffect, useState } from "react";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import useGeneralInfoStore from "../../store/GeneralInfoStore.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { SectionHeader } from "@/component/componentAdmin/SectionHeader.jsx";

export default function GeneralInfoForm() {
  const { token } = useAuthAdminStore();
  const { GeneralInfoList, GeneralInfoUpdate } = useGeneralInfoStore();

  const [formData, setFormData] = useState({
    CompanyName: "",
    PhoneNumber: [""],
    CompanyEmail: [""],
    ShortDescription: "",
    CompanyAddress: "",
    GoogleMapLink: "",
    PlayStoreLink: "",
    AppStoreLink: "",
    TradeLicense: "",
    TINNumber: "",
    BINNumber: "",
    FooterCopyright: "",
  });

  const [files, setFiles] = useState({
    PrimaryLogo: null,
    SecondaryLogo: null,
    Favicon: null,
  });

  const [previews, setPreviews] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (GeneralInfoList) {
      setFormData((prev) => ({
        ...prev,
        ...GeneralInfoList,
        PhoneNumber: GeneralInfoList.PhoneNumber || [""],
        CompanyEmail: GeneralInfoList.CompanyEmail || [""],
      }));

      setFiles({
        PrimaryLogo: GeneralInfoList.PrimaryLogo || null,
        SecondaryLogo: GeneralInfoList.SecondaryLogo || null,
        Favicon: GeneralInfoList.Favicon || null,
      });
    }
  }, [GeneralInfoList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    setFiles((prev) => ({ ...prev, [name]: file }));
    if (file) {
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    } else {
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleArrayChange = (index, field, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (index, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        form.append(key, formData[key].join(","));
      } else if (formData[key]) {
        form.append(key, formData[key]);
      }
    });

    Object.keys(files).forEach((key) => {
      if (files[key] && files[key] instanceof File) {
        form.append(key, files[key]);
      }
    });

    const result = await GeneralInfoUpdate(form, token);

    if (result.success) {
      toast.success("General information updated successfully!");
    } else {
      if (result.status === 403) {
        toast.warning(
          "You do not have permission to perform this action. (403 Forbidden)",
        );
      } else {
        toast.error("Failed to update general information.");
      }
    }

    setSubmitting(false);
  };

  const ImageUploadCard = ({ label, name, preview, existing }) => (
    <div className="space-y-3">
      <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/20">
        {preview || existing ? (
          <ImageComponent
            imageName={preview || existing}
            className="w-full h-full object-contain"
            altName={label}
            skeletonHeight={140}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="size-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type="file"
          name={name}
          onChange={handleFileChange}
          accept="image/*"
          className="mt-1"
        />
      </div>
    </div>
  );

  const ArrayFieldSection = ({ label, fields, fieldName }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) =>
                handleArrayChange(index, fieldName, e.target.value)
              }
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeArrayField(index, fieldName)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayField(fieldName)}
        >
          <Plus className="size-4 mr-1" />
          Add More
        </Button>
      </CardContent>
    </Card>
  );

  const TextField = ({ label, name, placeholder }) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={"General Information"}
        description={
          "Manage your company details, logos, and contact information."
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadCard
                label="Primary Logo"
                name="PrimaryLogo"
                preview={previews.PrimaryLogo}
                existing={formData.PrimaryLogo}
              />
              <ImageUploadCard
                label="Secondary Logo"
                name="SecondaryLogo"
                preview={previews.SecondaryLogo}
                existing={formData.SecondaryLogo}
              />
              <ImageUploadCard
                label="Favicon"
                name="Favicon"
                preview={previews.Favicon}
                existing={formData.Favicon}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ArrayFieldSection
            label="Phone Numbers"
            fields={formData.PhoneNumber}
            fieldName="PhoneNumber"
          />
          <ArrayFieldSection
            label="Company Emails"
            fields={formData.CompanyEmail}
            fieldName="CompanyEmail"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Company Name"
                name="CompanyName"
                placeholder="Your company name"
              />
              <TextField
                label="Short Description"
                name="ShortDescription"
                placeholder="Brief description of your company"
              />
            </div>
            <TextField
              label="Company Address"
              name="CompanyAddress"
              placeholder="Full company address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Google Map Link"
                name="GoogleMapLink"
                placeholder="Google Maps embed URL"
              />
              <TextField
                label="Play Store Link"
                name="PlayStoreLink"
                placeholder="Google Play Store URL"
              />
              <TextField
                label="App Store Link"
                name="AppStoreLink"
                placeholder="Apple App Store URL"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField label="Trade License" name="TradeLicense" />
              <TextField label="TIN Number" name="TINNumber" />
              <TextField label="BIN Number" name="BINNumber" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <TextField
              label="Footer Copyright"
              name="FooterCopyright"
              placeholder="© 2024 Your Company. All rights reserved."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Updating..." : "Update General Info"}
          </Button>
        </div>
      </form>
    </div>
  );
}
