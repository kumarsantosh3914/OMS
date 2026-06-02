import { useMemo, useState } from 'react';

export function useEntityList(items, searchableFields, defaultSort = 'id', pageSize = 8) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      searchableFields.some((field) => String(item[field] || '').toLowerCase().includes(needle))
    );
  }, [items, query, searchableFields]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      if (typeof first === 'number' && typeof second === 'number') {
        return sortDirection === 'asc' ? first - second : second - first;
      }
      return sortDirection === 'asc'
        ? String(first || '').localeCompare(String(second || ''))
        : String(second || '').localeCompare(String(first || ''));
    });
  }, [filtered, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const changeSort = (nextKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextKey);
      setSortDirection('asc');
    }
  };

  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  return {
    query,
    setQuery: updateQuery,
    sortKey,
    sortDirection,
    changeSort,
    page: safePage,
    setPage,
    totalPages,
    rows: paged,
    filteredCount: filtered.length,
  };
}
