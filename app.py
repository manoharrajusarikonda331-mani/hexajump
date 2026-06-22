"""
==========================================================================
HEXAJUMP - ENTERPRISE FULL-STACK CORE SERVER ENGINE
==========================================================================
"""

from flask import Flask, send_from_directory, jsonify, request, session
import os

app = Flask(__name__, static_folder='static')
app.secret_key = 'hexajump_crypto_secure_dev_key_2026' # Secures session cookies

# --------------------------------------------------------------------------
# STATE INITIALIZATION HELPER
# --------------------------------------------------------------------------
def initialize_player_session():
    """Initializes standard player save states into the server memory cookie if empty."""
    if 'coins' not in session:
        session['coins'] = 500  # Granting starter coins to test the Buy store logic!
    if 'selected_avatar' not in session:
        session['selected_avatar'] = 'm1'
    if 'unlocked_avatars' not in session:
        session['unlocked_avatars'] = ['m1']  # Only Alpha (M1) is unlocked initially

# --------------------------------------------------------------------------
# CORE WEB SYSTEM ROUTING
# --------------------------------------------------------------------------
@app.route('/')
def serve_launcher():
    initialize_player_session()
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_assets(path):
    return send_from_directory(app.static_folder, path)

# --------------------------------------------------------------------------
# RESTful API ENDPOINTS FOR ACCOUNT STATE SYNCHRONIZATION
# --------------------------------------------------------------------------

@app.route('/api/player/data', methods=['GET'])
def get_player_data():
    """Fetches full authenticated player coin balances and character unlocks."""
    initialize_player_session()
    return jsonify({
        "coins": session['coins'],
        "selected_avatar": session['selected_avatar'],
        "unlocked_avatars": session['unlocked_avatars']
    }), 200

@app.route('/api/store/buy', methods=['POST'])
def buy_avatar():
    """Handles secure backend confirmation and transaction logic for unlocking characters."""
    initialize_player_session()
    data = request.get_json() or {}
    avatar_id = data.get('avatar_id')
    price = data.get('price', 999999) # Defaults to unreachable price if manipulated

    if not avatar_id:
        return jsonify({"status": "error", "message": "Missing asset identification parameter."}), 400
    
    if avatar_id in session['unlocked_avatars']:
        return jsonify({"status": "error", "message": "Character profile already unlocked."}), 400

    if session['coins'] >= price:
        session['coins'] -= price
        session['unlocked_avatars'].append(avatar_id)
        session.modified = True
        return jsonify({
            "status": "success",
            "coins": session['coins'],
            "unlocked_avatars": session['unlocked_avatars']
        }), 200
    else:
        return jsonify({"status": "error", "message": "Insufficient coin transaction balance."}), 400

@app.route('/api/state/select', methods=['POST'])
def select_avatar():
    """Saves the current active deployment avatar verification node."""
    initialize_player_session()
    data = request.get_json() or {}
    avatar_id = data.get('avatar_id')

    if avatar_id in session['unlocked_avatars']:
        session['selected_avatar'] = avatar_id
        return jsonify({"status": "success", "selected_avatar": session['selected_avatar']}), 200
    
    return jsonify({"status": "error", "message": "Target vector path remains locked."}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
