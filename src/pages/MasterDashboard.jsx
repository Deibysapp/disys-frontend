import React, { useState, useEffect } from 'react';
import { obtenerDashboardData } from '../services/masterService';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [resumen, setResumen] = useState({
        total_vendidos: 0,
        total_pagados: 0,
        total_pendientes: 0
    });

    const [vendedores, setVendedores] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                const sorteoId = 1; // Asumimos el Sorteo 1 como activo
                
                const respuesta = await obtenerDashboardData(sorteoId, token);
                
                // Si la estructura del backend envía las métricas, las aplicamos
                if (respuesta.resumen) setResumen(respuesta.resumen);
                if (respuesta.vendedores) setVendedores(respuesta.vendedores);
            } catch (error) {
                console.error('Error al sincronizar el dashboard:', error);
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

            const response = await fetch(`http://localhost:3000/api/reportes/descargar-excel/${sorteoId}`, {
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
            alert('Hubo un problema al descargar el Excel. Verifica tu conexión.');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control Master - DiSys</h2>
                <button className="btn-excel" onClick={handleDescargarExcel}>
                    📊 Descargar Respaldo Excel
                </button>
            </div>

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