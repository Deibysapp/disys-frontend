const API_URL = 'https://disys-backend.onrender.com';

export const loginUsuario = async (credenciales) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credenciales)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
};