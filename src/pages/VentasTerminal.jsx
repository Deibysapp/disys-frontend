import React, { useState, useEffect } from 'react';
import { apartarNumero, obtenerEstadoBoletos, obtenerSorteoActivo, pagarBoleto, liberarNumero } from '../services/ventasService';
import './VentasTerminal.css';

const VentasTerminal = () => {
    const [boletos, setBoletos] = useState([]);
    const [boletoSeleccionado, setBoletoSeleccionado] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', cedula: '', telefono: '', direccion: '' });
    const [errorMensaje, setErrorMensaje] = useState('');
    const [cargando, setCargando] = useState(true);
    const [sorteo, setSorteo] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            const resSorteo = await obtenerSorteoActivo(1, token);
            if (resSorteo.success) setSorteo(resSorteo.data);

            const resBoletos = await obtenerEstadoBoletos(1, token);
            const boletosOcupados = resBoletos.data || [];

            const grillaReal = Array.from({ length: 100 }, (_, i) => {
                const numeroString = i.toString().padStart(2, '0');
                const boletoEnBD = boletosOcupados.find(b => b.numero === numeroString);
                return boletoEnBD ? { ...boletoEnBD } : { numero: numeroString, estado: 'Disponible' };
            });
            setBoletos(grillaReal);
        } catch (error) {
            console.error('Error al sincronizar:', error);
        } finally {
            setCargando(false);
        }
    };

    const toggleNumero = (boleto) => {
        if (boleto.estado === 'Pagado') return alert(`El número ${boleto.numero} ya está pagado.`);
        setBoletoSeleccionado(boleto.numero === boletoSeleccionado?.numero ? null : boleto);
        setErrorMensaje('');
    };

    const handleReservar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const respuesta = await apartarNumero({ sorteoId: 1, numero: boletoSeleccionado.numero, clienteNombre: formData.nombre, clienteCedula: formData.cedula, clienteTelefono: formData.telefono, clienteDireccion: formData.direccion }, token);
            if (respuesta.success) {
                alert('Número apartado con éxito.');
                setBoletoSeleccionado(null);
                setFormData({ nombre: '', cedula: '', telefono: '', direccion: '' });
                cargarDatos();
            }
        } catch (error) {
            setErrorMensaje(error.message);
        }
    };

    const handlePagar = async () => {
        try {
            const token = localStorage.getItem('token');
            await pagarBoleto(boletoSeleccionado.id, new FormData(), token);
            alert('Pago registrado. El boleto ahora es verde.');
            setBoletoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            alert('Error al registrar el pago');
        }
    };

    const handleLiberar = async () => {
        if (!window.confirm('¿Seguro que deseas liberar este número?')) return;
        try {
            const token = localStorage.getItem('token');
            await liberarNumero(boletoSeleccionado.id, token); // Requiere exportar esta función en ventasService.js
            alert('Número devuelto a la bolsa.');
            setBoletoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            alert('Error al liberar');
        }
    };

    const enviarWhatsApp = () => {
        const msj = `¡Hola ${boletoSeleccionado.cliente_nombre}! Tu número ${boletoSeleccionado.numero} para la ${sorteo.nombre_sorteo} ha sido apartado con éxito. Total a pagar: $${parseFloat(sorteo.precio_boleto).toFixed(2)}.`;
        window.open(`https://wa.me/${boletoSeleccionado.cliente_telefono}?text=${encodeURIComponent(msj)}`, '_blank');
    };

    if (cargando) return <p>Cargando terminal...</p>;

    return (
        <div className="terminal-container">
            <div className="terminal-header">
                <h2>{sorteo.nombre_sorteo}</h2>
                <p>Valor por ticket: ${parseFloat(sorteo.precio_boleto).toFixed(2)} | Lotería: {sorteo.loteria}</p>
            </div>
            <div className="terminal-cuerpo">
                <div className="panel-numeros">
                    <div className="grid-numeros">
                        {boletos.map((b) => (
                            <button 
                                key={b.numero} 
                                className={`num-btn ${b.estado === 'Pendiente' ? 'seleccionado' : b.estado === 'Pagado' ? 'vendido' : 'disponible'} ${boletoSeleccionado?.numero === b.numero ? 'resaltado' : ''}`}
                                onClick={() => toggleNumero(b)}
                            >
                                {b.numero}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="panel-pago">
                    <h3>{boletoSeleccionado?.estado === 'Pendiente' ? 'Gestión de Cobranza' : 'Resumen de Venta'}</h3>
                    {errorMensaje && <p style={{color: 'red'}}>{errorMensaje}</p>}
                    
                    {!boletoSeleccionado ? (
                        <p>Selecciona un número de la grilla.</p>
                    ) : boletoSeleccionado.estado === 'Disponible' ? (
                        <form onSubmit={handleReservar} className="form-venta">
                            <p>Número seleccionado: <strong>{boletoSeleccionado.numero}</strong></p>
                            <input type="text" placeholder="Nombre completo" required onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <input type="text" placeholder="Cédula" required onChange={e => setFormData({...formData, cedula: e.target.value})} />
                            <input type="tel" placeholder="Teléfono" required onChange={e => setFormData({...formData, telefono: e.target.value})} />
                            <button type="submit" className="btn-vender">Registrar Venta</button>
                        </form>
                    ) : (
                        <div className="acciones-cobranza" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <p><strong>Cliente:</strong> {boletoSeleccionado.cliente_nombre}</p>
                            <p><strong>Número:</strong> {boletoSeleccionado.numero}</p>
                            <button onClick={enviarWhatsApp} style={{background: '#25D366', color: 'white', padding: '10px'}}>📱 Enviar Recibo WhatsApp</button>
                            <button onClick={handlePagar} style={{background: '#28a745', color: 'white', padding: '10px'}}>💰 Registrar Pago Total</button>
                            <button onClick={handleLiberar} style={{background: '#dc3545', color: 'white', padding: '10px'}}>🗑️ Liberar Número</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VentasTerminal;