export const normalizeId = (id: string | undefined): string => {
  if (!id) return '';
  // Converts to lower case, corrects common typo, and removes all non-alphanumeric chars (spaces, hyphens, etc.)
  // This makes matching very flexible. e.g., "QPMS-07-001" and "qmps07001" will both become "qmps07001".
  return id
    .toLowerCase()
    .replace('qpms', 'qmps') 
    .replace(/[^a-z0-9]/g, '');
}