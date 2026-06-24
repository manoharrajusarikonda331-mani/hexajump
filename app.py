"""
==========================================================================
HEXAJUMP - ENTERPRISE BACKEND ENGINE & STATE LAYER
==========================================================================
"""
import os
from flask import Flask, send_from_directory, jsonify, request, session, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'hexajump_crypto_high_performance_system_secure_key_2026'

def initialize_player_session():
    """Initializes player save state structure into the server memory."""
    if 'coins' not in session: 
        session['coins'] = 1000
    if 'selected_avatar' not in session: 
        session['selected_avatar'] = 'm1'
    if 'unlocked_avatars' not in session: 
        session['unlocked_avatars'] = ['m1', 'f1']
    
    # Initialize high score data structure if empty
    if 'high_scores' not in session:
        session['high_scores'] = {
            'm1': 0, 'm2': 0, 'm3': 0,
            'f1': 0, 'f2': 0, 'f3': 0
        }

@app.route('/')
def serve_launcher():
    """Serves the primary UI canvas layer out of the templates environment."""
    initialize_player_session()
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static_assets(path):
    """Fallback directory route map for serving static media assets cleanly."""
    return send_from_directory(app.static_folder, path)

# --------------------------------------------------------------------------
# Restful API Interface Layer
# --------------------------------------------------------------------------

@app.route('/api/player/data', methods=['GET'])
def get_player_data():
    initialize_player_session()
    return jsonify({
        "coins": session['coins'],
        "selected_avatar": session['selected_avatar'],
        "unlocked_avatars": session['unlocked_avatars'],
        "high_scores": session['high_scores']
    }), 200

@app.route('/api/store/buy', methods=['POST'])
def buy_avatar():
    initialize_player_session()
    data = request.get_json() or {}
    avatar_id = data.get('avatar_id')
    price = data.get('price', 999999)

    if not avatar_id or avatar_id in session['unlocked_avatars']:
        return jsonify({"status": "error"}), 400

    if session['coins'] >= price:
        session['coins'] -= price
        session['unlocked_avatars'].append(avatar_id)
        session.modified = True
        return jsonify({
            "status": "success", 
            "coins": session['coins'], 
            "unlocked_avatars": session['unlocked_avatars']
        }), 200
    
    return jsonify({"status": "error"}), 400

@app.route('/api/game/over', methods=['POST'])
def handle_game_over():
    initialize_player_session()
    data = request.get_json() or {}
    score = data.get('score', 0)
    avatar_id = data.get('avatar_id')
    coins_earned = data.get('coins_earned', 0)

    session['coins'] += coins_earned
    new_high_score = False

    # Track high score only for the specific avatar used
    if avatar_id in session['high_scores'] and score > session['high_scores'][avatar_id]:
        session['high_scores'][avatar_id] = score
        new_high_score = True

    session.modified = True
    return jsonify({
        "status": "success", 
        "high_score": session['high_scores'].get(avatar_id, 0), 
        "is_new_high": new_high_score
    }), 200

@app.route('/api/state/select', methods=['POST'])
def select_avatar():
    initialize_player_session()
    data = request.get_json() or {}
    avatar_id = data.get('avatar_id')
    if avatar_id in session['unlocked_avatars']:
        session['selected_avatar'] = avatar_id
        session.modified = True
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error"}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
