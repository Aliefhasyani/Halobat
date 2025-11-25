"use client";

import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type DrugCardProps = {
  id: string;
  name: string;
  price?: string | number;
  type?: "generic" | "brand";
  picture?: string | null;
  manufacturer?: string | null;
  dosage?: string | null;
};

export function DrugCard({
  id,
  name,
  price,
  type = "generic",
  picture,
  manufacturer,
  dosage,
}: DrugCardProps) {
  // fallback to a picsum photo when there's no picture supplied by backend
  const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(
    id
  )}/200`;
  const [imageSrc, setImageSrc] = React.useState<string>(
    picture || fallbackUrl
  );

  React.useEffect(() => {
    setImageSrc(picture || fallbackUrl);
  }, [picture, fallbackUrl]);

  return (
    // remove card internal padding so the top image can sit flush with the card's rounded corners
    <Card className="flex flex-col justify-between h-full overflow-hidden p-0">
      {/* large image area (rounded top corners) */}
      <div className="w-full h-44 sm:h-56 md:h-48 bg-muted/10 overflow-hidden rounded-t-xl relative">
        <Image
          src={imageSrc}
          alt={name}
          fill
          unoptimized
          className="w-full h-full object-cover"
          onError={() => {
            if (imageSrc !== fallbackUrl) setImageSrc(fallbackUrl);
          }}
        />
      </div>

      <CardContent className="flex-1 px-6 py-4">
        <div className="min-w-0">
          <CardTitle className="text-sm truncate">{name}</CardTitle>
          <CardDescription className="text-xs truncate">
            {manufacturer ||
              dosage ||
              (type === "brand" ? "Branded" : "Generic")}
          </CardDescription>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-base font-semibold">
            {price ? `$${price}` : "—"}
          </div>
          <div className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground capitalize">
            {type}
          </div>
        </div>
      </CardContent>
      {/* add more comfortable padding and a subtle top border so the action isn't flush against the card edge */}
      <CardFooter className="px-6 py-4 border-t bg-transparent">
        <Button variant="outline" size="sm" asChild>
          {/* navigate to the public detail page; pass `type` so the page can fetch the right resource */}
          <a href={`/drug?id=${id}&type=${type}`}>View</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default DrugCard;
