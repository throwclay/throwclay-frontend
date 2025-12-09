import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Eraser, Palette, RotateCcw, Save, X } from "lucide-react";

interface DrawingCanvasProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
    initialImage?: string;
}

const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
    "#8b4513",
    "#ffc0cb",
    "#808080",
    "#a52a2a",
    "#90ee90"
];

export function DrawingCanvas({ onSave, onCancel, initialImage }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState([3]);
    const [isEraser, setIsEraser] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = 600;
        canvas.height = 400;

        // Set drawing properties
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (initialImage) {
            // Load existing sketch
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setImageLoaded(true);
            };
            img.onerror = () => {
                // If image fails to load, initialize with white background
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                setImageLoaded(true);
            };
            img.src = initialImage;
        } else {
            // Initialize with white background for new sketch
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setImageLoaded(true);
        }
    }, [initialImage]);

    const getCanvasCoordinates = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!imageLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
        setIsDrawing(true);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !imageLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
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

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (initialImage) {
            // Reload the initial image
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = initialImage;
        } else {
            // Clear to white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        onSave(dataUrl);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!imageLoaded) return;

        const touch = e.touches[0];
        const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);

        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing || !imageLoaded) return;

        const touch = e.touches[0];
        const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);

        const canvas = canvasRef.current;
        if (!canvas) return;

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

    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
    };

    return (
        <div className="space-y-4">
            {/* Drawing Tools */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                    <Label>Color:</Label>
                    <div className="flex flex-wrap gap-1">
                        {colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => {
                                    setCurrentColor(color);
                                    setIsEraser(false);
                                }}
                                className={`w-8 h-8 rounded-full border-2 ${
                                    currentColor === color && !isEraser
                                        ? "border-primary"
                                        : "border-border"
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Label>Brush Size:</Label>
                    <div className="w-24">
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

                <Button
                    variant={isEraser ? "default" : "outline"}
                    onClick={() => setIsEraser(!isEraser)}
                    className="flex items-center space-x-2"
                >
                    <Eraser className="w-4 h-4" />
                    <span>Eraser</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={clearCanvas}
                    className="flex items-center space-x-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>{initialImage ? "Reset" : "Clear"}</span>
                </Button>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
                <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={`touch-none ${!imageLoaded ? "opacity-50" : ""}`}
                        style={{
                            cursor: !imageLoaded ? "wait" : isEraser ? "grab" : "crosshair",
                            width: "100%",
                            maxWidth: "600px",
                            height: "auto"
                        }}
                    />
                </div>
            </div>

            {!imageLoaded && (
                <div className="text-center text-muted-foreground">
                    {initialImage ? "Loading sketch..." : "Preparing canvas..."}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center space-x-2"
                >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                </Button>
                <Button
                    onClick={saveDrawing}
                    disabled={!imageLoaded}
                    className="flex items-center space-x-2"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Sketch</span>
                </Button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground text-center">
                <p>
                    Use your mouse or touch to draw. Select colors and adjust brush size as needed.
                </p>
                <p>
                    {initialImage
                        ? "Edit your existing sketch or add new elements."
                        : "Perfect for sketching pottery forms, decorative patterns, or process diagrams."}
                </p>
            </div>
        </div>
    );
}
