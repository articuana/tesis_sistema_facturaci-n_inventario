import EntityTable from '../components/common/EntityTable.jsx';
import PagePanel from '../components/common/PagePanel.jsx';
import PageToolbar from '../components/common/PageToolbar.jsx';
import UserModal from '../components/modals/UserModal.jsx';
import { useUsers } from '../hooks/useUsers.js';

export default function UsersPage() {
  const usersState = useUsers();
  const { users, message, openCreate, openEdit, remove } = usersState;

  return (
    <>
      <PagePanel title="Administración de usuarios" description="Crear, editar, eliminar usuarios y asignar roles de administrador o facturador." message={message}>
        <PageToolbar actions={<button type="button" className="primary-button" onClick={openCreate}>Nuevo usuario</button>} />

        <EntityTable
          headers={['Usuario', 'Nombre', 'Correo', 'Identificación', 'Rol', 'Estado', 'Teléfono', 'Acciones']}
          rows={users}
          emptyMessage="No hay usuarios registrados."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.username || '-'}</td>
              <td>{item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : item.name || '-'}</td>
              <td>{item.email}</td>
              <td>{item.identification || '-'}</td>
              <td>{item.role}</td>
              <td>{item.status || 'Activo'}</td>
              <td>{item.phone || '-'}</td>
              <td>
                <div className="actions-row">
                  <button type="button" className="mini-button" onClick={() => openEdit(item)}>Editar</button>
                  <button type="button" className="mini-button danger" onClick={() => remove(item.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          )}
        />
      </PagePanel>

      <UserModal users={usersState} />
    </>
  );
}
