import React, { useState, useEffect } from 'react';
import { apartarNumero, obtenerEstadoBoletos } from '../services/ventasService';
import './VentasTerminal.css';

const VentasTerminal = () => {
    const [boletos, setBoletos] = useState([]);
    const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState(''); // Estado para mostrar colisiones

    const [formData, setFormData] = useState({
        nombre: '', cedula: '', telefono: '', direccion: ''
    });

    useEffect(() => {
    const cargarGrilla = async () => {
        try {
            const token = localStorage.getItem('token');
            const sorteoId = 1; // Asumimos el Sorteo ID 1 temporalmente
            
            // 1. Obtener la lista de boletos que ya están en PostgreSQL
            const respuesta = await obtenerEstadoBoletos(sorteoId, token);
            const boletosOcupados = respuesta.data || [];

            // 2. Generar el 00 al 99 evaluando el estado de cada uno
            const grillaReal = Array.from({ length: 100 }, (_, i) => {
                const numeroString = i.toString().padStart(2, '0');
                
                // Buscar si este número específico viene en la respuesta de la base de datos
                const boletoEnBD = boletosOcupados.find(b => b.numero === numeroString);
                
                return { 
                    numero: numeroString, 
                    // Si lo encontró en BD, hereda su estado (Pendiente/Pagado). Si no, es Blanco.
                    estado: boletoEnBD ? boletoEnBD.estado : 'Disponible' 
                };
            });
            
            setBoletos(grillaReal);
        } catch (error) {
            console.error('Error al sincronizar los números con el servidor:', error);
        }
    };

    cargarGrilla();
}, []);

    const handleClicNumero = (boleto) => {
        if (boleto.estado !== 'Disponible') {
            alert(`El número ${boleto.numero} ya está ${boleto.estado}.`);
            return;
        }
        setNumeroSeleccionado(boleto.numero);
        setErrorMensaje(''); // Limpiar errores de intentos anteriores
        setMostrarModal(true);
    };

    const handleReservar = async (e) => {
        e.preventDefault();
        setErrorMensaje('');

        try {
            // 2. Extraer el token que guardamos en el Login
            const token = localStorage.getItem('token');
            
            // 3. Empaquetar los datos exactos que exige el controlador del backend
            const datosReserva = {
                sorteoId: 1, // Asumimos el Sorteo ID 1 temporalmente
                numero: numeroSeleccionado,
                clienteNombre: formData.nombre,
                clienteCedula: formData.cedula,
                clienteTelefono: formData.telefono,
                clienteDireccion: formData.direccion
            };

            // 4. Ejecutar la petición real a la base de datos
            const respuesta = await apartarNumero(datosReserva, token);

            if (respuesta.success) {
                // 5. Si la BD lo aprueba, actualizamos la interfaz a Amarillo
                setBoletos(boletos.map(b => 
                    b.numero === numeroSeleccionado ? { ...b, estado: 'Pendiente' } : b
                ));
                setMostrarModal(false);
                setFormData({ nombre: '', cedula: '', telefono: '', direccion: '' });
                alert('Número apartado con éxito.');
            }
        } catch (error) {
            // Si el candado anticolisión de PostgreSQL salta, el mensaje se mostrará aquí
            setErrorMensaje(error.message || 'Error de conexión al apartar el número.');
        }
    };

    const obtenerClaseColor = (estado) => {
        if (estado === 'Pendiente') return 'boleto-amarillo';
        if (estado === 'Pagado') return 'boleto-verde';
        return 'boleto-blanco'; 
    };

    return (
        <div className="terminal-container">
            <h2>Terminal de Ventas</h2>
            
            <div className="grilla-numeros">
                {boletos.map((boleto) => (
                    <div 
                        key={boleto.numero} 
                        className={`caja-numero ${obtenerClaseColor(boleto.estado)}`}
                        onClick={() => handleClicNumero(boleto)}
                    >
                        {boleto.numero}
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Apartar Número: {numeroSeleccionado}</h3>
                        
                        {/* Aviso de error en caso de que alguien más lo comprara primero */}
                        {errorMensaje && <div style={{color: 'red', fontWeight: 'bold'}}>{errorMensaje}</div>}
                        
                        <form onSubmit={handleReservar}>
                            <input type="text" placeholder="Nombre completo" required 
                                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <input type="text" placeholder="Cédula" required 
                                value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                            <input type="text" placeholder="Teléfono (WhatsApp)" required 
                                value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                            <input type="text" placeholder="Dirección de despacho" required 
                                value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                            
                            <div className="modal-botones">
                                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit">Confirmar Reserva</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VentasTerminal;