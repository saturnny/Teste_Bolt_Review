// Time Picker Visual Component - Compacto e Flutuante
class TimePicker {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.hours = 0;
        this.minutes = 0;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createPicker();
        this.attachEvents();
    }

    createPicker() {
        // Create the picker container - mais compacto
        this.pickerContainer = document.createElement('div');
        this.pickerContainer.className = 'time-picker-container';
        this.pickerContainer.style.display = 'none';
        this.pickerContainer.style.position = 'absolute';
        this.pickerContainer.style.background = 'white';
        this.pickerContainer.style.border = '1px solid var(--bs-gray-300)';
        this.pickerContainer.style.borderRadius = '8px';
        this.pickerContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        this.pickerContainer.style.padding = '12px';
        this.pickerContainer.style.zIndex = '1050';
        this.pickerContainer.style.minWidth = '200px';
        this.pickerContainer.style.maxWidth = '250px';

        // Create input field para digitação
        const inputDiv = document.createElement('div');
        inputDiv.className = 'mb-3';
        inputDiv.innerHTML = `
            <label class="form-label fw-semibold small">Horário</label>
            <div class="input-group input-group-sm">
                <input type="text" id="time-input-${this.element.id}" 
                       class="form-control text-center" 
                       placeholder="00:00" 
                       maxlength="5"
                       style="font-family: monospace; font-weight: bold;">
                <button type="button" class="btn btn-outline-secondary" onclick="timePicker_${this.element.id}.setCurrentTime()">
                    <i class="bi bi-clock"></i>
                </button>
            </div>
        `;

        // Create quick buttons - mais compactos
        const quickDiv = document.createElement('div');
        quickDiv.className = 'mb-3';
        quickDiv.innerHTML = `
            <label class="form-label fw-semibold small">Horários Rápidos</label>
            <div class="d-grid gap-1">
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary quick-time-btn" data-time="08:00">08:00</button>
                    <button type="button" class="btn btn-outline-secondary quick-time-btn" data-time="12:00">12:00</button>
                    <button type="button" class="btn btn-outline-secondary quick-time-btn" data-time="13:00">13:00</button>
                    <button type="button" class="btn btn-outline-secondary quick-time-btn" data-time="18:00">18:00</button>
                </div>
            </div>
        `;

        // Create action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'd-flex gap-2 justify-content-between';
        actionsDiv.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="timePicker_${this.element.id}.clear()">Limpar</button>
            <button type="button" class="btn btn-sm btn-primary" onclick="timePicker_${this.element.id}.apply()">Aplicar</button>
        `;

        // Add to container
        this.pickerContainer.appendChild(inputDiv);
        this.pickerContainer.appendChild(quickDiv);
        this.pickerContainer.appendChild(actionsDiv);

        // Add to body
        document.body.appendChild(this.pickerContainer);
    }

    attachEvents() {
        // Click to open
        this.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.open();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.pickerContainer.contains(e.target) && e.target !== this.element) {
                this.close();
            }
        });

        // Input field events
        this.pickerContainer.addEventListener('input', (e) => {
            if (e.target.id === `time-input-${this.element.id}`) {
                this.handleTextInput(e.target.value);
            }
        });

        // Quick time buttons
        this.pickerContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-time-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.setTime(e.target.dataset.time);
            }
        });

        // Formatação do input
        const input = document.getElementById(`time-input-${this.element.id}`);
        if (input) {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d]/g, '');
                if (value.length >= 3) {
                    value = value.slice(0, 2) + ':' + value.slice(2, 4);
                }
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                this.validateAndFormat(e.target.value);
            });
        }
    }

    open() {
        // Close other pickers
        document.querySelectorAll('.time-picker-container').forEach(picker => {
            if (picker !== this.pickerContainer) {
                picker.style.display = 'none';
            }
        });

        // Position picker - ajustado para modal
        this.positionPicker();
        this.pickerContainer.style.display = 'block';
        this.isOpen = true;

        // Load current value
        const currentValue = this.element.value;
        const input = document.getElementById(`time-input-${this.element.id}`);
        if (input) {
            input.value = currentValue || '';
            if (currentValue) {
                this.setTime(currentValue);
            }
        }

        // Focus no input
        setTimeout(() => {
            if (input) input.focus();
        }, 100);
    }

    positionPicker() {
        const rect = this.element.getBoundingClientRect();
        const modal = this.element.closest('.modal');
        
        let top, left;
        
        if (modal) {
            // Se estiver dentro de um modal, posicionar relativo ao modal
            const modalRect = modal.getBoundingClientRect();
            top = rect.bottom - modalRect.top + modal.scrollTop + 5;
            left = rect.left - modalRect.left;
            
            // Ajustar se sair do modal
            const pickerWidth = 220;
            if (left + pickerWidth > modal.offsetWidth) {
                left = modal.offsetWidth - pickerWidth - 20;
            }
        } else {
            // Posicionamento normal
            top = rect.bottom + window.scrollY + 5;
            left = rect.left + window.scrollX;
        }

        this.pickerContainer.style.top = `${top}px`;
        this.pickerContainer.style.left = `${left}px`;
    }

    handleTextInput(value) {
        if (value.length === 5 && value.includes(':')) {
            this.setTime(value);
        }
    }

    validateAndFormat(value) {
        if (value.length === 5 && value.includes(':')) {
            const [hours, minutes] = value.split(':').map(Number);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                this.setTime(value);
            } else {
                const input = document.getElementById(`time-input-${this.element.id}`);
                if (input) input.value = this.element.value || '';
            }
        }
    }

    setTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            this.hours = hours;
            this.minutes = minutes;
            this.updateDisplay();
            this.updateInput();
        }
    }

    setCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.setTime(`${hours}:${minutes}`);
    }

    updateInput() {
        const input = document.getElementById(`time-input-${this.element.id}`);
        if (input) {
            input.value = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
        }
    }

    updateDisplay() {
        const timeStr = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
        this.element.value = timeStr;
    }

    clear() {
        this.hours = 0;
        this.minutes = 0;
        this.element.value = '';
        const input = document.getElementById(`time-input-${this.element.id}`);
        if (input) input.value = '';
    }

    apply() {
        this.close();
        // Trigger change event
        this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    close() {
        this.pickerContainer.style.display = 'none';
        this.isOpen = false;
    }
}

// Global storage for time pickers
let timePickers = {};

function initTimePickers() {
    document.querySelectorAll('input.time-picker-input').forEach(input => {
        if (!input.dataset.timePicker) {
            input.dataset.timePicker = 'true';
            const picker = new TimePicker(input.id);
            timePickers[input.id] = picker;
            
            // Create global reference for onclick handlers
            window[`timePicker_${input.id}`] = picker;
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initTimePickers);

// Reinitialize after dynamic content
window.initTimePickers = initTimePickers;
