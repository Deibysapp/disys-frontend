const API_URL = 'https://disys-backend.onrender.com/api/ventas';

// 1. Obtener la configuración general de la rifa (Precio, Premios)
export const obtenerSorteoActivo = async (sorteoId, token) => {
    const response = await fetch(`${API_URL}/sorteo-activo/${sorteoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

// 2. Obtener los boletos ya ocupados
export const obtenerEstadoBoletos = async (sorteoId, token) => {
    const response = await fetch(`${API_URL}/boletos-estado/${sorteoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

// 3. Reservar un número
export const apartarNumero = async (datosReserva, token) => {
    const response = await fetch(`${API_URL}/apartar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosReserva)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

// 4. Registrar el pago (Preparado para Bancolombia)
export const pagarBoleto = async (boletoId, formData, token) => {
    const response = await fetch(`${API_URL}/pagar/${boletoId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData 
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};