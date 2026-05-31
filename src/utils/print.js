function fmt(n, d = 2) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

function showToast(msg, color = 'var(--color-primary)') {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', top: '24px', right: '24px',
    background: color, color: '#0D0D0D',
    padding: '10px 20px', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em',
    zIndex: '9999', boxShadow: `0 4px 24px ${color}55`,
    animation: 'fhToastIn 0.2s ease', pointerEvents: 'none',
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2700);
  setTimeout(() => t.remove(), 3100);
}

function escPrint(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function printInvoice(saleId, settings) {
  const saleRes = await window.api.db.query(
    `SELECT * FROM sales WHERE id = ?`, [saleId]
  );
  if (!saleRes.ok || !saleRes.rows.length) {
    showToast('Could not fetch invoice for printing.', '#FF4444');
    return;
  }
  const sale = saleRes.rows[0];

  const itemsRes = await window.api.db.query(
    `SELECT * FROM sale_items WHERE sale_id = ?`, [saleId]
  );
  const lineItems = itemsRes.ok ? itemsRes.rows : [];

  // Format date
  const d = new Date(sale.sale_date);
  const pad2 = n => String(n).padStart(2, '0');
  const dateFormatted = isNaN(d)
    ? sale.sale_date
    : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const shopName    = settings?.shop_name    || 'FoneHisab Store';
  const shopAddress = settings?.shop_address || '';
  const shopGstin   = settings?.shop_gstin   || '';

  const lineRows = lineItems.map(li => {
    const amount     = round2(li.qty * li.price_per_unit);
    const gstCell    = li.is_margin_applied
      ? `<td style="padding:8px 10px;font-size:11px;font-style:italic;color:#555;">GST paid under<br/>Margin Scheme</td>`
      : `<td style="padding:8px 10px;font-size:12px;">CGST ₹${fmt(li.cgst_amount)}<br/>SGST ₹${fmt(li.sgst_amount)}</td>`;
    return `
      <tr style="border-bottom:1px solid #e0e0e0;">
        <td style="padding:8px 10px;font-size:13px;">${escPrint(li.item_name)}</td>
        <td style="padding:8px 10px;text-align:center;font-size:13px;">${li.qty}</td>
        <td style="padding:8px 10px;text-align:right;font-size:13px;">₹${fmt(li.price_per_unit)}</td>
        ${gstCell}
        <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:600;">₹${fmt(amount)}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${escPrint(sale.invoice_number)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 20mm 15mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    @page { size: A4 portrait; margin: 15mm; }
    @media print {
      body { padding: 0; }
    }
    table { width: 100%; border-collapse: collapse; }
    .divider { border: none; border-top: 1px solid #ccc; margin: 10px 0; }
    .divider-bold { border: none; border-top: 2px solid #222; margin: 10px 0; }
  </style>
</head>
<body>

  <!-- Shop Header -->
  <div style="text-align:center;margin-bottom:16px;">
    <div style="font-size:20px;font-weight:700;letter-spacing:0.04em;">${escPrint(shopName)}</div>
    ${shopAddress ? `<div style="font-size:12px;color:#444;margin-top:4px;white-space:pre-line;">${escPrint(shopAddress)}</div>` : ''}
    ${shopGstin   ? `<div style="font-size:12px;margin-top:4px;">GSTIN: <strong>${escPrint(shopGstin)}</strong></div>` : ''}
  </div>

  <hr class="divider-bold"/>

  <!-- Invoice Meta -->
  <div style="margin-bottom:14px;">
    <div style="text-align:center;font-size:15px;font-weight:700;letter-spacing:0.1em;
      text-transform:uppercase;margin-bottom:10px;">Tax Invoice</div>
    <table>
      <tr>
        <td style="font-size:12px;padding:2px 0;width:50%;">
          <strong>Invoice No:</strong> ${escPrint(sale.invoice_number)}
        </td>
        <td style="font-size:12px;padding:2px 0;text-align:right;">
          <strong>Date:</strong> ${dateFormatted}
        </td>
      </tr>
      <tr>
        <td style="font-size:12px;padding:2px 0;">
          <strong>Customer:</strong> ${escPrint(sale.customer_name || 'Walk-in Customer')}
        </td>
        <td style="font-size:12px;padding:2px 0;text-align:right;">
          <strong>Payment:</strong> ${escPrint(sale.payment_mode)}
        </td>
      </tr>
      ${sale.customer_gstin ? `
      <tr>
        <td colspan="2" style="font-size:12px;padding:2px 0;">
          <strong>Customer GSTIN:</strong> ${escPrint(sale.customer_gstin)}
        </td>
      </tr>` : ''}
    </table>
  </div>

  <hr class="divider-bold"/>

  <!-- Line Items -->
  <table style="margin-bottom:0;">
    <thead>
      <tr style="border-bottom:2px solid #222;background:#f5f5f5;">
        <th style="padding:8px 10px;text-align:left;font-size:12px;">Item</th>
        <th style="padding:8px 10px;text-align:center;font-size:12px;">Qty</th>
        <th style="padding:8px 10px;text-align:right;font-size:12px;">Rate</th>
        <th style="padding:8px 10px;text-align:left;font-size:12px;">GST</th>
        <th style="padding:8px 10px;text-align:right;font-size:12px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>

  <hr class="divider-bold" style="margin-top:0;"/>

  <!-- Totals -->
  <table style="margin-left:auto;width:260px;margin-bottom:16px;">
    <tr>
      <td style="padding:4px 10px;font-size:12px;color:#555;">Taxable Base</td>
      <td style="padding:4px 10px;text-align:right;font-size:12px;">₹${fmt(sale.total_taxable)}</td>
    </tr>
    <tr>
      <td style="padding:4px 10px;font-size:12px;color:#555;">CGST</td>
      <td style="padding:4px 10px;text-align:right;font-size:12px;">₹${fmt(sale.total_cgst)}</td>
    </tr>
    <tr>
      <td style="padding:4px 10px;font-size:12px;color:#555;">SGST</td>
      <td style="padding:4px 10px;text-align:right;font-size:12px;">₹${fmt(sale.total_sgst)}</td>
    </tr>
    <tr style="border-top:2px solid #222;">
      <td style="padding:8px 10px;font-size:15px;font-weight:700;">GRAND TOTAL</td>
      <td style="padding:8px 10px;text-align:right;font-size:15px;font-weight:700;">₹${fmt(sale.grand_total)}</td>
    </tr>
  </table>

  <hr class="divider"/>

  <div style="text-align:center;font-size:11px;color:#888;margin-top:10px;">
    Thank you for your purchase. This is a computer-generated invoice.
  </div>

</body>
</html>`;

  const pw = window.open('', '_blank', 'width=800,height=900');
  if (!pw) { showToast('Pop-up blocked. Allow pop-ups for printing.', '#FF8C00'); return; }
  pw.document.open();
  pw.document.write(html);
  pw.document.close();
  pw.focus();
  setTimeout(() => { pw.print(); pw.close(); }, 500);
}
