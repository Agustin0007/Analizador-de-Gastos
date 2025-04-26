import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendEmail } from '../config/emailjs';
import './AlertConfig.css';

export default function AlertConfig() {
    const [alertLimit, setAlertLimit] = useState('');
    const [email, setEmail] = useState('');
    const [alerts, setAlerts] = useState([]);

    const handleSave = async () => {
        if (!alertLimit || !email) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        if (alertLimit <= 0) {
            toast.error('El límite debe ser mayor a 0');
            return;
        }

        const newAlert = { 
            limit: parseFloat(alertLimit), 
            email,
            createdAt: new Date().toISOString()
        };

        try {
            await sendEmail({
                to_email: email,
                message: `Alerta configurada: Se notificará cuando los gastos superen $${alertLimit}`
            });
            
            setAlerts([...alerts, newAlert]);
            setAlertLimit('');
            setEmail('');
            toast.success('¡Alerta configurada exitosamente!');
        } catch (error) {
            toast.error('Error al configurar la alerta');
        }
    };

    const handleDelete = (index) => {
        const updatedAlerts = alerts.filter((_, i) => i !== index);
        setAlerts(updatedAlerts);
        toast.success('Alerta eliminada');
    };

    return (
        <div className="alert-config-container">
            <h1>Configuración de Alertas</h1>
            <div className="alert-form">
                <input
                    type="number"
                    placeholder="Ingrese el límite de gastos ($)"
                    value={alertLimit}
                    onChange={(e) => setAlertLimit(e.target.value)}
                    min="0"
                />
                <input
                    type="email"
                    placeholder="Ingrese su correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleSave} className="save-button">
                    Guardar Configuración
                </button>
            </div>
            
            <div className="alerts-list">
                <h2>Alertas Configuradas</h2>
                {alerts.length === 0 ? (
                    <p>No hay alertas configuradas</p>
                ) : (
                    alerts.map((alert, index) => (
                        <div key={index} className="alert-item">
                            <div>
                                <strong>Límite:</strong> ${alert.limit.toFixed(2)}
                                <br />
                                <strong>Email:</strong> {alert.email}
                            </div>
                            <button 
                                onClick={() => handleDelete(index)} 
                                className="delete-button"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}