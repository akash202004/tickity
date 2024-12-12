"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  eventData: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Event date must be in the future"
    ),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalTickets: z.number().min(1, "Must have at least 1 ticket"),
});

type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  descripton: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageId: Id<"_storage">;
}

interface EventFormProps {
  mode: "create" | "edit";
  intialData?: InitialEventData;
}

export default function EventForm({ mode, intialData }: EventFormProps) {
  const { user } = useUser();
  const createEvent = useMutation(api.events.craete);
  const updateEvent = useMutation(api.events.updateEvent);
  const router = useRouter();
  const [isPending, startTrasnsition] = useTransition();
  const { toast } = useToast();
  const currentImageUrl = useStorageUrl(intialData?.imageStorageId);

  // image upload
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  return <div>EventForm</div>;
}
