'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Header({ user, title = 'Time Tracking System' }) {
  useEffect(() => {
    // Função para toggle do sidebar (mobile)
    window.toggleSidebar = function() {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
      }
    };
  }, []);

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/login';
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="app-layout">
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => window.toggleSidebar()}>
          <i className="bi bi-list"></i>
        </button>

        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">⏱️</div>
              <span>Sistema de Atividades</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {(user.tipo_usuario === "Admin" || user.tipo_usuario === "Administrador") ? (
              <>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">Principal</div>
                  <Link href="/dashboard" className="sidebar-item">
                    <i className="bi bi-speedometer2"></i>
                    <span>Dashboard</span>
                  </Link>
                </div>

                <div className="sidebar-section">
                  <div className="sidebar-section-title">Administração</div>
                  <Link href="/admin/usuarios" className="sidebar-item">
                    <i className="bi bi-person"></i>
                    <span>Usuários</span>
                  </Link>
                  <Link href="/admin/atividades" className="sidebar-item">
                    <i className="bi bi-list-task"></i>
                    <span>Gerenciar Atividades</span>
                  </Link>
                  <Link href="/admin/categorias" className="sidebar-item">
                    <i className="bi bi-tag"></i>
                    <span>Categorias</span>
                  </Link>
                  <Link href="/admin/lancamentos" className="sidebar-item">
                    <i className="bi bi-clock-history"></i>
                    <span>Lançamentos da Equipe</span>
                  </Link>
                  <Link href="/admin/sharepoint" className="sidebar-item">
                    <i className="bi bi-cloud-arrow-up"></i>
                    <span>Integração SharePoint</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="sidebar-section">
                <div className="sidebar-section-title">Menu</div>
                <Link href="/dashboard" className="sidebar-item">
                  <i className="bi bi-speedometer2"></i>
                  <span>Dashboard</span>
                </Link>
                <Link href="/lancamentos" className="sidebar-item">
                  <i className="bi bi-list-task"></i>
                  <span>Meus Lançamentos</span>
                </Link>
                <Link href="/perfil" className="sidebar-item">
                  <i className="bi bi-person"></i>
                  <span>Meu Perfil</span>
                </Link>
              </div>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar" style={{ backgroundColor: '#a00000' }}>
                {user.nome.substring(0, 2).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name text-truncate" style={{ maxWidth: '140px' }}>
                  {user.nome}
                </div>
                <div className="sidebar-user-role">{user.tipo_usuario}</div>
              </div>
            </div>
            
            <div className="sidebar-logout">
              <button 
                type="button" 
                className="btn w-100" 
                style={{ background: 'white', color: '#8b0000', borderRadius: '8px', fontWeight: '600', padding: '10px' }}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Sair
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="container-fluid p-4">
          </div>
        </main>
      </div>
    </>
  );
}
