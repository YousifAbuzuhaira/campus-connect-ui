import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Textbooks", "Electronics", "Lab Supplies", "Furniture", "Transportation", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function CreateListing() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload these to a server
      // For now, create local URLs for preview
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Listing created successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Create a Listing</h1>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={condition} onValueChange={setCondition} required>
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
                    Include pickup details and any defects to help buyers make informed decisions
                  </p>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Photos</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
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
                  Upload up to 5 images. The first image will be the primary photo.
                </p>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Location & Pickup</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campus">Campus</Label>
                  <Input
                    id="campus"
                    value="Stanford University"
                    disabled
                    className="bg-muted"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Auto-detected from your verified email
                  </p>
                </div>
                <div>
                  <Label htmlFor="pickup-notes">Pickup Instructions (Optional)</Label>
                  <Textarea
                    id="pickup-notes"
                    placeholder="e.g., Available for pickup at Main Library during weekdays"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" size="lg" className="flex-1">
                Publish Listing
              </Button>
              <Button type="button" variant="outline" size="lg">
                Save as Draft
              </Button>
              <Link to="/browse">
                <Button type="button" variant="ghost" size="lg">
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
