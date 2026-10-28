// CSV with a BOM so Excel reads UTF-8, quoted cells, and free text that starts with a
// formula character prefixed with ' so spreadsheets don't run it. Phone numbers such as
// +260971234567 are left alone.
export function toCsv(header, rows) {
  const cell = (value) => {
    let v = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(v) && !/^\+\d+$/.test(v)) v = `'${v}`;
    return `"${v.replace(/"/g, '""')}"`;
  };
  return `﻿${[header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')}`;
}

export function downloadCsv(filename, header, rows) {
  const url = URL.createObjectURL(new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
