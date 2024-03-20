import request from 'supertest';
import app from '../src/server';

describe('Authentication', () => {
  it('should return 201 and a success message when signing up with valid credentials', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@exampl.com', password: 'password12' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });

  it('should return 400 and a message when signing up with an existing email', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@exampl.com', password: 'password12' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already exists');
  });

  it('should return 200 and a token when logging in with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@exampl.com', password: 'password12' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('should return 404 and a message when logging in with an unknown email', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'unknown@example.com', password: 'password12' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 401 and a message when logging in with an invalid password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@exampl.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid password');
  });
});

// Add more describe blocks for testing the TODO routes
describe('TODO Routes', () => {
    let token: string;
  
    beforeAll(async () => {
      // Login to get the JWT token
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@exampl.com', password: 'password12' });
  
      token = res.body.token;
    });
  
    it('should return 201 and the created TODO item when creating a new TODO item', async () => {
      const res = await request(app)
        .post('/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test TODO', description: 'Test description', completed: false });
  
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test TODO');
      expect(res.body.description).toBe('Test description');
      expect(res.body.completed).toBe(false);
      expect(res.body.userId).toBeTruthy();
    });
  
    it('should return 200 and an array of TODO items when fetching all TODO items', async () => {
      const res = await request(app)
        .get('/todos')
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  
    // Add more test cases for updating and deleting TODO items
    it('should return 200 and the updated TODO item when updating a TODO item', async () => {
        // Create a new TODO item
        const createRes = await request(app)
          .post('/todos')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Update Test TODO', description: 'Update test description', completed: false });
    
        const todoId = createRes.body._id;
    
        // Update the TODO item
        const updateRes = await request(app)
          .put(`/todos/${todoId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Updated TODO', description: 'Updated description', completed: true });
    
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.title).toBe('Updated TODO');
        expect(updateRes.body.description).toBe('Updated description');
        expect(updateRes.body.completed).toBe(true);
        expect(updateRes.body.userId).toBeTruthy();
      });
    
      it('should return 404 when updating a non-existing TODO item', async () => {
        const nonExistingTodoId = '605f11b556d90d10a4aaba77'; // A non-existing ID
    
        const res = await request(app)
          .put(`/todos/${nonExistingTodoId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Update Test TODO', description: 'Update test description', completed: false });
    
        expect(res.status).toBe(404);
      });
    
      it('should return 200 and a success message when deleting a TODO item', async () => {
        // Create a new TODO item
        const createRes = await request(app)
          .post('/todos')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Delete Test TODO', description: 'Delete test description', completed: false });
    
        const todoId = createRes.body._id;
    
        // Delete the TODO item
        const deleteRes = await request(app)
          .delete(`/todos/${todoId}`)
          .set('Authorization', `Bearer ${token}`);
    
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toBe('TODO item deleted successfully');
      });
    
      it('should return 404 when deleting a non-existing TODO item', async () => {
        const nonExistingTodoId = '605f11b556d90d10a4aaba77'; // A non-existing ID
    
        const res = await request(app)
          .delete(`/todos/${nonExistingTodoId}`)
          .set('Authorization', `Bearer ${token}`);
    
        expect(res.status).toBe(404);
      });

  });

  
  
