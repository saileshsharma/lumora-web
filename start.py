#!/usr/bin/env python3
"""
Cross-platform startup script for AI Outfit Assistant
Starts both backend (Flask) and frontend (HTTP server) concurrently
"""

import os
import sys
import subprocess
import time
import signal
import platform
from pathlib import Path

# ANSI color codes
class Colors:
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    NC = '\033[0m'  # No Color

    @staticmethod
    def disable_on_windows():
        """Disable colors on Windows unless in modern terminal"""
        if platform.system() == 'Windows':
            # Enable ANSI support on Windows 10+
            try:
                import ctypes
                kernel32 = ctypes.windll.kernel32
                kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
            except:
                # Disable colors if ANSI not supported
                Colors.GREEN = Colors.BLUE = Colors.YELLOW = Colors.RED = Colors.NC = ''

Colors.disable_on_windows()

# Global process list for cleanup
processes = []

def print_header():
    """Print startup header"""
    print(f"{Colors.BLUE}╔════════════════════════════════════════════╗{Colors.NC}")
    print(f"{Colors.BLUE}║   AI Outfit Assistant - Startup Script    ║{Colors.NC}")
    print(f"{Colors.BLUE}╚════════════════════════════════════════════╝{Colors.NC}")
    print()

def check_python():
    """Check if Python version is adequate"""
    if sys.version_info < (3, 7):
        print(f"{Colors.RED}❌ Python 3.7+ is required{Colors.NC}")
        sys.exit(1)
    print(f"{Colors.GREEN}✅ Python {sys.version_info.major}.{sys.version_info.minor} detected{Colors.NC}")

def check_venv():
    """Check and create virtual environment if needed"""
    venv_path = Path("venv")

    if not venv_path.exists():
        print(f"{Colors.YELLOW}⚠️  Virtual environment not found. Creating one...{Colors.NC}")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print(f"{Colors.GREEN}✅ Virtual environment created{Colors.NC}")

    return venv_path

def get_venv_python(venv_path):
    """Get path to Python executable in virtual environment"""
    if platform.system() == 'Windows':
        return venv_path / "Scripts" / "python.exe"
    else:
        return venv_path / "bin" / "python"

def install_dependencies(venv_python):
    """Install Python dependencies"""
    print(f"{Colors.BLUE}📦 Installing/updating dependencies...{Colors.NC}")
    try:
        subprocess.run(
            [str(venv_python), "-m", "pip", "install", "-q", "-r", "requirements.txt"],
            check=True
        )
        print(f"{Colors.GREEN}✅ Dependencies ready{Colors.NC}")
    except subprocess.CalledProcessError:
        print(f"{Colors.RED}❌ Failed to install dependencies{Colors.NC}")
        sys.exit(1)

def check_env_file():
    """Check if .env file exists"""
    if not Path(".env").exists():
        print(f"{Colors.YELLOW}⚠️  .env file not found!{Colors.NC}")
        print(f"{Colors.YELLOW}   Please create a .env file with your API keys:{Colors.NC}")
        print(f"{Colors.YELLOW}   - OPENAI_API_KEY=your_key_here{Colors.NC}")
        print(f"{Colors.YELLOW}   - FAL_KEY=your_key_here{Colors.NC}")
        input("   Press Enter to continue anyway or Ctrl+C to exit...")

def start_backend(venv_python):
    """Start Flask backend server"""
    print(f"\n{Colors.GREEN}🚀 Starting Backend Server...{Colors.NC}")

    backend_env = os.environ.copy()
    backend_env['PYTHONUNBUFFERED'] = '1'  # Ensure real-time output

    backend_process = subprocess.Popen(
        [str(venv_python), "app.py"],
        cwd="backend",
        env=backend_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(backend_process)
    return backend_process

def start_frontend(venv_python):
    """Start frontend Vite dev server"""
    print(f"{Colors.GREEN}🚀 Starting Frontend Server...{Colors.NC}")

    # Use npm to start Vite dev server
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", "5173"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(frontend_process)
    return frontend_process

def print_ready_message():
    """Print ready message with URLs"""
    print()
    print(f"{Colors.GREEN}╔════════════════════════════════════════════╗{Colors.NC}")
    print(f"{Colors.GREEN}║          🎉 All Systems Ready! 🎉          ║{Colors.NC}")
    print(f"{Colors.GREEN}╠════════════════════════════════════════════╣{Colors.NC}")
    print(f"{Colors.GREEN}║                                            ║{Colors.NC}")
    print(f"{Colors.GREEN}║  Frontend: {Colors.BLUE}http://localhost:5173{Colors.GREEN}          ║{Colors.NC}")
    print(f"{Colors.GREEN}║  Backend:  {Colors.BLUE}http://localhost:5001{Colors.GREEN}          ║{Colors.NC}")
    print(f"{Colors.GREEN}║                                            ║{Colors.NC}")
    print(f"{Colors.GREEN}║  Press {Colors.RED}Ctrl+C{Colors.GREEN} to stop all servers        ║{Colors.NC}")
    print(f"{Colors.GREEN}║                                            ║{Colors.NC}")
    print(f"{Colors.GREEN}╚════════════════════════════════════════════╝{Colors.NC}")
    print()

def open_browser():
    """Open browser to frontend URL"""
    url = "http://localhost:5173"

    try:
        if platform.system() == 'Darwin':  # macOS
            subprocess.run(['open', url], check=False)
        elif platform.system() == 'Windows':
            subprocess.run(['start', url], shell=True, check=False)
        elif platform.system() == 'Linux':
            subprocess.run(['xdg-open', url], check=False)

        print(f"{Colors.BLUE}🌐 Opening browser...{Colors.NC}")
    except Exception:
        pass  # Silently fail if can't open browser

def cleanup(signum=None, frame=None):
    """Cleanup function to stop all servers"""
    print(f"\n{Colors.YELLOW}🛑 Shutting down servers...{Colors.NC}")

    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()

    print(f"{Colors.GREEN}✅ Servers stopped{Colors.NC}")
    sys.exit(0)

def monitor_processes(backend_process, frontend_process):
    """Monitor both processes and display output"""
    import select

    print(f"{Colors.BLUE}📋 Server logs:{Colors.NC}\n")

    while True:
        # Check if processes are still running
        if backend_process.poll() is not None:
            print(f"{Colors.RED}❌ Backend process died unexpectedly{Colors.NC}")
            cleanup()

        if frontend_process.poll() is not None:
            print(f"{Colors.RED}❌ Frontend process died unexpectedly{Colors.NC}")
            cleanup()

        time.sleep(0.1)

def main():
    """Main function"""
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    # Setup signal handlers
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # Startup sequence
    print_header()
    check_python()
    venv_path = check_venv()
    venv_python = get_venv_python(venv_path)

    install_dependencies(venv_python)
    check_env_file()

    # Start servers
    backend_process = start_backend(venv_python)

    print(f"{Colors.BLUE}⏳ Waiting for backend to initialize...{Colors.NC}")
    time.sleep(3)

    frontend_process = start_frontend(venv_python)
    time.sleep(2)

    # Show ready message
    print_ready_message()
    open_browser()

    # Monitor processes
    try:
        monitor_processes(backend_process, frontend_process)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
