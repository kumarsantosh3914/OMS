import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

function DataTable({ columns, rows, loading, emptyTitle = 'No records', emptyMessage = 'Nothing to show yet.' }) {
  if (loading) return <LoadingSpinner label="Loading records" />;

  if (!rows.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} data-label={column.header}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
