let citaACancelar = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarCitas();

    const btnConfirmarCancelacion = document.getElementById('btnConfirmarCancelacion');
    if (btnConfirmarCancelacion) {
        btnConfirmarCancelacion.addEventListener('click', confirmarCancelacion);
    }
});

function cargarCitas() {
    const citas = obtenerCitas();
    const cuerpoTabla = document.getElementById('cuerpoTablaCitas');
    const alertNoCitas = document.getElementById('alertNoCitas');
    const tablaCitas = document.getElementById('tablaCitas');

    if (citas.length === 0) {
        alertNoCitas.style.display = 'block';
        tablaCitas.style.display = 'none';
        return;
    }

    alertNoCitas.style.display = 'none';
    tablaCitas.style.display = 'table';

    cuerpoTabla.innerHTML = '';

    citas.forEach((cita, index) => {
        const fila = crearFilaCita(cita, index);
        cuerpoTabla.appendChild(fila);
    });
}

function crearFilaCita(cita, index) {
    const tr = document.createElement('tr');

    const estadoClass = cita.estado === 'Confirmada' ? 'success' :
                       cita.estado === 'Cancelada' ? 'danger' : 'warning';

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${cita.nombre}</td>
        <td>${cita.documento}</td>
        <td>${cita.especialidad}</td>
        <td>${formatearFecha(cita.fecha)}</td>
        <td>${cita.hora}</td>
        <td><span class="badge bg-${estadoClass}">${cita.estado}</span></td>
        <td>
            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-primary" onclick="verDetalle(${cita.id})" title="Ver Detalle">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                </button>
                ${cita.estado === 'Confirmada' ? `
                <button class="btn btn-outline-danger" onclick="cancelarCita(${cita.id})" title="Cancelar Cita">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                ` : ''}
            </div>
        </td>
    `;

    return tr;
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

function obtenerCitas() {
    const citasJSON = localStorage.getItem('citas');
    return citasJSON ? JSON.parse(citasJSON) : [];
}

function guardarCitas(citas) {
    localStorage.setItem('citas', JSON.stringify(citas));
}

function verDetalle(idCita) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === idCita);

    if (!cita) {
        showToast('Cita no encontrada', 'danger');
        return;
    }

    const detalleHTML = `
        <div class="mb-2"><strong>Paciente:</strong> ${cita.nombre}</div>
        <div class="mb-2"><strong>Documento:</strong> ${cita.documento}</div>
        <div class="mb-2"><strong>Teléfono:</strong> ${cita.telefono}</div>
        <div class="mb-2"><strong>Email:</strong> ${cita.email}</div>
        <div class="mb-2"><strong>Especialidad:</strong> ${cita.especialidad}</div>
        <div class="mb-2"><strong>Fecha:</strong> ${formatearFecha(cita.fecha)}</div>
        <div class="mb-2"><strong>Hora:</strong> ${cita.hora}</div>
        <div class="mb-2"><strong>Estado:</strong> ${cita.estado}</div>
        ${cita.motivo ? `<div class="mb-2"><strong>Motivo:</strong> ${cita.motivo}</div>` : ''}
    `;

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info alert-dismissible fade show mt-3';
    alertDiv.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        <h5 class="alert-heading">Detalle de la Cita</h5>
        ${detalleHTML}
    `;

    const container = document.querySelector('.container');
    const existingAlert = container.querySelector('.alert-info');
    if (existingAlert) {
        existingAlert.remove();
    }

    container.insertBefore(alertDiv, container.children[1]);
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarCita(idCita) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === idCita);

    if (!cita) {
        showToast('Cita no encontrada', 'danger');
        return;
    }

    citaACancelar = idCita;

    const datosCita = `${cita.nombre} - ${cita.especialidad} - ${formatearFecha(cita.fecha)} ${cita.hora}`;
    document.getElementById('datosCitaCancelar').textContent = datosCita;

    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarCancelacion'));
    modal.show();
}

function confirmarCancelacion() {
    if (!citaACancelar) return;

    const citas = obtenerCitas();
    const citaIndex = citas.findIndex(c => c.id === citaACancelar);

    if (citaIndex !== -1) {
        citas[citaIndex].estado = 'Cancelada';
        guardarCitas(citas);

        cargarCitas();

        showToast('Cita cancelada exitosamente', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarCancelacion'));
        modal.hide();
    }

    citaACancelar = null;
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