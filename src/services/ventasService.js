const API_URL = 'https://disys-backend.onrender.com';

// Función para reservar un número en la bolsa general
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

// Función para registrar el pago (soporta envío de imágenes para Bancolombia)
export const pagarBoleto = async (boletoId, formData, token) => {
    const response = await fetch(`${API_URL}/pagar/${boletoId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
            // NOTA: Cuando se envía FormData (imágenes), no se pone 'Content-Type'. 
            // El navegador lo configura automáticamente con el boundary correcto.
        },
        body: formData 
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
    };

export const obtenerEstadoBoletos = async (sorteoId, token) => {
    const response = await fetch(`${API_URL}/sorteo/${sorteoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};
