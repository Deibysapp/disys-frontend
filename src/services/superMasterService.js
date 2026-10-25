const API_URL = 'https://disys-backend.onrender.com';

// Función para registrar al usuario Master
export const crearMaster = async (datosMaster, token) => {
    // La ruta debe coincidir con la que creaste en tu backend (ej. /api/super-master/crear)
    const response = await fetch(`${API_URL}/api/super-master/crear`, {
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