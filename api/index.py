import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# This is the Vercel entry point
# Vercel's Edge/Serverless functions look for 'app' by default
