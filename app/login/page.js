'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro no servidor, tente novamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', sans-serif;
        }

        body {
          background-color: #3d0202;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        /* CONTAINER PRINCIPAL RESPONSIVO */
        .main-container {
          display: flex;
          width: 100%;
          max-width: 1000px;
          min-height: 600px;
          background-color: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
          flex-direction: row; /* Lado a lado por padrão */
        }

        /* SEÇÃO ESQUERDA (BOAS-VINDAS) */
        .welcome-section {
          flex: 1.3;
          background: #590000; /* Dark Red solid fallback */
          background-image: radial-gradient(circle at top right, #800000, #300000);
          color: white;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .bg-svg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: -1;
          opacity: 0.3;
          pointer-events: none;
        }

        .logo-area { margin-bottom: 40px; }
        .logo-main { display: flex; align-items: center; font-size: 2.2rem; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .logo-icon {
          width: 45px; height: 45px; background: white; color: #8b0000;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; margin-right: 12px; font-size: 1.5rem; font-style: italic; font-weight: bold; font-family: sans-serif;
        }
        .tagline { font-size: 0.9rem; opacity: 0.8; font-style: italic; font-weight: 300; }

        .welcome-section h1 { font-size: 2.5rem; margin-bottom: 15px; }
        .welcome-section p.desc { font-size: 1rem; line-height: 1.5; opacity: 0.85; max-width: 350px; }

        /* SEÇÃO DIREITA (FORMULÁRIO) */
        .login-section {
          flex: 1;
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }

        .form-container { width: 100%; max-width: 340px; }
        .form-container h2 { font-size: 2rem; margin-bottom: 30px; color: #222; }

        .input-box { position: relative; margin-bottom: 15px; }
        .input-box i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #888; }
        .input-box input {
          width: 100%; padding: 14px 20px 14px 50px;
          border: 1px solid #ddd; border-radius: 30px; font-size: 1rem; outline: none;
        }

        .extra-options {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.85rem; margin-bottom: 30px; color: #555;
        }
        .extra-options a { color: #8b0000; text-decoration: none; font-weight: 600; }

        .btn-entrar {
          width: 100%; padding: 15px; background-color: #A00000; color: white;
          border: none; border-radius: 35px; font-size: 1rem; font-weight: bold;
          cursor: pointer; transition: 0.3s;
        }
        .btn-entrar:hover { background-color: #8b0000; }

        .create-account { text-align: center; margin-top: 25px; font-size: 0.85rem; color: #666; }
        .create-account a { color: #8b0000; text-decoration: none; font-weight: bold; }

        /* Alert styles */
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .alert-danger {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c00;
        }

        /* --- MEDIA QUERIES PARA RESPONSIVIDADE --- */

        /* Tablets e Telas Médias (até 900px) */
        @media (max-width: 900px) {
          .main-container { max-width: 700px; height: auto; }
          .welcome-section { padding: 40px; }
        }

        /* Celulares e Tablets em modo Retrato (até 768px) */
        @media (max-width: 768px) {
          .main-container {
            flex-direction: column; /* Empilha as seções */
            height: auto;
            max-width: 450px;
          }

          .welcome-section {
            padding: 40px 30px;
            text-align: center;
            align-items: center;
          }

          .welcome-section p.desc { max-width: 100%; }

          .login-section { padding: 40px 30px; }
          
          .logo-main { justify-content: center; }
        }

        /* Celulares Pequenos (até 480px) */
        @media (max-width: 480px) {
          body { padding: 10px; }
          .main-container { border-radius: 15px; }
          .welcome-section h1 { font-size: 1.8rem; }
          .form-container h2 { font-size: 1.7rem; text-align: center; }
          .extra-options { flex-direction: column; gap: 15px; text-align: center; }
        }
      `}</style>

      <main className="main-container">
        <section className="welcome-section">
          <svg className="bg-svg" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50,100 C150,50 350,250 550,150" stroke="white" fill="transparent" stroke-width="1" opacity="0.2"/>
            <path d="M-50,200 C150,150 350,350 550,250" stroke="white" fill="transparent" stroke-width="1" opacity="0.1"/>
            <polyline points="400,400 450,480 350,500 400,400" stroke="white" fill="transparent" stroke-width="1" opacity="0.2"/>
            <polyline points="50,450 120,400 80,500 50,450" stroke="white" fill="transparent" stroke-width="1" opacity="0.2"/>
          </svg>

          <div className="logo-area">
            <div className="logo-main">
              <div className="logo-icon">Q</div>
              QualiDados
            </div>
            <p className="tagline">Engenharia com Tecnologia</p>
          </div>

          <h1>Bem-vindo de volta!</h1>
          <p className="desc">Use sua conta existente para acessar o portal da QualiDados.</p>
        </section>

        <section className="login-section">
          <div className="form-container">
            <h2>Entrar</h2>
            
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <i className="fa-regular fa-user"></i>
                <input
                  type="text"
                  name="username"
                  placeholder="Usuário ou email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="extra-options">
                <label><input type="checkbox" defaultChecked /> Lembrar de mim</label>
                <a href="#">Esqueceu a senha?</a>
              </div>

              <button type="submit" className="btn-entrar" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            
            <p className="create-account">Novo por aqui? <a href="/register">Crie uma conta</a></p>
          </div>
        </section>
      </main>
    </>
  );
}
