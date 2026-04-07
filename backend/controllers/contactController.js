const contactService = require('../services/contactService');

class ContactController {
  async getAll(req, res) {
    try {
      const contacts = await contactService.getAll();
      res.json({ success: true, data: contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const contact = await contactService.getById(req.params.id);
      res.json({ success: true, data: contact });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async search(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Falta el término de búsqueda' });
      }
      const contacts = await contactService.search(q);
      res.json({ success: true, data: contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    console.log('POST /api/contacts recibido');
    console.log('Body:', req.body);
    try {
      const contact = await contactService.create(req.body);
      res.status(201).json({ success: true, data: contact });
    } catch (error) {
      console.error('Error en create:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const contact = await contactService.update(req.params.id, req.body);
      res.json({ success: true, data: contact });
    } catch (error) {
      const status = error.message === 'Contacto no encontrado' ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await contactService.delete(req.params.id);
      res.json({ success: true, message: 'Contacto eliminado' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async toggleFavorite(req, res) {
    try {
      const contact = await contactService.toggleFavorite(req.params.id);
      res.json({ success: true, data: contact });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ContactController();