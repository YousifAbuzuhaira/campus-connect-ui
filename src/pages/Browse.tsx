import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/layout/Navbar";
import { Filter, Star, MapPin } from "lucide-react";

const CATEGORIES = ["All", "Textbooks", "Electronics", "Lab Supplies", "Furniture", "Transportation", "Other"];

const MOCK_LISTINGS = [
  {
    id: 1,
    title: "Calculus II Textbook - Perfect Condition",
    price: 45,
    category: "Textbooks",
    campus: "Stanford University",
    posted: "2 days ago",
    rating: 4.8,
    verified: true,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"
  },
  {
    id: 2,
    title: "MacBook Pro 13\" 2020 - Great for Students",
    price: 800,
    category: "Electronics",
    campus: "Stanford University",
    posted: "1 week ago",
    rating: 5.0,
    verified: true,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"
  },
  {
    id: 3,
    title: "Lab Coat and Safety Goggles Set",
    price: 25,
    category: "Lab Supplies",
    campus: "MIT",
    posted: "3 days ago",
    rating: 4.5,
    verified: true,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400"
  },
  {
    id: 4,
    title: "IKEA Desk - Excellent Condition",
    price: 75,
    category: "Furniture",
    campus: "Stanford University",
    posted: "5 days ago",
    rating: 4.9,
    verified: true,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400"
  },
  {
    id: 5,
    title: "Organic Chemistry Study Guide Bundle",
    price: 30,
    category: "Textbooks",
    campus: "UC Berkeley",
    posted: "1 day ago",
    rating: 4.7,
    verified: true,
    image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400"
  },
  {
    id: 6,
    title: "iPad Air with Apple Pencil",
    price: 450,
    category: "Electronics",
    campus: "Stanford University",
    posted: "4 days ago",
    rating: 5.0,
    verified: true,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400"
  }
];

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse Listings</h1>
            <p className="text-muted-foreground">
              {MOCK_LISTINGS.length} items available
            </p>
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <Card className="sticky top-20 p-6">
              <div className="mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="mb-3 font-medium">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategory === category}
                          onCheckedChange={() => setSelectedCategory(category)}
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="mb-3 font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Posted Date */}
                <div>
                  <h3 className="mb-3 font-medium">Posted</h3>
                  <div className="space-y-2">
                    {["Today", "This Week", "This Month", "All Time"].map((time) => (
                      <div key={time} className="flex items-center gap-2">
                        <Checkbox id={time} />
                        <Label htmlFor={time} className="text-sm">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {MOCK_LISTINGS.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {listing.category}
                        </Badge>
                        {listing.verified && (
                          <Badge variant="outline" className="border-success/20 bg-success/10 text-success text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 line-clamp-2 font-semibold text-card-foreground group-hover:text-primary">
                        {listing.title}
                      </h3>
                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.campus}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ${listing.price}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-medium">{listing.rating}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Posted {listing.posted}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
