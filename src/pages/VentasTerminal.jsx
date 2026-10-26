import React, { useState, useEffect } from 'react';
import { apartarNumero, obtenerEstadoBoletos, obtenerSorteoActivo } from '../services/ventasService';
import './VentasTerminal.css';

const VentasTerminal = () => {
    const [boletos, setBoletos] = useState([]);
    const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', cedula: '', telefono: '', direccion: '' });
    const [errorMensaje, setErrorMensaje] = useState('');
    const [cargando, setCargando] = useState(true);
    const [sorteo, setSorteo] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                const sorteoId = 1; // Asumimos el ID 1 temporalmente

                // 1. Cargar datos reales de la rifa
                const resSorteo = await obtenerSorteoActivo(sorteoId, token);
                if (resSorteo.success) setSorteo(resSorteo.data);

                // 2. Cargar estado de la cuadrícula
                const resBoletos = await obtenerEstadoBoletos(sorteoId, token);
                const boletosOcupados = resBoletos.data || [];

                const grillaReal = Array.from({ length: 100 }, (_, i) => {
                    const numeroString = i.toString().padStart(2, '0');
                    const boletoEnBD = boletosOcupados.find(b => b.numero === numeroString);
                    return { numero: numeroString, estado: boletoEnBD ? boletoEnBD.estado : 'Disponible' };
                });
                setBoletos(grillaReal);
            } catch (error) {
                console.error('Error al sincronizar:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const toggleNumero = (boleto) => {
        if (boleto.estado !== 'Disponible') return alert(`El número ${boleto.numero} ya está ${boleto.estado}.`);
        setNumeroSeleccionado(boleto.numero === numeroSeleccionado ? null : boleto.numero);
        setErrorMensaje('');
    };

    const handleReservar = async (e) => {
        e.preventDefault();
        if (!numeroSeleccionado) return alert('Selecciona un número primero.');
        setErrorMensaje('');

        try {
            const token = localStorage.getItem('token');
            const datosReserva = {
                sorteoId: 1,
                numero: numeroSeleccionado,
                clienteNombre: formData.nombre,
                clienteCedula: formData.cedula,
                clienteTelefono: formData.telefono,
                clienteDireccion: formData.direccion
            };

            const respuesta = await apartarNumero(datosReserva, token);

            if (respuesta.success) {
                setBoletos(boletos.map(b => b.numero === numeroSeleccionado ? { ...b, estado: 'Pendiente' } : b));
                setNumeroSeleccionado(null);
                setFormData({ nombre: '', cedula: '', telefono: '', direccion: '' });
                alert('Número apartado con éxito en la base de datos.');
            }
        } catch (error) {
            setErrorMensaje(error.message || 'Error de conexión al apartar el número.');
        }
    };

    if (cargando) return <p>Cargando terminal de ventas...</p>;
    if (!sorteo) return <p>No se encontró la configuración del sorteo.</p>;

    return (
        <div className="terminal-container">
            <div className="terminal-header">
                <h2>{sorteo.nombre_sorteo}</h2>
                <p>Valor por ticket: ${parseFloat(sorteo.precio_boleto).toFixed(2)} | Lotería: {sorteo.loteria}</p>
                <p className="premios-info">🎁 {sorteo.premios}</p>
            </div>

            <div className="terminal-cuerpo">
                <div className="panel-numeros">
                    <h3>Selecciona un número</h3>
                    <div className="grid-numeros">
                        {boletos.map((boleto) => {
                            let claseEstado = boleto.estado === 'Pendiente' ? 'seleccionado' : boleto.estado === 'Pagado' ? 'vendido' : 'disponible';
                            if (numeroSeleccionado === boleto.numero) claseEstado = 'seleccionado';

                            return (
                                <button 
                                    key={boleto.numero} 
                                    className={`num-btn ${claseEstado}`}
                                    onClick={() => toggleNumero(boleto)}
                                    disabled={boleto.estado === 'Pagado' || boleto.estado === 'Pendiente'}
                                >
                                    {boleto.numero}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="panel-pago">
                    <h3>Resumen de Venta</h3>
                    {errorMensaje && <p style={{color: 'red', fontWeight: 'bold'}}>{errorMensaje}</p>}
                    <p>Número seleccionado: <strong>{numeroSeleccionado || 'Ninguno'}</strong></p>
                    <p>Total a pagar: <strong className="total-pago">${numeroSeleccionado ? parseFloat(sorteo.precio_boleto).toFixed(2) : '0.00'}</strong></p>
                    
                    <form onSubmit={handleReservar} className="form-venta">
                        <input type="text" placeholder="Nombre completo" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <input type="text" placeholder="Cédula" required value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                        <input type="tel" placeholder="Teléfono" required value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                        <input type="text" placeholder="Dirección" required value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                        <button type="submit" className="btn-vender" disabled={!numeroSeleccionado}>
                            Registrar Venta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VentasTerminal;