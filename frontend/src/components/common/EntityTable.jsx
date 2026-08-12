export default function EntityTable({ headers, rows, emptyMessage, renderRow }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length}>{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((row, index) => renderRow(row, index))
          )}
        </tbody>
      </table>
    </div>
  );
}
