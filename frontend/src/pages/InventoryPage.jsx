import EntityTable from '../components/common/EntityTable.jsx';
import PagePanel from '../components/common/PagePanel.jsx';
import PageToolbar from '../components/common/PageToolbar.jsx';
import ProductModal from '../components/modals/ProductModal.jsx';
import { useInventory } from '../hooks/useInventory.js';
import { formatDate } from '../utils/formatters.js';

export default function InventoryPage() {
  const inventory = useInventory();
  const { filters, setFilters, products, openCreate, openEdit, remove } = inventory;
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  return (
    <>
      <PagePanel title="Inventario" description="Agrega, edita, elimina y filtra tus productos.">
        <PageToolbar actions={<button type="button" className="primary-button" onClick={openCreate}>Nuevo producto</button>}>
          <div className="filters-grid">
            <label>Nombre<input value={filters.name} onChange={(event) => updateFilter('name', event.target.value)} placeholder="Buscar por nombre" /></label>
            <label>Fecha desde<input type="date" value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} /></label>
            <label>Fecha hasta<input type="date" value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} /></label>
            <label>Cantidad mínima<input type="number" value={filters.quantity} onChange={(event) => updateFilter('quantity', event.target.value)} /></label>
          </div>
        </PageToolbar>

        <EntityTable
          headers={['Nombre', 'Cantidad', 'Tipo', 'Marca', 'Fecha', 'Acciones']}
          rows={products}
          emptyMessage="No hay productos registrados."
          renderRow={(product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>{product.productType || '-'}</td>
              <td>{product.brand || '-'}</td>
              <td>{formatDate(product.created_at)}</td>
              <td>
                <div className="actions-row">
                  <button type="button" className="mini-button" onClick={() => openEdit(product)}>Editar</button>
                  <button type="button" className="mini-button danger" onClick={() => remove(product.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          )}
        />
      </PagePanel>

      <ProductModal inventory={inventory} />
    </>
  );
}
