"use client";
import { useState } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Flame,
    GraduationCap,
    PartyPopper,
    Briefcase,
    Flag,
    AlertCircle,
    Sparkles,
    Clock,
    MapPin,
    Users,
    Filter,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/app/context/AppContext";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

type CalendarItemType =
    | "kiln"
    | "class"
    | "event"
    | "pto"
    | "holiday"
    | "expiration"
    | "cleanup"
    | "studio-time"
    | "vacation"
    | "personal";

interface CalendarItem {
    id: string;
    type: CalendarItemType;
    title: string;
    description?: string;
    date: string;
    endDate?: string;
    time?: string;
    endTime?: string;
    location?: string;
    assignedTo?: string[];
    color?: string;
    status?: "pending" | "approved" | "denied";
}

type CalendarView = "month" | "week" | "day";

export default function CalendarPage() {
    const { currentUser } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>("month");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState<CalendarItemType | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Filter states
    const [filters, setFilters] = useState({
        kiln: true,
        class: true,
        event: true,
        pto: true,
        holiday: true,
        expiration: true,
        cleanup: true,
        "studio-time": true,
        vacation: true,
        personal: true
    });

    // Mock calendar items
    const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([
        {
            id: "1",
            type: "kiln",
            title: "Bisque Firing - Main Kiln",
            description: "Load: 42 pieces, Cone 04",
            date: "2025-06-25",
            time: "08:00",
            endTime: "18:00",
            location: "Main Studio",
            color: "#ef4444"
        },
        {
            id: "2",
            type: "class",
            title: "Beginner Wheel Throwing",
            description: "Week 3 of 6",
            date: "2025-06-26",
            time: "18:00",
            endTime: "20:00",
            location: "Studio A",
            assignedTo: ["instructor1"],
            color: "#3b82f6"
        },
        {
            id: "3",
            type: "event",
            title: "Open Studio Night",
            description: "Members only - practice time",
            date: "2025-06-27",
            time: "18:00",
            endTime: "22:00",
            location: "All Studios",
            color: "#8b5cf6"
        },
        {
            id: "4",
            type: "pto",
            title: "Sarah Wilson - PTO",
            date: "2025-06-28",
            endDate: "2025-06-30",
            assignedTo: ["instructor1"],
            color: "#f59e0b"
        },
        {
            id: "5",
            type: "holiday",
            title: "Independence Day",
            description: "Studio Closed",
            date: "2025-07-04",
            color: "#dc2626"
        },
        {
            id: "6",
            type: "expiration",
            title: "Membership Expiring - John Doe",
            description: "5 members expiring this week",
            date: "2025-06-30",
            color: "#ec4899"
        },
        {
            id: "7",
            type: "cleanup",
            title: "Studio Deep Clean",
            description: "Monthly maintenance",
            date: "2025-06-29",
            time: "10:00",
            endTime: "14:00",
            assignedTo: ["staff1", "staff2"],
            color: "#10b981"
        },
        {
            id: "8",
            type: "kiln",
            title: "Glaze Firing - Small Kiln",
            description: "Cone 6, 28 pieces",
            date: "2025-07-01",
            time: "06:00",
            endTime: "16:00",
            location: "Small Kiln Room",
            color: "#ef4444"
        },
        {
            id: "9",
            type: "class",
            title: "Advanced Hand Building",
            description: "Sculpture techniques",
            date: "2025-07-02",
            time: "14:00",
            endTime: "17:00",
            location: "Studio B",
            assignedTo: ["instructor2"],
            color: "#3b82f6"
        }
    ]);

    const [newItem, setNewItem] = useState<Partial<CalendarItem>>({
        title: "",
        description: "",
        date: "",
        endDate: "",
        time: "",
        endTime: "",
        location: "",
        assignedTo: []
    });

    const getTypeConfig = (type: CalendarItemType) => {
        const configs = {
            kiln: {
                icon: Flame,
                label: "Kiln Schedule",
                color: "bg-red-100 text-red-800 border-red-300"
            },
            class: {
                icon: GraduationCap,
                label: "Class",
                color: "bg-blue-100 text-blue-800 border-blue-300"
            },
            event: {
                icon: PartyPopper,
                label: "Event",
                color: "bg-purple-100 text-purple-800 border-purple-300"
            },
            pto: {
                icon: Briefcase,
                label: "PTO",
                color: "bg-amber-100 text-amber-800 border-amber-300"
            },
            holiday: {
                icon: Flag,
                label: "Holiday",
                color: "bg-red-100 text-red-800 border-red-300"
            },
            expiration: {
                icon: AlertCircle,
                label: "Expiration",
                color: "bg-pink-100 text-pink-800 border-pink-300"
            },
            cleanup: {
                icon: Sparkles,
                label: "Cleanup",
                color: "bg-green-100 text-green-800 border-green-300"
            },
            "studio-time": {
                icon: Clock,
                label: "Studio Time",
                color: "bg-gray-100 text-gray-800 border-gray-300"
            },
            vacation: {
                icon: Users,
                label: "Vacation",
                color: "bg-teal-100 text-teal-800 border-teal-300"
            },
            personal: {
                icon: X,
                label: "Personal",
                color: "bg-gray-100 text-gray-800 border-gray-300"
            }
        };
        return configs[type];
    };

    const toggleFilter = (type: CalendarItemType) => {
        setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const getFilteredItems = () => {
        return calendarItems.filter((item) => filters[item.type]);
    };

    const getItemsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return getFilteredItems().filter((item) => {
            const itemStart = item.date;
            const itemEnd = item.endDate || item.date;
            return dateStr >= itemStart && dateStr <= itemEnd;
        });
    };

    // Calendar navigation
    const previousPeriod = () => {
        if (view === "month") {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        } else if (view === "week") {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 1);
            setCurrentDate(newDate);
        }
    };

    const nextPeriod = () => {
        if (view === "month") {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        } else if (view === "week") {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 1);
            setCurrentDate(newDate);
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getViewTitle = () => {
        if (view === "month") {
            return currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
        } else if (view === "week") {
            const weekStart = getWeekStart(currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${weekStart.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            })} - ${weekEnd.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            })}`;
        } else {
            return currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
        }
    };

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    const handleCreateItem = () => {
        if (!selectedItemType || !newItem.title || !newItem.date) return;

        const item: CalendarItem = {
            id: Date.now().toString(),
            type: selectedItemType,
            title: newItem.title,
            description: newItem.description,
            date: newItem.date,
            endDate: newItem.endDate,
            time: newItem.time,
            endTime: newItem.endTime,
            location: newItem.location,
            assignedTo: newItem.assignedTo,
            color: getTypeConfig(selectedItemType).color
        };

        setCalendarItems((prev) => [...prev, item]);
        setShowCreateDialog(false);
        setSelectedItemType(null);
        setNewItem({
            title: "",
            description: "",
            date: "",
            endDate: "",
            time: "",
            endTime: "",
            location: "",
            assignedTo: []
        });
    };

    const openCreateDialog = (type: CalendarItemType) => {
        setSelectedItemType(type);
        setShowCreateDialog(true);
    };

    // Get calendar types user can create
    const getCreatableTypes = (): CalendarItemType[] => {
        if (currentUser?.type === "studio") {
            return ["kiln", "class", "event", "pto", "holiday", "expiration", "cleanup"];
        } else {
            // Artists can only create personal events and vacation requests
            return ["personal", "vacation"];
        }
    };

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1>Calendar</h1>
                        <p className="text-muted-foreground">
                            {currentUser?.type === "studio"
                                ? "Manage schedules, events, and studio operations"
                                : "Track your classes, studio time, and pottery journey"}
                        </p>
                    </div>

                    {/* Quick Create Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Quick Create
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56"
                        >
                            {getCreatableTypes().map((type) => {
                                const config = getTypeConfig(type);
                                const Icon = config.icon;
                                return (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => openCreateDialog(type)}
                                        className="cursor-pointer"
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        <div>
                                            <p>{config.label}</p>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex gap-6">
                    {/* Main Calendar Area */}
                    <div className="flex-1 space-y-6">
                        {/* Calendar Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={previousPeriod}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextPeriod}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <h3 className="ml-4">{getViewTitle()}</h3>
                            </div>

                            <Tabs
                                value={view}
                                onValueChange={(v) => setView(v as CalendarView)}
                            >
                                <TabsList>
                                    <TabsTrigger value="month">Month</TabsTrigger>
                                    <TabsTrigger value="week">Week</TabsTrigger>
                                    <TabsTrigger value="day">Day</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Calendar Views */}
                        {view === "month" && (
                            <MonthView
                                currentDate={currentDate}
                                items={getFilteredItems()}
                                getTypeConfig={getTypeConfig}
                                onDateClick={setSelectedDate}
                            />
                        )}
                        {view === "week" && (
                            <WeekView
                                currentDate={currentDate}
                                items={getFilteredItems()}
                                getTypeConfig={getTypeConfig}
                            />
                        )}
                        {view === "day" && (
                            <DayView
                                currentDate={currentDate}
                                items={getFilteredItems()}
                                getTypeConfig={getTypeConfig}
                            />
                        )}
                    </div>

                    {/* Filters Sidebar */}
                    <Card className="w-64 h-fit sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Filter className="w-4 h-4" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(Object.keys(filters) as CalendarItemType[]).map((type) => {
                                    const config = getTypeConfig(type);
                                    const Icon = config.icon;
                                    return (
                                        <div
                                            key={type}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`filter-${type}`}
                                                checked={filters[type]}
                                                onCheckedChange={() => toggleFilter(type)}
                                            />
                                            <Label
                                                htmlFor={`filter-${type}`}
                                                className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                                            >
                                                <Icon className="w-4 h-4" />
                                                {config.label}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Create Item Dialog */}
                <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Create {selectedItemType && getTypeConfig(selectedItemType).label}
                            </DialogTitle>
                            <DialogDescription>
                                Add a new{" "}
                                {selectedItemType &&
                                    getTypeConfig(selectedItemType).label.toLowerCase()}{" "}
                                to the calendar.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="item-title">Title *</Label>
                                <Input
                                    id="item-title"
                                    value={newItem.title}
                                    onChange={(e) =>
                                        setNewItem((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    placeholder="Enter title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="item-description">Description</Label>
                                <Textarea
                                    id="item-description"
                                    value={newItem.description}
                                    onChange={(e) =>
                                        setNewItem((prev) => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }
                                    placeholder="Add details..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="item-date">Start Date *</Label>
                                    <Input
                                        id="item-date"
                                        type="date"
                                        value={newItem.date}
                                        onChange={(e) =>
                                            setNewItem((prev) => ({
                                                ...prev,
                                                date: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="item-end-date">End Date (optional)</Label>
                                    <Input
                                        id="item-end-date"
                                        type="date"
                                        value={newItem.endDate}
                                        onChange={(e) =>
                                            setNewItem((prev) => ({
                                                ...prev,
                                                endDate: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="item-time">Start Time</Label>
                                    <Input
                                        id="item-time"
                                        type="time"
                                        value={newItem.time}
                                        onChange={(e) =>
                                            setNewItem((prev) => ({
                                                ...prev,
                                                time: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="item-end-time">End Time</Label>
                                    <Input
                                        id="item-end-time"
                                        type="time"
                                        value={newItem.endTime}
                                        onChange={(e) =>
                                            setNewItem((prev) => ({
                                                ...prev,
                                                endTime: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {(selectedItemType === "kiln" ||
                                selectedItemType === "class" ||
                                selectedItemType === "event" ||
                                selectedItemType === "cleanup") && (
                                <div>
                                    <Label htmlFor="item-location">Location</Label>
                                    <Input
                                        id="item-location"
                                        value={newItem.location}
                                        onChange={(e) =>
                                            setNewItem((prev) => ({
                                                ...prev,
                                                location: e.target.value
                                            }))
                                        }
                                        placeholder="Enter location"
                                    />
                                </div>
                            )}

                            {selectedItemType === "vacation" && currentUser?.type !== "studio" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Vacation requests require studio
                                        approval. You'll be notified once your request is reviewed.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateItem}
                                    disabled={!newItem.title || !newItem.date}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DefaultLayout>
    );
}

// Month View Component
function MonthView({
    currentDate,
    items,
    getTypeConfig,
    onDateClick
}: {
    currentDate: Date;
    items: CalendarItem[];
    getTypeConfig: (type: CalendarItemType) => any;
    onDateClick: (date: Date) => void;
}) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const getItemsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return items.filter((item) => {
            const itemStart = item.date;
            const itemEnd = item.endDate || item.date;
            return dateStr >= itemStart && dateStr <= itemEnd;
        });
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                            key={day}
                            className="text-center text-sm font-semibold p-2 text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Empty cells */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="min-h-32 p-1 border rounded-lg bg-muted/20"
                        />
                    ))}

                    {/* Calendar days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        const dayItems = getItemsForDate(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div
                                key={day}
                                className={`min-h-32 p-1 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                                    isToday ? "border-primary bg-primary/5" : ""
                                }`}
                                onClick={() => onDateClick(date)}
                            >
                                <div className="h-full flex flex-col">
                                    <span
                                        className={`text-sm p-1 ${
                                            isToday ? "font-bold text-primary" : ""
                                        }`}
                                    >
                                        {day}
                                    </span>
                                    <div className="flex-1 overflow-hidden space-y-1">
                                        {dayItems.slice(0, 3).map((item) => {
                                            const config = getTypeConfig(item.type);
                                            const Icon = config.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`text-xs px-1.5 py-1 rounded flex items-center gap-1 ${config.color} border`}
                                                >
                                                    <Icon className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                            );
                                        })}
                                        {dayItems.length > 3 && (
                                            <div className="text-xs text-muted-foreground px-1.5">
                                                +{dayItems.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Week View Component
function WeekView({
    currentDate,
    items,
    getTypeConfig
}: {
    currentDate: Date;
    items: CalendarItem[];
    getTypeConfig: (type: CalendarItemType) => any;
}) {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day;
    weekStart.setDate(diff);

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });

    const getItemsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return items.filter((item) => {
            const itemStart = item.date;
            const itemEnd = item.endDate || item.date;
            return dateStr >= itemStart && dateStr <= itemEnd;
        });
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((date, index) => {
                        const dayItems = getItemsForDate(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div
                                key={index}
                                className="min-h-96"
                            >
                                <div
                                    className={`text-center p-2 rounded-t-lg ${
                                        isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                >
                                    <div className="text-xs">
                                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                                    </div>
                                    <div className="text-lg font-semibold">{date.getDate()}</div>
                                </div>
                                <div className="border rounded-b-lg p-2 space-y-2 min-h-80">
                                    {dayItems.map((item) => {
                                        const config = getTypeConfig(item.type);
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`text-xs px-2 py-2 rounded ${config.color} border`}
                                            >
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Icon className="w-3 h-3" />
                                                    <span className="font-semibold">
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <div className="font-medium">{item.title}</div>
                                                {item.location && (
                                                    <div className="text-xs mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.location}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Day View Component
function DayView({
    currentDate,
    items,
    getTypeConfig
}: {
    currentDate: Date;
    items: CalendarItem[];
    getTypeConfig: (type: CalendarItemType) => any;
}) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayItems = items
        .filter((item) => {
            const itemStart = item.date;
            const itemEnd = item.endDate || item.date;
            return dateStr >= itemStart && dateStr <= itemEnd;
        })
        .sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });

    const hours = Array.from({ length: 24 }).map((_, i) => i);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-2">
                    {/* All-day items */}
                    {dayItems.filter((item) => !item.time).length > 0 && (
                        <div className="border rounded-lg p-4 bg-muted/50 mb-4">
                            <h4 className="text-sm font-semibold mb-3">All Day</h4>
                            <div className="space-y-2">
                                {dayItems
                                    .filter((item) => !item.time)
                                    .map((item) => {
                                        const config = getTypeConfig(item.type);
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`px-3 py-2 rounded ${config.color} border`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-xs mt-1">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Hourly schedule */}
                    <div className="space-y-1">
                        {hours.map((hour) => {
                            const hourStr = hour.toString().padStart(2, "0");
                            const hourItems = dayItems.filter(
                                (item) => item.time && item.time.startsWith(hourStr)
                            );

                            return (
                                <div
                                    key={hour}
                                    className="flex gap-4"
                                >
                                    <div className="w-20 text-sm text-muted-foreground pt-2">
                                        {hour === 0
                                            ? "12 AM"
                                            : hour < 12
                                              ? `${hour} AM`
                                              : hour === 12
                                                ? "12 PM"
                                                : `${hour - 12} PM`}
                                    </div>
                                    <div className="flex-1 border-t pt-2 min-h-16">
                                        {hourItems.map((item) => {
                                            const config = getTypeConfig(item.type);
                                            const Icon = config.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`px-3 py-2 rounded mb-2 ${config.color} border`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className="w-4 h-4" />
                                                        <span className="font-medium">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-xs">
                                                            {item.time}{" "}
                                                            {item.endTime && `- ${item.endTime}`}
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs mb-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    {item.location && (
                                                        <div className="text-xs flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {item.location}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
