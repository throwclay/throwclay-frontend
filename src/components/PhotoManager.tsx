"use client";
import { useState } from "react";
import { Camera, Plus, Pencil, Upload, X, Edit, Trash2, Image } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "./ui/alert-dialog";
import { DrawingCanvas } from "./DrawingCanvas";
import { PhotoEditor } from "./PhotoEditor";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PhotoEntry } from "@/app/context/AppContext";

interface PhotoManagerProps {
    photos: PhotoEntry[];
    onPhotosChange: (photos: PhotoEntry[]) => void;
}

export function PhotoManager({ photos, onPhotosChange }: PhotoManagerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDrawingDialog, setShowDrawingDialog] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<PhotoEntry | null>(null);
    const [newPhotoUrl, setNewPhotoUrl] = useState("");
    const [newPhotoCaption, setNewPhotoCaption] = useState("");
    const [newPhotoNotes, setNewPhotoNotes] = useState("");

    const generatePhotoId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const handleAddPhoto = () => {
        if (!newPhotoUrl.trim()) return;

        const newPhoto: PhotoEntry = {
            id: generatePhotoId(),
            url: newPhotoUrl,
            type: "photo",
            caption: newPhotoCaption,
            notes: newPhotoNotes,
            timestamp: new Date().toISOString()
        };

        onPhotosChange([...photos, newPhoto]);
        setNewPhotoUrl("");
        setNewPhotoCaption("");
        setNewPhotoNotes("");
        setShowAddDialog(false);
    };

    const handleAddSketch = (dataUrl: string) => {
        const newSketch: PhotoEntry = {
            id: generatePhotoId(),
            url: dataUrl,
            type: "sketch",
            caption: "Hand-drawn sketch",
            notes: "",
            timestamp: new Date().toISOString()
        };

        onPhotosChange([...photos, newSketch]);
        setShowDrawingDialog(false);
    };

    const handleUpdatePhoto = (updatedPhoto: PhotoEntry) => {
        const updatedPhotos = photos.map((photo) =>
            photo.id === updatedPhoto.id ? updatedPhoto : photo
        );
        onPhotosChange(updatedPhotos);
        setEditingPhoto(null);
    };

    const handleDeletePhoto = (photoId: string) => {
        onPhotosChange(photos.filter((photo) => photo.id !== photoId));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setNewPhotoUrl(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getSamplePhotoUrl = () => {
        const sampleUrls = [
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1493925410384-84f842e616fb?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1606107557311-7c2c85e79f22?w=400&h=300&fit=crop"
        ];
        return sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    };

    // If editing a photo, show the PhotoEditor
    if (editingPhoto) {
        return (
            <PhotoEditor
                photo={editingPhoto}
                onSave={handleUpdatePhoto}
                onCancel={() => setEditingPhoto(null)}
            />
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>Photos & Sketches</span>
                        <Badge variant="secondary">{photos.length}</Badge>
                    </div>
                    <div className="flex space-x-2">
                        <Dialog
                            open={showAddDialog}
                            onOpenChange={setShowAddDialog}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Photo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Photo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="photo-upload">Upload Photo</Label>
                                        <div className="mt-2">
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    document.getElementById("photo-upload")?.click()
                                                }
                                                className="w-full flex items-center space-x-2"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span>Choose File</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-center text-muted-foreground">or</div>

                                    <div>
                                        <Label htmlFor="photo-url">Photo URL</Label>
                                        <Input
                                            id="photo-url"
                                            value={newPhotoUrl}
                                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewPhotoUrl(getSamplePhotoUrl())}
                                            className="mt-2"
                                        >
                                            Use Sample Photo
                                        </Button>
                                    </div>

                                    {newPhotoUrl && (
                                        <div>
                                            <Label>Preview</Label>
                                            <ImageWithFallback
                                                src={newPhotoUrl}
                                                alt="Photo preview"
                                                className="w-full h-32 object-cover rounded-md mt-2"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="photo-caption">Caption</Label>
                                        <Input
                                            id="photo-caption"
                                            value={newPhotoCaption}
                                            onChange={(e) => setNewPhotoCaption(e.target.value)}
                                            placeholder="Brief description of the photo"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="photo-notes">Process Notes</Label>
                                        <Textarea
                                            id="photo-notes"
                                            value={newPhotoNotes}
                                            onChange={(e) => setNewPhotoNotes(e.target.value)}
                                            placeholder="What was happening at this stage? Key observations..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAddDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddPhoto}
                                            disabled={!newPhotoUrl.trim()}
                                        >
                                            Add Photo
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={showDrawingDialog}
                            onOpenChange={setShowDrawingDialog}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Draw Sketch
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Create Sketch</DialogTitle>
                                </DialogHeader>
                                <DrawingCanvas
                                    onSave={handleAddSketch}
                                    onCancel={() => setShowDrawingDialog(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {photos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Image className="w-12 h-12 mx-auto mb-4" />
                        <p>No photos or sketches yet</p>
                        <p className="text-sm">Add photos to document your pottery process</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative group"
                            >
                                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                    <ImageWithFallback
                                        src={photo.url}
                                        alt={photo.caption || "Pottery photo"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="absolute top-2 left-2">
                                    <Badge
                                        variant={photo.type === "sketch" ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {photo.type === "sketch" ? "Sketch" : "Photo"}
                                    </Badge>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditingPhoto(photo);
                                        }}
                                        className="p-2"
                                    >
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="p-2"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this photo? This
                                                    action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {photo.caption && (
                                    <div className="mt-2">
                                        <p className="text-sm">{photo.caption}</p>
                                    </div>
                                )}

                                {photo.notes && (
                                    <div className="mt-1">
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {photo.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-1 text-xs text-muted-foreground">
                                    {new Date(photo.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
