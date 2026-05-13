export const getAutoFitColumns = (json: any[]) => {
  if (!json || json.length === 0) return [];
  const keys = Object.keys(json[0]);
  return keys.map(key => {
    let maxLength = key.length;
    json.forEach(row => {
      const val = row[key];
      const length = val ? String(val).length : 0;
      if (length > maxLength) maxLength = length;
    });
    return { wch: maxLength + 2 }; // padding
  });
};

export const hasMeaningfulData = (arr: any[], key?: string) => {
  if (!arr || arr.length === 0) return false;
  return arr.some(item => {
    const val = key ? item[key] : Object.values(item).find(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(String(v)))));
    
    // For specific key checks or found values
    if (typeof val === 'number') return val > 0;
    if (typeof val === 'string') {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(num) && num > 0) return true;
    }
    
    // Fallback: Check all values if it wasn't caught above
    return Object.values(item).some(v => 
      (typeof v === 'number' && v > 0) || 
      (typeof v === 'string' && v.trim() !== '' && v !== '0' && v !== '0%')
    );
  });
};

export const NO_DATA_MSG = 'No data available for the selected period';
