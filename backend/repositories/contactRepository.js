const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');

class ContactRepository {
  async readAll() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const json = JSON.parse(data);
      return json.contacts || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error('Error al leer el archivo de contactos');
    }
  }

  async writeAll(contacts) {
    try {
      const data = JSON.stringify({ contacts }, null, 2);
      await fs.writeFile(DATA_FILE, data, 'utf8');
    } catch (error) {
      throw new Error('Error al escribir en el archivo de contactos');
    }
  }

  async findById(id) {
    const contacts = await this.readAll();
    return contacts.find(contact => contact.id === id);
  }

  async findByEmail(email) {
    const contacts = await this.readAll();
    return contacts.find(contact => contact.email === email);
  }

  async save(contact) {
    const contacts = await this.readAll();
    contacts.push(contact);
    await this.writeAll(contacts);
    return contact;
  }

  async update(id, updatedData) {
    const contacts = await this.readAll();
    const index = contacts.findIndex(contact => contact.id === id);
    if (index === -1) return null;
    contacts[index] = { ...contacts[index], ...updatedData };
    await this.writeAll(contacts);
    return contacts[index];
  }

  async delete(id) {
    const contacts = await this.readAll();
    const newContacts = contacts.filter(contact => contact.id !== id);
    await this.writeAll(newContacts);
    return true;
  }
}

module.exports = new ContactRepository();