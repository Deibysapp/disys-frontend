const API_URL = 'http://localhost:3000/api/super-master'; // Asumiendo que esta es la ruta base para el Super Master

// Registrar un nuevo usuario Master
export const crearMaster = async (datosMaster, token) => {
    const response = await fetch(`${API_URL}/crear-master`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosMaster)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

// Cambiar el estado (Activo/Inactivo) de un Master
export const cambiarEstadoMaster = async (id, estado, token) => {
    const response = await fetch(`${API_URL}/estado-master/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};