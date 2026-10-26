import React, { useState, useEffect } from 'react';
import { obtenerDashboardData } from '../services/masterService';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [resumen, setResumen] = useState({ total_vendidos: 0, total_pagados: 0, total_pendientes: 0 });
    const [vendedores, setVendedores] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados para modales
    const [mostrarModalVendedor, setMostrarModalVendedor] = useState(false);
    const [mostrarModalSorteo, setMostrarModalSorteo] = useState(false);

    // Estados para formularios
    const [formVendedor, setFormVendedor] = useState({ nombre: '', apellido: '', username: '', pin: '' });
    const [formSorteo, setFormSorteo] = useState({ nombre_sorteo: '', cantidad_numeros: '', precio_boleto: '', fecha_sorteo: '' });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                const sorteoId = 1; 
                const respuesta = await obtenerDashboardData(sorteoId, token);
                if (respuesta.resumen) setResumen(respuesta.resumen);
                if (respuesta.vendedores) setVendedores(respuesta.vendedores);
            } catch (error) {
                console.error('Error al sincronizar:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const handleDescargarExcel = async () => {
        try {
            const sorteoId = 1;
            const token = localStorage.getItem('token');
            const response = await fetch(`https://disys-backend.onrender.com/api/reportes/descargar-excel/${sorteoId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al generar el respaldo');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Respaldo_Sorteo_${sorteoId}_DiSys.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            alert('Hubo un problema al descargar el Excel.');
        }
    };

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
                alert('Vendedor registrado exitosamente en DiSys');
                setMostrarModalVendedor(false);
                window.location.reload(); 
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
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
                alert('Rifa configurada exitosamente en DiSys');
                setMostrarModalSorteo(false);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión con el servidor al configurar la rifa.');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control Master - DiSys</h2>
                <div className="header-botones">
                    <button className="btn-accion azul" onClick={() => setMostrarModalVendedor(true)}>
                        + Crear Vendedor
                    </button>
                    <button className="btn-accion gris" onClick={() => setMostrarModalSorteo(true)}>
                        ⚙️ Configurar Rifa
                    </button>
                    <button className="btn-excel" onClick={handleDescargarExcel}>
                        📊 Descargar Respaldo
                    </button>
                </div>
            </div>

            {/* Modal Crear Vendedor */}
            {mostrarModalVendedor && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>Registrar Nuevo Vendedor</h3>
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
                    <div className="modal-contenido">
                        <h3>Configurar Nueva Rifa</h3>
                        <form onSubmit={handleCrearSorteo}>
                            <input type="text" placeholder="Nombre (Ej: Gran Rifa Navideña)" required onChange={e => setFormSorteo({...formSorteo, nombre_sorteo: e.target.value})} />
                            <input type="number" placeholder="Cantidad total de números" required onChange={e => setFormSorteo({...formSorteo, cantidad_numeros: e.target.value})} />
                            <input type="number" step="0.01" placeholder="Precio por boleto ($)" required onChange={e => setFormSorteo({...formSorteo, precio_boleto: e.target.value})} />
                            <input type="date" required onChange={e => setFormSorteo({...formSorteo, fecha_sorteo: e.target.value})} title="Fecha del sorteo" />
                            <div className="modal-botones">
                                <button type="button" onClick={() => setMostrarModalSorteo(false)}>Cancelar</button>
                                <button type="submit" className="btn-guardar">Guardar Rifa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {cargando ? (
                <p>Cargando métricas de ventas...</p>
            ) : (
                <>
                    <div className="tarjetas-metricas">
                        <div className="tarjeta azul">
                            <h3>Total Vendidos</h3>
                            <p>{resumen.total_vendidos}</p>
                        </div>
                        <div className="tarjeta verde">
                            <h3>Total Pagados</h3>
                            <p>{resumen.total_pagados}</p>
                        </div>
                        <div className="tarjeta amarilla">
                            <h3>Total Pendientes</h3>
                            <p>{resumen.total_pendientes}</p>
                        </div>
                    </div>

                    <div className="tabla-rendimiento-container">
                        <h3>Rendimiento por Vendedor</h3>
                        <table className="tabla-rendimiento">
                            <thead>
                                <tr>
                                    <th>Vendedor</th>
                                    <th>Vendidos</th>
                                    <th>Pagados (Confirmados)</th>
                                    <th>Pendientes (Por Cobrar)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendedores.length > 0 ? (
                                    vendedores.map((v, index) => (
                                        <tr key={v.id || index}>
                                            <td>{v.nombre}</td>
                                            <td>{v.vendidos}</td>
                                            <td className="texto-verde">{v.pagados}</td>
                                            <td className="texto-amarillo">{v.pendientes}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No hay datos de vendedores registrados aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default MasterDashboard;