import { useState } from 'react';
import { pagarBoleto } from '../services/ventasService';
import './Cobranza.css';

const Cobranza = () => {
    // Mantendremos una lista simulada por ahora hasta crear el endpoint de "mis boletos"
    const [boletosPendientes, setBoletosPendientes] = useState([
        { id: 1, numero: '45', cliente: 'Juan Pérez', telefono: '573001234567', valor: 5000 },
        { id: 2, numero: '12', cliente: 'María Gómez', telefono: '573109876543', valor: 5000 }
    ]);

    const [modalPago, setModalPago] = useState(false);
    const [boletoAPagar, setBoletoAPagar] = useState(null);
    const [metodoPago, setMetodoPago] = useState('Bancolombia');
    const [archivoCapture, setArchivoCapture] = useState(null);
    const [cargando, setCargando] = useState(false);

    const abrirWhatsApp = (boleto) => {
        const mensaje = `Hola ${boleto.cliente}, te escribo para recordarte el pago de tu boleto número ${boleto.numero} por un valor de $${boleto.valor}. ¡Gracias por participar!`;
        const url = `https://wa.me/${boleto.telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    const iniciarPago = (boleto) => {
        setBoletoAPagar(boleto);
        setModalPago(true);
    };

    const handleConfirmarPago = async (e) => {
        e.preventDefault();
        
        if (metodoPago === 'Bancolombia' && !archivoCapture) {
            alert('Debes adjuntar el capture de Bancolombia.');
            return;
        }

        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('metodo_pago', metodoPago);
            
            if (archivoCapture) {
                formData.append('comprobante', archivoCapture);
            }

            // Petición real al backend
            await pagarBoleto(boletoAPagar.id, formData, token);

            alert(`Pago registrado para el boleto ${boletoAPagar.numero}. El número ahora es VERDE.`);
            
            // Actualizar la lista visualmente
            setBoletosPendientes(boletosPendientes.filter(b => b.id !== boletoAPagar.id));
            setModalPago(false);
            setArchivoCapture(null);
        } catch (error) {
            alert(error.message || 'Error al procesar el pago.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="cobranza-container">
            <h2>Gestión de Cobranzas (Boletos Amarillos)</h2>
            
            <table className="tabla-cobranza">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Valor</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {boletosPendientes.map(boleto => (
                        <tr key={boleto.id}>
                            <td className="celda-numero">{boleto.numero}</td>
                            <td>{boleto.cliente}</td>
                            <td>{boleto.telefono}</td>
                            <td>${boleto.valor}</td>
                            <td className="celda-acciones">
                                <button className="btn-whatsapp" onClick={() => abrirWhatsApp(boleto)}>
                                    📲 Cobrar
                                </button>
                                <button className="btn-pagar" onClick={() => iniciarPago(boleto)}>
                                    💵 Registrar Pago
                                </button>
                            </td>
                        </tr>
                    ))}
                    {boletosPendientes.length === 0 && (
                        <tr><td colSpan="5">No tienes boletos pendientes por cobrar.</td></tr>
                    )}
                </tbody>
            </table>

            {modalPago && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Pago: Número {boletoAPagar.numero}</h3>
                        <form onSubmit={handleConfirmarPago}>
                            <label>Método de Pago:</label>
                            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                <option value="Bancolombia">Bancolombia</option>
                                <option value="Efectivo_Pesos">Efectivo (Pesos)</option>
                                <option value="Efectivo_Dolares">Efectivo (Dólares)</option>
                            </select>

                            {metodoPago === 'Bancolombia' && (
                                <div className="input-archivo">
                                    <label>Capture de Pantalla:</label>
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg" 
                                        onChange={(e) => setArchivoCapture(e.target.files[0])} 
                                    />
                                </div>
                            )}

                            <div className="modal-botones">
                                <button type="button" onClick={() => setModalPago(false)} disabled={cargando}>Cancelar</button>
                                <button type="submit" className="btn-confirmar" disabled={cargando}>
                                    {cargando ? 'Procesando...' : 'Validar y Pasar a Verde'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cobranza;