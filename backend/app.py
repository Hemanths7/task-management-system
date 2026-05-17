from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from datetime import timedelta
import os

app = Flask(__name__)
CORS(app)

# ─── Config ───────────────────────────────────────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///taskmanager.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'taskflow-secret-2025')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)


# ─── Models ───────────────────────────────────────────────────────────────────
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True, default='')
    completed = db.Column(db.Boolean, default=False, nullable=False)
    priority = db.Column(db.String(20), default='medium', nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


with app.app_context():
    db.create_all()


# ─── Auth Routes ──────────────────────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    user = User(
        username=username,
        password=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'username': user.username
    }), 200


# ─── Task Routes ──────────────────────────────────────────────────────────────
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())
    tasks = (
        Task.query
        .filter_by(user_id=user_id)
        .order_by(Task.created_at.desc())
        .all()
    )
    return jsonify([task.to_dict() for task in tasks]), 200


@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'Task title is required'}), 400

    priority = data.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        return jsonify({'error': 'Priority must be low, medium, or high'}), 400

    task = Task(
        title=title,
        description=(data.get('description') or '').strip(),
        completed=bool(data.get('completed', False)),
        priority=priority,
        user_id=user_id,
    )
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    if 'title' in data:
        title = (data['title'] or '').strip()
        if not title:
            return jsonify({'error': 'Task title cannot be empty'}), 400
        task.title = title

    if 'description' in data:
        task.description = (data['description'] or '').strip()

    if 'completed' in data:
        task.completed = bool(data['completed'])

    if 'priority' in data:
        if data['priority'] not in ('low', 'medium', 'high'):
            return jsonify({'error': 'Priority must be low, medium, or high'}), 400
        task.priority = data['priority']

    db.session.commit()
    return jsonify(task.to_dict()), 200


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'}), 200


# ─── Error Handlers ───────────────────────────────────────────────────────────
@jwt.unauthorized_loader
def unauthorized_callback(reason):
    return jsonify({'error': 'Missing or invalid token'}), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
