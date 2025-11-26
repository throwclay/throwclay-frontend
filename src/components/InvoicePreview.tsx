import React from "react";

interface InvoicePreviewProps {
  layout: "modern" | "classic" | "minimal";
  settings: {
    fontFamily: string;
    textColor: string;
    primaryColor: string;
    accentColor: string;
    logo: string;
    showLogoOnInvoice: boolean;
    tagline: string;
    website: string;
    invoiceNumberPrefix: string;
    invoiceHeader: string;
    invoiceTerms: string;
    invoiceNotes: string;
    invoiceFooter: string;
  };
  userName: string;
}

export function InvoicePreview({
  layout,
  settings,
  userName,
}: InvoicePreviewProps) {
  if (layout === "modern") {
    return (
      <div
        className="border-2 rounded-lg p-6 bg-white"
        style={{
          fontFamily: settings.fontFamily,
          color: settings.textColor,
          borderColor: settings.primaryColor,
        }}
      >
        {/* Modern Layout */}
        {/* Header */}
        <div
          className="flex items-start justify-between mb-6 pb-4 border-b-2"
          style={{ borderColor: settings.primaryColor }}
        >
          <div className="space-y-2">
            {settings.showLogoOnInvoice && settings.logo && (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-12 object-contain mb-2"
              />
            )}
            <div>
              <h3 className="font-bold text-xl">{userName}</h3>
              {settings.tagline && (
                <p className="text-sm text-muted-foreground">
                  {settings.tagline}
                </p>
              )}
              {settings.website && (
                <p className="text-sm text-muted-foreground">
                  {settings.website}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2
              className="text-2xl font-bold"
              style={{ color: settings.primaryColor }}
            >
              INVOICE
            </h2>
            <p className="text-sm text-muted-foreground">
              {settings.invoiceNumberPrefix}-001
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Custom Header */}
        {settings.invoiceHeader && (
          <div
            className="mb-4 p-3 rounded"
            style={{ backgroundColor: `${settings.primaryColor}15` }}
          >
            <p className="text-sm">{settings.invoiceHeader}</p>
          </div>
        )}

        {/* Bill To */}
        <div className="mb-6">
          <h4
            className="font-semibold mb-2"
            style={{ color: settings.primaryColor }}
          >
            Bill To:
          </h4>
          <p className="text-sm">Customer Name</p>
          <p className="text-sm text-muted-foreground">customer@example.com</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr
              className="border-b-2"
              style={{ borderColor: settings.primaryColor }}
            >
              <th className="text-left py-2">Description</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Blue Vase</td>
              <td className="text-center py-2">1</td>
              <td className="text-right py-2">$85.00</td>
              <td className="text-right py-2">$85.00</td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>$85.00</span>
            </div>
            <div
              className="flex justify-between font-bold border-t-2 pt-2"
              style={{ borderColor: settings.primaryColor }}
            >
              <span>Total:</span>
              <span style={{ color: settings.primaryColor }}>$85.00</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {(settings.invoiceTerms || settings.invoiceNotes) && (
          <div className="space-y-3 mb-6 text-xs">
            {settings.invoiceTerms && (
              <div>
                <h5 className="font-semibold mb-1">Payment Terms:</h5>
                <p className="text-muted-foreground">{settings.invoiceTerms}</p>
              </div>
            )}
            {settings.invoiceNotes && (
              <div>
                <h5 className="font-semibold mb-1">Notes:</h5>
                <p className="text-muted-foreground">{settings.invoiceNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {settings.invoiceFooter && (
          <div
            className="text-center pt-4 border-t-2"
            style={{ borderColor: settings.accentColor }}
          >
            <p className="text-sm text-muted-foreground">
              {settings.invoiceFooter}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (layout === "classic") {
    return (
      <div
        className="border-4 border-gray-800 rounded-lg p-6 bg-gray-50"
        style={{
          fontFamily: settings.fontFamily,
          color: settings.textColor,
        }}
      >
        {/* Classic Layout */}
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-4 border-gray-900">
          <div className="space-y-1">
            {settings.showLogoOnInvoice && settings.logo && (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-10 object-contain mb-2"
              />
            )}
            <h3 className="font-bold text-lg">{userName}</h3>
            {settings.tagline && (
              <p className="text-xs text-gray-600">{settings.tagline}</p>
            )}
            {settings.website && (
              <p className="text-xs text-gray-600">{settings.website}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
            <div className="mt-2 text-sm">
              <p className="text-gray-600">
                Invoice #: {settings.invoiceNumberPrefix}-001
              </p>
              <p className="text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Custom Header */}
        {settings.invoiceHeader && (
          <div className="mb-4 p-3 border-l-4 border-gray-800 bg-gray-100">
            <p className="text-sm">{settings.invoiceHeader}</p>
          </div>
        )}

        {/* Bill To & From in columns */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wide">
              Bill To:
            </h4>
            <p className="text-sm">Customer Name</p>
            <p className="text-sm text-gray-600">customer@example.com</p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wide">
              From:
            </h4>
            <p className="text-sm">{userName}</p>
            {settings.website && (
              <p className="text-sm text-gray-600">{settings.website}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm border-2 border-gray-800">
          <thead className="bg-gray-200">
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 px-3 font-bold">Description</th>
              <th className="text-center py-2 px-3 font-bold">Qty</th>
              <th className="text-right py-2 px-3 font-bold">Price</th>
              <th className="text-right py-2 px-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-400">
              <td className="py-2 px-3">Blue Vase</td>
              <td className="text-center py-2 px-3">1</td>
              <td className="text-right py-2 px-3">$85.00</td>
              <td className="text-right py-2 px-3">$85.00</td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-64 border-2 border-gray-800 p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal:</span>
              <span>$85.00</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t-2 border-gray-800 pt-2">
              <span>Total Due:</span>
              <span>$85.00</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {(settings.invoiceTerms || settings.invoiceNotes) && (
          <div className="space-y-3 mb-6 text-xs border-t-2 border-gray-300 pt-4">
            {settings.invoiceTerms && (
              <div>
                <h5 className="font-bold mb-1 uppercase tracking-wide">
                  Payment Terms:
                </h5>
                <p className="text-gray-600">{settings.invoiceTerms}</p>
              </div>
            )}
            {settings.invoiceNotes && (
              <div>
                <h5 className="font-bold mb-1 uppercase tracking-wide">
                  Notes:
                </h5>
                <p className="text-gray-600">{settings.invoiceNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {settings.invoiceFooter && (
          <div className="text-center pt-4 border-t-4 border-gray-900">
            <p className="text-sm font-semibold">{settings.invoiceFooter}</p>
          </div>
        )}
      </div>
    );
  }

  // Minimal layout
  return (
    <div
      className="border border-gray-200 rounded-lg p-6 bg-white"
      style={{
        fontFamily: settings.fontFamily,
        color: settings.textColor,
      }}
    >
      {/* Minimal Layout */}
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div className="space-y-3">
          {settings.showLogoOnInvoice && settings.logo && (
            <img
              src={settings.logo}
              alt="Logo"
              className="h-8 object-contain"
            />
          )}
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-xl font-normal">Invoice</h2>
          <p className="text-sm text-gray-500">
            {settings.invoiceNumberPrefix}-001
          </p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Custom Header */}
      {settings.invoiceHeader && (
        <div className="mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">{settings.invoiceHeader}</p>
        </div>
      )}

      {/* Bill To */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Bill To
        </p>
        <p className="text-sm">Customer Name</p>
        <p className="text-sm text-gray-500">customer@example.com</p>
      </div>

      {/* Items */}
      <div className="mb-12 space-y-4">
        <div className="flex justify-between py-3 border-b border-gray-200">
          <div>
            <p className="text-sm">Blue Vase</p>
            <p className="text-xs text-gray-500">Quantity: 1</p>
          </div>
          <p className="text-sm">$85.00</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>$85.00</span>
          </div>
          <div className="flex justify-between font-medium border-t border-gray-300 pt-3">
            <span>Total</span>
            <span>$85.00</span>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      {(settings.invoiceTerms || settings.invoiceNotes) && (
        <div className="space-y-6 mb-12 text-xs">
          {settings.invoiceTerms && (
            <div>
              <h5 className="font-medium mb-2 text-gray-500 uppercase tracking-wider">
                Payment Terms
              </h5>
              <p className="text-gray-600 leading-relaxed">
                {settings.invoiceTerms}
              </p>
            </div>
          )}
          {settings.invoiceNotes && (
            <div>
              <h5 className="font-medium mb-2 text-gray-500 uppercase tracking-wider">
                Notes
              </h5>
              <p className="text-gray-600 leading-relaxed">
                {settings.invoiceNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {settings.invoiceFooter && (
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">{settings.invoiceFooter}</p>
        </div>
      )}
    </div>
  );
}
