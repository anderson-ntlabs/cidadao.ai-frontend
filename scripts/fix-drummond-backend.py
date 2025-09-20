#!/usr/bin/env python3
"""
Script to fix Drummond agent initialization in the backend.

This script adds proper initialization for the Drummond agent
on first use, ensuring the Maritaca AI client is properly configured.
"""

import os
import sys
from pathlib import Path

def apply_drummond_fix():
    """Apply the fix to initialize Drummond agent properly."""
    
    # Find the backend directory
    backend_path = Path("/home/anderson-henrique/Documentos/cidadao.ai/cidadao.ai-backend")
    chat_file = backend_path / "src" / "api" / "routes" / "chat.py"
    
    if not chat_file.exists():
        print(f"❌ Error: chat.py not found at {chat_file}")
        return False
    
    print(f"📁 Found chat.py at: {chat_file}")
    
    # Read the current file
    with open(chat_file, 'r') as f:
        content = f.read()
    
    # Check if fix is already applied
    if "drummond_initialized = False" in content:
        print("✅ Fix already applied!")
        return True
    
    # Apply the fix
    print("🔧 Applying Drummond initialization fix...")
    
    # Add drummond_initialized flag
    content = content.replace(
        'drummond_agent = None\nlogger.info("Starting Drummond initialization...")',
        'drummond_agent = None\ndrummond_initialized = False\nlogger.info("Starting Drummond initialization...")'
    )
    
    # Add initialization on first use
    init_code = '''            # Initialize Drummond on first use
            global drummond_initialized
            if not drummond_initialized:
                try:
                    logger.info("Initializing Drummond agent on first use...")
                    await drummond_agent.initialize()
                    drummond_initialized = True
                    logger.info("Drummond agent initialized successfully")
                except Exception as e:
                    logger.error(f"Failed to initialize Drummond: {e}")
                    raise
'''
    
    content = content.replace(
        '        if target_agent == "drummond" and drummond_agent:\n            # Use Drummond for conversational intents',
        f'        if target_agent == "drummond" and drummond_agent:\n{init_code}            # Use Drummond for conversational intents'
    )
    
    # Create backup
    backup_file = chat_file.with_suffix('.py.backup')
    with open(backup_file, 'w') as f:
        f.write(content)
    print(f"💾 Backup created at: {backup_file}")
    
    # Write the fixed content
    with open(chat_file, 'w') as f:
        f.write(content)
    
    print("✅ Fix applied successfully!")
    print("\n📝 Next steps:")
    print("1. Commit the changes to the backend repository")
    print("2. Push to the hf-fastapi branch on HuggingFace")
    print("3. The HuggingFace Space will automatically rebuild")
    print("\n🚀 The Drummond agent should now initialize properly!")
    
    return True

if __name__ == "__main__":
    success = apply_drummond_fix()
    sys.exit(0 if success else 1)