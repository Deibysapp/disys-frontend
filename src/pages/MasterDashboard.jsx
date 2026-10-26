import React, { useState, useEffect } from 'react';
import { obtenerDashboardData } from '../services/masterService';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [resumen, setResumen] = useState({ total_vendidos: 0, total_pagados: 0, total_pendientes: 0 });
    const [vendedores, setVendedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sorteoActivo, setSorteoActivo] = useState(1); // Asumimos el ID 1 temporalmente

    // Estados para modales
    const [mostrarModalVendedor, setMostrarModalVendedor] = useState(false);
    const [mostrarModalSorteo, setMostrarModalSorteo] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

    // Estados para formularios
    const [formVendedor, setFormVendedor] = useState({ nombre: '', apellido: '', username: '', pin: '' });
    const [formSorteo, setFormSorteo] = useState({ 
        nombre_sorteo: '', cantidad_numeros: '', precio_boleto: '', 
        fecha_sorteo: '', hora_sorteo: '', loteria: '', premios: '', modalidad_ganadora: '' 
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                const respuesta = await obtenerDashboardData(sorteoActivo, token);
                if (respuesta.resumen) setResumen(respuesta.resumen);
                if (respuesta.vendedores) setVendedores(respuesta.vendedores);
            } catch (error) {
                console.error('Error al sincronizar:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [sorteoActivo]);

    const handleCrearVendedor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://disys-backend.onrender.com/api/master/crear-vendedor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formVendedor)
            });
            const data = await response.json();
            if (data.success) {
                alert('Vendedor registrado exitosamente');
                setMostrarModalVendedor(false);
                window.location.reload(); 
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión.');
        }
    };

    const handleCrearSorteo = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://disys-backend.onrender.com/api/master/crear-sorteo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formSorteo)
            });
            const data = await response.json();
            if (data.success) {
                alert('Rifa configurada exitosamente');
                setMostrarModalSorteo(false);
                setSorteoActivo(data.data.id);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error al configurar la rifa.');
        }
    };

    const handleEliminarSorteo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://disys-backend.onrender.com/api/master/eliminar-sorteo/${sorteoActivo}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Sorteo eliminado permanentemente');
                setMostrarModalEliminar(false);
                window.location.reload();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error al intentar eliminar.');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control Master - DiSys</h2>
                <div className="header-botones">
                    <button className="btn-accion azul" onClick={() => setMostrarModalVendedor(true)}>+ Crear Vendedor</button>
                    <button className="btn-accion gris" onClick={() => setMostrarModalSorteo(true)}>⚙️ Configurar Rifa</button>
                    <button className="btn-accion rojo" style={{backgroundColor: '#dc3545'}} onClick={() => setMostrarModalEliminar(true)}>🗑️ Eliminar Rifa</button>
                </div>
            </div>

            {/* Modal Crear Vendedor */}
            {mostrarModalVendedor && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>Registrar Vendedor</h3>
                        <form onSubmit={handleCrearVendedor}>
                            <input type="text" placeholder="Nombre" required onChange={e => setFormVendedor({...formVendedor, nombre: e.target.value})} />
                            <input type="text" placeholder="Apellido" required onChange={e => setFormVendedor({...formVendedor, apellido: e.target.value})} />
                            <input type="text" placeholder="Usuario (Ej: juan.ventas)" required onChange={e => setFormVendedor({...formVendedor, username: e.target.value})} />
                            <input type="password" placeholder="PIN (4 dígitos)" required onChange={e => setFormVendedor({...formVendedor, pin: e.target.value})} />
                            <div className="modal-botones">
                                <button type="button" onClick={() => setMostrarModalVendedor(false)}>Cancelar</button>
                                <button type="submit" className="btn-guardar">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Configurar Sorteo */}
            {mostrarModalSorteo && (
                <div className="modal-overlay">
                    <div className="modal-contenido" style={{width: '400px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3>Configurar Nueva Rifa</h3>
                        <form onSubmit={handleCrearSorteo}>
                            <input type="text" placeholder="Nombre (Ej: Gran Rifa)" required onChange={e => setFormSorteo({...formSorteo, nombre_sorteo: e.target.value})} />
                            <input type="number" placeholder="Cantidad total de números" required onChange={e => setFormSorteo({...formSorteo, cantidad_numeros: e.target.value})} />
                            <input type="number" step="0.01" placeholder="Precio por boleto ($)" required onChange={e => setFormSorteo({...formSorteo, precio_boleto: e.target.value})} />
                            
                            <label style={{fontSize: '12px', marginTop: '10px'}}>Fecha y Hora:</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input type="date" required onChange={e => setFormSorteo({...formSorteo, fecha_sorteo: e.target.value})} style={{flex: 1}}/>
                                <input type="time" required onChange={e => setFormSorteo({...formSorteo, hora_sorteo: e.target.value})} style={{flex: 1}}/>
                            </div>

                            <input type="text" placeholder="Lotería (Ej: Zulia, Chance)" required onChange={e => setFormSorteo({...formSorteo, loteria: e.target.value})} />
                            <textarea placeholder="Premios (Ej: 1er Premio: Moto, 2do: TV)" required onChange={e => setFormSorteo({...formSorteo, premios: e.target.value})} style={{padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px'}}></textarea>
                            
                            <select required onChange={e => setFormSorteo({...formSorteo, modalidad_ganadora: e.target.value})} style={{padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%'}}>
                                <option value="">Selecciona cómo ganan...</option>
                                <option value="Primeros 3 numeros">Primeros 3 números</option>
                                <option value="Ultimos 3 numeros">Últimos 3 números</option>
                                <option value="Triple A">Triple A</option>
                                <option value="Triple B">Triple B</option>
                            </select>

                            <div className="modal-botones">
                                <button type="button" onClick={() => setMostrarModalSorteo(false)}>Cancelar</button>
                                <button type="submit" className="btn-guardar">Guardar Rifa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminación */}
            {mostrarModalEliminar && (
                <div className="modal-overlay">
                    <div className="modal-contenido" style={{textAlign: 'center'}}>
                        <h3 style={{color: 'red'}}>¡Advertencia!</h3>
                        <p style={{color: 'black'}}>¿Estás seguro de que deseas eliminar esta rifa? Esta acción no se puede deshacer y borrará las métricas.</p>
                        <div className="modal-botones" style={{justifyContent: 'center', gap: '20px', marginTop: '20px'}}>
                            <button type="button" onClick={() => setMostrarModalEliminar(false)}>Cancelar</button>
                            <button type="button" onClick={handleEliminarSorteo} className="btn-guardar" style={{backgroundColor: 'red'}}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Métricas y Tabla (Oculto en este snippet por brevedad, mantén la misma estructura de tus tarjetas y tabla aquí) */}
            {cargando ? <p>Cargando métricas de ventas...</p> : (
                <>
                    <div className="tarjetas-metricas">
                        <div className="tarjeta azul"><h3>Total Vendidos</h3><p>{resumen.total_vendidos}</p></div>
                        <div className="tarjeta verde"><h3>Total Pagados</h3><p>{resumen.total_pagados}</p></div>
                        <div className="tarjeta amarilla"><h3>Total Pendientes</h3><p>{resumen.total_pendientes}</p></div>
                    </div>
                    <div className="tabla-rendimiento-container">
                        <h3>Rendimiento por Vendedor</h3>
                        <table className="tabla-rendimiento">
                            <thead><tr><th>Vendedor</th><th>Vendidos</th><th>Pagados</th><th>Pendientes</th></tr></thead>
                            <tbody>
                                {vendedores.length > 0 ? vendedores.map((v, i) => (
                                    <tr key={v.id || i}><td>{v.nombre}</td><td>{v.vendidos}</td><td className="texto-verde">{v.pagados}</td><td className="texto-amarillo">{v.pendientes}</td></tr>
                                )) : <tr><td colSpan="4">No hay datos de vendedores.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default MasterDashboard;