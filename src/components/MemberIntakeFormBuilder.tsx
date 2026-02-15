"use client";
import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Eye,
    Save,
    Settings,
    GripVertical,
    Type,
    Mail,
    Phone,
    AlignLeft,
    List,
    CheckSquare,
    Radio,
    ArrowUp,
    ArrowDown,
    Copy,
    RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAppContext } from "@/app/context/AppContext";
import type { EnrollmentFormField, StudioEnrollmentForm } from "@/types";

export function MemberIntakeFormBuilder() {
    const { currentStudio } = useAppContext();
    const [selectedTab, setSelectedTab] = useState("builder");
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [editingField, setEditingField] = useState<EnrollmentFormField | null>(null);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number>(-1);

    // Form state
    const [formTitle, setFormTitle] = useState(
        currentStudio?.enrollmentForm?.title || "Membership Application"
    );
    const [formDescription, setFormDescription] = useState(
        currentStudio?.enrollmentForm?.description ||
            "Please fill out this form to apply for studio membership."
    );
    const [formFields, setFormFields] = useState<EnrollmentFormField[]>(
        currentStudio?.enrollmentForm?.fields || [
            {
                id: "name",
                type: "text",
                label: "Full Name",
                placeholder: "Enter your full name",
                required: true,
                order: 0
            },
            {
                id: "email",
                type: "email",
                label: "Email Address",
                placeholder: "your@email.com",
                required: true,
                order: 1
            },
            {
                id: "phone",
                type: "phone",
                label: "Phone Number",
                placeholder: "(555) 123-4567",
                required: false,
                order: 2
            }
        ]
    );

    // Field type options
    const fieldTypes = [
        { type: "text", label: "Text Input", icon: Type, description: "Single line text field" },
        { type: "email", label: "Email", icon: Mail, description: "Email address with validation" },
        { type: "phone", label: "Phone", icon: Phone, description: "Phone number field" },
        {
            type: "textarea",
            label: "Long Text",
            icon: AlignLeft,
            description: "Multi-line text area"
        },
        { type: "select", label: "Dropdown", icon: List, description: "Single selection dropdown" },
        {
            type: "checkbox",
            label: "Checkboxes",
            icon: CheckSquare,
            description: "Multiple selections"
        },
        {
            type: "radio",
            label: "Radio Buttons",
            icon: Radio,
            description: "Single selection from options"
        }
    ];

    const handleAddField = (fieldType: string) => {
        const newFieldData: EnrollmentFormField = {
            id: `field_${Date.now()}`,
            type: fieldType as any,
            label: `New ${fieldTypes.find((ft) => ft.type === fieldType)?.label || "Field"}`,
            placeholder: "",
            required: false,
            order: formFields.length,
            options: ["select", "checkbox", "radio"].includes(fieldType)
                ? ["Option 1", "Option 2"]
                : undefined
        };

        setFormFields([...formFields, newFieldData]);
    };

    const handleEditField = (field: EnrollmentFormField, index: number) => {
        setEditingField({ ...field });
        setEditingFieldIndex(index);
        setShowFieldEditor(true);
    };

    const handleSaveField = () => {
        if (editingField && editingFieldIndex >= 0) {
            const updatedFields = [...formFields];
            updatedFields[editingFieldIndex] = editingField;
            setFormFields(updatedFields);
            setShowFieldEditor(false);
            setEditingField(null);
            setEditingFieldIndex(-1);
        }
    };

    const handleDeleteField = (index: number) => {
        const updatedFields = formFields.filter((_, i) => i !== index);
        const reorderedFields = updatedFields.map((field, i) => ({ ...field, order: i }));
        setFormFields(reorderedFields);
    };

    const handleMoveField = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index > 0) {
            const newFields = [...formFields];
            [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
            newFields.forEach((field, i) => (field.order = i));
            setFormFields(newFields);
        } else if (direction === "down" && index < formFields.length - 1) {
            const newFields = [...formFields];
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
            newFields.forEach((field, i) => (field.order = i));
            setFormFields(newFields);
        }
    };

    const handleDuplicateField = (field: EnrollmentFormField, index: number) => {
        const duplicatedField: EnrollmentFormField = {
            ...field,
            id: `field_${Date.now()}`,
            label: `${field.label} (Copy)`,
            order: formFields.length
        };
        setFormFields([...formFields, duplicatedField]);
    };

    const handleSaveForm = () => {
        const formData: Partial<StudioEnrollmentForm> = {
            title: formTitle,
            description: formDescription,
            fields: formFields,
            isActive: true,
            updatedAt: new Date().toISOString()
        };

        console.log("Saving form:", formData);
    };

    const renderFieldPreview = (field: EnrollmentFormField) => {
        const baseProps = {
            id: field.id,
            placeholder: field.placeholder || "",
            required: field.required
        };

        switch (field.type) {
            case "text":
                return <Input {...baseProps} />;
            case "email":
                return (
                    <Input
                        {...baseProps}
                        type="email"
                    />
                );
            case "phone":
                return (
                    <Input
                        {...baseProps}
                        type="tel"
                    />
                );
            case "textarea":
                return (
                    <Textarea
                        {...baseProps}
                        rows={3}
                    />
                );
            case "select":
                return (
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option, i) => (
                                <SelectItem
                                    key={i}
                                    value={option.toLowerCase().replace(/\s+/g, "-")}
                                >
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case "checkbox":
                return (
                    <div className="space-y-3">
                        {field.options?.map((option, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox id={`${field.id}-${i}`} />
                                <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                );
            case "radio":
                return (
                    <RadioGroup>
                        {field.options?.map((option, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-2"
                            >
                                <RadioGroupItem
                                    value={option.toLowerCase().replace(/\s+/g, "-")}
                                    id={`${field.id}-${i}`}
                                />
                                <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            default:
                return <Input {...baseProps} />;
        }
    };

    const renderFieldIcon = (type: string) => {
        const fieldType = fieldTypes.find((ft) => ft.type === type);
        const IconComponent = fieldType?.icon || Type;
        return <IconComponent className="w-4 h-4" />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Member Intake Form Builder</h2>
                    <p className="text-muted-foreground">
                        Customize your membership application form
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedTab("preview")}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Form
                    </Button>
                    <Button onClick={handleSaveForm}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Form
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="space-y-8"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="builder">Form Builder</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Form Builder Tab */}
                <TabsContent
                    value="builder"
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Field Types Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold">Add Fields</h2>
                                <Separator />
                            </div>

                            <div className="space-y-3">
                                {fieldTypes.map((fieldType) => {
                                    const Icon = fieldType.icon;
                                    return (
                                        <Button
                                            key={fieldType.type}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddField(fieldType.type)}
                                            className="w-full justify-start h-auto p-4"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className="w-5 h-5" />
                                                <div className="text-left space-y-1">
                                                    <p className="font-medium">{fieldType.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {fieldType.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form Builder */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Form Title</Label>
                                        <Input
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            placeholder="Enter form title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Form Description</Label>
                                        <Textarea
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            placeholder="Enter form description"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-6">
                                    {formFields.length === 0 ? (
                                        <div className="text-center py-16 space-y-4">
                                            <Settings className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold">
                                                    No fields added yet
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    Click on a field type to add it to your form
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        formFields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="border rounded-lg p-6 space-y-4 hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                        {renderFieldIcon(field.type)}
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {field.label}
                                                            </p>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        fieldTypes.find(
                                                                            (ft) =>
                                                                                ft.type ===
                                                                                field.type
                                                                        )?.label
                                                                    }
                                                                </Badge>
                                                                {field.required && (
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="text-xs"
                                                                    >
                                                                        Required
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleMoveField(index, "up")
                                                            }
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleMoveField(index, "down")
                                                            }
                                                            disabled={
                                                                index === formFields.length - 1
                                                            }
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleDuplicateField(field, index)
                                                            }
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleEditField(field, index)
                                                            }
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteField(index)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        {field.label}
                                                        {field.required && (
                                                            <span className="text-destructive ml-1">
                                                                *
                                                            </span>
                                                        )}
                                                    </Label>
                                                    {renderFieldPreview(field)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent
                    value="preview"
                    className="space-y-8"
                >
                    <div className="max-w-2xl mx-auto border rounded-lg p-8 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">{formTitle}</h2>
                            <p className="text-muted-foreground">{formDescription}</p>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            {formFields.map((field) => (
                                <div
                                    key={field.id}
                                    className="space-y-2"
                                >
                                    <Label>
                                        {field.label}
                                        {field.required && (
                                            <span className="text-destructive ml-1">*</span>
                                        )}
                                    </Label>
                                    {renderFieldPreview(field)}
                                </div>
                            ))}
                        </div>

                        <Separator />

                        <div className="flex justify-end">
                            <Button>Submit Application</Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent
                    value="settings"
                    className="space-y-8"
                >
                    <div className="max-w-2xl space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold">Form Settings</h2>
                                <p className="text-muted-foreground">
                                    Configure form behavior and notifications
                                </p>
                                <Separator />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-3">
                                    <div className="space-y-1">
                                        <Label>Form Active</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow new membership applications using this form
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="space-y-1">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Send email notifications for new applications
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="space-y-1">
                                        <Label>Auto-Approval</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically approve applications that meet criteria
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notification Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="admin@yourstudio.com"
                                        defaultValue={currentStudio?.locations?.[0]?.email}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Confirmation Message</Label>
                                    <Textarea
                                        placeholder="Thank you for your membership application..."
                                        rows={4}
                                        defaultValue="Thank you for your membership application! We'll review your submission and get back to you within 2-3 business days."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold">Form Versions</h2>
                                <p className="text-muted-foreground">
                                    Manage different versions of your intake form
                                </p>
                                <Separator />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <p className="font-medium">Current Version</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last updated 2 days ago
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="default">Active</Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                                    <div className="space-y-1">
                                        <p className="font-medium">Previous Version</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last updated 1 week ago
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="secondary">Archived</Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Restore
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Field Editor Dialog */}
            <Dialog
                open={showFieldEditor}
                onOpenChange={setShowFieldEditor}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Field</DialogTitle>
                        <DialogDescription>
                            Configure the field properties and validation rules
                        </DialogDescription>
                    </DialogHeader>
                    {editingField && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Field Label</Label>
                                    <Input
                                        value={editingField.label}
                                        onChange={(e) =>
                                            setEditingField({
                                                ...editingField,
                                                label: e.target.value
                                            })
                                        }
                                        placeholder="Enter field label"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Field Type</Label>
                                    <Select
                                        value={editingField.type}
                                        onValueChange={(value) =>
                                            setEditingField({ ...editingField, type: value as any })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fieldTypes.map((type) => (
                                                <SelectItem
                                                    key={type.type}
                                                    value={type.type}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Placeholder Text</Label>
                                <Input
                                    value={editingField.placeholder || ""}
                                    onChange={(e) =>
                                        setEditingField({
                                            ...editingField,
                                            placeholder: e.target.value
                                        })
                                    }
                                    placeholder="Enter placeholder text"
                                />
                            </div>

                            {["select", "checkbox", "radio"].includes(editingField.type) && (
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-3">
                                        {editingField.options?.map((option, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2"
                                            >
                                                <Input
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [
                                                            ...(editingField.options || [])
                                                        ];
                                                        newOptions[index] = e.target.value;
                                                        setEditingField({
                                                            ...editingField,
                                                            options: newOptions
                                                        });
                                                    }}
                                                    placeholder={`Option ${index + 1}`}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const newOptions =
                                                            editingField.options?.filter(
                                                                (_, i) => i !== index
                                                            );
                                                        setEditingField({
                                                            ...editingField,
                                                            options: newOptions
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const newOptions = [
                                                    ...(editingField.options || []),
                                                    `Option ${(editingField.options?.length || 0) + 1}`
                                                ];
                                                setEditingField({
                                                    ...editingField,
                                                    options: newOptions
                                                });
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Option
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-3 border-t">
                                <div className="space-y-1">
                                    <Label>Required Field</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Users must fill out this field to submit the form
                                    </p>
                                </div>
                                <Switch
                                    checked={editingField.required}
                                    onCheckedChange={(checked) =>
                                        setEditingField({ ...editingField, required: checked })
                                    }
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFieldEditor(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveField}>Save Field</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
