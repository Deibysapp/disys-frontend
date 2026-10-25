import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/authService';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        pin: '',
        rol: 'vendedor' // Por defecto
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const respuesta = await loginUsuario(formData);
            
            // Guardar token y datos básicos en el navegador
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

            // Redirección inteligente según el rol
            if (respuesta.usuario.rol === 'super_master') {
                navigate('/super-master');
            } else if (respuesta.usuario.rol === 'master') {
                navigate('/dashboard');
            } else {
                navigate('/terminal');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Ingreso al Sistema</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Rol de Usuario:</label>
                    <select name="rol" value={formData.rol} onChange={handleChange}>
                        <option value="super_master">Super Master</option>
                        <option value="master">Master</option>
                        <option value="vendedor">Vendedor</option>
                    </select>
                </div>

                <div>
                    <label>Nombre de Usuario:</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>{formData.rol === 'super_master' ? 'Contraseña:' : 'PIN (4 dígitos):'}</label>
                    <input 
                        type={formData.rol === 'super_master' ? 'password' : 'text'} 
                        name="pin" 
                        maxLength={formData.rol === 'super_master' ? undefined : 4}
                        value={formData.pin} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
};

export default Login;