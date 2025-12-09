import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Upload, Pencil, Eraser, RotateCcw, X, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DrawingCanvas } from "./DrawingCanvas";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PhotoEntry } from "@/app/context/AppContext";

interface PhotoEditorProps {
    photo: PhotoEntry;
    onSave: (updatedPhoto: PhotoEntry) => void;
    onCancel: () => void;
}

const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
    "#ffc0cb",
    "#a52a2a",
    "#000000",
    "#ffffff"
];

export function PhotoEditor({ photo, onSave, onCancel }: PhotoEditorProps) {
    const [editedPhoto, setEditedPhoto] = useState<PhotoEntry>(photo);
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState("#ff0000");
    const [brushSize, setBrushSize] = useState([3]);
    const [isEraser, setIsEraser] = useState(false);
    const [showReplaceDialog, setShowReplaceDialog] = useState(false);
    const [showSketchEditor, setShowSketchEditor] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [imageLoaded, setImageLoaded] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isSketch = photo.type === "sketch";

    // Reset image loaded state when photo changes
    useEffect(() => {
        setImageLoaded(false);
    }, [editedPhoto.url]);

    const handleSave = () => {
        // If we're annotating a photo, combine the original image with annotations
        if (isAnnotating && canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const image = imageRef.current;

            // Create a new canvas to combine image + annotations
            const combinedCanvas = document.createElement("canvas");
            const combinedCtx = combinedCanvas.getContext("2d");

            if (combinedCtx) {
                // Set canvas size to match original image dimensions
                combinedCanvas.width = image.naturalWidth;
                combinedCanvas.height = image.naturalHeight;

                // Draw the original image
                combinedCtx.drawImage(image, 0, 0);

                // Draw the annotations on top, scaling appropriately
                const scaleX = image.naturalWidth / canvas.width;
                const scaleY = image.naturalHeight / canvas.height;
                combinedCtx.scale(scaleX, scaleY);
                combinedCtx.drawImage(canvas, 0, 0);

                const dataUrl = combinedCanvas.toDataURL("image/png");
                const updatedPhoto = {
                    ...editedPhoto,
                    url: dataUrl
                };
                onSave(updatedPhoto);
                return;
            }
        }

        onSave(editedPhoto);
    };

    const handleSketchSave = (dataUrl: string) => {
        const updatedPhoto = {
            ...editedPhoto,
            url: dataUrl
        };
        onSave(updatedPhoto);
        setShowSketchEditor(false);
    };

    const handleReplaceImage = () => {
        if (newImageUrl.trim()) {
            setEditedPhoto((prev) => ({ ...prev, url: newImageUrl }));
            setNewImageUrl("");
            setShowReplaceDialog(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setEditedPhoto((prev) => ({ ...prev, url: e.target.result as string }));
                    setShowReplaceDialog(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getSamplePhotoUrl = () => {
        const sampleUrls = [
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1493925410384-84f842e616fb?w=600&h=400&fit=crop"
        ];
        return sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        if (isAnnotating) {
            setupCanvas();
        }
    };

    const startAnnotation = () => {
        setIsAnnotating(true);
        if (imageLoaded) {
            setupCanvas();
        }
    };

    const setupCanvas = () => {
        const canvas = canvasRef.current;
        const image = imageRef.current;

        if (!canvas || !image || !imageLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get the displayed size of the image
        const imageRect = image.getBoundingClientRect();

        // Set canvas size to match displayed image size
        canvas.width = imageRect.width;
        canvas.height = imageRect.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set drawing properties
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
    };

    const clearAnnotations = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isAnnotating || !imageLoaded) return;

        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e);
        setIsDrawing(true);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isAnnotating || !imageLoaded) return;

        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (isEraser) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = brushSize[0] * 2;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize[0];
        }

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
        if (e) e.preventDefault();
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
    };

    // Setup canvas when annotation starts and image is loaded
    useEffect(() => {
        if (isAnnotating && imageLoaded) {
            setupCanvas();
        }
    }, [isAnnotating, imageLoaded]);

    // If editing a sketch, show the drawing canvas
    if (showSketchEditor) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSketchEditor(false)}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1>Edit Sketch</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Drawing Canvas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DrawingCanvas
                            initialImage={editedPhoto.url}
                            onSave={handleSketchSave}
                            onCancel={() => setShowSketchEditor(false)}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="p-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1>Edit {isSketch ? "Sketch" : "Photo"}</h1>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowReplaceDialog(true)}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Replace Image
                    </Button>

                    {isSketch ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowSketchEditor(true)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Drawing
                        </Button>
                    ) : !isAnnotating ? (
                        <Button
                            variant="outline"
                            onClick={startAnnotation}
                            disabled={!imageLoaded}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Annotate Photo
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsAnnotating(false)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Stop Annotating
                        </Button>
                    )}

                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Display & Annotation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{isSketch ? "Sketch" : "Photo"}</span>
                            <div className="flex items-center space-x-2">
                                <Badge variant={isSketch ? "default" : "secondary"}>
                                    {isSketch ? "Sketch" : "Photo"}
                                </Badge>
                                {isAnnotating && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        Annotation Mode
                                    </Badge>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            ref={containerRef}
                            className="relative"
                        >
                            <ImageWithFallback
                                ref={imageRef}
                                src={editedPhoto.url}
                                alt={editedPhoto.caption}
                                className="w-full h-auto rounded-lg block"
                                onLoad={handleImageLoad}
                                onError={() => setImageLoaded(false)}
                            />

                            {isAnnotating && !isSketch && imageLoaded && (
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="absolute top-0 left-0 w-full h-full rounded-lg cursor-crosshair"
                                    style={{
                                        cursor: isEraser ? "grab" : "crosshair",
                                        pointerEvents: "auto"
                                    }}
                                />
                            )}

                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                                    <p className="text-muted-foreground">Loading image...</p>
                                </div>
                            )}
                        </div>

                        {/* Drawing Tools - Only show for photo annotation */}
                        {isAnnotating && !isSketch && imageLoaded && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4>Annotation Tools</h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAnnotations}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Clear Marks
                                    </Button>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Label>Color:</Label>
                                        <div className="flex gap-1">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => {
                                                        setCurrentColor(color);
                                                        setIsEraser(false);
                                                    }}
                                                    className={`w-6 h-6 rounded-full border-2 ${
                                                        currentColor === color && !isEraser
                                                            ? "border-primary"
                                                            : "border-border"
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant={isEraser ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsEraser(!isEraser)}
                                    >
                                        <Eraser className="w-4 h-4 mr-2" />
                                        Eraser
                                    </Button>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <Label>Brush Size:</Label>
                                    <div className="w-32">
                                        <Slider
                                            value={brushSize}
                                            onValueChange={setBrushSize}
                                            min={1}
                                            max={20}
                                            step={1}
                                        />
                                    </div>
                                    <Badge variant="outline">{brushSize[0]}px</Badge>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Photo Details Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{isSketch ? "Sketch" : "Photo"} Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="caption">Caption</Label>
                            <Input
                                id="caption"
                                value={editedPhoto.caption}
                                onChange={(e) =>
                                    setEditedPhoto((prev) => ({ ...prev, caption: e.target.value }))
                                }
                                placeholder={`Brief description of the ${isSketch ? "sketch" : "photo"}`}
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Process Notes</Label>
                            <Textarea
                                id="notes"
                                value={editedPhoto.notes}
                                onChange={(e) =>
                                    setEditedPhoto((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                placeholder="What was happening at this stage? Key observations, techniques used, challenges faced..."
                                rows={8}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <div>Type: {isSketch ? "Sketch" : "Photo"}</div>
                            <div>Created: {new Date(editedPhoto.timestamp).toLocaleString()}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Replace Image Dialog */}
            <Dialog
                open={showReplaceDialog}
                onOpenChange={setShowReplaceDialog}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Replace {isSketch ? "Sketch" : "Photo"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="image-upload">Upload New Image</Label>
                            <div className="mt-2">
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById("image-upload")?.click()}
                                    className="w-full flex items-center space-x-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Choose File</span>
                                </Button>
                            </div>
                        </div>

                        <div className="text-center text-muted-foreground">or</div>

                        <div>
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                            />
                            {!isSketch && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setNewImageUrl(getSamplePhotoUrl())}
                                    className="mt-2"
                                >
                                    Use Sample Photo
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowReplaceDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReplaceImage}
                                disabled={!newImageUrl.trim()}
                            >
                                Replace Image
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
