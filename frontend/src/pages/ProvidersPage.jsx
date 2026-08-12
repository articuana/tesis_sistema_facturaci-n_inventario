import EntityTable from '../components/common/EntityTable.jsx';
import PagePanel from '../components/common/PagePanel.jsx';
import PageToolbar from '../components/common/PageToolbar.jsx';
import ProviderModal from '../components/modals/ProviderModal.jsx';
import { useProviders } from '../hooks/useProviders.js';

export default function ProvidersPage() {
  const providersState = useProviders();
  const { providers, message, openCreate, openEdit, remove } = providersState;

  return (
    <>
      <PagePanel title="Proveedores" description="Registrar, editar y eliminar proveedores programados." message={message}>
        <PageToolbar actions={<button type="button" className="primary-button" onClick={openCreate}>Nuevo proveedor</button>} />

        <EntityTable
          headers={['Empresa', 'Proveedor', 'Tipo', 'Día', 'Modo', 'Teléfono', 'Acciones']}
          rows={providers}
          emptyMessage="No hay proveedores programados."
          renderRow={(provider) => (
            <tr key={provider.id}>
              <td>{provider.company}</td>
              <td>{provider.supplier_name || '-'}</td>
              <td>{provider.product_type === 'Otro' ? provider.product_type_other || 'Otro' : provider.product_type}</td>
              <td>{provider.scheduled_day || '-'}</td>
              <td>{provider.contact_mode}</td>
              <td>{provider.contact_phone || '-'}</td>
              <td>
                <div className="actions-row">
                  <button type="button" className="mini-button" onClick={() => openEdit(provider)}>Editar</button>
                  <button type="button" className="mini-button danger" onClick={() => remove(provider.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          )}
        />
      </PagePanel>

      <ProviderModal providers={providersState} />
    </>
  );
}
