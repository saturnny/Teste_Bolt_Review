// Sistema de Notificações Toast Personalizado
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Criar container de notificações
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success', title = null, duration = 5000) {
        const toastId = 'toast-' + Date.now();
        
        const toastHtml = `
            <div id="${toastId}" class="toast ${type}" role="alert">
                <div class="toast-header">
                    ${title ? `<strong class="me-auto">${title}</strong>` : ''}
                    <button type="button" class="btn-close" data-bs-dismiss="toast" onclick="notificationSystem.hide('${toastId}')">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="toast-body">
                    ${this.formatMessage(message)}
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', toastHtml);
        
        // Auto remover após duration
        setTimeout(() => {
            this.hide(toastId);
        }, duration);

        // Inicializar Bootstrap toast se disponível
        if (window.bootstrap) {
            const toastElement = document.getElementById(toastId);
            const toast = new window.bootstrap.Toast(toastElement);
            toast.show();
        }
    }

    hide(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    formatMessage(message) {
        // Formatar mensagens com ícones baseado no tipo
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Se a mensagem já tiver emoji, não adicionar outro
        if (/[✅❌⚠️ℹ️]/.test(message)) {
            return message;
        }

        return message;
    }

    // Métodos de conveniência
    success(message, title = null) {
        this.show(message, 'success', title);
    }

    error(message, title = null) {
        this.show(message, 'danger', title, 8000); // Erros ficam mais tempo
    }

    warning(message, title = null) {
        this.show(message, 'warning', title, 6000);
    }

    info(message, title = null) {
        this.show(message, 'info', title);
    }

    // Notificações para operações CRUD
    created(entity, details = null) {
        const message = details ? `${entity} "${details}" criado com sucesso!` : `${entity} criado com sucesso!`;
        this.success(message, 'Criado');
    }

    updated(entity, details = null) {
        const message = details ? `${entity} "${details}" atualizado com sucesso!` : `${entity} atualizado com sucesso!`;
        this.success(message, 'Atualizado');
    }

    deleted(entity, details = null) {
        const message = details ? `${entity} "${details}" removido com sucesso!` : `${entity} removido com sucesso!`;
        this.warning(message, 'Removido');
    }

    errorOccurred(operation, entity, error = null) {
        const message = error ? `Erro ao ${operation} ${entity}: ${error}` : `Erro ao ${operation} ${entity}. Tente novamente.`;
        this.error(message, 'Erro');
    }

    // Notificações específicas do sistema
    loginSuccess(userName) {
        this.success(`Bem-vindo(a), ${userName}!`, 'Login realizado');
    }

    logoutSuccess() {
        this.info('Você saiu do sistema com sucesso.', 'Logout');
    }

    passwordChanged() {
        this.success('Sua senha foi alterada com sucesso!', 'Senha Alterada');
    }

    invalidCredentials() {
        this.error('Email ou senha incorretos. Verifique suas credenciais.', 'Erro de Autenticação');
    }

    accessDenied() {
        this.error('Você não tem permissão para acessar esta página.', 'Acesso Negado');
    }
}

// Instância global
const notificationSystem = new NotificationSystem();

// Funções globais para conveniência
function showNotification(message, type = 'success', title = null) {
    notificationSystem.show(message, type, title);
}

function showSuccess(message, title = null) {
    notificationSystem.success(message, title);
}

function showError(message, title = null) {
    notificationSystem.error(message, title);
}

function showWarning(message, title = null) {
    notificationSystem.warning(message, title);
}

function showInfo(message, title = null) {
    notificationSystem.info(message, title);
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem, notificationSystem };
}
