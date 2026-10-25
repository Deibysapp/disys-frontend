import React, { useState } from 'react';
import { crearMaster, cambiarEstadoMaster } from '../services/superMasterService';
import './SuperMasterPanel.css';

const SuperMasterPanel = () => {
    // Lista inicial (debería venir de un GET al backend en un useEffect, similar al dashboard)
    const [masters, setMasters] = useState([
        { id: 1, username: 'master_principal', estado: true }
    ]);
    const [nuevoMaster, setNuevoMaster] = useState({ username: '', pin: '' });
    const [cargando, setCargando] = useState(false);

    const handleCrearMaster = async (e) => {
        e.preventDefault();
        setCargando(true);
        
        try {
            const token = localStorage.getItem('token');
            const respuesta = await crearMaster(nuevoMaster, token);
            
            if (respuesta.success) {
                // Agregamos el nuevo master a la tabla visualmente con el ID que asigne PostgreSQL
                setMasters([...masters, { id: respuesta.masterId || Date.now(), username: nuevoMaster.username, estado: true }]);
                setNuevoMaster({ username: '', pin: '' });
                alert(`Master ${nuevoMaster.username} registrado exitosamente en la plataforma DiSys.`);
            }
        } catch (error) {
            alert(error.message || 'Error al crear el Master en la base de datos.');
        } finally {
            setCargando(false);
        }
    };

    const toggleEstado = async (id, estadoActual) => {
        try {
            const token = localStorage.getItem('token');
            const nuevoEstado = !estadoActual;
            
            // Petición real para bloquear/desbloquear en PostgreSQL
            await cambiarEstadoMaster(id, nuevoEstado, token);
            
            setMasters(masters.map(m => 
                m.id === id ? { ...m, estado: nuevoEstado } : m
            ));
        } catch (error) {
            alert('Error al cambiar el estado del Master.');
        }
    };

    return (
        <div className="super-master-container">
            <h2>Panel Super Master - DiSys Rifas</h2>
            
            <div className="crear-master-box">
                <h3>Registrar Nuevo Usuario Master</h3>
                <form onSubmit={handleCrearMaster}>
                    <input 
                        type="text" 
                        placeholder="Nombre de usuario" 
                        value={nuevoMaster.username}
                        onChange={(e) => setNuevoMaster({...nuevoMaster, username: e.target.value})}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="PIN de acceso (4 dígitos)" 
                        maxLength="4"
                        value={nuevoMaster.pin}
                        onChange={(e) => setNuevoMaster({...nuevoMaster, pin: e.target.value})}
                        required
                    />
                    <button type="submit" className="btn-crear" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Crear Master'}
                    </button>
                </form>
            </div>

            <div className="lista-masters">
                <h3>Masters Registrados</h3>
                <table className="tabla-masters">
                    <thead>
                        <tr>
                            <th>Usuario Master</th>
                            <th>Estado de Cuenta</th>
                            <th>Acción Administrativa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {masters.map(master => (
                            <tr key={master.id}>
                                <td>{master.username}</td>
                                <td>
                                    <span className={`badge ${master.estado ? 'activo' : 'inactivo'}`}>
                                        {master.estado ? 'Operativo' : 'Suspendido'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className={`btn-toggle ${master.estado ? 'btn-desactivar' : 'btn-activar'}`}
                                        onClick={() => toggleEstado(master.id, master.estado)}
                                    >
                                        {master.estado ? 'Inactivar Master' : 'Activar Master'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperMasterPanel;