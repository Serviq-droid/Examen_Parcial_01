document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formReserva');
    const fechaInput = document.getElementById('fecha');

    setMinDate();

    form.addEventListener('submit', handleFormSubmit);
});

function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('fecha').setAttribute('min', minDate);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;

    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        showToast('Por favor complete todos los campos requeridos', 'danger');
        return;
    }

    const formData = {
        id: Date.now(),
        nombre: document.getElementById('nombreCompleto').value.trim(),
        documento: document.getElementById('documento').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        especialidad: document.getElementById('especialidad').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        motivo: document.getElementById('motivo').value.trim(),
        estado: 'Confirmada',
        fechaReserva: new Date().toISOString()
    };

    if (!validarFecha(formData.fecha)) {
        showToast('La fecha debe ser posterior a hoy', 'danger');
        return;
    }

    guardarCita(formData);

    mostrarConfirmacion(formData);

    form.reset();
    form.classList.remove('was-validated');

    showToast('Cita reservada exitosamente', 'success');
}

function validarFecha(fecha) {
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaSeleccionada > hoy;
}

function guardarCita(cita) {
    let citas = obtenerCitas();
    citas.push(cita);
    localStorage.setItem('citas', JSON.stringify(citas));
}

function obtenerCitas() {
    const citasJSON = localStorage.getItem('citas');
    return citasJSON ? JSON.parse(citasJSON) : [];
}

function mostrarConfirmacion(datos) {
    document.getElementById('confNombre').textContent = datos.nombre;
    document.getElementById('confDocumento').textContent = datos.documento;
    document.getElementById('confTelefono').textContent = datos.telefono;
    document.getElementById('confEmail').textContent = datos.email;
    document.getElementById('confEspecialidad').textContent = datos.especialidad;

    const fechaFormateada = formatearFecha(datos.fecha);
    document.getElementById('confFechaHora').textContent = `${fechaFormateada} a las ${datos.hora}`;

    const confirmacionDiv = document.getElementById('confirmacionCita');
    confirmacionDiv.style.display = 'block';

    confirmacionDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('formReserva').parentElement.parentElement.style.display = 'none';
}

function formatearFecha(fecha) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const date = new Date(fecha + 'T00:00:00');
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    return `${dia} de ${mes} de ${anio}`;
}

function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    const toastHeader = toastEl.querySelector('.toast-header');
    toastHeader.className = 'toast-header';

    if (type === 'success') {
        toastHeader.classList.add('bg-success', 'text-white');
    } else if (type === 'danger') {
        toastHeader.classList.add('bg-danger', 'text-white');
    } else {
        toastHeader.classList.add('bg-primary', 'text-white');
    }

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}