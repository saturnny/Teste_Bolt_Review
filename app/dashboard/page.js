'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [recentLancamentos, setRecentLancamentos] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalHorasTrabalhadas: '0.00',
    totalHorasPendentes: '0.00',
    totalGeralHorasTrabalhadas: '0.00',
    diasLancados: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setRecentLancamentos(data.recentLancamentos || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .dashboard-container {
          padding: 2rem;
        }
        
        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #667eea;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
        
        .recent-activities {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .activity-item {
          border-left: 4px solid #667eea;
          padding: 1rem;
          margin-bottom: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0 8px 8px 0;
        }
        
        .activity-time {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .activity-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .activity-category {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }
        
        .user-info {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .btn-logout {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
      `}</style>

      <Header user={user} title="Dashboard - Time Tracking System" />
      
      <div className="dashboard-container">
        {/* User Info */}
        <div className="user-info">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="h3 mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Bem-vindo, {user.nome}!
              </h1>
              <p className="text-muted mb-0">
                <i className="bi bi-briefcase me-1"></i>
                {user.tipo_usuario}
              </p>
            </div>
            <div className="col-md-4 text-end">
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right me-1"></i>
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="stat-value">{stats.todayCount}</div>
            <div className="stat-label">Lançamentos Hoje</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-calendar-week"></i>
            </div>
            <div className="stat-value">48</div>
            <div className="stat-label">Esta Semana</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-bar-chart"></i>
            </div>
            <div className="stat-value">156</div>
            <div className="stat-label">Este Mês</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-trophy"></i>
            </div>
            <div className="stat-value">{stats.totalHorasTrabalhadas}h</div>
            <div className="stat-label">Média Diária</div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <h3 className="h4 mb-4">
            <i className="bi bi-clock me-2"></i>
            Atividades Recentes
          </h3>
          
          {recentLancamentos && recentLancamentos.length > 0 ? (
            recentLancamentos.map((lancamento, index) => (
              <div key={index} className="activity-item">
                <div className="activity-time">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                  <i className="bi bi-clock ms-2 me-1"></i>
                  {lancamento.hora_inicio}
                </div>
                <div className="activity-title">
                  {lancamento.Atividade ? lancamento.Atividade.nome : 'Atividade'}
                </div>
                {lancamento.Atividade && lancamento.Atividade.Categoria && (
                  <span className="activity-category">
                    {lancamento.Atividade.Categoria.nome}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-5">
              <i className="bi bi-inbox display-1 mb-3"></i>
              <h5>Nenhuma atividade registrada</h5>
              <p>Comece a registrar suas atividades para vê-las aqui.</p>
              <a href="/lancamentos/novo" className="btn btn-primary">
                <i className="bi bi-plus-circle me-1"></i>
                Novo Lançamento
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}
