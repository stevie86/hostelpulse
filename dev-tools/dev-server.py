#!/usr/bin/env python3
"""
AI-Powered Development Server for HostelPulse
Provides real-time code execution, review, and assistance
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path

# Local MCP servers
servers = [
    {
        "name": "typescript",
        "command": "node /usr/local/bin/typescript",
        "version": "5.3.3",
        "description": "TypeScript Language Server with real-time type checking"
    },
    {
        "name": "python", 
        "command": "python3 /usr/local/bin/python3",
        "version": "3.12.0",
        "description": "Python 3.12 Language Server"
    },
    {
        "name": "python-code-analyzer",
        "command": "python3 /usr/local/bin/python3",
        "args": ["/opt/code-analyzer/main.py"],
        "description": "Python code analysis and refactoring tool"
    },
    {
        "name": "auto-formatter",
        "command": "python3 /usr/local/bin/python3",
        "args": ["/opt/auto-formatter/main.py"],
        "description": "Code formatting with best practices"
    },
]

]

class AIDevServer:
    def __init__(self):
        self.servers = {server["name"]: server for server in servers}
        self.codebase_path = Path("/home/user/webdev/hostelpulse-clean")
        self.session_memory = {}  # Store conversation context
        
    async def get_servers(self):
        return list(self.servers.values())
    
    async def execute_code(self, server_name: str, code: str, language: str = 'typescript', conversation_id: str = None):
        server = self.servers.get(server_name)
        if not server:
            return {"error": f"Server {server_name} not found"}
        
        try:
            # Change to project directory
            original_cwd = Path.cwd()
            os.chdir(self.codebase_path)
            
            # Execute code
            process = subprocess.run([
                server["command"],
                "-c", code
            ], 
                capture_output=True, 
                text=True,
                timeout=30
            )
            
            # Return to original directory
            os.chdir(original_cwd)
            
            return {
                "success": True,
                "output": process.stdout,
                "stderr": process.stderr,
                "returncode": process.returncode,
                "language": language,
                "server": server_name
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "server": server_name
            }
    
    async def get_code_analysis(self, file_path: str):
        """Analyze code and suggest improvements"""
        analyzer = self.servers.get("python-code-analyzer")
        if not analyzer:
            return {"error": "Code analyzer not available"}
        
        try:
            # Change to project directory
            original_cwd = Path.cwd()
            os.chdir(self.codebase_path)
            
            # Get file content
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                return {"error": f"File {file_path} not found"}
            
            with open(file_path_obj, 'r') as f:
                content = f.read()
            
            # Change back
            os.chdir(original_cwd)
            
            # Run analysis
            result = subprocess.run([
                analyzer["command"],
                analyzer["args"],
                file_path_obj
                content
            ], capture_output=True, text=True)
            
            return {
                "success": True,
                "analysis": result.stdout,
                "suggestions": result.stderr
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    async def format_code(self, file_path: str):
        """Auto-format code with best practices"""
        formatter = self.servers.get("auto-formatter")
        if not formatter:
            return {"error": "Formatter not available"}
        
        try:
            # Change to project directory
            original_cwd = Path.cwd()
            os.chdir(self.codebase_path)
            
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                return {"error": f"File {file_path} not found"}
            
            with open(file_path_obj, 'r') as f:
                original_content = f.read()
            
            # Change back
            os.chdir(original_cwd)
            
            # Format code
            result = subprocess.run([
                formatter["command"],
                formatter["args"],
                file_path_obj
                original_content
            ], capture_output=True, text=True)
            
            # Write formatted code back
            if result.returncode == 0:
                with open(file_path_obj, 'w') as f:
                    f.write(result.stdout)
            
            return {
                "success": result.returncode == 0,
                "formatted": result.stdout
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    async def chat_with_ai(self, message: str, context: str = None):
        """Chat with AI assistant"""
        server = self.servers.get("auto-assistant")
        if not server:
            return {"error": "AI assistant not available"}
        
        try:
            # Enhanced context
            full_context = context or self.session_memory.get(conversation_id, "") or self.codebase_context
            
            # Change to project directory  
            original_cwd = Path.cwd()
            os.chdir(self.codebase_path)
            
            # Execute with AI server
            result = subprocess.run([
                server["command"],
                "-c", f"assistant.chat('{message}', context='{full_context}')"
            ], capture_output=True, text=True)
            
            # Store response in session memory
            if conversation_id:
                response_text = result.stdout.strip()
                self.session_memory[conversation_id] = response_text
            
            return {
                "success": True,
                "response": response_text,
                "conversation_id": conversation_id
            }
            
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="AI-Powered Development Server")
    parser.add_argument("--host", default="localhost", help="Host for the server")
    parser.add_argument("--port", type=int, default=8080, help="Port for the server")
    parser.add_argument("command", choices=["execute", "analyze", "format", "chat", "servers"], help="Command to execute")
    parser.add_argument("--server", choices=["typescript", "python", "python-code-analyzer", "auto-formatter"], help="Server to use")
    parser.add_argument("--language", default="typescript", help="Programming language")
    parser.add_argument("--file", help="File path for analysis/formatting")
    parser.add_argument("--code", help="Code to execute")
    parser.add_argument("--message", help="Message for AI assistant")
    parser.add_argument("--context", help="Context identifier")
    
    args = parser.parse_args()
    
    dev_server = AIDevServer()
    
    if args.command == "servers":
        result = dev_server.get_servers()
        print(json.dumps(result, indent=2))
    
    elif args.command == "execute":
        if not args.code:
            print("Error: --code is required for execute command")
            sys.exit(1)
        
        result = await dev_server.execute_code(args.server, args.code, args.language)
        print(json.dumps(result, indent=2))
    
    elif args.command == "analyze":
        if not args.file:
            print("Error: --file is required for analyze command")
            sys.exit(1)
        
        result = await dev_server.get_code_analysis(args.file)
        print(json.dumps(result, indent=2))
    
    elif args.command == "format":
        if not args.file:
            print("Error: --file is required for format command")
            sys.exit(1)
        
        result = await dev_server.format_code(args.file)
        print(json.dumps(result, indent=2))
    
    elif args.command == "chat":
        await dev_server.chat_with_ai(args.message, args.context)
    
    elif args.command == "help":
        print("Available commands:")
        print("  servers - List available servers")
        print("  execute  - Execute code on a server")
        print("  analyze  - Analyze code file")
        print("  format  - Auto-format code file")
        print("  chat    - Chat with AI assistant")
        print("  help    - Show this help message")
        print("\nExamples:")
        print("  python3 dev-server.py --execute typescript --code 'console.log(\"hello\")'")
        print("  python3 dev-server.py --analyze python --file src/components/guests/guest-list.tsx")
        print("  python3 dev-server.py --format typescript --file src/components/guests/guest-list.tsx'")
        print("  python3 dev-server.py --chat typescript --message 'Refactor this component for better performance'")
        print("  python3 dev-server.py --help")
    
    else:
        parser.print_help()
```