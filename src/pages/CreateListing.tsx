import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateListing } from "@/hooks/useApi";
import { CATEGORY_VALUES, LISTING_CONDITIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = CATEGORY_VALUES;
const CONDITIONS = LISTING_CONDITIONS;

export default function CreateListing() {
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [campus, setCampus] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const createListingMutation = useCreateListing();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Convert files to Base64 strings for persistent storage
      Array.from(files).forEach((file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setImages((prev) => [...prev, base64String].slice(0, 5));

          // Also create a preview URL for display
          const previewUrl = URL.createObjectURL(file);
          setPreviewImages((prev) => [...prev, previewUrl].slice(0, 5));
        };

        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const toggleCategory = (categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        return prev.filter((cat) => cat !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  const removeCategory = (categoryValue: string) => {
    setSelectedCategories((prev) =>
      prev.filter((cat) => cat !== categoryValue)
    );
  };

  const clearForm = () => {
    setTitle("");
    setSelectedCategories([]);
    setCondition("");
    setPrice("");
    setStock("");
    setDescription("");
    setPickupLocation("");
    setCampus("");
    setPickupNotes("");
    setImages([]);
    setPreviewImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a listing");
      navigate("/auth");
      return;
    }

    // Validate required fields
    if (
      !title ||
      selectedCategories.length === 0 ||
      !condition ||
      !price ||
      !stock ||
      !description ||
      !campus
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (parseInt(stock) <= 0) {
      toast.error("Stock quantity must be at least 1");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the primary category (first selected) for the backend
      const primaryCategory = selectedCategories[0];
      const additionalTags = selectedCategories.slice(1);

      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        category: primaryCategory,
        condition: condition.toLowerCase(),
        pickup_location: pickupLocation.trim() || campus.trim(),
        images,
        tags: [
          ...additionalTags,
          ...(pickupNotes.trim() ? [pickupNotes.trim()] : []),
        ],
      };

      console.log(
        "Submitting listing with token:",
        token.substring(0, 20) + "..."
      );
      await createListingMutation.mutateAsync(listingData);
      toast.success("Listing created successfully!");
      navigate("/browse");
    } catch (error: unknown) {
      console.error("Create listing error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create listing. Please try again.";

      // Check for authentication errors
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("Could not validate")
      ) {
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Create a Listing
            </h1>
            <p className="text-muted-foreground">
              Fill out the details below to list your item
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus II Textbook - Perfect Condition"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="categories">
                    Categories * (Select one or more)
                  </Label>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox
                            id={cat}
                            checked={selectedCategories.includes(cat)}
                            onCheckedChange={() => toggleCategory(cat)}
                          />
                          <Label htmlFor={cat} className="text-sm font-normal">
                            {cat}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">
                          Selected:
                        </span>
                        {selectedCategories.map((cat) => (
                          <Badge
                            key={cat}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {cat}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeCategory(cat)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={condition}
                      onValueChange={setCondition}
                      required
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond} value={cond.toLowerCase()}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="45"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Quantity Available *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pickup-location">
                    Specific Pickup Location
                  </Label>
                  <Input
                    id="pickup-location"
                    type="text"
                    placeholder="e.g., Main Library, Dorm Building A"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Description</h2>
              <div>
                <Label htmlFor="description">Item Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail. Include condition, features, reason for selling, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {description.length}/1000 characters
                </p>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    <AlertCircle className="mr-2 inline h-4 w-4 text-primary" />
                    Include pickup details and any defects to help buyers make
                    informed decisions
                  </p>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Photos</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {previewImages.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                        Upload Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <ImageIcon className="mr-2 inline h-4 w-4" />
                  Upload up to 5 images. The first image will be the primary
                  photo.
                </p>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Location & Pickup</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campus">Campus/University *</Label>
                  <Input
                    id="campus"
                    placeholder="Enter your campus or university name"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This will help buyers find items near them
                  </p>
                </div>
                <div>
                  <Label htmlFor="pickup-notes">
                    Pickup Instructions (Optional)
                  </Label>
                  <Textarea
                    id="pickup-notes"
                    placeholder="e.g., Available for pickup at Main Library during weekdays, flexible schedule, contact me to arrange"
                    rows={3}
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provide details about when and where buyers can collect the
                    item
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1 min-w-40"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  "Publish Listing"
                )}
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={() => {
                  toast.info("Save as draft functionality coming soon!");
                }}
              >
                Save as Draft
              </Button> */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={clearForm}
              >
                Clear Form
              </Button>
              <Link to="/browse">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
