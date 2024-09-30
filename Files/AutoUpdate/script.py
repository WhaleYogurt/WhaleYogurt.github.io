import os
import sys
import requests

# URL of the version file hosted on GitHub Pages
VERSION_URL = "https://whaleyogurt.github.io/Files/AutoUpdate/version.txt"
# URL of the updated Python script hosted on GitHub Pages
SCRIPT_URL = "https://whaleyogurt.github.io/Files/AutoUpdate/script.py"
# Path to the current script file
CURRENT_SCRIPT = os.path.abspath(__file__)

# Current version of the local script
CURRENT_VERSION = "1.0.0"  # Update this value as needed for the current local version

def check_for_updates():
    """Check if there is a new version available."""
    try:
        # Get the version from the remote version file
        response = requests.get(VERSION_URL)
        response.raise_for_status()
        remote_version = response.text.strip()

        # Compare remote version with current version
        if remote_version > CURRENT_VERSION:
            print(f"New version available: {remote_version}")
            return True, remote_version
        else:
            print("Already up-to-date.")
            return False, CURRENT_VERSION
    except requests.RequestException as e:
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
        
        print("Update complete.")
        return True
    except requests.RequestException as e:
        print(f"Error downloading the new version: {e}")
        return False

def restart_script():
    """Restart the script."""
    print("Restarting script...")
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
        print("No updates found. Running the current version.")

