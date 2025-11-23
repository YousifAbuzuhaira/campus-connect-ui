import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { 
  MessageCircle, 
  Flag, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Tag
} from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);

  const listing = {
    id: 1,
    title: "Calculus II Textbook - Perfect Condition",
    price: 45,
    category: "Textbooks",
    campus: "Stanford University",
    posted: "2 days ago",
    condition: "Like New",
    description: "Comprehensive Calculus II textbook in excellent condition. Used for one semester only. No highlighting or writing inside. All pages intact. Perfect for MATH 142 or equivalent courses. Includes all original materials and access codes (if applicable). Great way to save money on expensive textbooks!",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800"
    ],
    seller: {
      name: "Sarah M.",
      rating: 4.8,
      totalSales: 12,
      memberSince: "Sep 2023",
      verified: true
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Link to="/browse">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="relative mb-4 overflow-hidden rounded-lg bg-muted">
              <div className="aspect-square">
                <img
                  src={listing.images[currentImage]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 rounded-md bg-background/80 px-2 py-1 text-sm">
                {currentImage + 1} / {listing.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    currentImage === index
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Description */}
            <Card className="mt-8 p-6">
              <h2 className="mb-4 text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </Card>

            {/* Safety Tips */}
            <Card className="mt-4 border-accent/20 bg-accent/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Meet in a public place on campus</li>
                <li>• Inspect the item before purchasing</li>
                <li>• Never share financial information via messages</li>
                <li>• Report suspicious listings immediately</li>
              </ul>
            </Card>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">{listing.category}</Badge>
                  <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                    Verified
                  </Badge>
                </div>
              </div>

              <h1 className="mb-4 text-2xl font-bold text-foreground">
                {listing.title}
              </h1>

              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">
                  ${listing.price}
                </span>
              </div>

              <div className="mb-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Condition: {listing.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.campus}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {listing.posted}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Seller Info */}
              <div className="mb-6">
                <h3 className="mb-4 font-semibold">Seller Information</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      SM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <ShieldCheck className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span>{listing.seller.rating}</span>
                      <span>•</span>
                      <span>{listing.seller.totalSales} sales</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Member since {listing.seller.memberSince}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link to="/messages">
                  <Button className="w-full" size="lg">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Seller
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Related Listings */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Similar Items</h3>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Link key={i} to={`/listing/${i + 1}`}>
                    <div className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={`https://images.unsplash.com/photo-150902143666${i}-8f07dbf5bf1d?w=200`}
                          alt="Similar item"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-2 text-sm font-medium">
                          Physics Textbook Bundle
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          $35
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
