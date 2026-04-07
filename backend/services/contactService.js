const { v4: uuidv4 } = require('uuid');
const contactRepository = require('../repositories/contactRepository');

class ContactService {
  async getAll() {
    return await contactRepository.readAll();
  }

  async getById(id) {
    const contact = await contactRepository.findById(id);
    if (!contact) throw new Error('Contacto no encontrado');
    return contact;
  }

  async search(term) {
    if (!term) return this.getAll();
    const contacts = await contactRepository.readAll();
    const lowerTerm = term.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerTerm) ||
      contact.email.toLowerCase().includes(lowerTerm)
    );
  }

  async create(contactData) {
    this.validateContactData(contactData);

    const existing = await contactRepository.findByEmail(contactData.email);
    if (existing) throw new Error('El email ya está registrado');

    const newContact = {
      id: uuidv4(),
      name: contactData.name.trim(),
      phone: contactData.phone.trim(),
      email: contactData.email.trim().toLowerCase(),
      isFavorite: contactData.isFavorite || false
    };
    return await contactRepository.save(newContact);
  }

  async update(id, contactData) {
    this.validateContactData(contactData, true);

    const existing = await contactRepository.findById(id);
    if (!existing) throw new Error('Contacto no encontrado');

    if (contactData.email && contactData.email !== existing.email) {
      const emailUsed = await contactRepository.findByEmail(contactData.email);
      if (emailUsed && emailUsed.id !== id) {
        throw new Error('El email ya está registrado por otro contacto');
      }
    }

    const updatedData = {
      name: contactData.name?.trim(),
      phone: contactData.phone?.trim(),
      email: contactData.email?.trim().toLowerCase(),
      isFavorite: contactData.isFavorite
    };
    return await contactRepository.update(id, updatedData);
  }

  async delete(id) {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new Error('Contacto no encontrado');
    await contactRepository.delete(id);
    return true;
  }

  async toggleFavorite(id) {
    const contact = await contactRepository.findById(id);
    if (!contact) throw new Error('Contacto no encontrado');
    const newFavorite = !contact.isFavorite;
    return await contactRepository.update(id, { isFavorite: newFavorite });
  }

  validateContactData(data, isUpdate = false) {
    if (!isUpdate && (!data.name || !data.phone || !data.email)) {
      throw new Error('Nombre, teléfono y email son requeridos');
    }
    if (data.name && data.name.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }
    if (data.phone) {
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(data.phone.trim())) {
        throw new Error('El teléfono debe contener solo números');
      }
    }
    if (data.email) {
      const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        throw new Error('El email no es válido');
      }
    }
  }
}

module.exports = new ContactService();