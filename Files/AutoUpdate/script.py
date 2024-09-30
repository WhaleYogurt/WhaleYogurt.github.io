import os
import sys
import requests

# URL of the version file hosted on GitHub Pages
VERSION_URL = "https://<your-github-username>.github.io/version.txt"
# URL of the updated Python script hosted on GitHub Pages
SCRIPT_URL = "https://<your-github-username>.github.io/script.py"
# Path to the current script file
CURRENT_SCRIPT = os.path.abspath(__file__)

# Current version of the local script
CURRENT_VERSION = "1.0.1"  # This is now version 1.0.1

# Check if the script was run with 'debug' argument
DEBUG = "debug" in sys.argv


def log_debug(message):
    """Log messages if debug mode is enabled."""
    if DEBUG:
        print(message)


def check_for_updates():
    """Check if there is a new version available."""
    try:
        # Get the version from the remote version file
        response = requests.get(VERSION_URL)
        response.raise_for_status()
        remote_version = response.text.strip()

        # Compare remote version with current version
        if remote_version > CURRENT_VERSION:
            log_debug(f"New version available: {remote_version}")
            return True, remote_version
        else:
            log_debug("Already up-to-date.")
            return False, CURRENT_VERSION
    except requests.RequestException as e:
        if DEBUG:
            print(f"Error checking for updates: {e}")
        return False, CURRENT_VERSION


def download_new_version():
    """Download the latest version of the script."""
    try:
        response = requests.get(SCRIPT_URL)
        response.raise_for_status()

        # Write the downloaded script to the current script file
        with open(CURRENT_SCRIPT, 'w') as script_file:
            script_file.write(response.text)

        log_debug("Update complete.")
        return True
    except requests.RequestException as e:
        if DEBUG:
            print(f"Error downloading the new version: {e}")
        return False


def restart_script():
    """Restart the script."""
    log_debug("Restarting script...")
    os.execv(sys.executable, ['python'] + sys.argv)


if __name__ == "__main__":
    # Step 1: Check if there is a new version
    update_available, remote_version = check_for_updates()

    # Step 2: If a new version is available, download and update
    if update_available:
        if download_new_version():
            # Step 3: After update, restart the script to load the new version
            restart_script()
    else:
        log_debug("No updates found. Running the current version.")
