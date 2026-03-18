/**
 * Admin Routes
 * Administrative functions
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Lancamento, Atividade, Categoria } = require('../models/database');

const { authenticateToken } = require('./auth');

// Admin Authorization Middleware
const isAdmin = (req, res, next) => {
  if (req.user.tipo_usuario !== 'Admin' && req.user.tipo_usuario !== 'Administrador') {
    return res.redirect('/dashboard');
  }
  next();
};

const adminAuth = [authenticateToken, isAdmin];

// Admin Users
router.get('/usuarios', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['nome', 'ASC']]
    });
    
    console.log('DEBUG ADMIN USUÁRIOS - users.length:', users.length);
    console.log('DEBUG ADMIN USUÁRIOS - users:', users.map(u => ({ id: u.id, nome: u.nome, email: u.email })));
    
    res.render('admin/usuarios_bootstrap', {
      user: req.user,
      usuarios: users.map(u => u.toJSON()),
      title: 'Admin Usuários - Time Tracking'
    });
    
  } catch (error) {
    console.error('Admin usuarios error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar usuários',
      title: 'Erro - Time Tracking'
    });
  }
});

// Create User
router.post('/usuarios', adminAuth, async (req, res) => {
  try {
    const { nome, email, senha, tipo_usuario, gestao, area, equipe, especialidade } = req.body;
    
    console.log('DEBUG CREATE USER - req.body:', req.body);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    // Create user
    await User.create({
      nome,
      email,
      senha: hashedPassword,
      tipo_usuario,
      gestao,
      area,
      equipe,
      especialidade
    });
    
    res.redirect('/admin/usuarios');
    
  } catch (error) {
    console.error('Create user error:', error);
    res.redirect('/admin/usuarios?error=1');
  }
});

// Update User
router.post('/usuarios/:id/editar', adminAuth, async (req, res) => {
  try {
    const { nome, email, tipo_usuario, ativo, senha, gestao, area, equipe, especialidade } = req.body;
    
    console.log('DEBUG UPDATE USER - req.body:', req.body);
    
    const updateData = { 
      nome, 
      email, 
      tipo_usuario,
      gestao,
      area,
      equipe,
      especialidade,
      ativo: ativo === 'on' || ativo === true || ativo === 'true'
    };
    
    if (senha && senha.trim() !== '') {
      updateData.senha = await bcrypt.hash(senha, 10);
    }
    
    await User.update(updateData, {
      where: { id: req.params.id }
    });
    
    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Update user error:', error);
    res.redirect('/admin/usuarios?error=update');
  }
});

// Delete User
router.post('/usuarios/:id/excluir', adminAuth, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Delete user error:', error);
    res.redirect('/admin/usuarios?error=delete');
  }
});

// Admin Categorias
router.get('/categorias', adminAuth, async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.render('admin/categorias', {
      user: req.user,
      categorias: categorias.map(c => c.toJSON()),
      title: 'Admin Categorias - Time Tracking'
    });
    
  } catch (error) {
    console.error('Admin categorias error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar categorias',
      title: 'Erro - Time Tracking'
    });
  }
});

// Create Categoria
router.post('/categorias', adminAuth, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    
    await Categoria.create({
      nome,
      descricao
    });
    
    res.redirect('/admin/categorias');
    
  } catch (error) {
    console.error('Create categoria error:', error);
    res.redirect('/admin/categorias?error=1');
  }
});

// Update Categoria
router.post('/categorias/:id/editar', adminAuth, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    await Categoria.update({
      nome,
      descricao,
      ativo: ativo === 'on' || ativo === true || ativo === 'true'
    }, {
      where: { id: req.params.id }
    });
    res.redirect('/admin/categorias');
  } catch (error) {
    console.error('Update categoria error:', error);
    res.redirect('/admin/categorias?error=update');
  }
});

// Delete Categoria
router.post('/categorias/:id/excluir', adminAuth, async (req, res) => {
  try {
    await Categoria.destroy({
      where: { id: req.params.id }
    });
    
    res.redirect('/admin/categorias');
    
  } catch (error) {
    console.error('Delete categoria error:', error);
    res.redirect('/admin/categorias?error=1');
  }
});

// Admin Atividades
router.get('/atividades', adminAuth, async (req, res) => {
  try {
    const atividades = await Atividade.findAll({
      include: [{ model: Categoria }],
      order: [['nome', 'ASC']]
    });
    
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.render('admin/atividades', {
      user: req.user,
      atividades: atividades.map(a => a.toJSON()),
      categorias: categorias.map(c => c.toJSON()),
      title: 'Admin Atividades - Time Tracking'
    });
    
  } catch (error) {
    console.error('Admin atividades error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar atividades',
      title: 'Erro - Time Tracking'
    });
  }
});

// Create Atividade
router.post('/atividades', adminAuth, async (req, res) => {
  try {
    const { nome, descricao, categoria_id } = req.body;
    await Atividade.create({ nome, descricao, categoria_id });
    res.redirect('/admin/atividades');
  } catch (error) {
    console.error('Create atividade error:', error);
    res.redirect('/admin/atividades?error=create');
  }
});

// Update Atividade
router.post('/atividades/:id/editar', adminAuth, async (req, res) => {
  try {
    const { nome, descricao, categoria_id, ativo } = req.body;
    await Atividade.update({
      nome,
      descricao,
      categoria_id,
      ativo: ativo === 'on' || ativo === true || ativo === 'true'
    }, {
      where: { id: req.params.id }
    });
    res.redirect('/admin/atividades');
  } catch (error) {
    console.error('Update atividade error:', error);
    res.redirect('/admin/atividades?error=update');
  }
});

// Delete Atividade
router.post('/atividades/:id/excluir', adminAuth, async (req, res) => {
  try {
    await Atividade.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/atividades');
  } catch (error) {
    console.error('Delete atividade error:', error);
    res.redirect('/admin/atividades?error=delete');
  }
});

// Admin Lancamentos
router.get('/lancamentos', adminAuth, async (req, res) => {
  try {
    const { user_id, data } = req.query;
    
    let whereClause = {};
    if (user_id) whereClause.usuario_id = user_id;
    if (data) whereClause.data = data;
    
    const lancamentos = await Lancamento.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'nome'] },
        { model: Atividade, include: [{ model: Categoria }] }
      ],
      order: [['data', 'DESC'], ['hora_inicio', 'DESC']]
    });
    
    const usuarios = await User.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.render('admin/lancamentos_improved', {
      user: req.user,
      lancamentos: lancamentos.map(l => l.toJSON()),
      usuarios: usuarios.map(u => u.toJSON()),
      filtro_user_id: user_id || '',
      filtro_data: data || '',
      title: 'Admin Lançamentos - Time Tracking'
    });
    
  } catch (error) {
    console.error('Admin lancamentos error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar lançamentos',
      title: 'Erro - Time Tracking'
    });
  }
});

// Update Lancamento (Admin)
router.post('/lancamentos/:id/editar', adminAuth, async (req, res) => {
  try {
    const { atividade_id, data, hora_inicio, hora_fim, descricao } = req.body;
    await Lancamento.update({
      atividade_id,
      data,
      hora_inicio,
      hora_fim,
      descricao
    }, {
      where: { id: req.params.id }
    });
    res.redirect(req.headers.referer || '/admin/lancamentos');
  } catch (error) {
    console.error('Admin edit lancamento error:', error);
    res.redirect('/admin/lancamentos?error=edit');
  }
});

// Delete Lancamento (Admin)
router.post('/lancamentos/:id/excluir', adminAuth, async (req, res) => {
  try {
    await Lancamento.destroy({ where: { id: req.params.id } });
    res.redirect(req.headers.referer || '/admin/lancamentos');
  } catch (error) {
    console.error('Admin delete lancamento error:', error);
    res.redirect('/admin/lancamentos?error=delete');
  }
});

// SharePoint Integration
router.get('/sharepoint', adminAuth, async (req, res) => {
  try {
    res.render('admin/sharepoint', {
      user: req.user,
      title: 'Integração SharePoint - Time Tracking'
    });
  } catch (error) {
    console.error('Admin sharepoint error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar integração SharePoint',
      title: 'Erro - Time Tracking'
    });
  }
});

module.exports = router;
