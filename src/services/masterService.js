const API_URL = 'https://disys-backend.onrender.com';

// Extraer los datos reales para el Dashboard
export const obtenerDashboardData = async (sorteoId, token) => {
    const response = await fetch(`${API_URL}/dashboard/${sorteoId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

// Registrar a un nuevo vendedor en el equipo
export const crearVendedor = async (datosVendedor, token) => {
    const response = await fetch(`${API_URL}/crear-vendedor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosVendedor)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};