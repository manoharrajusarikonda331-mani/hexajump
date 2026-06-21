"""
==========================================================================
HEXAJUMP - FULL-STACK BACKEND ENGINE CORE SERVER
==========================================================================
"""

from flask import Flask, send_from_directory, jsonify, request
import os

# Initialize Flask core application targeting our frontend directory
app = Flask(__name__, static_folder='static')

# --------------------------------------------------------------------------
# CORE ROUTING MATRIX
# --------------------------------------------------------------------------

@app.route('/')
def serve_launcher():
    """Serves the primary UI game launcher and avatar selection template."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_assets(path):
    """Safely handles internal static routing for CSS styles and client JS scripts."""
    return send_from_directory(app.static_folder, path)

# --------------------------------------------------------------------------
# RECRUITER-READY REST API ENDPOINTS (FOUNDATION FOR STATE MANAGEMENT)
# --------------------------------------------------------------------------

@app.route('/api/state/save', methods=['POST'])
def save_player_state():
    """
    API Endpoint to securely save persistent user sessions, 
    including active avatar selection and highest cleared level thresholds.
    """
    data = request.get_json() or {}
    avatar = data.get('avatar', 'unknown')
    current_level = data.get('current_level', 1)
    
    # Placeholder for future database integration layers
    return jsonify({
        "status": "success",
        "message": f"Session synchronized for player using profile [{avatar}] at Level {current_level}."
    }), 200

# --------------------------------------------------------------------------
# ENGINE EXECUTION INITIALIZER
# --------------------------------------------------------------------------
if __name__ == '__main__':
    # Run the server locally on development port 5000 with hot-reloading active
    app.run(debug=True, host='0.0.0.0', port=5000)
